# Frontend Architecture

## Overview

React 19 application in TypeScript, organized according to a **feature-based** architecture (co-located features). Navigation via React Router v7. Server state managed exclusively by React Query.

## File Structure

```
src/
├── features/                    → co-located features
│   ├── auth/                    → LoginPage
│   ├── bgg/                     → BGGSearch + bggApi (importable by games and settings)
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
├── shared/                      → cross-cutting modules (used by 2+ features)
│   ├── components/ui/           → shadcn/ui components (do not edit manually)
│   ├── components/              → Layout.tsx, BottomNavigation.tsx, MobileDetailNav.tsx
│   │   └── dialogs/             → BaseFormDialog, BaseDeleteDialog, FormActions, useFormHandler
│   ├── contexts/                → AuthContext.tsx, DarkModeContext.tsx, LocaleContext.tsx
│   ├── services/api/            → request.ts, queryKeys.ts, authApi.ts, labelsApi.ts, statsApi.ts
│   ├── hooks/                   → useLabels, useLocales, useApiReachable, useNavigationAdapter, use-mobile
│   ├── i18n/                    → en.json (offline fallback)
│   ├── utils/                   → gameHelpers.ts
│   ├── lib/                     → utils.ts (cn helper shadcn)
│   └── styles/                  → theme.css
│   └── __tests__/               → shared test infrastructure (mocks/, fixtures/, utils/)
├── App.tsx                      → shell: Router + QueryClient + providers
├── main.tsx
├── ErrorFallback.tsx
└── types/                       → re-exports from shared/types only
```

## Architecture Rules

- **Feature isolation**: a feature **never** imports from another feature.
  - Single exception: `features/bgg/` is importable by `features/games/` and `features/settings/` (shared utility feature).
- **Promotion to shared**: any module used by 2+ features must be moved to `src/shared/`.
- **Path aliases**:
  - `@/` → `src/` (intra-feature and shared imports)
  - `@shared/` → `/shared` (front+back shared types — not to be confused with `@/shared/`)

## Container/Presenter Pattern

Strict separation between logic and presentation, co-located within the same feature.

```
Page (container)            View (presenter)
────────────────            ─────────────────
GamesPage.tsx    →  hooks → GamesPageView.tsx
  useGamesPage()               pure JSX
  logic + state                props only
  API calls                    no API calls
```

**Rule**: if a `View` component contains a `useQuery`, `useMutation`, or a direct API call, it is misplaced.

## Navigation — React Router v7

`App.tsx` is a pure shell. It contains no navigation state.

```tsx
// App.tsx — pure shell, global providers + routes
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>           {/* locale + labels cache invalidation */}
        <AuthProvider>
          <DarkModeProvider>     {/* dark mode (localStorage + html class) */}
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

**Global providers:**
- `LocaleProvider` — reads/writes `localStorage.locale`, invalidates the React Query `['labels']` cache on every change. Must wrap `AuthProvider` (login may use translated labels)
- `DarkModeProvider` — reads/writes `localStorage.darkMode`, applies the `dark` class on `<html>`

### Contextual Mobile Navigation

`location.state` is used when the origin screen must be known:

```ts
// From a game page, navigate to stats while keeping context
navigate('/stats/games/42', { state: { from: '/games' } })

// In the stats page, the back button uses this context
const { state } = useLocation()
const backPath = (state as { from?: string })?.from ?? '/'
```

### Responsive Layout

`BottomNavigation` (mobile) uses `useLocation()` for the active tab state. The adaptive layout is handled by Tailwind + `use-mobile.ts` — independent of the router.

## State Management

React Query is the **single** source of truth for server data.

```
Before (to fix):
  App.tsx [players useState] ← duplicate
  usePlayersPage [useQuery players] ← real source

After:
  App.tsx → no server state
  usePlayersPage [useQuery players] → single source
```

### Cache Keys — queryKeys.ts

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

**Rule**: always use `queryKeys` to invalidate the cache. Never hardcode keys in hooks.

## Hooks

One hook per page, co-located in its feature. Responsibility: data + local page state.

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

  // local state (search, filters, dialogs)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  return { games, isLoading, addGame, search, setSearch, isAddOpen, setIsAddOpen }
}
```

**Rule**: a hook only calls `useQuery` for data that its page actually needs.

## Dialogs

Each dialog manages its own form state. Communication via standard props:

```tsx
interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: GameFormData) => void
}
```

### Shared Dialog Primitives — `shared/components/dialogs/`

For Add/Edit dialogs of the same entity (e.g. Characters, Expansions), use `BaseFormDialog` to avoid duplicating the Dialog/DialogContent wrapper:

```tsx
// BaseFormDialog wraps Dialog + DialogContent + DialogHeader
<BaseFormDialog
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  titleKey={`character.dialog.${mode}.title`}
  descriptionKey={`character.dialog.${mode}.description`}
>
  <form onSubmit={onSubmit} className="space-y-4">
    {/* form fields */}
    <FormActions mode={mode} onCancel={() => onOpenChange(false)} />
  </form>
</BaseFormDialog>
```

- **`FormActions`** (`form-utils.tsx`) — renders Cancel + Submit buttons from `mode: 'add' | 'edit'`
- **`useFormHandler<T>`** (`use-form-handler.ts`) — single `onChange` for all text/textarea inputs; import from `use-form-handler.ts`, not `form-utils.tsx`:

```ts
const onFieldChange = useFormHandler(setFormData)  // T inferred from Dispatch<SetStateAction<T>>
```

- **`BaseDeleteDialog`** (`generic-dialogs.tsx`) — wraps AlertDialog for the controlled delete pattern (see below)

### Delete Dialog — Two Patterns

**Pattern 1 — Trigger prop (Games, Players)**: the dialog embeds its own trigger; use when a single button opens a single dialog:

```tsx
<DeleteGameDialog
  gameName={game.name}
  onDeleteGame={() => handleDelete(game.game_id)}
  trigger={<button>Delete</button>}
/>
```

Never pass a composite Radix component (e.g. `<Tooltip>`) as trigger — `AlertDialogTrigger asChild` clones the direct child.

**Pattern 2 — Controlled (Characters, Expansions)**: the parent owns the open state; use when a list tracks which item is being deleted via an ID:

```tsx
// parent keeps: const [deleteId, setDeleteId] = useState<number | null>(null)
<DeleteCharacterDialog
  isOpen={!!deleteCharacterId}
  onOpenChange={(open) => !open && setDeleteCharacterId(null)}
  characterName={characters.find(c => c.character_id === deleteCharacterId)?.name ?? ''}
  onConfirm={() => handleDeleteCharacter(deleteCharacterId!)}
/>
```

`DeleteCharacterDialog` and `DeleteExpansionDialog` use `BaseDeleteDialog` internally.

## Types

Types live in `shared/types/index.d.ts` (hand-written TypeScript declaration file — see [note in DEVELOPMENT.md §3](../guides/DEVELOPMENT.md#3-shared-types--sharedtypes)). The `src/types/` folder only re-exports:

```ts
// src/types/index.ts
export * from '../../shared/types'
```

**Rules:**
- Zero `any` — use `unknown`, `never`, or precise types
- Zero local interface if it already exists in `shared/types`
- Display-computed fields (`formatPlayerStats`, `formatPlayerCount`) are functions in `shared/utils/formatters.ts`, not type fields

## Responsive Design

The app handles three breakpoints:
- **Mobile**: navigation via `BottomNavigation`, contextual menus
- **Tablet**: hybrid layout
- **Desktop**: sidebar or top navigation, direct actions without menus

`use-mobile.ts` exposes `isMobile: boolean`. Components adapt via conditional Tailwind classes. No navigation logic depends on the breakpoint — the router is the same for all.

## Frontend Authentication

```ts
// AuthGuard.tsx
function AuthGuard() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}
```

The JWT role is decoded on the client (without signature verification — the backend validates it). Admin-only features (BGG catalog import) are conditionally rendered based on `role === 'admin'`.

```ts
// useAuth.ts
const { role } = useAuth()
// In Settings:
{role === 'admin' && <BGGCatalogImport />}
```

## Internationalization (i18n)

All user-facing text goes through the `useLabels` hook.

```tsx
const { t } = useLabels()
// Usage:
<h1>{t('dashboard.title')}</h1>
<Button>{t('games.add')}</Button>
```

**Flow:**
1. `LocaleContext` exposes `locale` (stored in `localStorage`) and `setLocale`
2. `useLabels` calls `GET /api/v1/labels?locale=<locale>` via React Query (key `['labels', locale]`)
3. If the API is unreachable, falls back to `src/shared/i18n/en.json`
4. Changing the locale via `setLocale()` invalidates the cache and reloads labels without a page refresh

**Adding a label:**
- Add the key to `src/shared/i18n/en.json` (offline fallback)
- Create a SQL migration: `INSERT INTO labels (key, locale, value) VALUES ...` for each locale

**Rule:** no user-visible string hardcoded in JSX. Always go through `t()`.

## Adding a Page — Checklist

1. Create the folder `src/features/<name>/`
2. Create the hook `src/features/<name>/use<NamePage>.ts`
3. Create the container `src/features/<name>/<NamePage>.tsx`
4. Create the view `src/features/<name>/<NamePage>View.tsx`
5. If dialogs are needed, create `src/features/<name>/dialogs/`
6. If an API is needed, create `src/features/<name>/<name>Api.ts`
7. Add the route in `App.tsx`
8. Add entries in `src/shared/services/api/queryKeys.ts` if new data is required
9. Write tests: hook (unit/functional) + component (unit/functional) + full flow (integration)
