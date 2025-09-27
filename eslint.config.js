import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'tests/e2e/playwright-report', 'tests/e2e/test-results'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Error handling and boundaries
      'no-console': 'warn',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Performance monitoring
      'no-unused-vars': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',

      // TypeScript specific for production hardening
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Security and constitutional compliance
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Edge runtime compatibility
      'no-process-env': 'off', // Allowed in edge functions
      'no-restricted-globals': ['error', 'window', 'document'], // Warn about client-side globals in server code
    },
  },
  {
    // Test files specific configuration
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // API/Edge function specific configuration
    files: ['src/app/api/**/*.{ts,tsx}', 'src/inngest/**/*.{ts,tsx}', 'src/middleware.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    rules: {
      'no-restricted-globals': 'off', // Allow Node.js globals in API routes
    },
  }
);
