# 🗺️ Roadmap du Projet Board Game Dashboard

Ce document présente l'état d'avancement et les prochaines étapes pour l'application Board Game Dashboard. La roadmap est organisée pour séparer clairement ce qui est **terminé** de ce qui **reste à faire**.

**📈 Statut Global** : Le projet **dépasse largement** les objectifs de la roadmap v1 avec une architecture plus robuste, des fonctionnalités bonus et une UX moderne. **Infrastructure tests solide** (63/63 ✅). Les gaps restants sont des finitions techniques.

**🎯 Stratégie Smart** : Exploiter au maximum le code existant des projets boardGameScore et board-game-scorekeep plutôt que de repartir de zéro.

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

</details>

---

## 🐛 Bugs Connus & Polish

<details open>
<summary>Voir le détail</summary>

<details>
<summary><b>Page Jeux</b></summary>

- **✅ CORRIGÉ Suppression de jeux non fonctionnelle** — PR #43 mars 2026 : handler frontend + SQL `DELETE /api/games/:id` opérationnel.
- **✅ CORRIGÉ `supports_hybrid` non persisté** — PR #43 mars 2026 : champ ajouté aux SQL INSERT/UPDATE dans `DatabaseManager.ts` + interfaces backend mises à jour.
- **✅ CORRIGÉ Popup de suppression joueur** — PR #43 mars 2026 : `DeletePlayerDialog` refactorisé avec `AlertDialog` + pattern `trigger` prop, aligné avec `DeleteGameDialog`.
- **✅ CORRIGÉ `NewGamePage.tsx` — interfaces locales dupliquées** — PR #43 mars 2026 : imports depuis `@/types`, 0 interface locale.

</details>

<details open>
<summary><b>BGG API — Évolutions futures</b></summary>

- **👤 `BGGGameDetails.characters` non initialisé** — L'interface `BGGGameDetails` (backend) déclare `characters: BGGCharacter[]` mais `parseGeekdoItem` ne le peuple pas (champ absent du retour = `undefined` en runtime). Lors de l'implémentation des personnages BGG, initialiser à `[]` par défaut dans le return de `parseGeekdoItem`, puis alimenter depuis les données BGG réelles.
- **🔄 `has_expansion`/`has_characters` non recalculés à l'import BGG** — Dans `handleAddGame` (`App.tsx`), le jeu ajouté via BGG reçoit `expansions: []` / `characters: []` en dur côté client. Les flags `has_expansion` et `has_characters` ne sont donc pas recalculés après création. À corriger lors de l'implémentation de l'import complet : recalculer ces flags à partir des données retournées par l'API après création.
- **🔀 `BGGGame` / `BGGGameDetails` — deux interfaces dupliquées** — `src/services/bggApi.ts` et `backend/bggService.ts` définissent chacun leur propre interface pour la même structure. À unifier dans `src/types/index.ts` (source de vérité partagée) pour éviter une désynchronisation silencieuse à l'avenir.
- **🧪 Tests BGG backend non couverts** — `backend/bggService.ts` (cache, rate limiting, parsing geekdo) et les routes `/api/bgg/*` dans `server.ts` n'ont aucun test. Les tests existants dans `src/__tests__/services/bggApi.test.ts` échouent car fetch n'est pas mocké avec MSW. À corriger : mocker les appels geekdo.com avec MSW et ajouter des cas de test pour la recherche, les détails, le cache et les erreurs réseau.
- **📅 Filtre par année dans la recherche BGG** — Permettre de restreindre la recherche à une année de publication (ex. "Cascadia 2021"). À étudier : l'API geekdo search (`/api/geekitems?search=...`) ne semble pas exposer de paramètre `yearpublished` côté serveur — le filtrage serait probablement à faire côté client sur les résultats retournés. Faible priorité.
- **🗄️ Index local BGG (siphonage)** — À investiguer : importer le dump CSV BGG dans une table SQLite dédiée `bgg_catalog` (import one-shot, pas de parsing à chaque requête). Flow cible : (1) recherche full-text + filtre année/expansion sur `bgg_catalog` → résultats instantanés, sans rate limit ni doublons multilingues ; (2) clic sur un résultat → `getGameDetails(bgg_id)` sur l'API geekdo pour les métadonnées complètes (image, mécaniques, designers…). Schéma minimal : `bgg_id INTEGER PK, name TEXT, year INTEGER, is_expansion INTEGER, rank INTEGER, rating REAL` + index FTS5 sur `name`. Source : dump CSV mensuel BGG (`boardgames_ranks.csv`, 175 352 lignes, colonnes : id, name, yearpublished, rank, bayesaverage, is_expansion). Script d'import one-shot à prévoir (`npm run import-bgg-catalog`), rafraîchissement mensuel optionnel.
  - **UI `BGGSearch`** : une fois le catalogue local en place, enrichir le dialog de recherche avec un champ année (filtre optionnel) et une case à cocher "inclure les extensions" (exploite `is_expansion` du catalogue — impossible proprement avec l'API geekdo actuelle).

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

### 📦 Dépendances majeures à mettre à jour
- `express` 4 → 5 (breaking changes à valider)
- `zod` 3 → 4 (breaking changes à valider)
- `recharts` 2 → 3 (déjà en roadmap)
- `vite` 7 → 8 (déjà en roadmap)
- `typescript` 5 → 6
- `lucide-react` 0.577 → 1.7

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
-   ✅ **63/63 Tests Passent** : 100% de réussite avec couverture seuils 80%
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

</details>

---

## 🔄 PHASE 4 : ÉVOLUTIONS AVANCÉES - PRIORITÉ MOYENNE (1-2 mois)

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>🧪 Tests Avancés (Impact ⭐⭐⭐) - 3-4 jours</b></summary>

#### **Restructuration & E2E**
- **État** : 63/63 tests ✅, structure plate
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

#### 🎮 **Service UltraBoardGames** - 1-2 jours
- **État** : Service placeholder non fonctionnel
- **Référence** : boardGameScore a le service **COMPLET et FONCTIONNEL**
- **Action** : Copier `backend/src/services/externalGameDataService.ts` avec mapping BGG→UltraBoardGames
- **Avantage** : Mapping déjà fait (Citadels: 478→'citadels', Dark Souls: 197831→'dark-souls', etc.)

#### 🔄 **Service Personnages UltraBoardGames** - 1 semaine
- **État** : Génération temporaire en place, scraping UBG à implémenter
- **Reste à faire** : Scraping HTML UltraBoardGames.com (pas d'API disponible)
- **Impact** : Données authentiques vs génération artificielle
- **Approche** : Scraping direct plus simple qu'une BDD séparée

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

#### **Système de Migration BDD** - 3-4 jours
- **Objectif** : Versioning schéma avec outils dédiés (knex.js)
- **Impact** : Déploiements sécurisés et reproductibles

#### **Pagination API** - 2-3 jours
- **Objectif** : Support grandes datasets sur `/api/games` et `/api/players`
- **Impact** : Évolutivité avec collections importantes

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

#### **Intelligence Artificielle** - 1-2 mois
- **Objectif** : Détection patterns, optimisation groupes, auto-catégorisation jeux
- **Impact** : Personnalisation intelligente
- **Inspiration** : Système IA de board-game-scorekeep

#### **Système de Recommandations** - 2-3 semaines
- **État** : Données historique disponibles, algorithme à implémenter
- **Reste à faire** : ML basique basé sur historique parties, préférences joueurs, catégories
- **Impact** : Découverte personnalisée et engagement utilisateur

</details>

<details>
<summary><b>🎮 Expérience de Jeu Enrichie</b></summary>

#### **Mode Campagne Multi-Scénarios** - 3-4 semaines
- **Objectif** : Gestion multi-sessions liées, progression personnages, scénarios
- **État** : Support base `campaign` existant, interface à développer
- **Impact** : Support jeux narratifs complexes (Gloomhaven, Legacy games)
- **Inspiration** : Système campagne complet de board-game-scorekeep

#### **Mode Tournoi** - 2-3 semaines
- **Objectif** : Organisation compétitions avec brackets
- **Impact** : Nouvelles possibilités de jeu
- **Effort** : Élevé

#### **Gestion Images Avancée** - 1 semaine
- **Objectif** : Upload images sessions, galeries, images HD BGG
- **Impact** : Valeur émotionnelle et partage

#### **Système d'Achievements** - 1 semaine
- **État** : Aucune implémentation existante
- **Reste à faire** : Interface badges, conditions accomplissements, système récompenses
- **Impact** : Gamification et engagement utilisateur

</details>

<details>
<summary><b>🏆 Gamification & Social</b></summary>

#### **Profils & Comparaisons** - 2-3 semaines
- **Objectif** : Head-to-head, rivalités, statistiques sociales
- **Impact** : Aspect social et compétitif

#### **Partage & Export** - 1 semaine
- **Objectif** : Génération résumés parties
- **Impact** : Partage social externe

</details>

<details>
<summary><b>⚛️ Qualité & Testing</b></summary>

#### **Tests End-to-End** - 1-2 semaines
- **Objectif** : Tests automatisés Cypress/Playwright
- **Impact** : Prévention régressions
- **Effort** : Élevé mais critique

#### **Progressive Web App** - 1 semaine
- **Objectif** : Installation et offline basique
- **Impact** : Expérience native mobile

#### ❌ **Non Pertinent pour ce Projet**
- **Multi-utilisateurs** : Application locale par design
- **Internationalisation** : Projet français focalisé
- **PWA complète** : Pas de besoin offline identifié

</details>

</details>

---

## 📋 RÉFÉRENCES PROJETS — NE PAS RÉINVENTER

<details>
<summary>Voir le détail</summary>

<details>
<summary><b>🎮 boardGameScore</b></summary>

- **Service UltraBoardGames complet** : `backend/src/services/externalGameDataService.ts` — copier directement
- **Mapping BGG ID → slug** déjà fait : Citadels (478→'citadels'), Dark Souls (197831→'dark-souls'), Zombicide, Arkham Horror, This War of Mine

</details>

<details>
<summary><b>🧪 board-game-scorekeep</b></summary>

- **Formulaire BGG pré-import** : édition complète avant sauvegarde (pas encore implémenté ici)
- **Cache BGG intelligent** : localStorage + expiration
- **Architecture tests** : 52/52 Jest + RTL (référence pour structuration unit/integration)

</details>

<details>
<summary><b>❌ À ne pas réimplémenter</b></summary>

- Multi-utilisateurs, internationalisation, PWA complète

</details>

</details>

---

## 🎯 PROCHAINES ACTIONS — DÉCOUPAGE EN SPRINTS

<details open>
<summary>Voir le détail</summary>

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
