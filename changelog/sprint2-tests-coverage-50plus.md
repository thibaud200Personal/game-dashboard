# Sprint 2 — Atteindre 50+ Tests (31 → 50+)

## Problème
31 tests couvrent principalement 3 composants, 1 hook et 1 service. La majorité du code (hooks, services, backend, dialogs) n'est pas testée.

## État actuel : 31 tests
| Fichier | Tests | Couverture |
|---|---|---|
| `BGGSearch.test.tsx` | 7 | Composant search UI |
| `BottomNavigation.test.tsx` | 9 | Navigation mobile |
| `SimpleDashboard.test.tsx` | 3 | Dashboard basique |
| `useGamesPage.test.ts` | 9 | Hook gestion jeux |
| `bggApi.test.ts` | 5 (fragiles) | Service BGG frontend |
| `infrastructure.test.ts` | 3 (triviaux) | Setup test framework |

## Tests manquants — Priorités

### Hooks (unit/technical/)
- `usePlayersPage.test.ts` — search, CRUD, dialogs state (~8 tests)
- `useDashboard.test.ts` — chargement stats, navigation (~4 tests)
- `useNewGamePage.test.ts` — sélection jeu/joueurs, soumission (~6 tests)
- `useGameStatsPage.test.ts` — calculs performanceTrend, playFrequency (~5 tests)

### Services (unit/technical/)
- `ApiService.test.ts` — tous les appels REST (players, games, sessions, stats) (~10 tests)
- `bggApi.test.ts` — corriger les tests existants avec vrais mocks MSW (~5 tests)

### Composants (unit/functional/)
- `AddGameDialog.test.tsx` — ouverture, préremplissage BGG, soumission (~5 tests)
- `DeleteGameDialog.test.tsx` — confirmation suppression (~3 tests)
- `DeletePlayerDialog.test.tsx` — confirmation suppression (~3 tests)

### Backend (unit/technical/)
- `bggService.test.ts` — cache, parsing, rate limit (~6 tests) ← voir sprint2-bgg-backend-tests
- `DatabaseManager.test.ts` — CRUD games, players, sessions (~8 tests)
- Zod validation middleware (~4 tests)

### Intégration (integration/)
- `bggWorkflow.test.ts` — search → select → save complet (~7 tests)

## Objectif
| Catégorie | Tests actuels | Tests à ajouter | Total |
|---|---|---|---|
| Hooks | 9 | +23 | 32 |
| Services | 5 | +15 | 20 |
| Composants | 19 | +11 | 30 |
| Intégration | 0 | +7 | 7 |
| **Total** | **31** | **+56** | **~87** |

Objectif minimal : **50+ tests** (dépasser board-game-scorekeep 52/52).

## Estimation
1-2 semaines
