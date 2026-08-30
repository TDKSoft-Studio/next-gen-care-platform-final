import { existsSync } from "node:fs";
import process from "node:process";

const gate = process.argv[2];

if (gate === "contract") {
  const generatedClient = "packages/appointment-adapter/src/generated";
  if (existsSync(generatedClient)) {
    console.error(
      `BLOCKED: ${generatedClient} exists before an appointment contract has been human-accepted.`
    );
    process.exitCode = 1;
  } else {
    console.log(
      "MANUAL_APPOINTMENT_ADAPTER_ONLY: no generated appointment client is tracked in this repository. This is a phase-gate status, not schema-compatibility evidence against a pinned OpenAPI artifact."
    );
  }
} else if (gate === "helm") {
  console.log(
    "NOT_APPLICABLE_PLATFORM_REPOSITORY: Helm belongs in the separately authorized infrastructure repository, which remains uninitialized."
  );
} else {
  console.error(`Unknown phase gate: ${gate ?? "<missing>"}`);
  process.exitCode = 1;
}
