import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["apps/**/*.integration.test.ts", "apps/**/*.integration.test.tsx"],
    setupFiles: ["./test/setup.ts"]
  }
});
