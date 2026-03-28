// One-time audit config — full SonarJS recommended at threshold 15, no project overrides
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/', 'node_modules/', '*.d.ts', 'packages/', '.git/',
      'test-backend.mjs', 'backend/**/*',
      'src/components/ui/**', 'src/hooks/use-mobile.ts',
      'src/__tests__/**',
      'eslint.audit.config.js'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.es2020 },
      parser: typescriptParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
      'sonarjs': sonarjs,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_', varsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off',
    },
  },
];
