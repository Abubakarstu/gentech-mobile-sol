import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Dynamic Prisma adapter payloads and third-party webhook bodies are still
  // typed as `any` across existing modules. Keep them visible as warnings so CI
  // is not blocked, and tighten them module-by-module as typed DTOs land.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client — never lint generated code.
    "lib/generated/**",
  ]),
]);

export default eslintConfig;
