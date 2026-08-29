import { gzipSync } from "node:zlib";
import { globSync, readFileSync } from "node:fs";
import process from "node:process";

const budgets = JSON.parse(readFileSync("PERFORMANCE_BUDGETS.json", "utf8"));
const groups = [
  {
    name: "JavaScript",
    files: globSync("apps/web/.next/static/chunks/**/*.js"),
    budget: budgets.javascriptGzipBytes
  },
  {
    name: "CSS",
    files: globSync("apps/web/.next/static/chunks/**/*.css"),
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
