import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const sourceFiles = globSync(["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"], {
  exclude: ["**/*.test.ts", "**/*.test.tsx", "**/node_modules/**"]
});

const rules = [
  {
    roots: ["packages/ui/"],
    forbidden: ["@next-gen-care/localization", "next/", "@opentelemetry/"],
    reason: "UI primitives must remain localization-, framework-, and exporter-neutral"
  },
  {
    roots: ["packages/localization/"],
    forbidden: ["react", "next/", "@opentelemetry/"],
    reason: "Localization policy must remain framework-neutral"
  },
  {
    roots: ["packages/observability/"],
    forbidden: ["react", "next/"],
    reason: "Observability contracts must remain framework-neutral"
  }
];

const failures = [];
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  for (const rule of rules) {
    if (!rule.roots.some((root) => file.startsWith(root))) continue;
    for (const dependency of rule.forbidden) {
      if (source.includes(`from "${dependency}`) || source.includes(`from '${dependency}`)) {
        failures.push(`${file}: imports ${dependency} (${rule.reason})`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Package boundary check passed (${sourceFiles.length} source files inspected).`);
}
