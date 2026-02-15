import { nestJsConfig } from '@artemis/config-eslint/nest-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
  {
    ignores: ['eslint.config.mjs'],
  },
];
