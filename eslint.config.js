import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.d.ts',
      'packages/',
      '.git/',
      'test-backend.mjs',
      'backend/**/*',
      // shadcn/ui auto-generated components — do not lint manually
      'src/components/ui/**',
      // shadcn/ui hook — do not lint manually
      'src/hooks/use-mobile.ts'
    ]
  },
  ...compat.extends('eslint:recommended'),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020
      },
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'sonarjs': sonarjs,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      // Disabled: covered by @typescript-eslint/no-unused-vars with _ prefix convention
      'sonarjs/no-unused-vars': 'off',
      // Raised threshold: React components naturally have higher complexity
      'sonarjs/cognitive-complexity': ['error', 25],
      // Disabled: nested ternaries are idiomatic in JSX conditional rendering
      'sonarjs/no-nested-conditional': 'off',
      // Disabled: nested template literals are common in Tailwind className strings
      'sonarjs/no-nested-template-literals': 'off',
      // Disabled: nested functions are common in React event handlers (e.g. map > onChange)
      'sonarjs/no-nested-functions': 'off',
      // Disabled: inline union types are common in React prop definitions
      'sonarjs/use-type-alias': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'error',
      'semi': ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'no-unused-vars': 'off',
    },
  },
];