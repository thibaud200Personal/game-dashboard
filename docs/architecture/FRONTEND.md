# Architecture Frontend

## Vue d'ensemble

Application React 19 en TypeScript, organisée selon le pattern Container/Presenter. Navigation via React Router v7. Données serveur gérées exclusivement par React Query.

## Structure des fichiers

```
src/
├── components/              → containers (logique + état)
│   ├── dialogs/             → boîtes de dialogue modulaires
│   └── ui/                  → composants shadcn/ui (ne pas éditer manuellement)
├── views/                   → presenters (JSX pur, aucune logique)
│   ├── games/
│   └── players/
├── hooks/                   → état et logique par page
│   └── games/               → hooks spécifiques aux jeux
├── services/
│   └── api/                 → un fichier par domaine
│       ├── playerApi.ts
│       ├── gameApi.ts
│       ├── sessionApi.ts
│       ├── statsApi.ts
│       ├── authApi.ts
│       ├── bggApi.ts
│       └── queryKeys.ts     → clés React Query centralisées
├── styles/
├── types/                   → réexporte shared/types (ne pas dupliquer)
└── App.tsx                  → shell : Router + QueryClient + providers
```

## Pattern Container/Presenter

Séparation stricte entre logique et présentation.

```
Page (container)            View (presenter)
────────────────            ─────────────────
GamesPage.tsx    →  hooks → GamesPageView.tsx
  useGamesPage()               JSX pur
  logique + état               props seulement
  appels API                   aucun appel API
```

**Règle** : si un composant dans `views/` contient un `useQuery`, `useMutation` ou un appel direct à une API, c'est une erreur de placement.

## Navigation — React Router v7

`App.tsx` est un shell pur. Il ne contient aucun état de navigation.

```tsx
// App.tsx
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            <Route path="/sessions/new" element={<NewGamePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/stats/players/:id" element={<PlayerStatsPage />} />
            <Route path="/stats/games/:id" element={<GameStatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

### Navigation contextuelle mobile

Le `navigationContext` est remplacé par `location.state` pour les cas où l'origine doit être connue :

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
  sessions: { all: ['sessions'] as const },
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

Un hook par page. Responsabilité : données + état local de la page.

```ts
// hooks/useGamesPage.ts
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

## Ajouter une page — checklist

1. Créer le hook `src/hooks/use<PageName>Page.ts`
2. Créer le container `src/components/<PageName>.tsx`
3. Créer la view `src/views/<PageName>View.tsx`
4. Ajouter la route dans `App.tsx`
5. Ajouter les entrées dans `queryKeys.ts` si nouvelles données
6. Créer `src/services/api/<domain>Api.ts` si nouveau domaine
7. Écrire les tests : hook (unit/functional) + composant (unit/functional) + flux complet (integration)
