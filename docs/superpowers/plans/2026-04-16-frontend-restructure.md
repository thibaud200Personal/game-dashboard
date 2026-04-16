# Restructuration feature-based du frontend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réorganiser `src/` d'une architecture par type de fichier (components/views/hooks) vers une architecture feature-based (features/games/, features/players/, etc.) avec `src/shared/` pour les modules transversaux.

**Architecture:** Chaque feature est autonome : container + vue + hook + API + dialogs + tests co-localisés. Les modules transversaux (shadcn UI, auth, i18n, hooks partagés) vivent dans `src/shared/`. Aucune feature n'importe depuis une autre feature (sauf `features/bgg/` qui est une feature utilitaire).

**Tech Stack:** React 19, TypeScript, Vite (alias `@/` → `src/`, `@shared` → `/shared` pour les types partagés front+back), Vitest, MSW, React Query v5

---

## Rappel de l'alias Vite

```ts
// vite.config.ts (ne pas modifier)
'@'      → '/src'        // @/shared/... = src/shared/...
'@shared' → '/shared'   // @shared/types = shared/types/index.d.ts (types front+back — NE PAS CONFONDRE)
```

`@/shared/` est le dossier frontend `src/shared/`. `@shared/` est le dossier racine `/shared` (types partagés avec le backend). Ce sont deux choses différentes.

---

## Task 1 : Créer `src/shared/`

**Fichiers déplacés :**
- `src/components/ui/` → `src/shared/components/ui/` (dossier entier, 30+ fichiers shadcn)
- `src/lib/utils.ts` → `src/shared/lib/utils.ts`
- `src/contexts/AuthContext.tsx` → `src/shared/contexts/AuthContext.tsx`
- `src/services/api/request.ts` → `src/shared/services/api/request.ts`
- `src/services/api/queryKeys.ts` → `src/shared/services/api/queryKeys.ts`
- `src/services/api/authApi.ts` → `src/shared/services/api/authApi.ts`
- `src/services/api/labelsApi.ts` → `src/shared/services/api/labelsApi.ts`
- `src/services/api/statsApi.ts` → `src/shared/services/api/statsApi.ts`
- `src/hooks/useLabels.ts` → `src/shared/hooks/useLabels.ts`
- `src/hooks/useLocale.ts` → `src/shared/hooks/useLocale.ts`
- `src/hooks/useLocales.ts` → `src/shared/hooks/useLocales.ts`
- `src/hooks/useApiReachable.ts` → `src/shared/hooks/useApiReachable.ts`
- `src/hooks/useNavigationAdapter.ts` → `src/shared/hooks/useNavigationAdapter.ts`
- `src/hooks/use-mobile.ts` → `src/shared/hooks/use-mobile.ts`
- `src/i18n/en.json` → `src/shared/i18n/en.json`
- `src/utils/gameHelpers.ts` → `src/shared/utils/gameHelpers.ts`
- `src/styles/theme.css` → `src/shared/styles/theme.css`

**Fichiers supplémentaires déplacés vers `src/shared/components/` :**
- `src/components/Layout.tsx` → `src/shared/components/Layout.tsx`
- `src/components/BottomNavigation.tsx` → `src/shared/components/BottomNavigation.tsx`

**Fichiers qui restent dans `src/services/api/` pour l'instant** (ils seront déplacés dans leur feature) : `gameApi.ts`, `playerApi.ts`, `sessionApi.ts`.

- [ ] **Step 1 : Créer les dossiers cibles**

```bash
mkdir -p src/shared/components
mkdir -p src/shared/contexts
mkdir -p src/shared/services/api
mkdir -p src/shared/hooks
mkdir -p src/shared/i18n
mkdir -p src/shared/utils
mkdir -p src/shared/lib
mkdir -p src/shared/styles
```

- [ ] **Step 2 : Déplacer les fichiers avec git mv**

```bash
git mv src/components/Layout.tsx src/shared/components/Layout.tsx
git mv src/components/BottomNavigation.tsx src/shared/components/BottomNavigation.tsx
git mv src/components/ui src/shared/components/ui
git mv src/lib/utils.ts src/shared/lib/utils.ts
git mv src/contexts/AuthContext.tsx src/shared/contexts/AuthContext.tsx
git mv src/services/api/request.ts src/shared/services/api/request.ts
git mv src/services/api/queryKeys.ts src/shared/services/api/queryKeys.ts
git mv src/services/api/authApi.ts src/shared/services/api/authApi.ts
git mv src/services/api/labelsApi.ts src/shared/services/api/labelsApi.ts
git mv src/services/api/statsApi.ts src/shared/services/api/statsApi.ts
git mv src/hooks/useLabels.ts src/shared/hooks/useLabels.ts
git mv src/hooks/useLocale.ts src/shared/hooks/useLocale.ts
git mv src/hooks/useLocales.ts src/shared/hooks/useLocales.ts
git mv src/hooks/useApiReachable.ts src/shared/hooks/useApiReachable.ts
git mv src/hooks/useNavigationAdapter.ts src/shared/hooks/useNavigationAdapter.ts
git mv src/hooks/use-mobile.ts src/shared/hooks/use-mobile.ts
git mv src/i18n/en.json src/shared/i18n/en.json
git mv src/utils/gameHelpers.ts src/shared/utils/gameHelpers.ts
git mv src/styles/theme.css src/shared/styles/theme.css
```

- [ ] **Step 3 : Mettre à jour les imports — `@/lib/utils` → `@/shared/lib/utils`**

Utilisé dans 42 fichiers (tous les composants shadcn + quelques vues).

```bash
grep -rl "@/lib/utils" src --include="*.ts" --include="*.tsx" | xargs sed -i 's|@/lib/utils|@/shared/lib/utils|g'
```

- [ ] **Step 4 : Mettre à jour les imports — `@/components/ui/` → `@/shared/components/ui/` + Layout/BottomNavigation**

```bash
grep -rl "@/components/ui" src --include="*.ts" --include="*.tsx" | xargs sed -i 's|@/components/ui/|@/shared/components/ui/|g'
grep -rl "@/components/Layout\|components/Layout" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/components/Layout|@/shared/components/Layout|g"
grep -rl "@/components/BottomNavigation\|./BottomNavigation" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|./BottomNavigation|@/shared/components/BottomNavigation|g"
```

Mettre également à jour App.tsx pour les imports lazy de Layout :

```tsx
// avant
const Layout = lazy(() => import('./components/Layout'));
// après
const Layout = lazy(() => import('./shared/components/Layout'));
```

- [ ] **Step 5 : Mettre à jour les imports — contextes, services API partagés**

```bash
grep -rl "@/contexts/" src --include="*.ts" --include="*.tsx" | xargs sed -i 's|@/contexts/|@/shared/contexts/|g'
grep -rl "@/services/api/request" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/services/api/request|@/shared/services/api/request|g"
grep -rl "@/services/api/queryKeys" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/services/api/queryKeys|@/shared/services/api/queryKeys|g"
grep -rl "@/services/api/authApi" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/services/api/authApi|@/shared/services/api/authApi|g"
grep -rl "@/services/api/labelsApi" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/services/api/labelsApi|@/shared/services/api/labelsApi|g"
grep -rl "@/services/api/statsApi" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/services/api/statsApi|@/shared/services/api/statsApi|g"
```

- [ ] **Step 6 : Mettre à jour les imports — hooks partagés**

```bash
grep -rl "@/hooks/useLabels" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/useLabels|@/shared/hooks/useLabels|g"
grep -rl "@/hooks/useLocale\b" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/useLocale'|@/shared/hooks/useLocale'|g; s|@/hooks/useLocale\"|@/shared/hooks/useLocale\"|g"
grep -rl "@/hooks/useLocales" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/useLocales|@/shared/hooks/useLocales|g"
grep -rl "@/hooks/useApiReachable" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/useApiReachable|@/shared/hooks/useApiReachable|g"
grep -rl "@/hooks/useNavigationAdapter" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/useNavigationAdapter|@/shared/hooks/useNavigationAdapter|g"
grep -rl "@/hooks/use-mobile" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/hooks/use-mobile|@/shared/hooks/use-mobile|g"
```

- [ ] **Step 7 : Mettre à jour les imports — utils et i18n**

```bash
grep -rl "@/utils/gameHelpers" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/utils/gameHelpers|@/shared/utils/gameHelpers|g"
grep -rl "@/i18n/en.json" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/i18n/en.json|@/shared/i18n/en.json|g"
```

- [ ] **Step 8 : Vérifier qu'il ne reste aucun import cassé**

```bash
# Ne doit retourner que des fichiers dans src/shared/ elle-même (imports internes au dossier shared)
grep -r "from '@/components/ui/\|from '@/lib/utils\|from '@/contexts/\|from '@/hooks/useLabels\|from '@/hooks/useLocale\|from '@/hooks/useApiReachable\|from '@/hooks/useNavigationAdapter\|from '@/utils/gameHelpers\|from '@/i18n/" src --include="*.ts" --include="*.tsx" | grep -v "src/shared"
# Résultat attendu : aucune ligne
```

- [ ] **Step 9 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent (même nombre qu'avant).

- [ ] **Step 10 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer modules partagés vers src/shared/"
```

---

## Task 2 : `features/auth/`

**Fichiers déplacés :**
- `src/components/LoginPage.tsx` → `src/features/auth/LoginPage.tsx`

- [ ] **Step 1 : Créer le dossier**

```bash
mkdir -p src/features/auth
```

- [ ] **Step 2 : Déplacer le fichier**

```bash
git mv src/components/LoginPage.tsx src/features/auth/LoginPage.tsx
```

- [ ] **Step 3 : Mettre à jour App.tsx**

```tsx
// avant
const LoginPage = lazy(() => import('./components/LoginPage'));
// après
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
```

- [ ] **Step 4 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer LoginPage vers features/auth/"
```

---

## Task 3 : `features/bgg/`

**Fichiers déplacés :**
- `src/components/BGGSearch.tsx` → `src/features/bgg/BGGSearch.tsx`
- `src/services/bggApi.ts` → `src/features/bgg/bggApi.ts`
- `src/__tests__/components/BGGSearch.test.tsx` → `src/features/bgg/__tests__/BGGSearch.test.tsx`
- `src/__tests__/services/bggApi.test.ts` → `src/features/bgg/__tests__/bggApi.test.ts`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/bgg/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/BGGSearch.tsx src/features/bgg/BGGSearch.tsx
git mv src/services/bggApi.ts src/features/bgg/bggApi.ts
git mv src/__tests__/components/BGGSearch.test.tsx src/features/bgg/__tests__/BGGSearch.test.tsx
git mv src/__tests__/services/bggApi.test.ts src/features/bgg/__tests__/bggApi.test.ts
```

- [ ] **Step 3 : Mettre à jour les imports dans les fichiers déplacés**

Dans `src/features/bgg/BGGSearch.tsx`, les imports `@/` restent valides car `@/` pointe sur `src/`. Vérifier que l'import `bggApi` est bien mis à jour :

```bash
# Vérifier l'import de bggApi dans BGGSearch.tsx
grep "bggApi\|ApiService\|bggApiService" src/features/bgg/BGGSearch.tsx
```

Si BGGSearch.tsx importe `bggApi` via un chemin relatif ou `@/services/bggApi`, le corriger :

```bash
sed -i "s|@/services/bggApi|@/features/bgg/bggApi|g" src/features/bgg/BGGSearch.tsx
```

De même pour `bggApi.test.ts` :

```bash
sed -i "s|@/services/bggApi|@/features/bgg/bggApi|g" src/features/bgg/__tests__/bggApi.test.ts
sed -i "s|@/services/bggApi|@/features/bgg/bggApi|g" src/features/bgg/__tests__/BGGSearch.test.tsx
```

- [ ] **Step 4 : Mettre à jour les fichiers qui importent BGGSearch**

```bash
grep -rl "@/components/BGGSearch\|components/BGGSearch" src --include="*.ts" --include="*.tsx" | xargs sed -i "s|@/components/BGGSearch|@/features/bgg/BGGSearch|g"
```

- [ ] **Step 5 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer BGGSearch + bggApi vers features/bgg/"
```

---

## Task 4 : `features/games/` — core (GamesPage + dialogs)

**Fichiers déplacés :**
- `src/components/GamesPage.tsx` → `src/features/games/GamesPage.tsx`
- `src/views/GamesPageView.tsx` → `src/features/games/GamesPageView.tsx`
- `src/hooks/useGamesPage.ts` → `src/features/games/useGamesPage.ts`
- `src/services/api/gameApi.ts` → `src/features/games/gameApi.ts`
- `src/components/dialogs/AddGameDialog.tsx` → `src/features/games/dialogs/AddGameDialog.tsx`
- `src/components/dialogs/EditGameDialog.tsx` → `src/features/games/dialogs/EditGameDialog.tsx`
- `src/components/dialogs/DeleteGameDialog.tsx` → `src/features/games/dialogs/DeleteGameDialog.tsx`
- `src/__tests__/flows/GamesPage.flow.test.tsx` → `src/features/games/__tests__/GamesPage.flow.test.tsx`
- `src/__tests__/hooks/useGamesPage.test.ts` → `src/features/games/__tests__/useGamesPage.test.ts`
- `src/__tests__/services/gameDuplicate.test.ts` → `src/features/games/__tests__/gameDuplicate.test.ts`

**Note :** `src/components/dialogs/index.ts` contient le barrel export de TOUS les dialogs (games + players + characters + expansions). On crée un nouveau barrel dans `features/games/dialogs/index.ts` uniquement pour les dialogs games, et on ne supprime l'ancien qu'à la Task 10 (quand tous les dialogs auront migré).

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/games/dialogs
mkdir -p src/features/games/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/GamesPage.tsx src/features/games/GamesPage.tsx
git mv src/views/GamesPageView.tsx src/features/games/GamesPageView.tsx
git mv src/hooks/useGamesPage.ts src/features/games/useGamesPage.ts
git mv src/services/api/gameApi.ts src/features/games/gameApi.ts
git mv src/components/dialogs/AddGameDialog.tsx src/features/games/dialogs/AddGameDialog.tsx
git mv src/components/dialogs/EditGameDialog.tsx src/features/games/dialogs/EditGameDialog.tsx
git mv src/components/dialogs/DeleteGameDialog.tsx src/features/games/dialogs/DeleteGameDialog.tsx
git mv src/__tests__/flows/GamesPage.flow.test.tsx src/features/games/__tests__/GamesPage.flow.test.tsx
git mv src/__tests__/hooks/useGamesPage.test.ts src/features/games/__tests__/useGamesPage.test.ts
git mv src/__tests__/services/gameDuplicate.test.ts src/features/games/__tests__/gameDuplicate.test.ts
```

- [ ] **Step 3 : Créer `src/features/games/dialogs/index.ts`**

```ts
export { default as AddGameDialog } from './AddGameDialog';
export { default as EditGameDialog } from './EditGameDialog';
export { default as DeleteGameDialog } from './DeleteGameDialog';
```

- [ ] **Step 4 : Mettre à jour les imports dans les fichiers déplacés**

```bash
# gameApi : anciens imports vers @/shared/services/api/
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/useGamesPage.ts
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/GamesPage.tsx

# dialogs : mettre à jour les imports depuis GamesPageView
sed -i "s|@/components/dialogs|@/features/games/dialogs|g" src/features/games/GamesPageView.tsx
sed -i "s|@/components/dialogs|@/features/games/dialogs|g" src/features/games/GamesPage.tsx

# bggApi dans les dialogs
sed -i "s|@/services/bggApi|@/features/bgg/bggApi|g" src/features/games/dialogs/AddGameDialog.tsx
sed -i "s|@/services/bggApi|@/features/bgg/bggApi|g" src/features/games/dialogs/EditGameDialog.tsx
sed -i "s|@/components/BGGSearch|@/features/bgg/BGGSearch|g" src/features/games/dialogs/AddGameDialog.tsx
sed -i "s|@/components/BGGSearch|@/features/bgg/BGGSearch|g" src/features/games/dialogs/EditGameDialog.tsx

# tests
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/__tests__/gameDuplicate.test.ts
```

- [ ] **Step 5 : Mettre à jour App.tsx**

Dans `src/App.tsx`, l'import lazy de `GamesPage` doit pointer vers la nouvelle location :

```tsx
// avant
const GamesPage = lazy(() => import('./components/GamesPage'));
// après
const GamesPage = lazy(() => import('./features/games/GamesPage'));
```

Faire la modification dans `src/App.tsx`.

- [ ] **Step 6 : Vérifier qu'il ne reste aucun import cassé vers les fichiers déplacés**

```bash
grep -r "from '@/components/GamesPage\|from '@/views/GamesPageView\|from '@/hooks/useGamesPage\|from '@/services/api/gameApi" src --include="*.ts" --include="*.tsx"
# Résultat attendu : aucune ligne
```

- [ ] **Step 7 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 8 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer games core (GamesPage + dialogs + gameApi) vers features/games/"
```

---

## Task 5 : `features/games/` — sous-routes (detail, expansions, characters)

**Fichiers déplacés :**

*detail/*
- `src/components/GameDetailPage.tsx` → `src/features/games/detail/GameDetailPage.tsx`
- `src/views/games/GameDetailView.tsx` → `src/features/games/detail/GameDetailView.tsx`
- `src/hooks/games/useGameDetail.ts` → `src/features/games/detail/useGameDetail.ts`
- `src/components/GamePageRoute.tsx` → `src/features/games/detail/GamePageRoute.tsx`

*expansions/*
- `src/components/GameExpansionsPage.tsx` → `src/features/games/expansions/GameExpansionsPage.tsx`
- `src/views/games/GameExpansionsView.tsx` → `src/features/games/expansions/GameExpansionsView.tsx`
- `src/hooks/games/useGameExpansions.ts` → `src/features/games/expansions/useGameExpansions.ts`
- `src/components/dialogs/ExpansionDialogs.tsx` → `src/features/games/expansions/dialogs/ExpansionDialogs.tsx`

*characters/*
- `src/components/GameCharactersPage.tsx` → `src/features/games/characters/GameCharactersPage.tsx`
- `src/views/games/GameCharactersView.tsx` → `src/features/games/characters/GameCharactersView.tsx`
- `src/hooks/games/useGameCharacters.ts` → `src/features/games/characters/useGameCharacters.ts`
- `src/components/dialogs/CharacterDialogs.tsx` → `src/features/games/characters/dialogs/CharacterDialogs.tsx`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/games/detail
mkdir -p src/features/games/expansions/dialogs
mkdir -p src/features/games/characters/dialogs
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/GameDetailPage.tsx src/features/games/detail/GameDetailPage.tsx
git mv src/views/games/GameDetailView.tsx src/features/games/detail/GameDetailView.tsx
git mv src/hooks/games/useGameDetail.ts src/features/games/detail/useGameDetail.ts
git mv src/components/GamePageRoute.tsx src/features/games/detail/GamePageRoute.tsx
git mv src/components/GameExpansionsPage.tsx src/features/games/expansions/GameExpansionsPage.tsx
git mv src/views/games/GameExpansionsView.tsx src/features/games/expansions/GameExpansionsView.tsx
git mv src/hooks/games/useGameExpansions.ts src/features/games/expansions/useGameExpansions.ts
git mv src/components/dialogs/ExpansionDialogs.tsx src/features/games/expansions/dialogs/ExpansionDialogs.tsx
git mv src/components/GameCharactersPage.tsx src/features/games/characters/GameCharactersPage.tsx
git mv src/views/games/GameCharactersView.tsx src/features/games/characters/GameCharactersView.tsx
git mv src/hooks/games/useGameCharacters.ts src/features/games/characters/useGameCharacters.ts
git mv src/components/dialogs/CharacterDialogs.tsx src/features/games/characters/dialogs/CharacterDialogs.tsx
```

- [ ] **Step 3 : Mettre à jour les imports dans les fichiers déplacés**

```bash
# detail
sed -i "s|@/hooks/games/useGameDetail|./useGameDetail|g" src/features/games/detail/GameDetailPage.tsx
sed -i "s|@/views/games/GameDetailView|./GameDetailView|g" src/features/games/detail/GameDetailPage.tsx
sed -i "s|@/components/GameDetailPage|@/features/games/detail/GameDetailPage|g" src/features/games/detail/GamePageRoute.tsx
sed -i "s|@/components/GameExpansionsPage|@/features/games/expansions/GameExpansionsPage|g" src/features/games/detail/GamePageRoute.tsx
sed -i "s|@/components/GameCharactersPage|@/features/games/characters/GameCharactersPage|g" src/features/games/detail/GamePageRoute.tsx
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/detail/useGameDetail.ts

# expansions
sed -i "s|@/hooks/games/useGameExpansions|./useGameExpansions|g" src/features/games/expansions/GameExpansionsPage.tsx
sed -i "s|@/views/games/GameExpansionsView|./GameExpansionsView|g" src/features/games/expansions/GameExpansionsPage.tsx
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/expansions/useGameExpansions.ts
sed -i "s|@/components/dialogs/ExpansionDialogs|./dialogs/ExpansionDialogs|g" src/features/games/expansions/GameExpansionsView.tsx

# characters
sed -i "s|@/hooks/games/useGameCharacters|./useGameCharacters|g" src/features/games/characters/GameCharactersPage.tsx
sed -i "s|@/views/games/GameCharactersView|./GameCharactersView|g" src/features/games/characters/GameCharactersPage.tsx
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/games/characters/useGameCharacters.ts
sed -i "s|@/components/dialogs/CharacterDialogs|./dialogs/CharacterDialogs|g" src/features/games/characters/GameCharactersView.tsx
```

- [ ] **Step 4 : Mettre à jour App.tsx**

Dans `src/App.tsx`, l'import lazy de `GamePageRoute` doit pointer vers la nouvelle location :

```tsx
// avant
const GamePageRoute = lazy(() => import('./components/GamePageRoute'));
// après
const GamePageRoute = lazy(() => import('./features/games/detail/GamePageRoute'));
```

- [ ] **Step 5 : Vérifier qu'il ne reste aucun import cassé**

```bash
grep -r "from '@/components/GameDetailPage\|from '@/components/GamePageRoute\|from '@/components/GameExpansionsPage\|from '@/components/GameCharactersPage\|from '@/hooks/games/\|from '@/views/games/" src --include="*.ts" --include="*.tsx"
# Résultat attendu : aucune ligne
```

- [ ] **Step 6 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 7 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer games sous-routes (detail, expansions, characters) vers features/games/"
```

---

## Task 6 : `features/players/`

**Fichiers déplacés :**
- `src/components/PlayersPage.tsx` → `src/features/players/PlayersPage.tsx`
- `src/views/PlayersPageView.tsx` → `src/features/players/PlayersPageView.tsx`
- `src/hooks/usePlayersPage.ts` → `src/features/players/usePlayersPage.ts`
- `src/services/api/playerApi.ts` → `src/features/players/playerApi.ts`
- `src/components/dialogs/AddPlayerDialog.tsx` → `src/features/players/dialogs/AddPlayerDialog.tsx`
- `src/components/dialogs/EditPlayerDialog.tsx` → `src/features/players/dialogs/EditPlayerDialog.tsx`
- `src/components/dialogs/DeletePlayerDialog.tsx` → `src/features/players/dialogs/DeletePlayerDialog.tsx`
- `src/__tests__/flows/PlayersPage.flow.test.tsx` → `src/features/players/__tests__/PlayersPage.flow.test.tsx`
- `src/__tests__/hooks/usePlayersPage.test.ts` → `src/features/players/__tests__/usePlayersPage.test.ts`
- `src/__tests__/services/playerDuplicate.test.ts` → `src/features/players/__tests__/playerDuplicate.test.ts`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/players/dialogs
mkdir -p src/features/players/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/PlayersPage.tsx src/features/players/PlayersPage.tsx
git mv src/views/PlayersPageView.tsx src/features/players/PlayersPageView.tsx
git mv src/hooks/usePlayersPage.ts src/features/players/usePlayersPage.ts
git mv src/services/api/playerApi.ts src/features/players/playerApi.ts
git mv src/components/dialogs/AddPlayerDialog.tsx src/features/players/dialogs/AddPlayerDialog.tsx
git mv src/components/dialogs/EditPlayerDialog.tsx src/features/players/dialogs/EditPlayerDialog.tsx
git mv src/components/dialogs/DeletePlayerDialog.tsx src/features/players/dialogs/DeletePlayerDialog.tsx
git mv src/__tests__/flows/PlayersPage.flow.test.tsx src/features/players/__tests__/PlayersPage.flow.test.tsx
git mv src/__tests__/hooks/usePlayersPage.test.ts src/features/players/__tests__/usePlayersPage.test.ts
git mv src/__tests__/services/playerDuplicate.test.ts src/features/players/__tests__/playerDuplicate.test.ts
```

- [ ] **Step 3 : Créer `src/features/players/dialogs/index.ts`**

```ts
export { default as AddPlayerDialog } from './AddPlayerDialog';
export { default as EditPlayerDialog } from './EditPlayerDialog';
export { default as DeletePlayerDialog } from './DeletePlayerDialog';
```

- [ ] **Step 4 : Mettre à jour les imports dans les fichiers déplacés**

```bash
sed -i "s|@/services/api/playerApi|@/features/players/playerApi|g" src/features/players/usePlayersPage.ts
sed -i "s|@/services/api/playerApi|@/features/players/playerApi|g" src/features/players/PlayersPage.tsx
sed -i "s|@/components/dialogs|@/features/players/dialogs|g" src/features/players/PlayersPageView.tsx
sed -i "s|@/services/api/playerApi|@/features/players/playerApi|g" src/features/players/__tests__/playerDuplicate.test.ts
```

- [ ] **Step 5 : Mettre à jour App.tsx**

```tsx
// avant
const PlayersPage = lazy(() => import('./components/PlayersPage'));
// après
const PlayersPage = lazy(() => import('./features/players/PlayersPage'));
```

- [ ] **Step 6 : Vérifier qu'il ne reste aucun import cassé**

```bash
grep -r "from '@/components/PlayersPage\|from '@/views/PlayersPageView\|from '@/hooks/usePlayersPage\|from '@/services/api/playerApi" src --include="*.ts" --include="*.tsx"
# Résultat attendu : aucune ligne
```

- [ ] **Step 7 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 8 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer players vers features/players/"
```

---

## Task 7 : `features/sessions/`

**Fichiers déplacés :**
- `src/components/NewGamePage.tsx` → `src/features/sessions/NewGamePage.tsx`
- `src/views/NewGameView.tsx` → `src/features/sessions/NewGameView.tsx`
- `src/hooks/useNewGamePage.ts` → `src/features/sessions/useNewGamePage.ts`
- `src/services/api/sessionApi.ts` → `src/features/sessions/sessionApi.ts`
- `src/__tests__/flows/SessionsPage.flow.test.tsx` → `src/features/sessions/__tests__/SessionsPage.flow.test.tsx`
- `src/__tests__/hooks/useNewGamePage.test.ts` → `src/features/sessions/__tests__/useNewGamePage.test.ts`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/sessions/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/NewGamePage.tsx src/features/sessions/NewGamePage.tsx
git mv src/views/NewGameView.tsx src/features/sessions/NewGameView.tsx
git mv src/hooks/useNewGamePage.ts src/features/sessions/useNewGamePage.ts
git mv src/services/api/sessionApi.ts src/features/sessions/sessionApi.ts
git mv src/__tests__/flows/SessionsPage.flow.test.tsx src/features/sessions/__tests__/SessionsPage.flow.test.tsx
git mv src/__tests__/hooks/useNewGamePage.test.ts src/features/sessions/__tests__/useNewGamePage.test.ts
```

- [ ] **Step 3 : Mettre à jour les imports dans les fichiers déplacés**

```bash
sed -i "s|@/services/api/sessionApi|@/features/sessions/sessionApi|g" src/features/sessions/useNewGamePage.ts
sed -i "s|@/services/api/playerApi|@/features/players/playerApi|g" src/features/sessions/useNewGamePage.ts
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/sessions/useNewGamePage.ts
```

- [ ] **Step 4 : Vérifier les imports croisés dans NewGamePage/NewGameView**

```bash
grep "from '@/" src/features/sessions/NewGamePage.tsx
grep "from '@/" src/features/sessions/NewGameView.tsx
```

Corriger tout import vers un ancien chemin `@/hooks/`, `@/components/`, `@/views/`.

- [ ] **Step 5 : Mettre à jour App.tsx**

```tsx
// avant
const NewGamePage = lazy(() => import('./components/NewGamePage'));
// après
const NewGamePage = lazy(() => import('./features/sessions/NewGamePage'));
```

- [ ] **Step 6 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 7 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer sessions vers features/sessions/"
```

---

## Task 8 : `features/dashboard/`

**Fichiers déplacés :**
- `src/components/Dashboard.tsx` → `src/features/dashboard/Dashboard.tsx`
- `src/views/DashboardView.tsx` → `src/features/dashboard/DashboardView.tsx`
- `src/hooks/useDashboard.ts` → `src/features/dashboard/useDashboard.ts`
- `src/__tests__/flows/DashboardPage.flow.test.tsx` → `src/features/dashboard/__tests__/DashboardPage.flow.test.tsx`
- `src/__tests__/hooks/useDashboard.test.ts` → `src/features/dashboard/__tests__/useDashboard.test.ts`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/dashboard/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/Dashboard.tsx src/features/dashboard/Dashboard.tsx
git mv src/views/DashboardView.tsx src/features/dashboard/DashboardView.tsx
git mv src/hooks/useDashboard.ts src/features/dashboard/useDashboard.ts
git mv src/__tests__/flows/DashboardPage.flow.test.tsx src/features/dashboard/__tests__/DashboardPage.flow.test.tsx
git mv src/__tests__/hooks/useDashboard.test.ts src/features/dashboard/__tests__/useDashboard.test.ts
```

- [ ] **Step 3 : Mettre à jour les imports**

```bash
sed -i "s|@/services/api/gameApi|@/features/games/gameApi|g" src/features/dashboard/useDashboard.ts
sed -i "s|@/services/api/playerApi|@/features/players/playerApi|g" src/features/dashboard/useDashboard.ts
sed -i "s|@/services/api/sessionApi|@/features/sessions/sessionApi|g" src/features/dashboard/useDashboard.ts
```

- [ ] **Step 4 : Vérifier les imports de DashboardView**

```bash
grep "from '@/" src/features/dashboard/DashboardView.tsx
```

Corriger tout import vers un ancien chemin.

- [ ] **Step 5 : Mettre à jour App.tsx**

```tsx
// avant
const Dashboard = lazy(() => import('./components/Dashboard'));
// après
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
```

- [ ] **Step 6 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 7 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer dashboard vers features/dashboard/"
```

---

## Task 9 : `features/settings/` + suppression de `ApiService.ts`

**Fichiers déplacés :**
- `src/components/SettingsPage.tsx` → `src/features/settings/SettingsPage.tsx`
- `src/views/SettingsPageView.tsx` → `src/features/settings/SettingsPageView.tsx`
- `src/hooks/useSettingsPage.ts` → `src/features/settings/useSettingsPage.ts`

**Migration `ApiService.ts` :** `useSettingsPage` utilise encore l'ancien `ApiService`. On remplace ses 5 appels par `request()` de `@/shared/services/api/request`.

Les méthodes à migrer :

| Méthode ApiService | Remplacement avec request() |
|---|---|
| `apiService.getBggCatalogStatus()` | `request<{count:number;bgg_catalog_imported_at:string\|null}>('/api/v1/bgg/import-status')` |
| `apiService.importBggCatalog(file)` | `request<{count:number}>('/api/v1/bgg/import-catalog', {method:'POST', body:text, headers:{'Content-Type':'text/plain'}})` |
| `apiService.exportData()` | fetch direct : `fetch('/api/v1/data/export', {credentials:'include'}).then(r => r.blob())` |
| `apiService.importData(file)` | `request<{ok:boolean}>('/api/v1/data/import', {method:'POST', body:text})` |
| `apiService.resetData()` | `request<{ok:boolean}>('/api/v1/data/reset', {method:'POST'})` |

`exportData` nécessite un fetch direct (retourne un `Blob`, pas du JSON — `request()` utilise `.json()`). Les autres passent par `request()`.

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/settings/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/SettingsPage.tsx src/features/settings/SettingsPage.tsx
git mv src/views/SettingsPageView.tsx src/features/settings/SettingsPageView.tsx
git mv src/hooks/useSettingsPage.ts src/features/settings/useSettingsPage.ts
```

- [ ] **Step 3 : Migrer `useSettingsPage.ts` — remplacer ApiService par request()**

Ouvrir `src/features/settings/useSettingsPage.ts`. Remplacer le contenu des imports et des 5 appels :

**Supprimer l'import :**
```ts
import apiService from '@/services/ApiService';
```

**Ajouter l'import :**
```ts
import { request } from '@/shared/services/api/request';
```

**Remplacer `apiService.getBggCatalogStatus()` :**
```ts
// avant
apiService.getBggCatalogStatus().then(s => { ... })
// après
request<{ count: number; bgg_catalog_imported_at: string | null }>('/api/v1/bgg/import-status').then(s => { ... })
```

**Remplacer `apiService.importBggCatalog(file)` :**
```ts
// avant
const result = await apiService.importBggCatalog(file);
// après
const text = await file.text();
const result = await request<{ count: number }>('/api/v1/bgg/import-catalog', {
  method: 'POST',
  body: text,
  headers: { 'Content-Type': 'text/plain' },
});
```

**Remplacer `apiService.exportData()` :**
```ts
// avant
const blob = await apiService.exportData();
// après
const res = await fetch('/api/v1/data/export', { credentials: 'include' });
if (!res.ok) throw new Error(`Export failed: ${res.status}`);
const blob = await res.blob();
```

**Remplacer `apiService.importData(file)` :**
```ts
// avant
await apiService.importData(file);
// après
const text = await file.text();
await request<{ ok: boolean }>('/api/v1/data/import', { method: 'POST', body: text });
```

**Remplacer `apiService.resetData()` :**
```ts
// avant
await apiService.resetData();
// après
await request<{ ok: boolean }>('/api/v1/data/reset', { method: 'POST' });
```

- [ ] **Step 4 : Supprimer `ApiService.ts` et mettre à jour `gameDuplicate` et `playerDuplicate`**

Les tests `gameDuplicate.test.ts` et `playerDuplicate.test.ts` importent encore `ApiService`. Les migrer vers `request()` ou vers les API functions de leur feature.

Dans `src/features/games/__tests__/gameDuplicate.test.ts` :
```ts
// supprimer
import apiService from '@/services/ApiService';
// ajouter
import { addGame } from '@/features/games/gameApi';
```
Et adapter les appels au lieu d'utiliser `apiService.addGame(...)`.

De même dans `src/features/players/__tests__/playerDuplicate.test.ts`.

Une fois les deux tests migrés :
```bash
git rm src/services/ApiService.ts
```

- [ ] **Step 5 : Mettre à jour App.tsx**

```tsx
// avant
const SettingsPage = lazy(() => import('./components/SettingsPage'));
// après
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
```

- [ ] **Step 6 : Vérifier qu'ApiService n'est plus importé nulle part**

```bash
grep -r "ApiService" src --include="*.ts" --include="*.tsx"
# Résultat attendu : aucune ligne
```

- [ ] **Step 7 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 8 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer settings vers features/settings/ + supprimer ApiService.ts"
```

---

## Task 10 : `features/stats/`

**Fichiers déplacés :**
- `src/components/StatsPage.tsx` → `src/features/stats/StatsPage.tsx`
- `src/views/GameStatsView.tsx` → `src/features/stats/game/GameStatsView.tsx`
- `src/hooks/useGameStatsPage.ts` → `src/features/stats/game/useGameStatsPage.ts`
- `src/views/PlayerStatsView.tsx` → `src/features/stats/player/PlayerStatsView.tsx`
- `src/hooks/usePlayerStatsPage.ts` → `src/features/stats/player/usePlayerStatsPage.ts`
- `src/__tests__/flows/StatsPages.flow.test.tsx` → `src/features/stats/__tests__/StatsPages.flow.test.tsx`
- `src/__tests__/hooks/useGameStatsPage.test.ts` → `src/features/stats/game/__tests__/useGameStatsPage.test.ts`
- `src/__tests__/hooks/usePlayerStatsPage.test.ts` → `src/features/stats/player/__tests__/usePlayerStatsPage.test.ts`

- [ ] **Step 1 : Créer les dossiers**

```bash
mkdir -p src/features/stats/__tests__
mkdir -p src/features/stats/game/__tests__
mkdir -p src/features/stats/player/__tests__
```

- [ ] **Step 2 : Déplacer les fichiers**

```bash
git mv src/components/StatsPage.tsx src/features/stats/StatsPage.tsx
git mv src/views/GameStatsView.tsx src/features/stats/game/GameStatsView.tsx
git mv src/hooks/useGameStatsPage.ts src/features/stats/game/useGameStatsPage.ts
git mv src/views/PlayerStatsView.tsx src/features/stats/player/PlayerStatsView.tsx
git mv src/hooks/usePlayerStatsPage.ts src/features/stats/player/usePlayerStatsPage.ts
git mv src/__tests__/flows/StatsPages.flow.test.tsx src/features/stats/__tests__/StatsPages.flow.test.tsx
git mv src/__tests__/hooks/useGameStatsPage.test.ts src/features/stats/game/__tests__/useGameStatsPage.test.ts
git mv src/__tests__/hooks/usePlayerStatsPage.test.ts src/features/stats/player/__tests__/usePlayerStatsPage.test.ts
```

- [ ] **Step 3 : Mettre à jour les imports**

```bash
# StatsPage
sed -i "s|@/views/GameStatsView|@/features/stats/game/GameStatsView|g" src/features/stats/StatsPage.tsx
sed -i "s|@/views/PlayerStatsView|@/features/stats/player/PlayerStatsView|g" src/features/stats/StatsPage.tsx

# hooks stats (utilisent statsApi depuis shared)
# statsApi doit rester @/shared/services/api/statsApi — vérifier que les imports sont corrects
grep "from '@/" src/features/stats/game/useGameStatsPage.ts
grep "from '@/" src/features/stats/player/usePlayerStatsPage.ts
```

- [ ] **Step 4 : Mettre à jour App.tsx**

```tsx
// avant
const StatsPage = lazy(() => import('./components/StatsPage'));
// après
const StatsPage = lazy(() => import('./features/stats/StatsPage'));
```

- [ ] **Step 5 : Lancer les tests**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "refactor: déplacer stats vers features/stats/"
```

---

## Task 11 : Nettoyage des anciens dossiers

À ce stade, `src/components/`, `src/views/`, `src/hooks/` et `src/services/` doivent être vides (ou presque). On les supprime.

- [ ] **Step 1 : Vérifier que les anciens dossiers sont vides**

```bash
find src/components -type f 2>/dev/null
find src/views -type f 2>/dev/null
find src/hooks -type f 2>/dev/null
find src/services -type f 2>/dev/null
```

Résultat attendu : aucun fichier. Si des fichiers restent, les traiter avant de continuer.

- [ ] **Step 2 : Supprimer les anciens dossiers**

```bash
git rm -r src/components 2>/dev/null || true
git rm -r src/views 2>/dev/null || true
git rm -r src/hooks 2>/dev/null || true
git rm -r src/services 2>/dev/null || true
git rm -r src/utils 2>/dev/null || true
git rm -r src/lib 2>/dev/null || true
git rm -r src/styles 2>/dev/null || true
git rm -r src/i18n 2>/dev/null || true
git rm -r src/contexts 2>/dev/null || true
```

- [ ] **Step 3 : Supprimer le barrel dialog racine (tous les dialogs sont maintenant dans leurs features)**

```bash
git rm src/components/dialogs/index.ts 2>/dev/null || echo "déjà supprimé"
```

- [ ] **Step 4 : Vérifier qu'aucun import ne pointe encore vers les anciens chemins**

```bash
grep -r "from '@/components/\|from '@/views/\|from '@/hooks/\|from '@/services/\|from '@/utils/\|from '@/lib/\|from '@/i18n/\|from '@/contexts/" src --include="*.ts" --include="*.tsx" | grep -v "src/shared"
# Résultat attendu : aucune ligne
```

- [ ] **Step 5 : Lancer les tests une dernière fois**

```bash
npm run test:run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "refactor: supprimer anciens dossiers components/ views/ hooks/ services/"
```

---

## Task 12 : Mise à jour de la documentation

- [ ] **Step 1 : Mettre à jour `CLAUDE.md`**

Modifier la section "Frontend structure" pour refléter la nouvelle organisation :

```markdown
### Frontend structure

Navigation via React Router v7. Server state managed exclusively by React Query.

- **`src/features/`** — Features co-localisées. Chaque feature contient : container, vue, hook, API service, dialogs, tests.
  - `dashboard/` — Dashboard principal
  - `games/` — Liste des jeux + dialogs. Sous-dossiers : `detail/`, `expansions/`, `characters/`
  - `bgg/` — Feature utilitaire : BGGSearch + bggApi (utilisé par games et settings)
  - `players/` — Liste des joueurs + dialogs
  - `sessions/` — Création de session (NewGamePage)
  - `stats/` — Page stats (shell). Sous-dossiers : `game/`, `player/`
  - `settings/` — Page paramètres (langue, import BGG, data)
- **`src/shared/`** — Modules transversaux :
  - `components/ui/` — shadcn/ui (ne jamais éditer manuellement)
  - `contexts/` — AuthContext
  - `services/api/` — `request.ts`, `queryKeys.ts`, `authApi.ts`, `labelsApi.ts`, `statsApi.ts`
  - `hooks/` — `useLabels`, `useLocale`, `useLocales`, `useApiReachable`, `useNavigationAdapter`, `use-mobile`
  - `i18n/` — `en.json` (fallback offline)
  - `utils/` — `gameHelpers.ts`
  - `lib/` — `utils.ts` (cn helper shadcn)
- **`src/__tests__/`** — Infrastructure de test partagée : `mocks/`, `fixtures/`, `utils/`, tests navigation/infrastructure
- **`src/services/api/`** — ⚠️ SUPPRIMÉ — les API services sont maintenant dans leur feature
```

- [ ] **Step 2 : Mettre à jour `docs/architecture/FRONTEND.md`**

Refléter la nouvelle structure de dossiers. Mettre à jour les exemples de data flow :

```
Feature hook → featureApi.ts (fetch) → Express route → Service → Repository → SQLite
```

Supprimer les références à `src/components/`, `src/views/`, `src/hooks/` racine.

- [ ] **Step 3 : Mettre à jour `docs/guides/CONTRIBUTING.md`**

Mettre à jour la section "Où ajouter du code" :
- Nouvelle feature → créer `src/features/<nom>/`
- Code partagé par 2+ features → `src/shared/`
- Supprimer les instructions relatives à `src/components/` et `src/views/`

- [ ] **Step 4 : Mettre à jour `docs/guides/DEVELOPMENT.md`**

Mettre à jour les patterns et conventions pour refléter la co-localisation feature-based.

- [ ] **Step 5 : Mettre à jour `README.md`**

Si le README mentionne la structure `components/views/hooks`, la mettre à jour.

- [ ] **Step 6 : Mettre à jour `ROADMAP.md`**

Marquer la restructuration feature-based comme ✅ livrée.

- [ ] **Step 7 : Commit final**

```bash
git add CLAUDE.md docs/architecture/FRONTEND.md docs/guides/CONTRIBUTING.md docs/guides/DEVELOPMENT.md README.md ROADMAP.md
git commit -m "docs: mettre à jour la documentation pour la structure feature-based"
```

---

## Checklist finale

Avant de créer la PR :

- [ ] `npm run test:run` — tous les tests passent
- [ ] `npm run build` — build TypeScript sans erreur
- [ ] `npm run lint` — aucune erreur ESLint
- [ ] Aucun import vers `@/components/`, `@/views/`, `@/hooks/`, `@/services/` ne subsiste (sauf dans `src/shared/` elle-même)
- [ ] `src/components/`, `src/views/`, `src/hooks/`, `src/services/` sont supprimés
- [ ] `src/services/ApiService.ts` est supprimé
