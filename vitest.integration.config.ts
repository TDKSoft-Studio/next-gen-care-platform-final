import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    exclude: ["**/.next/**", "**/node_modules/**"],
    include: ["apps/**/*.integration.test.ts", "apps/**/*.integration.test.tsx"],
    setupFiles: ["./test/setup.ts"]
  }
});
