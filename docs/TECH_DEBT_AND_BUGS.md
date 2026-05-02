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