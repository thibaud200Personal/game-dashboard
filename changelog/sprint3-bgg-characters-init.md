# Sprint 3 — BGGGameDetails.characters — Initialisation à []

## Problème
Quand un jeu est importé depuis BGG via `AddGameDialog`, le champ `characters` n'est pas initialisé à `[]` dans le formulaire front. Il est `undefined` en runtime jusqu'à ce qu'un personnage soit ajouté manuellement.

## État actuel

### Backend (correct) — `backend/bggService.ts` (ligne ~231)
```typescript
characters: [], // ✅ toujours initialisé côté API
```

### Frontend (bug) — `src/components/dialogs/AddGameDialog.tsx` (lignes 271–291)
Callback appelé lors de la sélection d'un jeu BGG (`onFormDataChange`) :
```typescript
onFormDataChange({
  name: bggGame.name,
  image: bggGame.image,
  year_published: bggGame.year_published,
  // ... autres champs
  // ❌ characters absent → formData.characters = undefined
});
```

## Fix

### `src/components/dialogs/AddGameDialog.tsx` (lignes 271–291)
Ajouter dans le callback :
```typescript
characters: bggGame.characters || [],
```

## Impact
- Évite les erreurs `Cannot read properties of undefined (reading 'length')` sur `formData.characters`
- Rend le comportement cohérent avec le backend (qui retourne toujours `characters: []`)
- Ce fix doit être appliqué dans le même callback que `sprint3-bgg-flags-recalculation`

## Fichiers à modifier
- `src/components/dialogs/AddGameDialog.tsx` — 1 ligne à ajouter

## Estimation
< 1 jour (à combiner avec sprint3-bgg-flags-recalculation)
