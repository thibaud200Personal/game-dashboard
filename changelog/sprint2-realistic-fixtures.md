# Sprint 2 — Fixtures Réalistes

## Problème
Les données de test actuelles sont minimales et ne représentent pas des jeux BGG réels avec toutes leurs métadonnées (categories[], mechanics[], designers[], is_expansion, etc.).

## État actuel

### `src/__tests__/utils/test-utils.tsx` (lignes 129–145)
```typescript
export const mockBGGGameData = {
  id: 266192,
  name: 'Wingspan',
  // champs basiques uniquement, arrays vides
  categories: [],
  mechanics: [],
  designers: [],
};
```

### `src/__tests__/mocks/server.ts` (lignes 4–32)
Mock Wingspan simplifié avec `expansions: []`, `characters: []`, champs BGG incomplets.

## Ce qui manque

### Répertoire `src/__tests__/fixtures/`

#### `bgg-gloomhaven.ts`
Jeu coopératif complexe avec campagne, personnages :
```typescript
export const BGG_GLOOMHAVEN: BGGGame = {
  id: 174430,
  name: 'Gloomhaven',
  categories: ['Adventure', 'Exploration', 'Fantasy', 'Fighting', 'Miniatures'],
  mechanics: ['Campaign / Battle Card Driven', 'Cooperative Game', 'Deck, Bag, and Pool Building'],
  designers: ['Isaac Childres'],
  publishers: ['Cephalofair Games'],
  supports_cooperative: true, supports_competitive: false, supports_campaign: true,
  characters: [ /* 6 personnages de base */ ],
  expansions: [ { bgg_expansion_id: 226868, name: 'Forgotten Circles', ... } ],
  is_expansion: false,
  rating: 8.7, weight: 3.86,
  // ...
};
```

#### `bgg-wingspan.ts`
Jeu compétitif, sans personnages :
```typescript
export const BGG_WINGSPAN: BGGGame = {
  id: 266192,
  name: 'Wingspan',
  categories: ['Animals', 'Card Game', 'Economic'],
  mechanics: ['Card Drafting', 'Engine Building', 'Hand Management'],
  designers: ['Elizabeth Hargrave'],
  supports_competitive: true, supports_cooperative: false,
  characters: [], expansions: [...],
  rating: 8.0, weight: 2.45,
};
```

#### `bgg-catan.ts`
Jeu compétitif classique simple :
```typescript
export const BGG_CATAN: BGGGame = {
  id: 13,
  name: 'Catan',
  categories: ['Negotiation'],
  mechanics: ['Dice Rolling', 'Trading'],
  designers: ['Klaus Teuber'],
  supports_competitive: true,
  characters: [], expansions: [],
  rating: 7.1, weight: 2.33,
};
```

#### `bgg-expansion.ts`
Exemple d'extension (`is_expansion: true`) :
```typescript
export const BGG_WINGSPAN_EUROPA: BGGGame = {
  id: 302672,
  name: 'Wingspan: European Expansion',
  is_expansion: true,
  base_game_id: 266192,
  // ...
};
```

## Format des fichiers
Chaque fixture exporte des constantes typées `BGGGame` depuis `@/types`, avec **toutes** les métadonnées renseignées pour tester les cas limites.

## Fichiers à créer
- `src/__tests__/fixtures/bgg-gloomhaven.ts`
- `src/__tests__/fixtures/bgg-wingspan.ts`
- `src/__tests__/fixtures/bgg-catan.ts`
- `src/__tests__/fixtures/bgg-expansion.ts`

## Estimation
1 jour
