import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}'],
  ignore: [
    // shadcn/ui components — auto-generated, not directly imported by app code
    'src/components/ui/**',
    // used by src/components/ui/sidebar.tsx — false positive since ui/ is ignored above
    'src/hooks/use-mobile.ts',
    // manual BGG test script, not part of the app
    'src/utils/testBGG.ts',
    // single source of truth for all TS types — exported speculatively for documentation
    'src/types/index.ts',
    // test utilities — exported for reuse across test files
    'src/__tests__/mocks/server.ts',
    'src/__tests__/utils/test-utils.tsx',
  ],
  ignoreDependencies: [
    // shadcn/ui components (ignored above) import these — knip can't see it
    '@radix-ui/*',
    'cmdk',                          // src/components/ui/command.tsx
    'embla-carousel-react',          // src/components/ui/carousel.tsx
    'input-otp',                     // src/components/ui/input-otp.tsx
    'react-day-picker',              // src/components/ui/calendar.tsx
    'vaul',                          // src/components/ui/drawer.tsx
    '@tailwindcss/container-queries', // src/components/ui/card.tsx uses @container
    // Planned — not yet used but scheduled for Sprint 2+
    'react-hook-form',
    'recharts',
    // Transitive dep of typescript-eslint, imported directly in eslint.config.js
    // Cannot be installed explicitly due to peer dep conflict — provided by typescript-eslint
    '@typescript-eslint/eslint-plugin',
    // Used by vitest --coverage CLI flag, not imported directly
    '@vitest/coverage-v8',
    // Used in eslint.config.js (not scanned by knip) as the unified TS-ESLint package
    'typescript-eslint',
  ],
  ignoreBinaries: [
    // fuser is a Linux system binary used in the `kill` npm script — not an npm package
    'fuser',
  ],
};

export default config;
