import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        document: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        window: "readonly",
        localStorage: "readonly",
        console: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        HTMLDivElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLElement: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-var": "warn",
      "no-undef": "off",
      "no-prototype-builtins": "off",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
];
