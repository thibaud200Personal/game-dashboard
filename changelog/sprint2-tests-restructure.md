# Sprint 2 — Restructuration Tests

## Problème
La structure des tests est plate (`components/`, `hooks/`, `services/`). L'objectif est une organisation par nature des tests : technique, fonctionnelle, intégration.

## Structure actuelle
```
src/__tests__/
├── components/
│   ├── BGGSearch.test.tsx
│   ├── BottomNavigation.test.tsx
│   └── SimpleDashboard.test.tsx
├── hooks/
│   └── useGamesPage.test.ts
├── services/
│   └── bggApi.test.ts
├── mocks/
│   └── server.ts
├── utils/
│   └── test-utils.tsx
├── setup.ts
└── infrastructure.test.ts
```

## Structure cible
```
src/__tests__/
├── unit/
│   ├── technical/       ← hooks, services purs (logique sans UI)
│   │   ├── useGamesPage.test.ts
│   │   ├── bggApi.test.ts
│   │   └── bggService.test.ts      (nouveau, voir sprint2-bgg-backend-tests)
│   └── functional/      ← composants avec comportement utilisateur
│       ├── BGGSearch.test.tsx
│       ├── BottomNavigation.test.tsx
│       └── SimpleDashboard.test.tsx
├── integration/         ← workflows complets multi-composants
│   └── bggRoutes.test.ts           (nouveau, voir sprint2-bgg-backend-tests)
├── fixtures/            ← données BGG réalistes (nouveau, voir sprint2-realistic-fixtures)
│   ├── bgg-gloomhaven.ts
│   ├── bgg-wingspan.ts
│   ├── bgg-catan.ts
│   └── bgg-expansion.ts
├── mocks/
│   └── server.ts
├── utils/
│   └── test-utils.tsx
└── setup.ts
```

## Actions

### 1. Déplacer les fichiers existants
- `components/*.test.tsx` → `unit/functional/`
- `hooks/*.test.ts` → `unit/technical/`
- `services/bggApi.test.ts` → `unit/technical/`

### 2. Supprimer `infrastructure.test.ts`
3 tests triviaux (`expect(true).toBe(true)`, math) sans valeur réelle.

### 3. Vérifier `vitest.config.ts`
Le pattern actuel `src/__tests__/**/*.{test,spec}.{...}` couvrira automatiquement la nouvelle structure — pas de changement nécessaire normalement.

### 4. Mettre à jour les imports dans les fichiers déplacés
Vérifier que les imports relatifs (`../utils/test-utils`, `../mocks/server`) restent valides après déplacement.

## Fichiers à modifier
- `vitest.config.ts` — vérifier pattern (probablement aucun changement)
- Tous les fichiers de test déplacés — mettre à jour imports relatifs si nécessaire

## Estimation
0,5 jour (déplacement + vérification imports)
