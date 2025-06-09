// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    rules: {
      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React Native 관련 규칙
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off', // React 17+ 에서는 불필요

      // Prettier 관련
      'prettier/prettier': 'error',
    },
  },
]);
