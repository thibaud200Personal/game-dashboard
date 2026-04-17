# Architecture Frontend

## Vue d'ensemble

Application React 19 en TypeScript, organisée selon une architecture **feature-based** (fonctionnalités co-localisées). Navigation via React Router v7. Données serveur gérées exclusivement par React Query.

## Structure des fichiers

```
src/
├── features/                    → features co-localisées
│   ├── auth/                    → LoginPage
│   ├── bgg/                     → BGGSearch + bggApi (importable par games et settings)
│   ├── dashboard/               → Dashboard, DashboardView, useDashboard
│   ├── games/                   → GamesPage, GamesPageView, useGamesPage, gameApi, dialogs/
│   │   ├── detail/              → GameDetailPage, GameDetailView, useGameDetail, GamePageRoute
│   │   ├── expansions/          → GameExpansionsPage, GameExpansionsView, useGameExpansions, dialogs/
│   │   └── characters/          → GameCharactersPage, GameCharactersView, useGameCharacters, dialogs/
│   ├── players/                 → PlayersPage, PlayersPageView, usePlayersPage, playerApi, dialogs/
│   ├── plays/                   → NewPlayPage, NewPlayView, useNewPlayPage, playApi
│   ├── settings/                → SettingsPage, SettingsPageView, useSettingsPage
│   └── stats/                   → StatsPage (shell)
│       ├── game/                → GameStatsView, useGameStatsPage
│       └── player/              → PlayerStatsView, usePlayerStatsPage
├── shared/                      → modules transversaux (utilisés par 2+ features)
│   ├── components/ui/           → composants shadcn/ui (ne pas éditer manuellement)
│   ├── components/              → Layout.tsx, BottomNavigation.tsx
│   ├── contexts/                → AuthContext.tsx, DarkModeContext.tsx, LocaleContext.tsx
│   ├── services/api/            → request.ts, queryKeys.ts, authApi.ts, labelsApi.ts, statsApi.ts
│   ├── hooks/                   → useLabels, useLocales, useApiReachable, useNavigationAdapter, use-mobile
│   ├── i18n/                    → en.json (fallback offline)
│   ├── utils/                   → gameHelpers.ts
│   ├── lib/                     → utils.ts (cn helper shadcn)
│   └── styles/                  → theme.css
│   └── __tests__/               → infrastructure de test partagée (mocks/, fixtures/, utils/)
├── App.tsx                      → shell : Router + QueryClient + providers
├── main.tsx
├── ErrorFallback.tsx
└── types/                       → réexporte shared/types uniquement
```

## Règles d'architecture

- **Isolation des features** : une feature n'importe **jamais** depuis une autre feature.
  - Exception unique : `features/bgg/` est importable par `features/games/` et `features/settings/` (feature utilitaire partagée).
- **Promotion vers shared** : tout module utilisé par 2+ features doit être déplacé dans `src/shared/`.
- **Alias de chemins** :
  - `@/` → `src/` (imports intra-feature et vers shared)
  - `@shared/` → `/shared` (types partagés front+back — à ne pas confondre avec `@/shared/`)

## Pattern Container/Presenter

Séparation stricte entre logique et présentation, co-localisés dans la même feature.

```
Page (container)            View (presenter)
────────────────            ─────────────────
GamesPage.tsx    →  hooks → GamesPageView.tsx
  useGamesPage()               JSX pur
  logique + état               props seulement
  appels API                   aucun appel API
```

**Règle** : si un composant `View` contient un `useQuery`, `useMutation` ou un appel direct à une API, c'est une erreur de placement.

## Navigation — React Router v7

`App.tsx` est un shell pur. Il ne contient aucun état de navigation.

```tsx
// App.tsx — shell pur, providers globaux + routes
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>           {/* langue + invalidation cache labels */}
        <AuthProvider>
          <DarkModeProvider>     {/* dark mode (localStorage + class html) */}
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<AuthGuard />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/players" element={<PlayersPage />} />
                    <Route path="/games" element={<GamesPage />} />
                    <Route path="/games/:id" element={<GameDetailPage />} />
                    <Route path="/games/:id/expansions" element={<GameExpansionsPage />} />
                    <Route path="/games/:id/characters" element={<GameCharactersPage />} />
                    <Route path="/plays/new" element={<NewPlayPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/stats/players/:id" element={<PlayerStatsPage />} />
                    <Route path="/stats/games/:id" element={<GameStatsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </DarkModeProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  )
}
```

**Providers globaux :**
- `LocaleProvider` — lit/écrit `localStorage.locale`, invalide le cache React Query `['labels']` à chaque changement. Doit envelopper `AuthProvider` (le login peut utiliser des labels traduits)
- `DarkModeProvider` — lit/écrit `localStorage.darkMode`, applique la classe `dark` sur `<html>`

### Navigation contextuelle mobile

`location.state` est utilisé pour les cas où l'origine doit être connue :

```ts
// Depuis un jeu, aller aux stats en gardant le contexte
navigate('/stats/games/42', { state: { from: '/games' } })

// Dans la page stats, le bouton retour utilise ce contexte
const { state } = useLocation()
const backPath = (state as { from?: string })?.from ?? '/'
```

### Responsive layout

`BottomNavigation` (mobile) utilise `useLocation()` pour l'état actif des onglets. Le layout adaptatif est géré par Tailwind + `use-mobile.ts` — indépendant du routeur.

## State management

React Query est la **seule** source de vérité pour les données serveur.

```
Avant (à corriger) :
  App.tsx [players useState] ← doublon
  usePlayersPage [useQuery players] ← source réelle

Après :
  App.tsx → aucun état serveur
  usePlayersPage [useQuery players] → unique
```

### Clés de cache — queryKeys.ts

```ts
export const queryKeys = {
  players: {
    all: ['players'] as const,
    detail: (id: number) => ['players', id] as const,
  },
  games: {
    all: ['games'] as const,
    detail: (id: number) => ['games', id] as const,
    expansions: (id: number) => ['games', id, 'expansions'] as const,
    characters: (id: number) => ['games', id, 'characters'] as const,
  },
  plays: { all: ['plays'] as const },
  stats: {
    players: ['stats', 'players'] as const,
    playerDetail: (id: number) => ['stats', 'players', id] as const,
    games: ['stats', 'games'] as const,
    gameDetail: (id: number) => ['stats', 'games', id] as const,
  },
}
```

**Règle** : toujours utiliser `queryKeys` pour invalider le cache. Ne jamais écrire des clés en dur dans les hooks.

## Hooks

Un hook par page, co-localisé dans sa feature. Responsabilité : données + état local de la page.

```ts
// features/games/useGamesPage.ts
export function useGamesPage() {
  const { data: games = [], isLoading } = useQuery({
    queryKey: queryKeys.games.all,
    queryFn: gameApi.getAll,
  })

  const addGame = useMutation({
    mutationFn: gameApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
  })

  // état local (recherche, filtres, dialogs)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  return { games, isLoading, addGame, search, setSearch, isAddOpen, setIsAddOpen }
}
```

**Règle** : un hook ne fait `useQuery` que sur les données dont sa page a besoin.

## Dialogs

Chaque dialog gère son propre état de formulaire. Communication via props standard :

```tsx
interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: GameFormData) => void
}
```

### Pattern trigger prop (suppression)

Les dialogs de suppression utilisent une prop `trigger` pour éviter les conflits Radix :

```tsx
<DeleteGameDialog
  gameName={game.name}
  onDelete={() => handleDelete(game.game_id)}
  trigger={<button>Supprimer</button>}
/>
```

Ne jamais passer un composant Radix composite (ex: `<Tooltip>`) comme trigger — `AlertDialogTrigger asChild` clone le child direct.

## Types

Les types vivent dans `shared/types/index.ts`. Le dossier `src/types/` réexporte uniquement :

```ts
// src/types/index.ts
export * from '../../shared/types'
```

**Règles :**
- Zéro `any` — utiliser `unknown`, `never`, ou des types précis
- Zéro interface locale si elle existe dans `shared/types`
- Les champs d'affichage calculés (`formatPlayerStats`, `formatPlayerCount`) sont des fonctions dans `shared/utils/formatters.ts`, pas des champs de type

## Responsive design

L'app gère trois breakpoints :
- **Mobile** : navigation via `BottomNavigation`, menus contextuels
- **Tablette** : layout hybride
- **Desktop** : navigation latérale ou top, actions directes sans menu

`use-mobile.ts` expose `isMobile: boolean`. Les composants s'adaptent via des classes Tailwind conditionnelles. Aucune logique de navigation ne dépend du breakpoint — le routeur est le même pour tous.

## Authentification frontend

```ts
// AuthGuard.tsx
function AuthGuard() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}
```

Le rôle JWT est décodé côté client (sans vérification de signature — c'est le backend qui valide). Les features admin-only (import BGG catalog) sont conditionnellement rendues selon `role === 'admin'`.

```ts
// useAuth.ts
const { role } = useAuth()
// Dans Settings :
{role === 'admin' && <BGGCatalogImport />}
```

## Internationalisation (i18n)

Tous les textes affichés à l'utilisateur passent par le hook `useLabels`.

```tsx
const { t } = useLabels()
// Utilisation :
<h1>{t('dashboard.title')}</h1>
<Button>{t('games.add')}</Button>
```

**Flux :**
1. `LocaleContext` expose `locale` (stocké dans `localStorage`) et `setLocale`
2. `useLabels` fait `GET /api/v1/labels?locale=<locale>` via React Query (clé `['labels', locale]`)
3. Si l'API est inaccessible, fallback sur `src/shared/i18n/en.json`
4. Changer la langue via `setLocale()` invalide le cache et recharge les labels sans refresh

**Ajouter un label :**
- Ajouter la clé dans `src/shared/i18n/en.json` (fallback offline)
- Créer une migration SQL : `INSERT INTO labels (key, locale, value) VALUES ...` pour chaque locale

**Règle :** aucune chaîne de caractères visible par l'utilisateur en dur dans le JSX. Toujours passer par `t()`.

## Ajouter une page — checklist

1. Créer le dossier `src/features/<nom>/`
2. Créer le hook `src/features/<nom>/use<NomPage>.ts`
3. Créer le container `src/features/<nom>/<NomPage>.tsx`
4. Créer la view `src/features/<nom>/<NomPage>View.tsx`
5. Si dialogs nécessaires, créer `src/features/<nom>/dialogs/`
6. Si API nécessaire, créer `src/features/<nom>/<nom>Api.ts`
7. Ajouter la route dans `App.tsx`
8. Ajouter les entrées dans `src/shared/services/api/queryKeys.ts` si nouvelles données
9. Écrire les tests : hook (unit/functional) + composant (unit/functional) + flux complet (integration)
