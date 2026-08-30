import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    exclude: [
      "**/.next/**",
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
