import { gzipSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const budgets = JSON.parse(readFileSync("PERFORMANCE_BUDGETS.json", "utf8"));
const buildDirectory = "apps/web/.next";
const publicManifests = [
  `${buildDirectory}/server/app/[locale]/page_client-reference-manifest.js`,
  `${buildDirectory}/server/app/[locale]/health-tech/page_client-reference-manifest.js`,
  `${buildDirectory}/server/app/[locale]/home-care/page_client-reference-manifest.js`,
  `${buildDirectory}/server/app/[locale]/operating-room/page_client-reference-manifest.js`,
  `${buildDirectory}/server/app/[locale]/travel-team-building/page_client-reference-manifest.js`,
  `${buildDirectory}/server/app/[locale]/well-being/page_client-reference-manifest.js`
];

function parseManifest(path) {
  const source = readFileSync(path, "utf8");
  const start = source.lastIndexOf(" = ");
  if (start === -1) throw new Error(`Unable to parse client reference manifest: ${path}`);
  return JSON.parse(source.slice(start + 3).replace(/;\s*$/, ""));
}

function buildPath(assetPath) {
  return `${buildDirectory}/${assetPath.replace(/^\/_next\//, "")}`;
}

function collectPublicAssets() {
  const files = new Set();
  const buildManifest = JSON.parse(readFileSync(`${buildDirectory}/build-manifest.json`, "utf8"));
  for (const assetPath of buildManifest.rootMainFiles) files.add(buildPath(assetPath));

  for (const manifestPath of publicManifests) {
    if (!existsSync(manifestPath)) continue;
    const manifest = parseManifest(manifestPath);
    for (const clientModule of Object.values(manifest.clientModules)) {
      for (const chunk of clientModule.chunks) files.add(buildPath(chunk));
    }
    for (const assets of Object.values(manifest.entryCSSFiles)) {
      for (const asset of assets) files.add(buildPath(asset.path));
    }
  }

  return [...files];
}

const publicAssets = collectPublicAssets();
const groups = [
  {
    name: "Public JavaScript",
    files: publicAssets.filter((file) => file.endsWith(".js")),
    budget: budgets.javascriptGzipBytes
  },
  {
    name: "Public CSS",
    files: publicAssets.filter((file) => file.endsWith(".css")),
    budget: budgets.cssGzipBytes
  }
];

let failed = false;
for (const group of groups) {
  if (group.files.length === 0) {
    console.error(`${group.name}: no build artifacts found; run the production build first.`);
    failed = true;
    continue;
  }
  const bytes = group.files.reduce(
    (total, file) => total + gzipSync(readFileSync(file), { level: 9 }).byteLength,
    0
  );
  console.log(`${group.name}: ${bytes} gzip bytes / ${group.budget} byte budget`);
  if (bytes > group.budget) failed = true;
}

if (failed) process.exitCode = 1;
