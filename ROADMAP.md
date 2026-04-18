# 🗺️ Roadmap — Board Game Dashboard

**📈 Statut** : 340 tests (206 backend + 134 frontend) · Phase 3 en cours

---

## 🧹 Dette Technique — Restante

- **`vitest.config.ts` backend — variables d'env de test** : `server.ts` exécute `createAuthService()` et `getDb()` au niveau module (effets de bord à l'import). Contourné via `backend/logger.ts`. Vraie solution : ajouter `env: { AUTH_JWT_SECRET: '...', ADMIN_PASSWORD: '...' }` dans `backend/vitest.config.ts`.
- **MSW handler manquant** : `GET /api/v1/labels?locale=en` non intercepté dans certains tests (GamesPage, PlayersPage, StatsPages) — warning MSW à l'exécution, aucun test qui fail.
- **Stats joueur (#23/#31)** : recent activity et performance overview vides — pas de endpoint `GET /api/v1/stats/players/:id/recent-plays` côté backend.
- **`players` — 4 colonnes mortes** : `games_played`, `wins`, `total_score`, `average_score` existent dans la table `players` ET sont recalculées dynamiquement via la vue `player_statistics`. Le backend lit toujours via la vue — les colonnes stockées restent à `0`. Option recommandée : supprimer les 4 colonnes + nettoyage `CreatePlayerSchema` Zod. Non tranché — conservées pour rétrocompatibilité.

---

## 🐛 Bugs — Restants

- **`has_expansion`/`has_characters` non recalculés sur add/delete** : `addExpansion()` et `deleteExpansion()` ne mettent pas à jour le flag sur le jeu parent. Impact faible (getById() charge toujours les expansions), mais `getAll()` peut retourner `expansions: []` à tort. → [détail](changelog/sprint3-bgg-flags-recalculation.md)
- **Labels EditGameDialog** : les valeurs BDD enum (`Beginner`, `Intermediate`, `competitive`…) s'affichent en anglais dans les formulaires d'édition. À corriger via maps centralisées `DIFFICULTY_LABELS`, `GAME_TYPE_LABELS` consommées par `t()`.
- **📅 Filtre par année BGG** : filtrage côté client sur les résultats geekdo (pas de paramètre serveur `yearpublished`). Faible priorité.
- **🗄️ Index local BGG — recherche à brancher** : infrastructure livrée (PR #59). Reste : brancher `searchGames()` sur `bgg_catalog` (FTS5 à envisager pour 175k entrées). Une fois branché : ajouter champ année + case "inclure extensions" dans `BGGSearch`.
- **🖼️ Thumbnails BGG non persistés** : jusqu'à 15 appels geekdo refaits à chaque recherche. Solution : table `bgg_thumbnails (bgg_id PK, thumbnail_url, fetched_at)` indépendante du cycle d'import CSV.
- **🕒 `name_updated_at` dans `bgg_catalog_language`** : timestamp de dernière mise à jour du `name_en` — utile pour détecter les renames BGG et invalider les traductions. À envisager lors du sprint "catalogue local".
- **🔽 Recherche BGG — autocomplete** : remplacer le champ texte par un composant autocomplete (saisie libre + filtre sur noms en/fr/es). La sélection doit transmettre le `bgg_id`, pas le nom — évite les problèmes d'homonymes.

---

## 🔒 Sécurité — Restante

- ⏳ `typescript` 5 → 6 — différé (ts-node, vitest, plugins pas encore compatibles)
- ⏳ `eslint` 9 → 10 — différé (eslint-plugin-react-hooks et sonarjs pas encore compatibles)

---

## 🎯 Phase en cours — Phase 3 : Finitions UX

Thème sombre/clair fonctionnel (à migrer prop-drilling → Tailwind `dark:`), graphiques temporels + cache BGG backend à implémenter. → [voir détail](#-phase-3--finitions-ux)

---

## Plan d'évolution

### ✅ Phase 1 — Foundation (terminée)

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>🏗️ Architecture & Infrastructure</b></summary>

- ✅ Architecture Frontend : pattern Container/Presenter, séparation logique/présentation
- ✅ Backend API RESTful : Express + endpoints CRUD complets
- ✅ Architecture relationnelle : tables `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `play_players`
- ✅ Validation Zod : schémas complets + middleware sur toutes les routes
- ✅ Vues SQL : `player_statistics`, `game_statistics` — résolution N+1

</details>

<details>
<summary><b>🏗️ Sprint 0 — Refactoring architecture complète (avril 2026)</b></summary>

- ✅ `shared/types/index.d.ts` — source de vérité unique frontend + backend
- ✅ Migrations SQL numérotées (001–022) + runner dans `DatabaseConnection.ts`
- ✅ `DatabaseManager.ts` + `interfaces.ts` supprimés → `DatabaseConnection` + Repositories
- ✅ Architecture en couches : Routes → Services → Repositories → DatabaseConnection
- ✅ `server.ts` réécrit : `/api/v1`, Helmet, pino, rate limiting, routes séparées
- ✅ JWT middleware : `auth.ts` (JWT signé, HttpOnly cookie), `requireRole.ts` (rôles `admin`/`user`)
- ✅ Refresh tokens avec rotation de famille (`RefreshTokenRepository`)
- ✅ Frontend React Query v5 : toutes les pages en hooks zero-prop (`useXxxPage`)
- ✅ React Router v7 : shell `App.tsx`, `AuthContext`, `Layout`, `useNavigationAdapter`
- ✅ `api/*` split : `playerApi.ts`, `gameApi.ts`, `sessionApi.ts`, `statsApi.ts`, `authApi.ts`, `bggApi.ts`, `queryKeys.ts`
- ✅ Architecture feature-based : `src/features/<nom>/` co-localisant container + view + hook + api + dialogs

</details>

<details>
<summary><b>🧪 Tests & Qualité</b></summary>

- ✅ Infrastructure : Vitest + React Testing Library + MSW
- ✅ **206/206 tests backend** (26 fichiers — repos, services, routes HTTP)
- ✅ **134/134 tests frontend** (23 fichiers — hooks, flows, composants, services)
- ✅ Hooks couverts : useGamesPage, usePlayersPage, useNewPlayPage, useDashboard, useGameStatsPage, usePlayerStatsPage
- ✅ Routes HTTP : 8 suites supertest (auth, games, players, plays, stats, bgg, labels, data)
- ✅ Flows CRUD : Players, Games, Plays, Stats, BGGSearch via MSW

</details>

<details>
<summary><b>🌍 Internationalisation DB-driven (PR #85, avril 2026)</b></summary>

- ✅ Table `labels(key, locale, value)` + endpoints `GET /api/v1/labels?locale=xx`
- ✅ Hooks `useLabels` / `useLocale` / `useLocales` / `useApiReachable`
- ✅ Migration complète : 9 composants, 6 migrations SQL (017-022), labels EN/FR
- **Note** : traduire le *contenu* des entités (noms localisés, descriptions) impliquerait une refonte schéma BDD (`games_translations` etc.) — à investiguer si besoin confirmé.

</details>

</details>

---

### 🎯 Phase 2 — Finitions BGG & BDD (quasi-terminée)

<details>
<summary>Voir le détail</summary>

- ✅ **Migration Schema BGG Étendu** (PR #55) : `thumbnail`, `playing_time`, `min/max_playtime`, `categories`, `mechanics`, `families`
- ✅ **Migrations automatiques** : `runMigrations()` dans `DatabaseConnection.ts` — transactions SQLite
- ✅ **Unification interfaces BGG** : `BGGGame`, `BGGSearchResult`, `BGGExpansion`, `BGGCharacter` dans `shared/types/index.d.ts` — voir [DEVELOPMENT.md §6](docs/guides/DEVELOPMENT.md#6-types-partagés--sharedtypes)
- ~~**Formulaire pré-import BGG**~~ — Annulé : le formulaire d'ajout gère déjà saisie manuelle + BGG

</details>

---

### 🎨 Phase 3 — Finitions UX

<details open>
<summary>Voir le détail</summary>

#### **Thème Sombre/Clair** — fonctionnel, refacto à faire
- ✅ `DarkModeContext` + localStorage + toggle Settings + `DarkModeProvider` dans `App.tsx`
- **Reste** : migrer du prop-drilling (`darkMode` passé en prop partout) vers le variant CSS Tailwind `dark:` — élimine le threading de prop dans tous les composants et dialogs. Zéro usage de `dark:` actuellement.

#### **Graphiques Temporels** — non démarré
- Infrastructure Recharts prête, placeholders "coming soon" en place
- Scope : évolution scores, tendances jeux, performances temporelles

#### **Cache BGG backend** — non démarré
- Cache persistant résultats BGG + sync périodique métadonnées
- Différé à la séparation front/back — inspiration : board-game-scorekeep

#### **Harmonisation UI/UX Globale** — reporté
- Boutons, couleurs, tailles, cohérence visuelle — à reprendre après stabilisation technique

</details>

---

### 🔄 Phase 4 — Évolutions Avancées

<details>
<summary>Voir le détail</summary>

#### **Sélection Personnages en Session** — non démarré
- Détection `has_characters` en place, interface sélection manquante
- Interface modale sélection personnages pour sessions

#### **Enrichissement Données**
- **Service Personnages UltraBoardGames** : scraping HTML UltraBoardGames.com (pas d'API). ⚠️ Fragile + légalement ambigu — à aborder quand les autres features sont stables.
- **Export/Import Données** : stubs présents dans `useSettingsPage`, implémentation manquante (Export JSON/CSV, import avec validation, backup automatique).

#### **Tests End-to-End** — non démarré → [détail](changelog/sprint5-e2e-tests.md)
- Framework recommandé : Playwright
- 7 workflows prioritaires : BGG search/import, CRUD players/games/sessions, navigation, stats
- Fichiers cibles : `e2e/bgg-search.spec.ts`, `player-crud.spec.ts`, `game-crud.spec.ts`, `session-create.spec.ts`, `navigation.spec.ts`, `stats-page.spec.ts`

#### **Gestion d'Erreurs Granulaire** — partiellement fait
- ✅ `ErrorBoundary` global + `ErrorFallback.tsx` + toasts `sonner` dans tous les hooks
- **Reste** : error boundaries par feature (si BGGSearch plante, seule la section crashe)

#### **Tests Performance** — non démarré
- Benchmarking suite Vitest. Note : 340 tests en ~25s — faible priorité.

</details>

---

### ✨ Phase 5 — Fonctionnalités Avancées (long terme)

<details>
<summary>Voir le détail</summary>

#### **Mode Campagne Multi-Scénarios** — non démarré → [détail](changelog/sprint5-campaign-mode.md)
- Support `campaign` existant en BDD + types, mais aucune interface dédiée
- Schéma à ajouter : table `campaigns`, `game_plays.campaign_id`, `scenario_number`
- Backend : CRUD `/api/campaigns` + `GET /api/campaigns/:id/plays`
- Frontend : `CampaignPage`, option "Ajouter à une campagne" dans NewPlayPage

#### **Système Migration BDD** — non démarré
- Knex.js ou système de versioning explicite à la place du runner maison

#### **Tableau de Bord Avancé** — non démarré
- Graphiques recharts sophistiqués : évolution scores, tendances, comparaisons temporelles

#### **Gestion Images Avancée** — non démarré
- Téléchargement images BGG à l'import → stockage local → re-encodage WebP avec `sharp`
- Volume Docker : `uploads/` dans le named volume existant (avec SQLite)

#### ❌ Non Pertinent pour ce Projet
- Multi-utilisateurs, PWA/offline, Mode Tournoi, Achievements, IA/ML, Partage social

</details>

---

## 🧹 Dette Technique — Livrée

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>PR #55 — Audit sécurité & refacto</b></summary>

- ✅ Duplicate keys BGGSearch : clé `${result.id}-${index}`
- ✅ Migrations SQLite dans transaction : `runMigrations()` encapsulé dans `db.transaction()`
- ✅ `eslint.audit.config.js` ajouté à `.gitignore`

</details>

<details>
<summary><b>PR #56 — Performance & feedback UI</b></summary>

- ✅ Toast Sonner sur `handleAddGame`/`handleUpdateGame`
- ✅ 32 tests unitaires helpers purs
- ✅ `useCallback` sur handlers `usePlayersPage`, `useGamesPage`
- ✅ `React.memo` sur `GameCard` et `PlayerCard`
- ✅ `React.lazy` + `Suspense` : 9 pages lazy-loadées

</details>

<details>
<summary><b>PR #57 — Authentification</b></summary>

- ✅ Bearer token statique : `POST /api/auth/login` valide `AUTH_PASSWORD`, token 64-hex en mémoire
- ✅ Middleware `requireAuth` protège toutes les routes sauf `/api/health` et `/api/auth/login`
- ✅ Startup guard : refus démarrage si `AUTH_PASSWORD` manquant
- ✅ Frontend : `LoginPage`, token en `localStorage`, logout dans Settings, 401 → redirect

</details>

<details>
<summary><b>PR #58 — Quick wins</b></summary>

- ✅ `formatExpansionLabel` supprimé — fusionné dans `formatExpansion`
- ✅ BGGSearch harmonisé FR — `onKeyPress` → `onKeyDown`
- ✅ Debounce resize 150ms dans `usePlayersPage` et `useGamesPage`

</details>

<details>
<summary><b>PR #59 — BGG catalog, doublons, pseudo joueur</b></summary>

- ✅ Index local BGG : table `bgg_catalog`, script `npm run import-bgg-catalog`, UI Settings
- ✅ Détection doublons jeux : check `bgg_id`, 409 backend + `DuplicateGameError`
- ✅ Pseudo joueur unique : colonne `pseudo TEXT UNIQUE`, Zod + 409, miroir auto

</details>

<details>
<summary><b>PR #60-63 — Bump dépendances</b></summary>

- ✅ `typescript-eslint` → `^8.57.2`, `globals` 16→17, `dotenv` 16→17, `@types/node` 24→25
- ✅ `zod` 3→4, `express` 4→5 (PR #61)
- ✅ `vite` 7→8, Rollup → Rolldown (PR #62)
- ✅ `recharts` 2→3, `lucide-react` 0.577→1.x (PR #63)

</details>

<details>
<summary><b>Sprint 0 — Refactoring architecture complète (avril 2026)</b></summary>

Voir Phase 1 ci-dessus pour le détail complet.

</details>

<details>
<summary><b>Refactoring feature-based + renommage sessions→plays (avril 2026)</b></summary>

- ✅ Migration DB 013 : `game_sessions` → `game_plays`, `session_players` → `play_players`
- ✅ Backend : `SessionRepository/Service/Route` → `PlayRepository/Service/Route`, endpoint `/api/v1/plays`
- ✅ Types : `GameSession` → `GamePlay`, `CreateSessionPayload` → `CreatePlayPayload`
- ✅ Architecture feature-based : `src/features/<nom>/` — isolation inter-features
- ✅ Suppression `src/components/`, `src/views/`, `src/hooks/`, `src/services/api/`

</details>

</details>

---

## 🐛 Bugs — Livrés

<details>
<summary>Voir le détail</summary>

- ✅ **`BGGGameDetails.characters` non initialisé** — `parseGeekdoItem` retourne `characters: []`
- ✅ **`has_expansion` non calculé à l'import BGG** — `handleBGGSearch` calcule `(bggGame.expansions?.length || 0) > 0`
- ✅ **`BGGGame`/`BGGGameDetails` dupliquées** — unifié dans `shared/types/index.d.ts`
- ✅ **`ApiService.getImportLog()` type inexact** — supprimé, fusionné dans `getBggCatalogStatus()`
- ✅ **Mode coopératif — Score masqué** — "Competitive Scoring" conditionné par `sessionType === 'competitive'`
- ✅ **Dégrisage bouton création session** — `canSubmit()` gère correctement chaque mode
- ✅ **Score à 0 par défaut (compétitif)** — `playerScores[playerId] || 0` forcé à la soumission
- ✅ **`canSubmit` modes campaign/hybrid** — hybrid exige gagnant OU teamSuccess OU teamScore > 0
- ✅ **Routes export/import protégées** — `GET/POST /api/v1/data/export|import|reset` sous `requireRole('admin')`
- ✅ **Suppression jeux** — handler frontend + SQL `DELETE /api/games/:id`
- ✅ **`supports_hybrid` non persisté** — ajouté aux SQL INSERT/UPDATE
- ✅ **Détection doublons jeux** — 409 backend + `DuplicateGameError`, dialog reste ouverte

</details>

---

## 🔒 Sécurité — Livrée (audit mars 2026)

<details>
<summary>Voir le détail</summary>

- ✅ `npm audit` : 0 vulnérabilité frontend + backend
- ✅ Zod sur toutes les routes : middleware `validateBody` sur POST/PUT
- ✅ CORS trim : `.map(o => o.trim())` sur `CORS_ORIGINS`
- ✅ JSON.parse robuste : `parseJSONField` helper dans `DatabaseConnection`
- ✅ BGG parseInt : `isNaN` + bounds check sur `objectid` dans `bggService.ts`
- ✅ HTTPS/HSTS : redirect HTTP→HTTPS + `Strict-Transport-Security` en production
- ✅ JWT signé HttpOnly cookie (PR #57 → Sprint 0)
- ✅ Refresh tokens avec rotation de famille (Sprint 0)
- ✅ `path-to-regexp` 0.1.13 → 8.4.0 — corrige CVE-2024-45296 (ReDoS) via PR #61

</details>

---

## 📊 Performance — Audit Unlighthouse avril 2026

**Scores globaux :** 91 total · 89 Performance · 92 Accessibility · 100 Best Practices · 83 SEO

| Page | Perf | A11y | BP | SEO |
|------|------|------|-----|-----|
| / (dashboard) | 88 | 92 | 100 | 83 |
| /games | 89 | 91 | 100 | 83 |
| /players | 89 | 93 | 100 | 83 |
| /plays/new | 93 | 93 | 100 | 82 |
| /settings | 95 | 93 | 100 | 82 |
| /stats | **80** | **87** | 100 | 83 |

| Priorité | Catégorie | Problème | Solution |
|----------|-----------|----------|----------|
| ⭐⭐ | SEO | Meta description absente | `<meta name="description">` dans `index.html` |
| ⭐⭐ | Performance | `/stats` perf 80 — recharts lourd | Lazy load charts, optimiser requêtes stats |
| ⭐⭐ | Accessibility | `/stats` a11y 87 — charts sans aria | `aria-label` sur graphiques recharts |
| ⭐ | Performance | Google Fonts render-blocking (~780ms) | `font-display: swap` ou self-hosting |
| ⭐ | Performance | Pas de cache headers assets | Fix niveau serveur/Nginx |
| ⭐ | Performance | Images BGG non optimisées (~32 KiB) | Télécharger à l'import + re-encoder WebP avec `sharp` |

---

## 🔧 Historique Infrastructure

| PR | Date | Résumé | Détail |
|---|---|---|---|
| #43 | Mars 2026 | Fix suppression jeux, supports_hybrid, DeletePlayerDialog, types | [changelog/pr-43-fix-popups-delete.md](changelog/pr-43-fix-popups-delete.md) |
| #44 | Mars 2026 | Mise à jour stack : Node 24, Vite 7.3, Vitest 4, TS 5.9 | [changelog/pr-44-stack-update.md](changelog/pr-44-stack-update.md) |
| #45 | Mars 2026 | Suppression @github/spark + 15 packages morts | [changelog/pr-45-remove-spark.md](changelog/pr-45-remove-spark.md) |
| #46 | Mars 2026 | Réorganisation ROADMAP + répertoire changelog/ + .gitattributes LF | [changelog/pr-46-roadmap-reorganization.md](changelog/pr-46-roadmap-reorganization.md) |
| #57 | Mars 2026 | Authentification Bearer token statique | — |
| #58 | Mars 2026 | Quick wins : formatExpansion merge, BGGSearch FR, debounce, onKeyDown | — |

📋 Mises à jour techniques planifiées : [changelog/planned-updates.md](changelog/planned-updates.md)

*Dernière mise à jour : Avril 2026*

---

## 📚 Références Projets

> Sources d'**inspiration technique** uniquement — évaluer chaque pattern avant de l'importer. **À supprimer à terme** quand les features correspondantes sont livrées ou définitivement abandonnées.

<details>
<summary>Voir le détail</summary>

### 🎮 boardGameScore (`C:/git/boardGameScore`)
- **Mapping BGG ID → slug UltraBoardGames** : Citadels (478→'citadels'), Dark Souls (197831→'dark-souls'), Zombicide, Arkham Horror…
- **Supprimer quand** : service UltraBoardGames livré ou abandonné

### 🧪 board-game-scorekeep (`C:/git/board-game-scorekeep`)
- **Système campagne complet** à étudier pour Phase 5 → [détail](changelog/sprint5-campaign-mode.md)
- **Cache BGG intelligent** à étudier pour Phase 2 (cache backend)
- **Supprimer quand** : mode campagne livré ET cache BGG backend implémenté

</details>
