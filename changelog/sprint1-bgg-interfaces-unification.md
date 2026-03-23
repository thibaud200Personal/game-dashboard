# Sprint 1 — Unification Interfaces BGG

## Problème
`BGGGame` / `BGGGameDetails` et interfaces associées sont définies à **3 endroits distincts** avec des noms légèrement différents. Toute modification d'un champ doit être répercutée manuellement dans les 3 fichiers — risque de désynchronisation silencieuse.

## Localisation des doublons

### 1. `backend/bggService.ts` (lignes 54–103)
```typescript
interface BGGGameDetails { ... }   // nom différent du frontend
interface BGGExpansion { ... }
interface BGGCharacter { ... }
interface BGGSearchResult { ... }
```

### 2. `src/services/bggApi.ts` (lignes 3–56)
```typescript
export interface BGGGame { ... }   // nom différent du backend
export interface BGGExpansion { ... }
export interface BGGCharacter { ... }
export interface BGGSearchResult { ... }
```

### 3. `src/types/index.ts` (lignes 160–205)
```typescript
export interface BGGGame { ... }
export interface BGGExpansion { ... }
export interface BGGCharacter { ... }
// BGGSearchResult absent ici
```

## Action

### Source de vérité unique : `src/types/index.ts`
1. Consolider toutes les définitions BGG dans `src/types/index.ts`
2. Ajouter `BGGSearchResult` si absent
3. Unifier le nom : `BGGGame` (pas `BGGGameDetails`)

### `src/services/bggApi.ts`
Remplacer les interfaces locales par des imports :
```typescript
import type { BGGGame, BGGExpansion, BGGCharacter, BGGSearchResult } from '@/types';
```

### `backend/bggService.ts`
Deux options :
- **Option A** (simple) : dupliquer les interfaces backend mais les aligner manuellement sur `src/types/index.ts`
- **Option B** (robuste) : créer `src/types/bgg.ts` exporté séparément, importable depuis backend aussi

## Fichiers à modifier
- `src/types/index.ts` — consolider
- `src/services/bggApi.ts` — supprimer interfaces locales, importer depuis `@/types`
- `backend/bggService.ts` — aligner sur la définition unifiée

## Estimation
1 jour
