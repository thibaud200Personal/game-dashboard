# Sprint 1 — Formulaire BGG Pré-Import

## Problème
Lors d'un import BGG, les données sont transférées directement vers le formulaire de création sans étape de validation/édition visible et claire. L'utilisateur n'a pas de vue dédiée pour modifier les champs BGG avant sauvegarde.

## État actuel

### Flux actuel
`BGGSearch.tsx` → sélection → `onGameSelect(bggGame)` → `AddGameDialog` prérempli → sauvegarde directe

### Fichiers concernés
- `src/components/BGGSearch.tsx` : appelle `onGameSelect` directement après sélection
- `src/components/dialogs/AddGameDialog.tsx` : formulaire principal, reçoit les données BGG via `onFormDataChange`

### Ce qui manque
Une étape intermédiaire claire entre "sélection dans la liste BGG" et "bouton Sauvegarder" où l'utilisateur peut :
- Voir et modifier tous les champs pré-remplis (name, description, image, categories, mechanics, min/max players, etc.)
- Valider les données avant insertion en base

## Référence
`board-game-scorekeep` a un composant formulaire d'édition complet à porter/adapter.

## Fichiers à modifier / créer

### 1. `src/components/dialogs/AddGameDialog.tsx`
- Ajouter un état `step: 'search' | 'edit'`
- Quand un jeu BGG est sélectionné → passer en mode `edit` avec tous les champs pré-remplis et éditables
- Afficher clairement tous les champs importés : thumbnail, categories[], mechanics[], designers[], publishers[], playing_time, etc.
- Bouton "Retour à la recherche" pour changer de jeu

### 2. `src/components/BGGSearch.tsx` (optionnel)
- Peut rester inchangé si l'état est géré dans `AddGameDialog`

## Estimation
3-4 jours
