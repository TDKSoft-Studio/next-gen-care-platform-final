import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

export default defineConfig([
  ...fixupConfigRules([...nextCoreWebVitals, ...nextTypeScript, security.configs.recommended]),
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "security/detect-object-injection": "off"
    }
  },
  {
    files: ["scripts/*.mjs"],
    rules: {
      "security/detect-non-literal-fs-filename": "off"
    }
  },
  globalIgnores([
    ".artifacts/**",
    ".cache/**",
    "**/.next/**",
    "coverage/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**"
  ])
]);
