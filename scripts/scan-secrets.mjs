import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import process from "node:process";

const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "utf8"
});

if (listed.status !== 0) {
  console.error("Unable to enumerate repository files for secret scanning.");
  process.exit(1);
}

const patterns = [
  ["private key", /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/],
  ["AWS access key", /(?:AKIA|ASIA)[0-9A-Z]{16}/],
  ["GitHub token", /gh[opsur]_[A-Za-z0-9]{36,}/],
  ["OpenAI-style secret", /sk-(?:proj-)?[A-Za-z0-9_-]{24,}/],
  ["Slack token", /xox[baprs]-[A-Za-z0-9-]{20,}/]
];

const findings = [];
const files = listed.stdout.split("\0").filter(Boolean);
for (const file of files) {
  if (statSync(file).size > 1_000_000) continue;
  const content = readFileSync(file);
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const [name, pattern] of patterns) {
    if (pattern.test(text)) findings.push(`${file}: ${name}`);
  }
}

if (findings.length > 0) {
  console.error(`High-confidence secret patterns found:\n${findings.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Secret baseline passed (${files.length} repository files inspected; secret values are never printed).`
  );
}
