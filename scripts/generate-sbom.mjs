import { mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";

const outputPath = ".artifacts/sbom.cdx.json";
const require = createRequire(import.meta.url);
const cdxgenEntry = join(dirname(require.resolve("@cyclonedx/cdxgen")), "bin", "cdxgen.js");
const sanitizedEnvironment = { ...process.env };
delete sanitizedEnvironment.NODE_PATH;
delete sanitizedEnvironment.WT_SESSION;

mkdirSync(".artifacts", { recursive: true });
const result = spawnSync(
  process.execPath,
  [
    cdxgenEntry,
    "-t",
    "js",
    "--spec-version",
    "1.6",
    "--output",
    outputPath,
    "--no-install-deps",
    "."
  ],
  { env: sanitizedEnvironment, stdio: "inherit" }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const sbom = JSON.parse(readFileSync(outputPath, "utf8"));
if (sbom.bomFormat !== "CycloneDX" || sbom.specVersion !== "1.6") {
  console.error("Generated SBOM is not CycloneDX 1.6 JSON.");
  process.exit(1);
}

console.log(`Validated CycloneDX 1.6 SBOM with ${sbom.components?.length ?? 0} components.`);
