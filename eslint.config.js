import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import promise from "eslint-plugin-promise";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "public/**",
      "node_modules/**",
      "tmp/**",
      "vendor/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      sonarjs.configs.recommended,
      security.configs.recommended,
      noUnsanitized.configs.recommended,
      promise.configs["flat/recommended"],
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "simple-import-sort/exports": "error",
      // Groups, separated by blank lines: side effects, react, packages, @/ aliases, relative.
      "simple-import-sort/imports": [
        "error",
        { groups: [["^\\u0000"], ["^react$", "^react-dom"], ["^@?\\w"], ["^@/"], ["^\\."]] },
      ],
    },
  },
  {
    files: ["app/frontend/components/ui/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  prettier,
);
