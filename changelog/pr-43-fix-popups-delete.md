# PR #43 — Fix popups delete + bugs (Mars 2026)

## Changements

### Corrections fonctionnelles
- ✅ **Suppression de jeux corrigée** — Handler frontend manquant ajouté + SQL `DELETE /api/games/:id` opérationnel dans `DatabaseManager.ts`
- ✅ **`supports_hybrid` non persisté** — Champ ajouté aux SQL INSERT et UPDATE dans `DatabaseManager.ts` + interfaces backend mises à jour

### Refactoring composants
- ✅ **`DeletePlayerDialog` refactorisé** — Remplacé par `AlertDialog` + pattern `trigger` prop, aligné avec le comportement de `DeleteGameDialog`
- ✅ **`NewGamePage.tsx` — interfaces locales dupliquées** — Imports migrés depuis `@/types`, 0 interface locale, 0 duplication de types
