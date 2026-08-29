import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/**/*.a11y.test.tsx"],
    setupFiles: ["./test/setup.ts"]
  }
});
