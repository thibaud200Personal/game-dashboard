---

## 🧹 Technical Debt — Remaining

- **`vitest.config.ts` backend — test env variables**: `server.ts` calls `createAuthService()` and `getDb()` at module level (side effects on import). Worked around via `backend/logger.ts`. Real fix: add `env: { AUTH_JWT_SECRET: '...', ADMIN_PASSWORD: '...' }` in `backend/vitest.config.ts`.
- **`players` — 4 dead columns**: `games_played`, `wins`, `total_score`, `average_score` exist in the `players` table AND are dynamically recalculated via the `player_statistics` view. The backend always reads via the view — stored columns stay at `0`. Recommended option: drop the 4 columns + clean up `CreatePlayerSchema` Zod. Unresolved — kept for backward compatibility.
- **`EditGameDialog` — weak typing**: `formData: any` and `editingGame?: any` in `EditGameDialogProps` — should be typed with the proper `Game` / `GameFormData` interfaces to catch field mismatches at compile time (noted in PR #94 security review).
- **`handleEditBGGSearch` / `handleBGGSearch` duplication**: the two handlers in `useGamesPage.ts` share the same BGG field mapping. Extract a shared `mapBGGGameToFormData()` helper to avoid drift (noted in PR #94 security review).

---

## 🐛 Bugs — Remaining

- **📱 Dialogs — mobile/tablet responsiveness**: popups (AddGameDialog, EditGameDialog, BGGSearch) overflow horizontally on small screens, with content partially off-screen. Needs global investigation: `max-w`, `overflow`, `mx-4`, internal vs external scrolling. Likely affects all dialogs. **Includes BGG year filter placement** (see item below) — where to place it depends on the final dialog layout.
- **📅 BGG year filter**: Client-side filter on local search result (no `year_published` server parameter). To place in BGGSearch — **depends on the responsive dialog refactor** (item above). Low priority.
- **`has_expansion`/`has_characters` not recalculated on add/delete**: `addExpansion()` and `deleteExpansion()` do not update the flag on the parent game. Low impact (`getById()` always loads expansions), but `getAll()` may return `expansions: []` incorrectly.
- **🕒 `name_updated_at` in `bgg_catalog_language`**: timestamp of last `name_en` update — useful for detecting BGG renames and invalidating translations. To consider during the "local catalog" sprint.
- **🔽 BGG search — live autocomplete**: en/fr/es search and `bgg_id` transmission already in place ✅. Remaining: switch to autocomplete pattern (live suggestions on keystroke, no Search button).
- **`isEditBGGSearchOpen` — not reset on dialog close**: `handleEditDialogOpen` (`useGamesPage.ts:125`) does not reset `isEditBGGSearchOpen` to `false`. Effect: reopening EditDialog after clicking BGGSearch without selecting a game shows BGGSearch already open. Fix: add `setIsEditBGGSearchOpen(false)` in the `if (!open)` branch of `handleEditDialogOpen`.

---

## 🔒 Security — Remaining

- ⏳ `typescript` 5 → 6 — deferred (ts-node, vitest, plugins not yet compatible)
- ⏳ `eslint` 9 → 10 — deferred (eslint-plugin-react-hooks and sonarjs not yet compatible)

---