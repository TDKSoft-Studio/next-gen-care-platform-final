import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    exclude: ["**/.next/**", "**/node_modules/**"],
    include: ["apps/**/*.a11y.test.tsx", "packages/**/*.a11y.test.tsx"],
    setupFiles: ["./test/setup.ts"]
  }
});
