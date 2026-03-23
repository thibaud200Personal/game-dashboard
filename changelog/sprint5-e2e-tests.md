# Sprint 5 — Tests End-to-End (E2E)

## Problème
Aucun test E2E. L'infrastructure Vitest + MSW couvre le testing unitaire et intégration légère, mais pas les workflows utilisateur complets en navigateur réel.

## État actuel
- `src/__tests__/` : tests unitaires et composants avec jsdom
- Aucun Cypress, Playwright ou framework E2E installé
- Aucun test de navigation, formulaire complet, ou interaction multi-pages

## Ce qui manque

### 1. Choix du framework
**Recommandé : Playwright** (plus moderne, multi-browser, meilleure DX TypeScript)
- Alternative : Cypress (plus répandu, mais plus lourd)

### 2. Setup
```bash
npm install --save-dev @playwright/test
npx playwright install
```
Configuration `playwright.config.ts` :
- `baseURL: 'http://localhost:5173'`
- Serveur backend à démarrer avant les tests
- Screenshots en cas d'échec

### 3. Workflows E2E à couvrir (7 prioritaires)

#### BGG Workflow (prioritaire)
1. `bgg-search.spec.ts` — chercher un jeu → sélectionner → vérifier préremplissage formulaire
2. `bgg-import.spec.ts` — importer un jeu BGG → vérifier en base → apparaît dans liste jeux

#### CRUD
3. `player-crud.spec.ts` — créer joueur → modifier → supprimer
4. `game-crud.spec.ts` — créer jeu manuellement → modifier → supprimer
5. `session-create.spec.ts` — sélectionner jeu + joueurs → sauvegarder session → vérifier dans historique

#### Navigation
6. `navigation.spec.ts` — navigation entre toutes les pages (Dashboard, Jeux, Joueurs, Stats, Paramètres)
7. `stats-page.spec.ts` — vérifier affichage stats après création de sessions

## Fichiers à créer
- `playwright.config.ts`
- `e2e/bgg-search.spec.ts`
- `e2e/bgg-import.spec.ts`
- `e2e/player-crud.spec.ts`
- `e2e/game-crud.spec.ts`
- `e2e/session-create.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/stats-page.spec.ts`

## Estimation
1-2 semaines
