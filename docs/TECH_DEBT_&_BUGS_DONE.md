# 🗺️ Board Game Dashboard - THECH DEBT & BUGS
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