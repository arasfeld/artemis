import { config } from '@artemis/eslint-config/base';
import globals from 'globals';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    files: ['*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
