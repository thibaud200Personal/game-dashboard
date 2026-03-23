# Sprint 3 — Recalcul has_expansion / has_characters à l'import BGG

## Problème
Lors de l'import BGG, les checkboxes `has_expansion` et `has_characters` ne sont jamais automatiquement cochées, même si le jeu BGG a des extensions ou des personnages. Elles restent à `false` par défaut.

## État actuel

### `src/components/dialogs/AddGameDialog.tsx`
- **Ligne ~632–636** : checkbox `has_expansion` — valeur par défaut `false`, jamais mise à jour lors de la sélection BGG
- **Ligne ~682–686** : checkbox `has_characters` — même problème
- **Lignes 271–291** : callback `onFormDataChange` lors de sélection BGG — ne contient ni `has_expansion` ni `has_characters`

### Backend `backend/bggService.ts` (lignes ~184–190)
```typescript
const expansions = (item.links?.boardgameexpansion || []).map(...).filter(...)
// ✅ expansions[] est bien retourné
characters: [] // ✅ initialisé (BGG ne fournit pas de personnages)
```

## Fix

### `src/components/dialogs/AddGameDialog.tsx` (lignes 271–291)
Ajouter dans le même callback que `sprint3-bgg-characters-init` :
```typescript
has_expansion: (bggGame.expansions?.length || 0) > 0,
has_characters: (bggGame.characters?.length || 0) > 0,
```

## Notes
- `has_characters` sera toujours `false` à l'import BGG (BGG ne fournit pas de personnages) — comportement attendu
- `has_expansion` sera `true` si BGG référence des extensions pour ce jeu
- Ce fix est à combiner avec `sprint3-bgg-characters-init` dans le même commit

## Fichiers à modifier
- `src/components/dialogs/AddGameDialog.tsx` — 2 lignes à ajouter dans le callback sélection BGG

## Estimation
< 1 jour (à combiner avec sprint3-bgg-characters-init)
