# Sprint 3 — BGGSearch — Harmonisation FR/EN

## Problème
`BGGSearch.tsx` et plusieurs dialogs mélangent du texte français et anglais dans la même interface.

## Textes EN à corriger (vers FR)

### `src/components/BGGSearch.tsx`
- **Ligne ~91** — placeholder : `"Search by name or enter BGG ID..."` → `"Rechercher par nom ou entrer un ID BGG..."`
- Vérifier les autres strings EN dans le composant (boutons, états de chargement, messages d'erreur)

### Textes FR déjà corrects (à ne pas toucher)
- **Ligne ~158** — `"Données de BoardGameGeek.com · Entrez un ID BGG pour un chargement direct"` ✅

## Audit complet — fichiers concernés

### `src/components/dialogs/AddGameDialog.tsx`
Vérifier les strings EN dans :
- Labels de champs (ex: "Game name", "Description")
- Boutons (ex: "Save", "Cancel", "Add")
- Messages d'état

### `src/components/dialogs/EditGameDialog.tsx`
Même vérification.

### `src/views/GamesPageView.tsx`
- Filtres et labels de catégories

## Action
1. Grep `"[A-Z][a-z]"` (strings capitalisées EN) dans les 4 fichiers pour identifier tous les candidats
2. Remplacer par les équivalents FR
3. Conserver les noms propres (BoardGameGeek, BGG) tels quels

## Commande de recherche utile
```bash
grep -n '"[A-Z][a-z]\+ ' src/components/BGGSearch.tsx src/components/dialogs/AddGameDialog.tsx src/components/dialogs/EditGameDialog.tsx src/views/GamesPageView.tsx
```

## Fichiers à modifier
- `src/components/BGGSearch.tsx`
- `src/components/dialogs/AddGameDialog.tsx`
- `src/components/dialogs/EditGameDialog.tsx`
- `src/views/GamesPageView.tsx`

## Estimation
< 1 jour
