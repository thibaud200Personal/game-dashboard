# 🗺️ Roadmap du Projet Board Game Dashboard

Ce document présente l'état d'avancement et les prochaines étapes pour l'application Board Game Dashboard. La roadmap est organisée pour séparer clairement ce qui est **terminé** de ce qui **reste à faire**.

**📈 Statut Global** : Le projet **dépasse largement** les objectifs de la roadmap v1 avec une architecture plus robuste, des fonctionnalités bonus et une UX moderne. **Infrastructure tests solide** (163/163 backend ✅, 74/74 frontend ✅ — cible ~126 frontend). Les gaps restants sont des finitions techniques.

**🎯 Stratégie Smart** : Exploiter au maximum le code existant des projets boardGameScore et board-game-scorekeep plutôt que de repartir de zéro.

---

## 🧹 Dette Technique — Active

- **`vitest.config.ts` backend — variables d'env de test** : `server.ts` exécute `createAuthService()` et `getDb()` au niveau module (effets de bord à l'import). Contourné en extrayant `logger` dans `backend/logger.ts` pour éviter que les routes importent `server.ts`. La vraie solution propre : ajouter `env: { AUTH_JWT_SECRET: '...', ADMIN_PASSWORD: '...' }` dans `backend/vitest.config.ts` — ainsi les tests ne dépendent pas de la structure des imports et `server.ts` peut s'initialiser normalement sans `.env` local.

---

## 🧹 Dette Technique — Livrée (mars 2026)

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>PR #55 — Audit sécurité & refacto</b></summary>

- ✅ **Duplicate keys BGGSearch** : clé `${result.id}-${index}`
- ✅ **Migrations SQLite dans transaction** : `runMigrations()` encapsulé dans `db.transaction()`
- ✅ **`eslint.audit.config.js`** : ajouté à `.gitignore`

</details>

<details>
<summary><b>PR #56 — Performance & feedback UI</b></summary>

- ✅ **Toast Sonner** sur `handleAddGame`/`handleUpdateGame` dans `App.tsx`
- ✅ **32 tests unitaires** helpers purs : `src/__tests__/helpers/pureHelpers.test.ts`
- ✅ **`useCallback`** sur `handleAddGame`, `handleUpdateGame`, handlers `usePlayersPage`
- ✅ **`React.memo`** sur `GameCard` et `PlayerCard`
- ✅ **`React.lazy` + `Suspense`** : 9 pages lazy-loadées

</details>

<details>
<summary><b>PR #57 — Authentification</b></summary>

- ✅ **Bearer token statique** : `POST /api/auth/login` valide `AUTH_PASSWORD` (env var), token 64-hex généré en mémoire au démarrage
- ✅ **Middleware `requireAuth`** protège toutes les routes `/api/*` sauf `/api/health` et `/api/auth/login`
- ✅ **Startup guard** : le serveur refuse de démarrer si `AUTH_PASSWORD` manquant (`process.exit(1)`)
- ✅ **Frontend** : `LoginPage`, token en `localStorage`, logout dans Settings, 401 → redirect auto

</details>

<details>
<summary><b>PR #58 — Quick wins</b></summary>

- ✅ **`formatExpansionLabel` supprimé** — fusionné dans `formatExpansion` (`GameExpansion` satisfait déjà le shape)
- ✅ **BGGSearch harmonisé FR** — tous les messages en français, `onKeyPress` → `onKeyDown`
- ✅ **Debounce resize 150ms** dans `usePlayersPage` et `useGamesPage`

</details>

<details>
<summary><b>PR #43 — Bugs page Jeux & Joueurs</b></summary>

- ✅ **Suppression de jeux** : handler frontend + SQL `DELETE /api/games/:id` opérationnel
- ✅ **`supports_hybrid` non persisté** : champ ajouté aux SQL INSERT/UPDATE dans `DatabaseManager.ts`
- ✅ **Popup suppression joueur** : `DeletePlayerDialog` refactorisé avec `AlertDialog` + pattern `trigger` prop
- ✅ **`NewGamePage.tsx` interfaces locales** : imports depuis `@/types`, 0 interface locale

</details>

<details>
<summary><b>PR #59 — BGG catalog, doublons, pseudo joueur</b></summary>

- ✅ **Index local BGG** : table `bgg_catalog`, script `npm run import-bgg-catalog`, `log_import`, UI Settings pour importer le CSV
- ✅ **Détection doublons jeux** : check frontend `bgg_id` déjà en collection, 409 backend + `DuplicateGameError`, dialog reste ouverte avec message
- ✅ **Pseudo joueur unique** : colonne `pseudo TEXT UNIQUE`, migration existants, Zod + 409, `AddPlayerDialog` miroir auto, `PlayersPageView` affiche pseudo sous le nom

</details>

<details>
<summary><b>PR #60 — Bump dépendances low-risk</b></summary>

- ✅ **`typescript-eslint` + `@typescript-eslint/parser`** : `^8.38/8.42` → `^8.57.2` (patch)
- ✅ **`globals`** : 16 → 17 (ESLint config uniquement)
- ✅ **`dotenv`** : 16 → 17 (drop-in, usage inchangé)
- ✅ **`@types/node`** : 24 → 25 (types uniquement)

</details>

<details>
<summary><b>PR #61 — Zod 3→4 + Express 4→5 (backend)</b></summary>

- ✅ **`zod`** : 3 → 4 — `ZodError.errors` → `.issues`, suppression `any` dans `UpdateGameSchema.refine`
- ✅ **`express` + `@types/express`** : 4 → 5 — casts `req.params.id as string`, types idiomatiques `Request['params']`/`Request['query']`
- ✅ **`path-to-regexp`** : 0.1.13 → 8.4.0 (transitif) — corrige CVE-2024-45296 (ReDoS)

</details>

<details>
<summary><b>PR #62 — Vite 7→8</b></summary>

- ✅ **`vite`** : 7 → 8 — aucun changement `vite.config.ts` requis (config minimale)
- ✅ **Rollup → Rolldown** : dépendances transitives remplacées par `@rolldown/binding-*`

</details>

<details>
<summary><b>PR #63 — recharts 2→3 + lucide-react 0.x→1.x</b></summary>

- ✅ **`recharts`** : 2 → 3 — aucun changement de code (usage isolé dans `chart.tsx`, placeholders "coming soon")
- ✅ **`lucide-react`** : 0.577 → 1.x — aucun changement de code (icônes utilisées conservent le même nom)

</details>

<details>
<summary><b>Sprint 0 — Refactoring architecture complète (branche `architecture`, avril 2026)</b></summary>

- ✅ **`shared/types/index.ts`** — source de vérité unique pour tous les types TS, importée par le front et le backend
- ✅ **Migrations SQL numérotées (001–007)** — `backend/database/migrations/`, runner dans `DatabaseConnection.ts`
- ✅ **`DatabaseManager.ts` + `interfaces.ts` supprimés** — remplacés par `DatabaseConnection` + couche Repositories
- ✅ **Architecture en couches backend** : Routes → Services → Repositories → DatabaseConnection (aucun handler inline dans `server.ts`)
- ✅ **`server.ts` réécrit** : `/api/v1`, Helmet, pino, rate limiting, routes séparées par domaine
- ✅ **JWT middleware** : `auth.ts` (JWT signé, HttpOnly cookie), `requireRole.ts` (rôles `admin`/`user`)
- ✅ **Frontend React Query v5** : toutes les pages migrées en hooks zero-prop (`useXxxPage`)
- ✅ **React Router v7** : shell `App.tsx`, `AuthContext`, `Layout`, `useNavigationAdapter`
- ✅ **`api/*` split** : `playerApi.ts`, `gameApi.ts`, `sessionApi.ts`, `statsApi.ts`, `authApi.ts`, `bggApi.ts`, `queryKeys.ts`

</details>

</details>

---

## 🐛 Bugs Connus & À Faire

<details open>
<summary>Voir le détail</summary>

<details open>
<summary><b>BGG API — Évolutions futures</b></summary>

- ✅ **`BGGGameDetails.characters` non initialisé** — `parseGeekdoItem` retourne `characters: []` (Sprint 0). Alimenter depuis des données BGG réelles reste à faire quand une source de personnages sera identifiée.
- ✅ **`has_expansion`/`has_characters` non recalculés à l'import BGG** — `handleBGGSearch` (`useGamesPage.ts`) calcule `has_expansion: (bggGame.expansions?.length || 0) > 0` et `has_characters: false` (correct, BGG ne fournit pas de personnages).
- ✅ **`BGGGame` / `BGGGameDetails` — deux interfaces dupliquées** — Unifié dans `shared/types/index.d.ts`, re-exporté par `src/types/index.ts` et importé par `backend/bggService.ts` (avril 2026).
- ✅ **Tests BGG backend couverts** — `backend/__tests__/unit/services/BGGService.test.ts` (22 tests : cache, parsing, modes de jeu, difficultés, erreurs réseau) + `BGGRepository.test.ts` (13 tests : upsert, search, status). `src/__tests__/services/bggApi.test.ts` réécrit avec MSW sur les routes `/api/v1/bgg/*`. 73/73 backend ✅, 74/74 frontend ✅ (avril 2026).
- ✅ **Couverture backend complète** — 20 fichiers de tests, **163/163 tests** ✅ (avril 2026). Ajouts : StatsRepository, GameService, PlayerService, StatsService, + 7 suites de tests de routes HTTP via supertest (auth, games, players, sessions, stats, data, bgg). `PlayerService` et `routes/players.ts` mis à jour pour lever `duplicate_pseudo` (cohérent avec `duplicate_game`). Plans frontend et CI/Docker prêts, non démarrés.
- **📅 Filtre par année dans la recherche BGG** — Permettre de restreindre la recherche à une année de publication (ex. "Cascadia 2021"). À étudier : l'API geekdo search (`/api/geekitems?search=...`) ne semble pas exposer de paramètre `yearpublished` côté serveur — le filtrage serait probablement à faire côté client sur les résultats retournés. Faible priorité.
- **🗄️ Index local BGG — recherche à brancher** — Infrastructure livrée (PR #59). Reste : brancher `searchGames()` sur `bgg_catalog` (local) au lieu de l'API geekdo — FTS5 à envisager pour 175k entrées.
  - **UI `BGGSearch`** : une fois le catalogue local branché, ajouter un champ année (filtre optionnel) et une case à cocher "inclure les extensions" (exploite `is_expansion` — impossible avec l'API geekdo actuelle).
  - **Couverture Wikidata FR/ES** : ~4 210 / 175 351 jeux ont un BGG ID sur Wikidata (2.4%). 1 760 noms FR et 501 noms ES disponibles après enrichissement. Pour les ~173k restants, pas de source externe identifiée — les noms FR/ES resteront NULL sauf contribution manuelle ou autre source.
  - **✖ Piste fermée — enrichissement Wikidata par nom de jeu** : Testé en avril 2026. Extraction de 110k items Wikidata (board game + card game + tabletop game + war game...) → 25k FR, 19k ES. Matching exact case-insensitive contre `bgg_catalog_language.name_en` : seulement 4 604 matches (2.6%), +376 FR et +119 ES nouveaux — gain marginal et risque de faux positifs élevé. Wikidata couvre bien les blockbusters (~4k jeux notables) mais pas le catalogue long-tail BGG. Piste abandonnée.
- ✅ **`ApiService.getImportLog()` — type de retour inexact** — `getImportLog()` supprimé, fusionné dans `getBggCatalogStatus()` avec le type exact `{ count: number; bgg_catalog_imported_at: string | null }`. Champs fantômes `data_exported_at`/`data_imported_at` retirés de l'UI et du hook (avril 2026).
- **🖼️ Thumbnails BGG non persistés** — `BGGSearch.tsx` enrichit les résultats de recherche avec les thumbnails via `getGameDetails()` (geekdo API) en arrière-plan, mais ces URLs ne sont pas mises en cache. À chaque recherche, jusqu'à 15 appels geekdo sont refaits. Solution : ajouter une colonne `thumbnail_url TEXT` dans `bgg_catalog`, la peupler lors du premier hit `GET /api/v1/bgg/game/:bggId`, et la retourner dans `search()`. **Contrainte** : ne pas stocker dans `bgg_catalog` pour ne pas perdre l'info à un re-import CSV — stocker dans une table séparée `bgg_thumbnails (bgg_id PK, thumbnail_url, fetched_at)` indépendante du cycle d'import.
- **🕒 Colonne `name_updated_at` dans `bgg_catalog_language`** — Ajouter une colonne timestamp pour tracer la dernière mise à jour du `name_en` (nom canonique BGG). Utile pour détecter les cas (rares) où BGG renomme un jeu : si `name_en` change, les versions localisées (`name_fr`, `name_es`) devraient potentiellement être invalidées ou revérifiées. Peut servir d'indicateur pour la recherche (fraîcheur des données). À envisager lors de la migration qui branchera la recherche sur le catalogue local.
- **🔽 Recherche BGG — liste déroulante avec saisie libre** — Remplacer ou compléter le champ de recherche actuel par un composant autocomplete : saisie libre + filtre auto sur les noms (en/fr/es) au keystroke. Bénéficie directement du catalogue local une fois branché. À concevoir lors du sprint "brancher la recherche sur `bgg_catalog`". **Piste** : la sélection devrait transmettre le `bgg_id` plutôt que le nom — évite tous les problèmes de correspondance par nom (homonymes, caractères spéciaux, noms localisés différents). Le nom affiché reste libre, mais l'identifiant technique est le `bgg_id`.

</details>

<details>
<summary><b>Création de session — Mode coopératif / scoring</b></summary>

- ✅ **Mode coopératif : champ Score à masquer** — La section "Competitive Scoring" est déjà conditionnée par `sessionType === 'competitive'` (`NewGameView.tsx` ligne 417). Section coopérative séparée présente depuis Sprint 0.
- ✅ **Dégrisage du bouton de création selon le mode** — `canSubmit()` (`useNewGamePage.ts`) gère correctement chaque mode : coopératif (objectifs ou teamScore), compétitif (gagnant + score), campaign/hybrid (jeu + joueurs valides).
- ✅ **Score à 0 par défaut en mode compétitif** — `playerScores[playerId] || 0` forcé à la soumission dans `handleSubmit` (`useNewGamePage.ts`).
- ✅ **Indentation `.map` dans `NewGameView`** — `return (` et contenu réindentés correctement dans le bloc `.map` des joueurs (avril 2026).
- ✅ **Routes export/import protégées côté backend** — `GET /api/v1/data/export`, `POST /api/v1/data/import`, `POST /api/v1/data/reset` implémentées dans `backend/routes/data.ts`, toutes protégées par `requireRole('admin')`. Stubs frontend connectés dans `useSettingsPage` (avril 2026).
- ✅ **`canSubmit` — modes `campaign`/`hybrid` sans condition** — Hybrid exige désormais un gagnant individuel OU teamSuccess OU teamScore > 0. Campaign garde `return true` (game + joueurs + durée suffisent, pas de scoring spécifique) (avril 2026).

</details>

<details>
<summary><b>Schema BDD — Colonnes stats dénormalisées dans `players`</b></summary>

- **🗄️ `players.games_played/wins/total_score/average_score` — colonnes mortes** : ces 4 colonnes existent dans la table `players` ET sont recalculées dynamiquement dans la vue SQL `player_statistics` (depuis `session_players`). Le backend lit **toujours** via la vue — les colonnes stockées restent à `0` en permanence (aucun trigger, aucune mise à jour applicative).
  - **Option A (recommandée)** : supprimer les 4 colonnes de `players`, utiliser uniquement la vue. Source de vérité unique, 0 risque de désynchronisation. Requiert une migration `ALTER TABLE` + nettoyage du `CreatePlayerSchema` Zod.
  - **Option B** : conserver et synchroniser via trigger SQL à chaque INSERT/UPDATE sur `session_players`. Redondant mais élimine les recalculs à la lecture sur gros volume.
  - **Statut** : non tranché — colonnes conservées pour rétrocompatibilité. À nettoyer lors d'un sprint dédié.

</details>

</details>

---

## 🔒 SÉCURITÉ — AUDIT MARS 2026

### ✅ Corrigé (28 mars 2026)
- **npm audit** : 0 vulnérabilité frontend + backend
- **Zod sur toutes les routes** : middleware `validateBody` appliqué sur POST/PUT players, games, sessions
- **CORS trim** : `.map(o => o.trim())` sur `CORS_ORIGINS` pour éviter mismatch whitespace
- **JSON.parse robuste** : `parseJSONField` helper utilisé partout dans `DatabaseManager`
- **BGG parseInt** : `isNaN` + bounds check sur `objectid` dans `bggService.ts`
- **HTTPS/HSTS** : Redirect HTTP→HTTPS + header `Strict-Transport-Security` en production
- **Authentification Bearer token** : voir PR #57 dans Dette Technique ci-dessus

### 📦 Dépendances majeures — état mars 2026
- ✅ `express` 4 → 5 — PR #61
- ✅ `zod` 3 → 4 — PR #61
- ✅ `recharts` 2 → 3 — PR #63
- ✅ `vite` 7 → 8 — PR #62
- ✅ `lucide-react` 0.577 → 1.x — PR #63
- ⏳ `typescript` 5 → 6 — différé (ts-node, vitest, plugins pas encore compatibles)
- ⏳ `eslint` 9 → 10 — différé (eslint-plugin-react-hooks et sonarjs pas encore compatibles)

---

## ✅ PHASE 1 : FOUNDATION - TERMINÉE

<details>
<summary>Voir le détail</summary>

**Approche UI/UX First** : Contrairement aux projets backend-first qui accumulent une dette UX, nous avons priorisé l'expérience utilisateur dès le début.

<details>
<summary><b>🏗️ Architecture & Infrastructure TERMINÉE</b></summary>

-   ✅ **Architecture Frontend Complète** : Pattern Container/Presenter avec séparation stricte logique/présentation
-   ✅ **Documentation Centralisée** : Réorganisation complète dans `/src/docs/` avec guides détaillés
-   ✅ **Structure Modulaire** : Organisation cohérente des composants, hooks, views et services
-   ✅ **Backend API RESTful** : Serveur Express avec endpoints CRUD complets
-   ✅ **Architecture Relationnelle** : Migration complète du JSON vers tables relationnelles
-   ✅ **Normalisation BDD** : Tables `players`, `games`, `game_expansions`, `game_characters`, `sessions`, `session_players` avec clés étrangères et index
-   ✅ **Validation Zod** : Schémas complets et middleware intégrés dans tous les contrôleurs
-   ✅ **Optimisations SQL** : Vues `player_statistics` et `game_statistics`, résolution N+1, 37.5% réduction requêtes

</details>

<details>
<summary><b>🎨 Interface Utilisateur TERMINÉE</b></summary>

-   ✅ **Design System Complet** : Tailwind CSS + shadcn/ui avec glassmorphisme
-   ✅ **Navigation Contextuelle** : Système mobile/desktop avec gestion d'état avancée
-   ✅ **Responsive Design** : Adaptation complète mobile/tablet/desktop
-   ✅ **Dashboard Analytics** : Page d'accueil avec métriques générales et navigation intuitive
-   ✅ **Menu Principal et Breadcrumbs** : Navigation contextuelle avec retour intelligent

</details>

<details>
<summary><b>🔧 Fonctionnalités Core TERMINÉES</b></summary>

-   ✅ **Gestion Joueurs Complète** : CRUD avec statistiques détaillées, recherche, profils riches, comparaisons
-   ✅ **Gestion Jeux Avancée** : CRUD avec intégration BGG API, métadonnées complètes, filtres intelligents
-   ✅ **Sessions de Jeu Sophistiquées** :
    - Interface création complète avec sélection jeu/joueurs
    - Scoring compétitif/coopératif avec objectifs et métriques
    - Types multiples (competitive/cooperative/campaign/hybrid)
    - Sauvegarde complète avec durée, notes, métadonnées
-   ✅ **Extensions/Personnages** : CRUD complet avec interfaces dédiées, modales modernes, intégration contextuelle
-   ✅ **Intégration BGG Avancée** :
    - API Service complet : thumbnail, playing_time, min/max_playtime, min_age, categories, mechanics
    - Import automatique avec métadonnées étendues (designers, publishers, rating, weight)
    - Détection intelligente modes de jeu basée sur mechanics/categories
    - Persistance BDD complète via bggService.ts + DatabaseManager typé
    - `characters: []` — BGG ne fournit pas de personnages, placeholder correct en place
-   ✅ **BGG Base de Données** : Métadonnées complètes en BDD (PR #55)
    - ✅ Champs basiques : bgg_rating, weight, age_min, supports_modes
    - ✅ Métadonnées étendues : thumbnail, playing_time, min/max_playtime, categories/mechanics (JSON), families
-   ✅ **Analytics Avancé** :
    - Dashboard centralisé avec métriques générales
    - Analytics par jeu : sessions, joueurs uniques, durées, scores
    - Analytics par joueur : performances, comparaisons, classements
    - Infrastructure graphiques (Recharts) prête
-   ✅ **Recherche & Découverte** :
    - Recherche intelligente multi-critères (texte + catégorie + difficulté)
    - Interface BGG intégrée avec import automatique
    - Filtres avancés avec tri dynamique

</details>

<details>
<summary><b>🎨 Interface & UX Avancée TERMINÉE</b></summary>

-   ✅ **Design System Moderne** : React 19 + Radix UI + Tailwind CSS
-   ✅ **Architecture TypeScript** : 0 `any`, 0 erreur de compilation — types stricts de bout en bout (PR #42)
-   ✅ **Flux de types** : DB schema → `src/types/index.ts` → backend → frontend, source de vérité unique
-   ✅ **`CreateSessionPayload`** : Nouveau type dédié à la création de session
-   ✅ **Champs optionnels alignés** : `Player.avatar?`, `GameExpansion.year_published?`, `GameCharacter.description?` alignés BDD
-   ✅ **Icônes Cohérentes** : @phosphor-icons/react dans toute l'application
-   ✅ **Notifications** : Sonner pour feedback utilisateur

</details>

<details>
<summary><b>🧪 Tests & Qualité TERMINÉS</b></summary>

-   ✅ **Infrastructure Tests** : Vitest + React Testing Library + MSW configurés
-   ✅ **163/163 Tests Backend Passent** : 100% de réussite (20 fichiers, repos + services + routes HTTP)
-   ✅ **74/74 Tests Frontend Passent** : coverage seuils 80% — plan ~52 tests supplémentaires à venir
-   ✅ **Tests Services** : BGG API service avec mocks MSW fonctionnels
-   ✅ **Tests Hooks** : useGamesPage et autres hooks React validés
-   ✅ **Tests Components** : BottomNavigation, BGGSearch, SimpleDashboard, helpers purs
-   ✅ **React Query** : TanStack Query v5 intégré pour le server state

</details>

</details>

---

## 🎯 PHASE 2 : FINITIONS CRITIQUES - PRIORITÉ IMMÉDIATE (1-2 semaines)

<details open>
<summary>Voir le détail</summary>

<details open>
<summary><b>🗄️ Finalisation BGG & Base de Données (Impact ⭐⭐)</b></summary>

#### **✅ Migration Schema BGG Étendu** — PR #55 mars 2026
- Colonnes `thumbnail`, `playing_time`, `min_playtime`, `max_playtime`, `categories`, `mechanics`, `families` ajoutées en BDD
- `runMigrations()` étendu pour couvrir toutes ces colonnes automatiquement au démarrage

#### **Formulaire Édition BGG Pré-Import** - 3-4 jours
- **État** : Import direct BGG → BDD, pas d'édition pré-import
- **Référence** : board-game-scorekeep a formulaire d'édition complet
- **Reste à faire** : Interface modification tous champs avant sauvegarde
- **Impact** : Contrôle utilisateur sur données importées

#### **✅ Système Migration Automatique** — PR #55 mars 2026
- `runMigrations()` dans `DatabaseManager.ts` : vérifie et applique les colonnes manquantes à chaque démarrage
- **Dette** : migrations hors transaction SQLite — un crash en milieu de migration laisse la BDD en état partiel. À encapsuler dans `db.transaction(...)` si on passe en prod.

</details>

<details open>
<summary><b>📊 Cache BGG Local (Impact ⭐⭐) - 2-3 jours</b></summary>

- **État** : Appels API répétés sans cache
- **Référence** : board-game-scorekeep a cache BGG intelligent
- **Action** : Implémenter cache localStorage + expiration
- **Impact** : Performance et limitation API BGG

</details>

<details open>
<summary><b>🔀 Unification Interfaces BGG (Impact ⭐⭐) - 1 jour</b></summary>

- **État** : `BGGGame`/`BGGGameDetails` dupliquées entre frontend et backend
- **Reste à faire** : Source de vérité unique dans `src/types/index.ts`
- **Impact** : Prévention désynchronisation silencieuse

</details>

</details>

---

## 🎨 PHASE 3 : FINITIONS UX - PRIORITÉ SECONDAIRE (2-3 semaines)

<details open>
<summary>Voir le détail</summary>

<details open>
<summary><b>🔄 Thème Sombre/Clair - 2-3 jours</b></summary>

- **État** : ✅ Prop `darkMode` correctement propagée dans toute la chaîne (App → StatsPage → PlayerStatsPage/GameStatsPage → views). Détection DOM fragile remplacée par prop-driven. Pages Players et Stats corrigées (mars 2026).
- **Reste** : ThemeProvider (React Context), persistance localStorage, toggle SettingsPage survit au reload
- **Action** : Provider React Context, toggle fonctionnel, persistance utilisateur
- **Impact** : UX personnalisée et accessibilité améliorée

</details>

<details open>
<summary><b>📊 Graphiques Temporels - 1 semaine</b></summary>

- **État** : Infrastructure Recharts prête, placeholders "coming soon" en place
- **Action** : Implémentation visualisations évolution scores, tendances jeux, performances temporelles
- **Impact** : Analytics visuels et insights utilisateur puissants

</details>

<details open>
<summary><b>🎮 Sélection Personnages en Session - 1-2 jours</b></summary>

- **État** : Détection `has_characters` en place, interface sélection manquante
- **Action** : Interface modale sélection personnages pour sessions
- **Impact** : Fonctionnalité complète pour jeux à personnages

</details>

<details>
<summary><b>🌐 Harmonisation UI/UX Globale - REPORTÉ</b></summary>

- L'harmonisation complète des boutons, couleurs, tailles et cohérence visuelle sur toutes les pages/dialogs est reportée.
- Prochaines étapes : stabilisation technique, audit des usages, puis reprise du design UI/UX en phase dédiée.

</details>

<details>
<summary><b>🌍 Localisation des labels — DÉFÉRÉ (lié à Settings → Langue)</b></summary>

**Problème connu (mars 2026)** : Les valeurs stockées en BDD pour les champs enum sont en **anglais** (`Beginner`, `Intermediate`, `Expert`, `competitive`…). Les formulaires de création (AddGameDialog) affichent des labels français mais enregistrent la valeur anglaise — ce qui est correct. Les formulaires de modification (EditGameDialog) affichent les valeurs anglaises brutes de la BDD, d'où une incohérence visuelle.

**Champs concernés :**
- `difficulty` dans EditGameDialog : affiche `Beginner` / `Intermediate` / `Expert` au lieu de Débutant / Intermédiaire / Expert
- Labels des modes de jeu (checkboxes) : impact moindre

**Approche à implémenter :**
- `useSettingsPage` possède déjà un state `language` (stub non fonctionnel)
- Quand l'implémentation i18n sera faite, créer une map centralisée `DIFFICULTY_LABELS`, `GAME_TYPE_LABELS`, etc. consommée par tous les dialogs et vues
- Ne pas patcher chaque dialog en dur — attendre la couche i18n globale

**Dépendance :** Implémentation du réglage Langue dans SettingsPage

</details>

</details>

---

## 🔄 PHASE 4 : ÉVOLUTIONS AVANCÉES - PRIORITÉ MOYENNE (1-2 mois)

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>🧪 Tests Avancés (Impact ⭐⭐⭐) - 3-4 jours</b></summary>

#### **Restructuration & E2E**
- **État** : 163/163 backend ✅, 74/74 frontend ✅ — plans frontend + CI/Docker écrits, non exécutés
- **Objectif** : Organisation mature (unit/technical/, unit/functional/, integration/) + 7 workflows E2E BGG
- **Référence** : board-game-scorekeep (52/52 tests ✅)
- **Impact** : Qualité code et robustesse application

#### **Tests Unitaires Core Étendus** - 1-2 semaines
- **Scope** : BGGService, DatabaseManager, validation Zod, hooks principaux
- **Objectif** : Couverture 80%+ des fonctions critiques, 63 → 80+ tests
- **Impact** : Prévention régressions et debugging facilité

#### **Tests d'Intégration** - 1 semaine
- **Scope** : Workflow BGG, CRUD complet, navigation
- **Objectif** : Tests end-to-end des fonctionnalités principales
- **Impact** : Validation parcours utilisateur

#### **Tests Performance** - 1-2 jours
- **Objectif** : Benchmarking et optimisation suite de tests
- **Impact** : Qualité et rapidité CI

</details>

<details>
<summary><b>🚀 Enrichissement Données (Impact ⭐⭐⭐)</b></summary>

#### 🔄 **Service Personnages UltraBoardGames** - 1 semaine
- **État** : Génération temporaire en place
- **Reste à faire** : Scraping HTML UltraBoardGames.com (pas d'API disponible)
- **Impact** : Données de personnages authentiques (BGG ne les fournit pas)
- **⚠️ Risques** : scraping fragile (casse à chaque redesign du site), légalement ambigu. À aborder uniquement quand les autres fonctionnalités sont stables.

#### **Export/Import Données** - 3-4 jours
- **État** : Placeholders existants dans useSettingsPage, implémentation manquante
- **Reste à faire** : Export JSON/CSV, import avec validation, backup automatique
- **Impact** : Portabilité données et sécurité utilisateur

</details>

<details>
<summary><b>⚛️ Backend Scalabilité (Impact ⭐⭐)</b></summary>

#### **Cache Intelligent BGG** - 1 semaine
- **Objectif** : Cache persistant résultats BGG, sync périodique métadonnées
- **Impact** : Performance optimisée et réduction calls API
- **Inspiration** : Système cache de board-game-scorekeep

#### **Gestion d'Erreurs Globale** - 2-3 jours
- **Objectif** : Error boundaries et toasts cohérents
- **Impact** : UX robuste et debugging facilité

#### **Fonctionnalités Découverte** - 1 semaine
- **État** : Base recherche solide, extensions à ajouter
- **Reste à faire** : Comparaison jeux, wishlist, filtres durée/nb joueurs
- **Impact** : UX de découverte enrichie

</details>

</details>

---

## ✨ PHASE 5 : FONCTIONNALITÉS AVANCÉES - LONG TERME (2-6 mois)

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>📊 Analytics & Intelligence</b></summary>

#### **Tableau de Bord Avancé** - 2-3 semaines
- **Objectif** : Graphiques sophistiqués avec recharts
- **Scope** : Évolution scores, tendances, comparaisons temporelles
- **Impact** : Insights utilisateur puissants


</details>

<details>
<summary><b>🎮 Expérience de Jeu Enrichie</b></summary>

#### **Mode Campagne Multi-Scénarios** - 3-4 semaines
- **Objectif** : Gestion multi-sessions liées, progression personnages, scénarios
- **État** : Support base `campaign` existant, interface à développer
- **Impact** : Support jeux narratifs complexes (Gloomhaven, Legacy games)
- **Inspiration** : Système campagne complet de board-game-scorekeep

#### **Gestion Images Avancée** - 1 semaine
- **Objectif** : Upload images sessions, galeries, images HD BGG
- **Impact** : Valeur émotionnelle et partage

</details>


<details>
<summary><b>⚛️ Qualité & Testing</b></summary>

#### **Tests End-to-End** - 1-2 semaines
- **Objectif** : Tests automatisés Cypress/Playwright
- **Impact** : Prévention régressions
- **Effort** : Élevé mais critique

#### ❌ **Non Pertinent pour ce Projet**
- **Multi-utilisateurs** : pas de gestion de profils, usage personnel/amis
- **PWA / offline** : pas de besoin offline identifié
- **Mode Tournoi** : hors périmètre (usage club/événement)
- **Système d'Achievements** : gamification non prioritaire
- **IA / ML / Recommandations** : volume de données insuffisant pour justifier l'investissement
- **Partage social** : pas de contexte social multi-utilisateurs

> ℹ️ L'internationalisation partielle (labels FR/EN) est déférée — voir section "Localisation des labels" en Phase 3.

</details>

</details>

---

## 📋 RÉFÉRENCES PROJETS

> Ces projets sont des sources d'**inspiration technique**, pas de copier-coller. Évaluer chaque pattern avant de l'importer.

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>🎮 boardGameScore</b></summary>

- **Mapping BGG ID → slug UltraBoardGames** : Citadels (478→'citadels'), Dark Souls (197831→'dark-souls'), Zombicide, Arkham Horror, This War of Mine
- Utile si/quand le scraping UBG est implémenté (Phase 4)

</details>

<details>
<summary><b>🧪 board-game-scorekeep</b></summary>

- **Formulaire BGG pré-import** : pattern d'édition avant sauvegarde (Sprint 1)
- **Architecture tests** : structuration unit/integration (Sprint 0-D)

</details>

</details>

---

## 🎯 PROCHAINES ACTIONS — DÉCOUPAGE EN SPRINTS

> **Principe transverse** : tests écrits avant le code (TDD), types stricts (zéro `any`), migrations BDD numérotées.

<details open>
<summary>Voir le détail</summary>

<details open>
<summary><b>Sprint 0 — Refactoring Architecture (priorité absolue)</b></summary>

Voir le design doc complet : `docs/superpowers/specs/2026-03-31-architecture-redesign.md`

**A — Fondations partagées**
1. Créer `shared/types/index.ts` + configurer path aliases frontend ET backend
2. Supprimer `backend/models/interfaces.ts`
3. Migrations SQL numérotées + runner (remplace `runMigrations()`)
4. Nettoyage BDD : supprimer 4 colonnes mortes `players`, supprimer `game_type`, ajouter `'hybrid'` au CHECK `session_type`

**B — Backend en couches**
1. Éclater `DatabaseManager` → repositories (`PlayerRepository`, `GameRepository`, `SessionRepository`, `StatsRepository`, `BGGRepository`)
2. Créer les services (`SessionService` en premier — le plus complexe, gère les transactions)
3. Éclater `server.ts` → `routes/`
4. JWT signé + rôles admin/user (remplace token statique en mémoire)
5. Cookie HttpOnly pour web (remplace `localStorage`)
6. Rate limiting sur `/auth/login` + Helmet + validation params GET
7. Logging pino (backend) + error handler frontend

**C — Frontend**
1. React Router v7 — migration navigation (inclut analyse cas contextuels mobile)
2. Supprimer état serveur de `App.tsx` (React Query seule source de vérité)
3. Éclater `ApiService.ts` → `services/api/` + `queryKeys.ts`
4. Standardiser tous les hooks sur React Query
5. Supprimer code mort (`SimpleDashboard.tsx`, `utils/testBGG.ts`)

**D — Documentation et qualité**
1. Restructurer tests : `unit/technical/`, `unit/functional/`, `integration/`
2. Écrire tests backend manquants (repositories + services)
3. API versioning `/api/v1/` + OpenAPI/Swagger
4. `CONTRIBUTING.md`, `DEPLOYMENT.md`, `.env.example` ✅ (déjà créés)

</details>

<details open>
<summary><b>Sprint 1 — Complétude BGG (1-2 semaines)</b></summary>

1. ✅ **🗄️ Migration schema BGG étendu** — PR #55 : thumbnail, playing_time, min/max_playtime, categories/mechanics (JSON), families
2. **📝 Formulaire pré-import BGG** : Permettre l'édition avant sauvegarde (3-4 jours) → [détail](changelog/sprint1-bgg-preimport-form.md)
3. **📊 Cache BGG local** : localStorage + expiration (2-3 jours) → [détail](changelog/sprint1-bgg-cache.md)
4. **🔀 Unifier BGGGame/BGGGameDetails** : Source de vérité unique dans `src/types/index.ts` (1 jour) → [détail](changelog/sprint1-bgg-interfaces-unification.md)

</details>

<details open>
<summary><b>Sprint 2 — Tests & Qualité (1-2 semaines)</b></summary>

1. **🧪 Tests BGG backend** : Mocker geekdo.com avec MSW, couvrir bggService.ts + routes `/api/bgg/*` → [détail](changelog/sprint2-bgg-backend-tests.md)
2. **🏗️ Restructuration tests** : Dossiers `unit/technical/`, `unit/functional/`, `integration/`, `fixtures/` → [détail](changelog/sprint2-tests-restructure.md)
3. **📊 Fixtures réalistes** : Données BGG authentiques (Gloomhaven, Wingspan, Catan) → [détail](changelog/sprint2-realistic-fixtures.md)
4. **📈 63 → 80+ tests** : Compléter coverage → [détail](changelog/sprint2-tests-coverage-50plus.md)

</details>

<details>
<summary><b>Sprint 3 — Bug Fix & Polish (2-4 jours)</b></summary>

1. **🎨 Thème Sombre/Clair** : ThemeProvider React Context + localStorage persistence (2-3 jours) → [détail](changelog/sprint3-theme-toggle.md)
2. ✅ **🌐 BGGSearch FR** — PR #58 : tous les messages en français
3. ✅ **👤 BGGGameDetails.characters** — `characters: []` déjà initialisé dans `parseGeekdoItem`
4. **🔄 has_expansion/has_characters** : Recalculer les flags après import BGG complet → [détail](changelog/sprint3-bgg-flags-recalculation.md)

</details>

<details>
<summary><b>Sprint 4 — Features UX (2-4 semaines)</b></summary>

1. **📊 Graphiques temporels** : Implémenter visualisations Recharts dans StatsPage → [détail](changelog/sprint4-temporal-charts.md)
2. **🎮 Sélection personnages en session** : Interface modale dans NewGamePage → [détail](changelog/sprint4-character-selection-session.md)
3. **🎮 Service UltraBoardGames** : Copier `externalGameDataService.ts` de boardGameScore → [détail](changelog/sprint4-ultraboardgames-service.md)
4. **💾 Export/Import données** : Implémenter les stubs existants dans `useSettingsPage` → [détail](changelog/sprint4-export-import.md)

</details>

<details>
<summary><b>Sprint 5 — Évolutions Long Terme (1-3 mois)</b></summary>

1. Système Migration BDD (knex.js / versioning) → [détail](changelog/sprint5-db-migration-system.md)
2. Mode campagne multi-scénarios → [détail](changelog/sprint5-campaign-mode.md)
3. Système d'achievements / gamification → [détail](changelog/sprint5-achievements.md)
4. Système de recommandations → [détail](changelog/sprint5-recommendations.md)
5. Mode tournoi / brackets → [détail](changelog/sprint5-tournament-mode.md)
6. Tests E2E (Cypress/Playwright) → [détail](changelog/sprint5-e2e-tests.md)
7. PWA basique → [détail](changelog/sprint5-pwa.md)

</details>

</details>

---

## 🔧 MAINTENANCE CONTINUE

### 🛡️ Sécurité & Performance
- **Audit Sécurité** : Scan vulnérabilités et dépendances
- **Monitoring Performance** : Métriques temps réponse
- **Sauvegarde Automatique** : Backup incrémental BDD

### 📚 Documentation & DevEx
- **Documentation API** : Swagger/OpenAPI endpoints
- **Guide Contributeur** : Processus PR, standards code
- **Déploiement Automatisé** : CI/CD avec tests

---

## 🔧 Historique Infrastructure Technique

| PR | Date | Résumé | Détail |
|---|---|---|---|
| #43 | Mars 2026 | Fix suppression jeux, supports_hybrid, DeletePlayerDialog, types | [changelog/pr-43-fix-popups-delete.md](changelog/pr-43-fix-popups-delete.md) |
| #44 | Mars 2026 | Mise à jour stack : Node 24, Vite 7.3, Vitest 4, TS 5.9 | [changelog/pr-44-stack-update.md](changelog/pr-44-stack-update.md) |
| #45 | Mars 2026 | Suppression @github/spark + 15 packages morts | [changelog/pr-45-remove-spark.md](changelog/pr-45-remove-spark.md) |
| #46 | Mars 2026 | Réorganisation ROADMAP + répertoire changelog/ + .gitattributes LF | [changelog/pr-46-roadmap-reorganization.md](changelog/pr-46-roadmap-reorganization.md) |
| #57 | Mars 2026 | Authentification Bearer token statique (AUTH_PASSWORD + LoginPage + logout) | — |
| #58 | Mars 2026 | Quick wins : formatExpansion merge, BGGSearch FR, debounce resize, onKeyDown | — |


📋 Mises à jour techniques planifiées : [changelog/planned-updates.md](changelog/planned-updates.md)

*Dernière mise à jour : Mars 2026*

---

## 🚀 CONCLUSION

**Stratégie Smart Validée** : Exploiter le travail existant permet d'avancer 10x plus vite !

- **boardGameScore** → Service UltraBoardGames fonctionnel
- **board-game-scorekeep** → Tests complets + Schema BGG étendu
- **Projet actuel** → Architecture moderne + UI/UX avancée + 31/31 tests ✅

**Résultat** : Un projet qui combine le meilleur des trois approches au lieu de repartir de zéro. C'est exactement pour ça qu'on garde les anciens projets ! 😄
