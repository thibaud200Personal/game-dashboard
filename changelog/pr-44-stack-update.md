# PR #44 — Mise à jour stack (Mars 2026)

## Mises à jour de versions

| Package | Avant | Après |
|---|---|---|
| Node.js | 20 | **24 LTS** (Dockerfile → `node:24-alpine`) |
| Vite | 6 | **7.3** |
| @vitejs/plugin-react-swc | 3 | **4** |
| Vitest | 3 | **4** (+ `jsdom` ajouté explicitement) |
| TypeScript | 5.7 | **5.9** (fix `response.json()` typé `unknown`) |
| @github/spark | 0.39 | 0.45 (puis supprimé en #45) |

## Suppressions

- ✅ **Jest + ts-jest** supprimés — Vitest est le runner officiel
- ✅ **@vitejs/plugin-react (Babel)** supprimé — SWC utilisé à la place
- ✅ **`sqlite3`** supprimé — inutilisé + vulnérabilités connues
- ✅ **`GameCharacterController.ts` + `GameCharacterService.ts`** supprimés — fichiers orphelins sans usage

## Notes techniques

- `better-sqlite3` recompilé pour Node 24 (binaire natif)
- Fix TypeScript strict : `response.json()` retourne maintenant `unknown` au lieu de `any` en TS 5.9
