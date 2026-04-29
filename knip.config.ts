import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}'],
  ignore: [
    // single source of truth for all TS types — exported speculatively for documentation
    'src/types/index.ts',
  ],
  ignoreDependencies: [
    // shadcn/ui components import these — knip can't see CSS/non-TS imports
    '@radix-ui/*',
    '@tailwindcss/container-queries', // card.tsx uses @container
    // Planned — not yet used
    'react-hook-form',
    'recharts',
    // Transitive dep of typescript-eslint, imported directly in eslint.config.js
    // Cannot be installed explicitly due to peer dep conflict — provided by typescript-eslint
    '@typescript-eslint/eslint-plugin',
    // Used in eslint.config.js (not scanned by knip) as the unified TS-ESLint package
    'typescript-eslint',
  ],
  ignoreBinaries: [
    // fuser is a Linux system binary used in the `kill` npm script — not an npm package
    'fuser',
  ],
};

export default config;
