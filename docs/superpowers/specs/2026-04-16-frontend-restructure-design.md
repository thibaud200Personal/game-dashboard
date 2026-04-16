# Design — Restructuration feature-based du frontend

**Date :** 2026-04-16  
**Branche cible :** `refactor/feature-architecture`  
**Statut :** Approuvé

---

## Contexte

Le frontend actuel est organisé par type de fichier :
- `src/components/` — containers (logique + state), mélangés avec `ui/` (shadcn)
- `src/views/` — vues presentational
- `src/hooks/` — hooks à plat
- `src/services/api/` — services API centralisés

Cette organisation rend difficile de comprendre une feature d'un coup d'œil — il faut naviguer dans 4 dossiers pour voir tout ce qui touche à "games". L'objectif est de co-localiser par feature.

---

## Architecture cible

```
src/
  features/
    dashboard/
      Dashboard.tsx
      DashboardView.tsx
      useDashboard.ts
      __tests__/
        DashboardPage.flow.test.tsx
        useDashboard.test.ts

    games/
      GamesPage.tsx
      GamesPageView.tsx
      useGamesPage.ts
      gameApi.ts
      dialogs/
        AddGameDialog.tsx
        EditGameDialog.tsx
        DeleteGameDialog.tsx
        index.ts
      detail/
        GameDetailPage.tsx
        GameDetailView.tsx
        useGameDetail.ts
        GamePageRoute.tsx
      expansions/
        GameExpansionsPage.tsx
        GameExpansionsView.tsx
        useGameExpansions.ts
        dialogs/
          ExpansionDialogs.tsx
      characters/
        GameCharactersPage.tsx
        GameCharactersView.tsx
        useGameCharacters.ts
        dialogs/
          CharacterDialogs.tsx
      __tests__/
        GamesPage.flow.test.tsx
        useGamesPage.test.ts

    bgg/
      BGGSearch.tsx
      bggApi.ts
      __tests__/
        BGGSearch.test.tsx
        bggApi.test.ts

    players/
      PlayersPage.tsx
      PlayersPageView.tsx
      usePlayersPage.ts
      playerApi.ts
      dialogs/
        AddPlayerDialog.tsx
        EditPlayerDialog.tsx
        DeletePlayerDialog.tsx
        index.ts
      __tests__/
        PlayersPage.flow.test.tsx
        usePlayersPage.test.ts

    sessions/
      NewGamePage.tsx
      NewGameView.tsx
      useNewGamePage.ts
      sessionApi.ts
      __tests__/
        SessionsPage.flow.test.tsx
        useNewGamePage.test.ts

    stats/
      StatsPage.tsx              ← shell : routing entre game et player stats
      game/
        GameStatsView.tsx
        useGameStatsPage.ts
        __tests__/
          useGameStatsPage.test.ts
      player/
        PlayerStatsView.tsx
        usePlayerStatsPage.ts
        __tests__/
          usePlayerStatsPage.test.ts
      __tests__/
        StatsPages.flow.test.tsx

    settings/
      SettingsPage.tsx
      SettingsPageView.tsx
      useSettingsPage.ts
      __tests__/
        useSettingsPage.test.ts (à créer)

  shared/
    components/ui/         ← shadcn (inchangé, jamais édité manuellement)
    contexts/
      AuthContext.tsx
    services/api/
      request.ts
      queryKeys.ts
      authApi.ts
      labelsApi.ts
      statsApi.ts
    hooks/
      useLabels.ts
      useLocale.ts
      useLocales.ts
      useApiReachable.ts
      useNavigationAdapter.ts   ← utilisé par toutes les features
      use-mobile.ts             ← généré par shadcn, partagé
    i18n/
      en.json
    utils/
      gameHelpers.ts
      lib/
        utils.ts
    styles/
      theme.css

  __tests__/               ← infrastructure partagée uniquement
    mocks/
      handlers.ts
      server.ts
    utils/
      test-utils.tsx
    fixtures/
      index.ts
    navigation/
      routing.test.tsx
    infrastructure.test.ts
    helpers/
      pureHelpers.test.ts

  App.tsx
  main.tsx
  main.css
  index.css
  ErrorFallback.tsx
  types/index.ts
  vite-end.d.ts
```

---

## Règles d'architecture

### Imports inter-features
- Une feature **n'importe jamais** depuis une autre feature
- Exception : `features/bgg/` est une feature utilitaire importable par `features/games/` et `features/settings/`
- Tout ce qui est utilisé par 2+ features → `shared/`

### Règle de promotion vers shared
Si un hook, utilitaire ou composant commence à être importé par 2+ features, il monte dans `shared/`. Tant qu'il est utilisé par une seule feature, il reste dans la feature.

### API services
- Chaque feature possède son API service (`gameApi.ts`, `playerApi.ts`, `sessionApi.ts`)
- Les services transversaux restent dans `shared/services/api/` : `request.ts`, `queryKeys.ts`, `authApi.ts`, `labelsApi.ts`, `statsApi.ts`
- `statsApi.ts` reste dans shared car les données stats croisent games et players

### Pattern interne d'une feature
```
features/<feature>/
  <Feature>Page.tsx          ← container (logique + state, importe hook + view)
  <Feature>View.tsx          ← presentational (JSX pur, props seulement)
  use<Feature>Page.ts        ← hook page (React Query, handlers)
  <feature>Api.ts            ← appels fetch
  dialogs/                   ← dialogs spécifiques à la feature
  __tests__/                 ← tests co-localisés
```

### BGG — feature utilitaire
BGG n'est pas une page navigable mais une feature utilitaire. Elle contient :
- `BGGSearch.tsx` — composant utilisé dans les dialogs de `features/games/`
- `bggApi.ts` — appels à l'API BGG externe
- Croissance future : enrichissement langues, scraping personnages, `ImportBGGPanel` (utilisé depuis `features/settings/`)

---

## Stats — architecture détaillée

`StatsPage` est une coquille de routing, sans appels API propres. Elle délègue à `game/` et `player/` selon la sélection de l'utilisateur. Les hooks de stats utilisent `statsApi.ts` depuis `shared/services/api/`.

---

## Stratégie de migration

Migration séquentielle, feature par feature. Les tests doivent passer avant de passer à la feature suivante.

**Ordre :**
1. Créer `src/shared/` — déplacer ui/, contexts/, services/api/ shared, hooks shared, i18n/, utils/
2. `features/bgg/`
3. `features/games/` (avec detail/, expansions/, characters/)
4. `features/players/`
5. `features/sessions/`
6. `features/dashboard/`
7. `features/settings/`
8. `features/stats/`
9. Supprimer les anciens dossiers (`src/components/`, `src/views/`, `src/hooks/`)
10. Mettre à jour CLAUDE.md, FRONTEND.md, DEVELOPMENT.md

À chaque étape : déplacer les fichiers → mettre à jour les imports → vérifier que les tests passent.

---

## Suppressions / migrations à faire pendant le refactor

- **`src/services/ApiService.ts`** — classe legacy utilisée uniquement dans `useSettingsPage`. Remplacer ses appels par `request.ts` lors de la migration `features/settings/`, puis supprimer le fichier.
- **`src/services/bggApi.ts`** — déplacer dans `features/bgg/bggApi.ts`.
- **`src/__tests__/services/request.test.ts`** — reste dans `src/__tests__/` (teste un module shared).
- **`src/__tests__/services/bggApi.test.ts`** — déplacer dans `features/bgg/__tests__/`.
- **`src/__tests__/services/gameDuplicate.test.ts`** et **`playerDuplicate.test.ts`** — rester dans `src/__tests__/` (testent des helpers partagés) ou déplacer dans leur feature respective selon contenu.

---

## Ce qui ne change pas

- `App.tsx` — routing React Router (imports mis à jour vers les nouveaux chemins)
- `src/components/ui/` → `src/shared/components/ui/` (shadcn, jamais édité manuellement)
- `vitest.config.ts` — découverte automatique `**/*.test.{ts,tsx}`, pas de changement
- Structure backend — 100% inchangée
- Alias `@/` — pointe sur `src/`, reste valide pour tous les nouveaux chemins
