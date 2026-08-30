import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    exclude: [
      "**/.next/**",
      "**/node_modules/**",
      "**/*.a11y.test.tsx",
      "**/*.integration.test.ts",
      "**/*.integration.test.tsx"
    ],
    include: [
      "apps/**/*.test.ts",
      "apps/**/*.test.tsx",
      "packages/**/*.test.ts",
      "packages/**/*.test.tsx"
    ],
    setupFiles: ["./test/setup.ts"]
  }
});
