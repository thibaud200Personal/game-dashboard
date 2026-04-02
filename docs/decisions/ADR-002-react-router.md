# ADR-002 — Navigation par URL avec React Router v7

**Date** : 31 mars 2026
**Statut** : Accepté

## Contexte

La navigation actuelle est state-based : `currentView` (string) + `navigationContext` (id + source) dans `App.tsx`. Conséquences :
- F5 ramène toujours à l'accueil
- Pas de liens directs partageables
- Pas d'historique navigateur
- `App.tsx` cumule shell + routeur + gestionnaire d'état

## Décision

Adopter React Router v7. Chaque page a une URL. `App.tsx` devient un shell pur. `navigationContext` est remplacé par l'historique navigateur (`navigate(-1)`) et `location.state` pour les cas contextuels.

## Gestion de la navigation contextuelle mobile

Le `navigationContext` servait à savoir "depuis quel écran je viens" pour le bouton retour mobile. Avec React Router :

- Cas simple (retour linéaire) : `navigate(-1)` — historique navigateur natif
- Cas contextuel (retour vers un onglet précis) : `navigate('/stats/games/42', { state: { from: '/games' } })`, récupéré avec `useLocation().state`

## Responsive layout

La migration React Router est orthogonale au responsive. `BottomNavigation` utilise `useLocation()` pour l'état actif et `<Link>` pour la navigation. Le hook `use-mobile.ts` et les classes Tailwind responsives sont inchangés.

## Conséquences

**Positives :**
- URLs réelles : deep links, F5, historique navigateur
- `App.tsx` réduit à son rôle de shell
- `navigationContext` et `handleNavigation` supprimés (~50 lignes)
- Standard React — meilleure connaissance de l'écosystème

**Négatives :**
- Migration non triviale : chaque appel à `handleNavigation` doit être converti
- Les cas de navigation contextuelle mobile nécessitent une analyse cas par cas
- React Router ajoute une dépendance

## Alternatives rejetées

- **Garder la navigation state-based** : n'adresse pas les limitations UX (pas d'URL)
- **TanStack Router** : plus récent, bonne DX, mais moins mature et migration plus coûteuse
