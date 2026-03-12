import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**"
    ]
  },
  js.configs.recommended,
  {
    files: [
      "src/core/**/*.mjs",
      "src/service/**/*.mjs",
      "src/provider/poc/**/*.mjs"
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off",
      "no-useless-assignment": "off",
      "no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  }
];
