import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
// ────────────────────────────────────────────────────────────────
// Add this import
// import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    // Ignore config and common root files from type-aware linting
    ignores: ["eslint.config.mjs", "node_modules/", "dist/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          "allowExpressions": true,
          "allowTypedFunctionExpressions": true
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "indent": ["error", 2],
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": "error",
      "keyword-spacing": "error",
      "space-before-function-paren": [
        "error",
        {
          "anonymous": "always",
          "named": "never",
          "asyncArrow": "always"
        }
      ]
    }
  },

  // ────────────────────────────────────────────────────────────────
  // Add this as the **very last** item
  //eslintPluginPrettierRecommended
);