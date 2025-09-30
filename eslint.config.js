import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.next', 'dist', 'tests/e2e/playwright-report', 'tests/e2e/test-results'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // General hygiene
      'no-console': 'warn',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',

      // TypeScript-focused rules (relaxed for legacy code)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-require-imports': 'off',

      // Security and runtime safeguards
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Edge runtime compatibility
      'no-process-env': 'off',
      'no-restricted-globals': ['error', 'window', 'document'],
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
