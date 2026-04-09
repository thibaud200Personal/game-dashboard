import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['dist/**', 'node_modules/**'],
    reporters: process.env.CI
      ? ['verbose', ['junit', { outputFile: '../test-results/backend.xml', suiteName: 'Backend' }]]
      : ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
})
