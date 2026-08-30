import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { gzipSync } from "node:zlib";

const budgets = JSON.parse(readFileSync("PERFORMANCE_BUDGETS.json", "utf8"));
const host = "127.0.0.1";
const port = "3103";
const origin = `http://${host}:${port}`;
const routes = [
  "/fr",
  "/fr/soins-a-domicile",
  "/fr/blocs-operatoires",
  "/fr/bien-etre",
  "/fr/voyages-team-building",
  "/fr/health-tech",
  "/nl",
  "/nl/thuiszorg",
  "/nl/operatiekwartier",
  "/nl/welzijn",
  "/nl/reizen-team-building",
  "/nl/health-tech"
];

const server = spawn(process.execPath, ["apps/web/.next/standalone/apps/web/server.js"], {
  env: {
    ...process.env,
    HOSTNAME: host,
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    PORT: port
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let diagnostics = "";
server.stdout.on("data", (chunk) => {
  diagnostics += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  diagnostics += chunk.toString();
});

async function waitUntilReady() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/health/ready`);
      if (response.ok) return;
    } catch {
      // The fixed local server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Production server did not become ready.\n${diagnostics}`);
}

function routeAssets(html) {
  const assets = new Set();
  const pattern = /["'](\/_next\/static\/[^"']+)["']/g;
  for (const match of html.matchAll(pattern)) {
    const pathname = match[1]?.split("?", 1)[0];
    if (!pathname || (!pathname.endsWith(".js") && !pathname.endsWith(".css"))) continue;
    const file = `apps/web/.next${pathname.slice("/_next".length)}`;
    if (!existsSync(file)) throw new Error(`Referenced build asset is missing: ${file}`);
    assets.add(file);
  }
  return [...assets];
}

function gzipBytes(files, extension) {
  return files
    .filter((file) => file.endsWith(extension))
    .reduce((total, file) => total + gzipSync(readFileSync(file), { level: 9 }).byteLength, 0);
}

try {
  await waitUntilReady();
  let failed = false;

  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route}: expected HTTP 200, got ${response.status}`);
    const assets = routeAssets(await response.text());
    const javascript = gzipBytes(assets, ".js");
    const css = gzipBytes(assets, ".css");
    console.log(
      `${route}: JavaScript ${javascript}/${budgets.javascriptGzipBytes} gzip bytes; CSS ${css}/${budgets.cssGzipBytes} gzip bytes`
    );
    if (javascript > budgets.javascriptGzipBytes || css > budgets.cssGzipBytes) failed = true;
  }

  if (failed) process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
