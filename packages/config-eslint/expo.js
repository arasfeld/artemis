import { globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";

/**
 * A custom ESLint configuration for Expo/React Native apps.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...expoConfig,
  eslintPluginPrettier,
  eslintConfigPrettier,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  globalIgnores(["dist/**"]),
];
