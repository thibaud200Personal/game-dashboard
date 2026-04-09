/**
 * Configuration Vitest pour Board Game Dashboard
 * Basé sur la configuration Jest de board-game-scorekeep (52/52 tests ✅)
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: true,
    
    // Configuration des fichiers de tests
    include: [
      'src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Timeout étendu pour les tests d'intégration
    testTimeout: 10000,
    reporters: process.env.CI
      ? ['verbose', ['junit', { outputFile: 'test-results/frontend.xml', suiteName: 'Frontend' }]]
      : ['verbose'],
    
    // Couverture de code - standards de board-game-scorekeep
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});