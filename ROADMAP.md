# 🗺️ Roadmap — Board Game Dashboard

**📈 Status**: 346 tests (212 backend + 134 frontend) · Phase 3 in progress

---

## 🧹 Technical Debt — Remaining

- **`vitest.config.ts` backend — test env variables**: `server.ts` calls `createAuthService()` and `getDb()` at module level (side effects on import). Worked around via `backend/logger.ts`. Real fix: add `env: { AUTH_JWT_SECRET: '...', ADMIN_PASSWORD: '...' }` in `backend/vitest.config.ts`.
- **`players` — 4 dead columns**: `games_played`, `wins`, `total_score`, `average_score` exist in the `players` table AND are dynamically recalculated via the `player_statistics` view. The backend always reads via the view — stored columns stay at `0`. Recommended option: drop the 4 columns + clean up `CreatePlayerSchema` Zod. Unresolved — kept for backward compatibility.
- **`EditGameDialog` — weak typing**: `formData: any` and `editingGame?: any` in `EditGameDialogProps` — should be typed with the proper `Game` / `GameFormData` interfaces to catch field mismatches at compile time (noted in PR #94 security review).
- **`handleEditBGGSearch` / `handleBGGSearch` duplication**: the two handlers in `useGamesPage.ts` share the same BGG field mapping. Extract a shared `mapBGGGameToFormData()` helper to avoid drift (noted in PR #94 security review).

---

## 🐛 Bugs — Remaining

- **📱 Dialogs — mobile/tablet responsiveness**: popups (AddGameDialog, EditGameDialog, BGGSearch) overflow horizontally on small screens, with content partially off-screen. Needs global investigation: `max-w`, `overflow`, `mx-4`, internal vs external scrolling. Likely affects all dialogs. **Includes BGG year filter placement** (see item below) — where to place it depends on the final dialog layout.
- **📅 BGG year filter** : Client side filter on local search result (no parameters `year_published` serveur). À placer dans BGGSearch — **dépendant de la refonte responsive des dialogs** (item ci-dessus). Low priority.
- **`has_expansion`/`has_characters` not recalculated on add/delete**: `addExpansion()` and `deleteExpansion()` do not update the flag on the parent game. Low impact (`getById()` always loads expansions), but `getAll()` may return `expansions: []` incorrectly.
- **🕒 `name_updated_at` in `bgg_catalog_language`**: timestamp of last `name_en` update — useful for detecting BGG renames and invalidating translations. To consider during the "local catalog" sprint.
- **🔽 BGG search — live autocomplete**: recherche en/fr/es et transmission du `bgg_id` déjà en place ✅. Reste : passer au pattern autocomplete (suggestions live au keystroke, sans bouton Search).
- **`isEditBGGSearchOpen` — non resetté à la fermeture du dialog** : `handleEditDialogOpen` (`useGamesPage.ts:125`) ne remet pas `isEditBGGSearchOpen` à `false`. Effet : rouvrir l'EditDialog après avoir cliqué BGGSearch sans sélectionner de jeu affiche BGGSearch ouvert d'emblée. Fix : ajouter `setIsEditBGGSearchOpen(false)` dans le `if (!open)` de `handleEditDialogOpen`.

---

## 🔒 Security — Remaining

- ⏳ `typescript` 5 → 6 — deferred (ts-node, vitest, plugins not yet compatible)
- ⏳ `eslint` 9 → 10 — deferred (eslint-plugin-react-hooks and sonarjs not yet compatible)

---

## 🎯 Current Phase — Phase 3: UX Polish

Functional dark/light theme (to migrate from prop-drilling → Tailwind `dark:`), time-series charts + backend BGG cache to implement. → [see detail](#-phase-3--ux-polish)

---

## Evolution Plan

### ✅ Phase 1 — Foundation (complete)

<details>
<summary>See detail</summary>

<details>
<summary><b>🏗️ Architecture & Infrastructure</b></summary>

- ✅ Frontend Architecture: Container/Presenter pattern, logic/presentation separation
- ✅ RESTful Backend API: Express + complete CRUD endpoints
- ✅ Relational architecture: `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `play_players` tables
- ✅ Zod validation: complete schemas + middleware on all routes
- ✅ SQL views: `player_statistics`, `game_statistics` — N+1 resolution

</details>

<details>
<summary><b>🏗️ Sprint 0 — Full Architecture Refactoring (April 2026)</b></summary>

- ✅ `shared/types/index.d.ts` — single source of truth frontend + backend
- ✅ Numbered SQL migrations (001–022) + runner in `DatabaseConnection.ts`
- ✅ `DatabaseManager.ts` + `interfaces.ts` deleted → `DatabaseConnection` + Repositories
- ✅ Layered architecture: Routes → Services → Repositories → DatabaseConnection
- ✅ `server.ts` rewritten: `/api/v1`, Helmet, pino, rate limiting, separate routes
- ✅ JWT middleware: `auth.ts` (signed JWT, HttpOnly cookie), `requireRole.ts` (`admin`/`user` roles)
- ✅ Refresh tokens with family rotation (`RefreshTokenRepository`)
- ✅ Frontend React Query v5: all pages in zero-prop hooks (`useXxxPage`)
- ✅ React Router v7: `App.tsx` shell, `AuthContext`, `Layout`, `useNavigationAdapter`
- ✅ `api/*` split: `playerApi.ts`, `gameApi.ts`, `sessionApi.ts`, `statsApi.ts`, `authApi.ts`, `bggApi.ts`, `queryKeys.ts`
- ✅ Feature-based architecture: `src/features/<name>/` co-locating container + view + hook + api + dialogs

</details>

<details>
<summary><b>🧪 Tests & Quality</b></summary>

- ✅ Infrastructure: Vitest + React Testing Library + MSW
- ✅ **212/212 backend tests** (26 files — repos, services, HTTP routes)
- ✅ **134/134 frontend tests** (23 files — hooks, flows, components, services)
- ✅ Covered hooks: useGamesPage, usePlayersPage, useNewPlayPage, useDashboard, useGameStatsPage, usePlayerStatsPage
- ✅ HTTP routes: 8 supertest suites (auth, games, players, plays, stats, bgg, labels, data)
- ✅ CRUD flows: Players, Games, Plays, Stats, BGGSearch via MSW

</details>

<details>
<summary><b>🌍 DB-driven Internationalization (PR #85, April 2026)</b></summary>

- ✅ `labels(key, locale, value)` table + `GET /api/v1/labels?locale=xx` endpoints
- ✅ `useLabels` / `useLocale` / `useLocales` / `useApiReachable` hooks
- ✅ Full migration: 9 components, 6 SQL migrations (017-022), EN/FR labels
- **Note**: translating entity *content* (localized names, descriptions) would require a schema redesign (`games_translations` etc.) — to investigate if need is confirmed.

</details>

</details>

---

### ✅ Phase 2 — BGG & DB Polish (complete)

<details>
<summary>See detail</summary>

- ✅ **Extended BGG Schema Migration** (PR #55): `thumbnail`, `playing_time`, `min/max_playtime`, `categories`, `mechanics`, `families`
- ✅ **Automatic migrations**: `runMigrations()` in `DatabaseConnection.ts` — SQLite transactions
- ✅ **BGG interface unification**: `BGGGame`, `BGGSearchResult`, `BGGExpansion`, `BGGCharacter` in `shared/types/index.d.ts` — see [DEVELOPMENT.md §6](docs/guides/DEVELOPMENT.md#6-shared-types--sharedtypes)
- ~~**BGG pre-import form**~~ — Cancelled: the add form already handles manual entry + BGG

</details>

---

### 🎨 Phase 3 — UX Polish

<details open>
<summary>See detail</summary>

#### **Dark/Light Theme** — functional, refactor pending
- ✅ `DarkModeContext` + localStorage + Settings toggle + `DarkModeProvider` in `App.tsx`
- ✅ Complete migration to Tailwind CSS `dark:` variant — `darkMode` prop removed everywhere
- ⚠️ Dark mode toggle disabled in Settings (removed during Sprint 2 — to restore during a proper light-mode design pass)

#### **UX Quick Wins — Sprint 1** ✅ (April 2026)
- ✅ Duplicate `<h1>` removed in `GameDetailView`
- ✅ Fake Dashboard data ("5 minutes ago") → replaced with real empty state
- ✅ Empty state `GamesPageView` with icon `<GameController>`
- ✅ `AlertDialog` de confirmation sur Reset data
- ✅ Placeholder "Performance charts coming soon" retiré
- ✅ Bottom-nav active-state déjà correct via `useLocation`

#### **Player Stats — recent plays** ✅ (April 2026)
- ✅ `GET /api/v1/stats/players/:id/recent-plays` — endpoint + repo + service
- ✅ Frontend wired via React Query in `PlayerStatsPage`
- ✅ MSW handler + 3 tests backend + 1 test frontend

#### **Global UI/UX Harmonization — Sprint 2** ✅ (April 2026)
- ✅ `DeleteGameDialog` + `DeletePlayerDialog`: i18n + entity name displayed
- ✅ `EditPlayerDialog` : suppression prop `darkMode`
- ✅ `AddPlayerDialog` : Complete migration i18n (EN + FR labels, migration 023)
- ✅ `EditGameDialog` + `AddGameDialog` : i18n complete (~30 strings), token `gameModeColors`
- ✅ `NewPlayView` : difficulty i18n + mode badges via `gameModeColors` (migration 024)
- ✅ `gameModeColors` token centralisé (`src/shared/theme/gameModeColors.ts`) — `GameStatsView` + `NewPlayView` harmonisés (hybrid était vert → orange)
- ✅ Bug dashboard : boutons "New Game" / "Add Player" se chevauchaient au hover — fixé via `hover:z-10`

#### **Player Stats Charts** ✅ (April 2026)
- ✅ Score evolution CSS bar chart (`PlayerStatsView`) — 10 dernières parties, teal=victoire
- ✅ Game trends horizontal bars (`PlayerStatsView`) — top 5 jeux les plus joués
- ✅ Labels i18n EN/FR (migration 025)

#### **Time-Series Charts** — scope réduit
- ~~Recharts~~ → CSS pur (bar charts via height %) — score evolution + game trends livrés
- Temporal performance : non implémenté (jugé pas utile)

#### **Backend BGG Cache** — partial
- ✅ Lazy thumbnail cache (PR #93): thumbnail persisted in `bgg_catalog_language` on first `getGameDetails` call
- ⏳ Periodic metadata sync (descriptions, min/max players, etc.) — not started, deferred

</details>

---

### 🔄 Phase 4 — Advanced Features

<details>
<summary>See detail</summary>

#### **Character Selection in Session** — not started
- `has_characters` detection in place, selection interface missing
- Modal interface for character selection in sessions

#### **Data Enrichment**
- **UltraBoardGames Character Service**: HTML scraping UltraBoardGames.com (no API). ⚠️ Fragile + legally ambiguous — to tackle when other features are stable.
- **Data Export/Import**: stubs present in `useSettingsPage`, implementation missing (JSON/CSV export, import with validation, automatic backup).
- **BGG data translation table**: `difficulty` (`Beginner`, `Intermediate`, `Expert`) and other BGG-sourced enum values are displayed as-is (English) — intentional, they come from BGG. A future `bgg_translations` table could map these to FR/ES if needed.

#### **End-to-End Tests** — not started
- Recommended framework: Playwright
- 7 priority workflows: BGG search/import, CRUD players/games/sessions, navigation, stats
- Target files: `e2e/bgg-search.spec.ts`, `player-crud.spec.ts`, `game-crud.spec.ts`, `session-create.spec.ts`, `navigation.spec.ts`, `stats-page.spec.ts`

#### **Granular Error Handling** — partially done
- ✅ Global `ErrorBoundary` + `ErrorFallback.tsx` + `sonner` toasts in all hooks
- **Remaining**: per-feature error boundaries (if BGGSearch crashes, only that section crashes)

#### **Performance Tests** — not started
- Vitest benchmarking suite. Note: 340 tests in ~25s — low priority.

</details>

---

### ✨ Phase 5 — Advanced Features (long term)

<details>
<summary>See detail</summary>

#### **Multi-Scenario Campaign Mode** — not started
- `campaign` support exists in DB + types, but no dedicated interface
- Schema to add: `campaigns` table, `game_plays.campaign_id`, `scenario_number`
- Backend: CRUD `/api/campaigns` + `GET /api/campaigns/:id/plays`
- Frontend: `CampaignPage`, "Add to campaign" option in NewPlayPage

#### **DB Migration System** — not started
- Knex.js or explicit versioning system instead of the custom runner

#### **Advanced Dashboard** — not started
- Sophisticated recharts charts: score evolution, trends, temporal comparisons

#### **Advanced Image Management** — not started
- Download BGG images at import → local storage → WebP re-encoding with `sharp`
- Docker volume: `uploads/` in the existing named volume (with SQLite)

#### ❌ Not Relevant for This Project
- Multi-user, PWA/offline, Tournament Mode, Achievements, AI/ML, Social sharing

</details>

---

## 🧹 Technical Debt — Delivered

<details>
<summary>See detail</summary>

<details>
<summary><b>PR #55 — Security audit & refactor</b></summary>

- ✅ Duplicate keys BGGSearch: key `${result.id}-${index}`
- ✅ SQLite migrations in transaction: `runMigrations()` wrapped in `db.transaction()`
- ✅ `eslint.audit.config.js` added to `.gitignore`

</details>

<details>
<summary><b>PR #56 — Performance & UI feedback</b></summary>

- ✅ Sonner toast on `handleAddGame`/`handleUpdateGame`
- ✅ 32 unit tests for pure helpers
- ✅ `useCallback` on `usePlayersPage`, `useGamesPage` handlers
- ✅ `React.memo` on `GameCard` and `PlayerCard`
- ✅ `React.lazy` + `Suspense`: 9 lazy-loaded pages

</details>

<details>
<summary><b>PR #57 — Authentication</b></summary>

- ✅ Static bearer token: `POST /api/auth/login` validates `AUTH_PASSWORD`, 64-hex token in memory
- ✅ `requireAuth` middleware protects all routes except `/api/health` and `/api/auth/login`
- ✅ Startup guard: refuses to start if `AUTH_PASSWORD` is missing
- ✅ Frontend: `LoginPage`, token in `localStorage`, logout in Settings, 401 → redirect

</details>

<details>
<summary><b>PR #58 — Quick wins</b></summary>

- ✅ `formatExpansionLabel` removed — merged into `formatExpansion`
- ✅ BGGSearch harmonized — `onKeyPress` → `onKeyDown`
- ✅ 150ms resize debounce in `usePlayersPage` and `useGamesPage`

</details>

<details>
<summary><b>PR #59 — BGG catalog, duplicates, player pseudo</b></summary>

- ✅ Local BGG index: `bgg_catalog` table, `npm run import-bgg-catalog` script, Settings UI
- ✅ Game duplicate detection: `bgg_id` check, 409 backend + `DuplicateGameError`
- ✅ Unique player pseudo: `pseudo TEXT UNIQUE` column, Zod + 409, auto-mirror

</details>

<details>
<summary><b>PR #60-63 — Dependency bumps</b></summary>

- ✅ `typescript-eslint` → `^8.57.2`, `globals` 16→17, `dotenv` 16→17, `@types/node` 24→25
- ✅ `zod` 3→4, `express` 4→5 (PR #61)
- ✅ `vite` 7→8, Rollup → Rolldown (PR #62)
- ✅ `recharts` 2→3, `lucide-react` 0.577→1.x (PR #63)

</details>

<details>
<summary><b>Sprint 0 — Full Architecture Refactoring (April 2026)</b></summary>

See Phase 1 above for full details.

</details>

<details>
<summary><b>Feature-based refactoring + sessions→plays rename (April 2026)</b></summary>

- ✅ DB migration 013: `game_sessions` → `game_plays`, `session_players` → `play_players`
- ✅ Backend: `SessionRepository/Service/Route` → `PlayRepository/Service/Route`, endpoint `/api/v1/plays`
- ✅ Types: `GameSession` → `GamePlay`, `CreateSessionPayload` → `CreatePlayPayload`
- ✅ Feature-based architecture: `src/features/<name>/` — inter-feature isolation
- ✅ Removal of `src/components/`, `src/views/`, `src/hooks/`, `src/services/api/`

</details>

</details>

---

## 🐛 Bugs — Delivered

<details>
<summary>See detail</summary>

- ✅ **Local BGG index — search wired** (PR #79): `search()` queries `bgg_catalog` + `bgg_catalog_language` (name_en/fr/es), ordered by rank
- ✅ **BGG thumbnails — lazy cache** (PR #93): thumbnail persisted in `bgg_catalog_language` on first detail fetch — no repeated geekdo calls on subsequent searches
- ✅ **`BGGGameDetails.characters` uninitialized** — `parseGeekdoItem` returns `characters: []`
- ✅ **`has_expansion` not calculated on BGG import** — `handleBGGSearch` computes `(bggGame.expansions?.length || 0) > 0`
- ✅ **`BGGGame`/`BGGGameDetails` duplicated** — unified in `shared/types/index.d.ts`
- ✅ **`ApiService.getImportLog()` inaccurate type** — removed, merged into `getBggCatalogStatus()`
- ✅ **Cooperative mode — Score hidden** — "Competitive Scoring" conditioned by `sessionType === 'competitive'`
- ✅ **Session creation button grayed out** — `canSubmit()` correctly handles each mode
- ✅ **Score at 0 by default (competitive)** — `playerScores[playerId] || 0` forced on submission
- ✅ **`canSubmit` campaign/hybrid modes** — hybrid requires winner OR teamSuccess OR teamScore > 0
- ✅ **Protected export/import routes** — `GET/POST /api/v1/data/export|import|reset` under `requireRole('admin')`
- ✅ **Game deletion** — frontend handler + SQL `DELETE /api/games/:id`
- ✅ **`supports_hybrid` not persisted** — added to SQL INSERT/UPDATE
- ✅ **Game duplicate detection** — 409 backend + `DuplicateGameError`, dialog stays open

</details>

---

## 🔒 Security — Delivered (March 2026 audit)

<details>
<summary>See detail</summary>

- ✅ `npm audit`: 0 vulnerabilities frontend + backend
- ✅ Zod on all routes: `validateBody` middleware on POST/PUT
- ✅ CORS trim: `.map(o => o.trim())` on `CORS_ORIGINS`
- ✅ Robust JSON.parse: `parseJSONField` helper in `DatabaseConnection`
- ✅ BGG parseInt: `isNaN` + bounds check on `objectid` in `bggService.ts`
- ✅ HTTPS/HSTS: HTTP→HTTPS redirect + `Strict-Transport-Security` in production
- ✅ Signed JWT HttpOnly cookie (PR #57 → Sprint 0)
- ✅ Refresh tokens with family rotation (Sprint 0)
- ✅ `path-to-regexp` 0.1.13 → 8.4.0 — fixes CVE-2024-45296 (ReDoS) via PR #61

</details>

---

## 📊 Performance — Unlighthouse Audit April 2026

**Global scores:** 91 total · 89 Performance · 92 Accessibility · 100 Best Practices · 83 SEO

| Page | Perf | A11y | BP | SEO |
|------|------|------|-----|-----|
| / (dashboard) | 88 | 92 | 100 | 83 |
| /games | 89 | 91 | 100 | 83 |
| /players | 89 | 93 | 100 | 83 |
| /plays/new | 93 | 93 | 100 | 82 |
| /settings | 95 | 93 | 100 | 82 |
| /stats | **80** | **87** | 100 | 83 |

| Priority | Category | Issue | Solution |
|----------|-----------|-------|----------|
| ⭐⭐ | SEO | Missing meta description | `<meta name="description">` in `index.html` |
| ⭐⭐ | Performance | `/stats` perf 80 — heavy recharts | Lazy load charts, optimize stats queries |
| ⭐⭐ | Accessibility | `/stats` a11y 87 — charts without aria | `aria-label` on recharts charts |
| ⭐ | Performance | Google Fonts render-blocking (~780ms) | `font-display: swap` or self-hosting |
| ⭐ | Performance | No asset cache headers | Server/Nginx level fix |
| ⭐ | Performance | BGG images not optimized (~32 KiB) | Download at import + re-encode WebP with `sharp` |

---

## 🔧 Infrastructure History

| PR | Date | Summary | Detail |
|---|---|---|---|
| #43 | March 2026 | Fix game deletion, supports_hybrid, DeletePlayerDialog, types | [changelog/pr-43-fix-popups-delete.md](changelog/pr-43-fix-popups-delete.md) |
| #44 | March 2026 | Stack update: Node 24, Vite 7.3, Vitest 4, TS 5.9 | [changelog/pr-44-stack-update.md](changelog/pr-44-stack-update.md) |
| #45 | March 2026 | Remove @github/spark + 15 dead packages | [changelog/pr-45-remove-spark.md](changelog/pr-45-remove-spark.md) |
| #46 | March 2026 | ROADMAP reorganization + changelog/ directory + .gitattributes LF | [changelog/pr-46-roadmap-reorganization.md](changelog/pr-46-roadmap-reorganization.md) |
| #57 | March 2026 | Static bearer token authentication | — |
| #58 | March 2026 | Quick wins: formatExpansion merge, BGGSearch, debounce, onKeyDown | — |

📋 Planned technical updates: [changelog/planned-updates.md](changelog/planned-updates.md)

*Last updated: April 2026*

---

## 📚 Reference Projects

> **Technical inspiration** only — evaluate each pattern before importing it. **To be removed** when the corresponding features are delivered or definitively abandoned.

<details>
<summary>See detail</summary>

### 🎮 boardGameScore (`C:/git/boardGameScore`)
- **BGG ID → UltraBoardGames slug mapping**: Citadels (478→'citadels'), Dark Souls (197831→'dark-souls'), Zombicide, Arkham Horror…
- **Remove when**: UltraBoardGames service delivered or abandoned

### 🧪 board-game-scorekeep (`C:/git/board-game-scorekeep`)
- **Complete campaign system** to study for Phase 5
- **Smart BGG cache** to study for Phase 2 (backend cache)
- **Remove when**: campaign mode delivered AND backend BGG cache implemented

</details>
