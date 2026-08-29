import { spawnSync } from "node:child_process";
import process from "node:process";

const expected = {
  node: "24.20.0",
  pnpm: "11.24.0",
  task: "3.53.1"
};

function versionOf(command, args = ["--version"]) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) return null;
  const output = `${result.stdout}\n${result.stderr}`.trim();
  return output.match(/\d+\.\d+\.\d+/)?.[0] ?? output;
}

function pnpmVersion() {
  const userAgentVersion = process.env.npm_config_user_agent?.match(/pnpm\/(\d+\.\d+\.\d+)/)?.[1];
  return userAgentVersion ?? versionOf("pnpm");
}

function installGuidance(tool) {
  const guides = {
    node: "Install Node 24.20.0 with an approved version manager, then run corepack enable.",
    pnpm: "Run corepack enable, then corepack install using the packageManager field.",
    task:
      process.platform === "win32"
        ? "Run pnpm install, then use pnpm exec task; or install Task with winget install Task.Task."
        : process.platform === "darwin"
          ? "Run pnpm install, then use pnpm exec task; or install Task with brew install go-task."
          : "Run pnpm install, then use pnpm exec task; or install Task from the official package repository.",
    git: "Install Git using the operating-system package manager.",
    docker:
      "Optional for the primary gate; required for container gates. Enable Docker Desktop integration or install Docker Engine.",
    trivy:
      "Optional for the primary gate; required for container scanning. Follow the official Trivy installation guide."
  };
  return guides[tool];
}

const checks = [
  { name: "node", mandatory: true, expected: expected.node, actual: versionOf("node") },
  { name: "pnpm", mandatory: true, expected: expected.pnpm, actual: pnpmVersion() },
  { name: "task", mandatory: true, expected: expected.task, actual: versionOf("task") },
  { name: "git", mandatory: true, expected: "2.x or newer", actual: versionOf("git") },
  { name: "docker", mandatory: false, expected: "current supported", actual: versionOf("docker") },
  { name: "trivy", mandatory: false, expected: "current supported", actual: versionOf("trivy") }
];

let failed = false;
for (const check of checks) {
  const exactMismatch =
    Object.hasOwn(expected, check.name) && check.actual !== expected[check.name];
  const missing = check.actual === null;
  const status = missing ? "MISSING" : exactMismatch ? "WRONG_VERSION" : "OK";
  console.log(
    `${check.mandatory ? "mandatory" : "optional"}\t${check.name}\t${status}\t${check.actual ?? "-"}\texpected ${check.expected}`
  );
  if (missing || exactMismatch) console.log(`  guidance: ${installGuidance(check.name)}`);
  if (check.mandatory && (missing || exactMismatch)) failed = true;
}

if (failed) {
  console.error("Tool setup is incomplete. No workstation changes were made.");
  process.exitCode = 1;
} else {
  console.log("Mandatory tool setup is reproducible and complete.");
}
