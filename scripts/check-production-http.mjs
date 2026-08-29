import { spawn } from "node:child_process";
import process from "node:process";

const host = "127.0.0.1";
const port = "3102";
const origin = `http://${host}:${port}`;
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

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

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

try {
  await waitUntilReady();

  const redirect = await fetch(`${origin}/`, {
    headers: { "Accept-Language": "nl-BE,nl;q=0.9,fr;q=0.7" },
    redirect: "manual"
  });
  requireCondition(redirect.status === 307, `Expected 307 locale redirect, got ${redirect.status}`);
  requireCondition(
    redirect.headers.get("location") === "/nl",
    `Expected Dutch redirect, got ${redirect.headers.get("location")}`
  );

  const french = await fetch(`${origin}/fr`);
  const frenchBody = await french.text();
  requireCondition(french.status === 200, `Expected /fr 200, got ${french.status}`);
  requireCondition(frenchBody.includes('<html lang="fr">'), "French document language is missing");
  requireCondition(
    french.headers.get("content-security-policy")?.includes("frame-ancestors 'none'"),
    "CSP frame protection is missing"
  );
  requireCondition(
    french.headers.get("referrer-policy") === "no-referrer",
    "Referrer policy is wrong"
  );
  requireCondition(
    french.headers.get("strict-transport-security")?.includes("max-age=63072000"),
    "Production HSTS is missing"
  );

  const live = await fetch(`${origin}/health/live`);
  const ready = await fetch(`${origin}/health/ready`);
  requireCondition(live.status === 200, `Expected liveness 200, got ${live.status}`);
  requireCondition(ready.status === 200, `Expected readiness 200, got ${ready.status}`);
  requireCondition(live.headers.get("cache-control") === "no-store", "Liveness must not cache");

  console.log(
    "Production HTTP baseline passed: locale redirect, FR document, security headers, liveness, readiness."
  );
} finally {
  server.kill("SIGTERM");
}
