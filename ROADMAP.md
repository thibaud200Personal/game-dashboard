# 🗺️ Roadmap du Projet Board Game Dashboard

Ce document présente l'état d'avancement et les prochaines étapes pour l'application Board Game Dashboard. La roadmap est organisée pour séparer clairement ce qui est **terminé** de ce qui **reste à faire**.

**📈 Statut Global** : Le projet **dépasse largement** les objectifs de la roadmap v1 avec **85% des fonctionnalités atteintes** et une architecture plus robuste. **Infrastructure tests solide** (31/31 ✅) prête pour évolution vers 50+ tests.

**🎯 Stratégie Smart** : Exploiter au maximum le code existant des projets boardGameScore et board-game-scorekeep plutôt que de repartir de zéro.

**🧪 Focus Tests** : Suite à l'analyse comparative avec board-game-scorekeep (52/52 tests), priorité donnée à l'évolution de l'infrastructure tests pour atteindre les standards de production (objectif 50+ tests).

---

## 🐛 Bugs Connus & Polish

### Page Jeux
- **✅ CORRIGÉ Suppression de jeux non fonctionnelle** — PR #43 mars 2026 : handler frontend + SQL `DELETE /api/games/:id` opérationnel.
- **✅ CORRIGÉ `supports_hybrid` non persisté** — PR #43 mars 2026 : champ ajouté aux SQL INSERT/UPDATE dans `DatabaseManager.ts` + interfaces backend mises à jour.
- **✅ CORRIGÉ Popup de suppression joueur** — PR #43 mars 2026 : `DeletePlayerDialog` refactorisé avec `AlertDialog` + pattern `trigger` prop, aligné avec `DeleteGameDialog`.
- **✅ CORRIGÉ `NewGamePage.tsx` — interfaces locales dupliquées** — PR #43 mars 2026 : imports depuis `@/types`, 0 interface locale.
- **🌐 BGGSearch — texte UI mixte FR/EN** — Les messages et placeholders de `BGGSearch.tsx` mélangent français et anglais. Harmoniser dans une seule langue.

### BGG API — Évolutions futures
- **👤 `BGGGameDetails.characters` non initialisé** — L'interface `BGGGameDetails` (backend) déclare `characters: BGGCharacter[]` mais `parseGeekdoItem` ne le peuple pas (champ absent du retour = `undefined` en runtime). Lors de l'implémentation des personnages BGG, initialiser à `[]` par défaut dans le return de `parseGeekdoItem`, puis alimenter depuis les données BGG réelles.
- **🔄 `has_expansion`/`has_characters` non recalculés à l'import BGG** — Dans `handleAddGame` (`App.tsx`), le jeu ajouté via BGG reçoit `expansions: []` / `characters: []` en dur côté client. Les flags `has_expansion` et `has_characters` ne sont donc pas recalculés après création. À corriger lors de l'implémentation de l'import complet : recalculer ces flags à partir des données retournées par l'API après création.
- **🔀 `BGGGame` / `BGGGameDetails` — deux interfaces dupliquées** — `src/services/bggApi.ts` et `backend/bggService.ts` définissent chacun leur propre interface pour la même structure. À unifier dans `src/types/index.ts` (source de vérité partagée) pour éviter une désynchronisation silencieuse à l'avenir.
- **🧪 Tests BGG backend non couverts** — `backend/bggService.ts` (cache, rate limiting, parsing geekdo) et les routes `/api/bgg/*` dans `server.ts` n'ont aucun test. Les tests existants dans `src/__tests__/services/bggApi.test.ts` échouent car fetch n'est pas mocké avec MSW. À corriger : mocker les appels geekdo.com avec MSW et ajouter des cas de test pour la recherche, les détails, le cache et les erreurs réseau.

---

## ✅ PHASE 1 : FOUNDATION - TERMINÉE (95% COMPLETE)

**Approche UI/UX First** : Contrairement aux projets backend-first qui accumulent une dette UX, nous avons priorisé l'expérience utilisateur dès le début. Cette stratégie évite les problèmes d'intégration UI impossibles à corriger et garantit une architecture cohérente.

### 🏗️ Architecture & Infrastructure TERMINÉE
-   ✅ **Architecture Frontend Complète** : Pattern Container/Presenter avec séparation stricte logique/présentation
-   ✅ **Documentation Centralisée** : Réorganisation complète dans `/src/docs/` avec guides détaillés
-   ✅ **Structure Modulaire** : Organisation cohérente des composants, hooks, views et services
-   ✅ **Backend API RESTful** : Serveur Express avec endpoints CRUD complets
-   ✅ **Architecture Relationnelle** : Migration complète du JSON vers tables relationnelles
-   ✅ **Normalisation BDD** : Tables `players`, `games`, `game_expansions`, `game_characters`, `sessions`, `session_players` avec clés étrangères et index
-   ✅ **Validation Zod** : Schémas complets et middleware intégrés dans tous les contrôleurs
-   ✅ **Optimisations SQL** : Vues `player_statistics` et `game_statistics`, résolution N+1, 37.5% réduction requêtes

### 🎨 Interface Utilisateur TERMINÉE
-   ✅ **Design System Complet** : Tailwind CSS + shadcn/ui avec glassmorphisme
-   ✅ **Navigation Contextuelle** : Système mobile/desktop avec gestion d'état avancée
-   ✅ **Responsive Design** : Adaptation complète mobile/tablet/desktop
-   ✅ **Dashboard Analytics** : Page d'accueil avec métriques générales et navigation intuitive
-   ✅ **Menu Principal et Breadcrumbs** : Navigation contextuelle avec retour intelligent

### 🔧 Fonctionnalités Core TERMINÉES
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
-   ⚠️ **BGG Base de Données** : Stockage partiel des métadonnées étendues
    - ✅ Champs basiques : bgg_rating, weight, age_min, supports_modes
    - ❌ Métadonnées manquantes : thumbnail, playing_time, categories/mechanics (JSON), families
-   ✅ **Analytics Avancé** :
    - Dashboard centralisé avec métriques générales
    - Analytics par jeu : sessions, joueurs uniques, durées, scores
    - Analytics par joueur : performances, comparaisons, classements
    - Infrastructure graphiques (Recharts) prête
-   ✅ **Recherche & Découverte** :
    - Recherche intelligente multi-critères (texte + catégorie + difficulté)
    - Interface BGG intégrée avec import automatique
    - Filtres avancés avec tri dynamique
    - Architecture extensible pour nouveaux filtres

### 🎨 Interface & UX Avancée TERMINÉE
-   ✅ **Design System Moderne** : React 19 + Radix UI + Tailwind CSS
-   ✅ **Architecture TypeScript** : 0 `any`, 0 erreur de compilation — types stricts de bout en bout (PR #42, mars 2026)
-   ✅ **Flux de types** : DB schema → `src/types/index.ts` → backend → frontend, source de vérité unique
-   ✅ **`CreateSessionPayload`** : Nouveau type dédié à la création de session (modes compétitif/coopératif/campagne/hybride)
-   ✅ **Champs optionnels alignés** : `Player.avatar?`, `Player.stats?`, `GameExpansion.year_published?`, `GameCharacter.description?` alignés avec le schéma BDD
-   ✅ **Responsive Design** : Adaptation mobile/desktop optimisée
-   ✅ **Validation Robuste** : Champs obligatoires, feedback immédiat
-   ✅ **Icônes Cohérentes** : @phosphor-icons/react dans toute l'application
-   ✅ **Notifications** : Sonner pour feedback utilisateur

### 🧪 Tests & Qualité — Baseline Solide ✅

**✅ État Actuel :**
-   ✅ **Infrastructure Tests** : Vitest + React Testing Library + MSW configurés
-   ✅ **31/31 Tests Passent** : 100% de réussite avec couverture seuils 80%
-   ✅ **Tests Services** : BGG API service avec mocks MSW fonctionnels
-   ✅ **Tests Hooks** : useGamesPage et autres hooks React validés
-   ✅ **Tests Components** : BottomNavigation, BGGSearch, SimpleDashboard
-   ✅ **Scripts Manuels** : `test-validation.ts` et `test-n1-optimization.ts`
-   ✅ **React Query** : TanStack Query v5 déjà intégré pour le server state

**🎯 Objectifs Évolution (Inspiration board-game-scorekeep 52/52 tests) :**
-   ⚡ **Structure Organisée** : Migration vers `unit/technical/`, `unit/functional/`, `integration/`
-   ⚡ **Tests E2E** : 7 workflows BGG complets (search → select → import → save)
-   ⚡ **Fixtures Réalistes** : Données BGG authentiques (Gloomhaven, Wingspan, Catan)
-   ⚡ **Mocks Sophistiqués** : Builders, matchers custom, support multilingue
-   ⚡ **50+ Tests Target** : Extension coverage pour égaler référence projet

**📊 État Actuel vs Référence :**
- ✅ **Infrastructure Solide** : 31/31 tests ✅ vs 52/52 tests ✅ (board-game-scorekeep)
- ✅ **Framework Moderne** : Vitest + RTL + MSW configurés et fonctionnels
- ⚠️ **Organisation** : Structure plate vs organisation mature (unit/technical/, functional/, integration/)
- ❌ **Tests E2E** : Aucun workflow d'intégration vs 7 tests BGG complets
- ❌ **Fixtures** : Mocks basiques vs données BGG réalistes (Gloomhaven, Catan)

**🎯 Plan d'Évolution Tests (3-4 jours) :**
1. **🏗️ Restructuration** : `unit/technical/`, `unit/functional/`, `integration/`, `fixtures/`
2. **🔄 Tests Intégration E2E** : 7 workflows BGG (search → select → import → save)
3. **📊 Fixtures Réalistes** : Données BGG authentiques (Gloomhaven, Wingspan, Catan)
4. **🎭 Mocks Avancés** : Builders configurables, matchers custom (`toHaveValidGameTemplate`)
5. **📈 Extension Coverage** : 31 → 50+ tests (17 techniques + 28 fonctionnels + 7 intégration)

---

## 🔒 SÉCURITÉ — AUDIT MARS 2026

### ✅ Corrigé (28 mars 2026)
- **npm audit** : 0 vulnérabilité frontend + backend (vitest 4.1.2, path-to-regexp 0.1.13, picomatch, brace-expansion)
- **Zod sur toutes les routes** : middleware `validateBody` appliqué sur POST/PUT players, games, sessions
- **CORS trim** : `.map(o => o.trim())` sur `CORS_ORIGINS` pour éviter mismatch whitespace
- **JSON.parse robuste** : `parseJSONField` helper utilisé partout dans `DatabaseManager`
- **BGG parseInt** : `isNaN` + bounds check sur `objectid` dans `bggService.ts`
- **HTTPS/HSTS** : Redirect HTTP→HTTPS + header `Strict-Transport-Security` en production (reverse proxy + `x-forwarded-proto`)

### ⚠️ Authentification — À faire (PRIORITÉ HAUTE)
- **État** : Aucune route protégée — l'app est exposée sur internet, toute personne connaissant l'URL peut lire/modifier les données
- **Action** : Ajouter une authentification simple (ex: API key en header, ou JWT, ou Basic Auth via reverse proxy)
- **Impact** : Critique pour une exposition publique

### 📦 Dépendances majeures à mettre à jour
- `express` 4 → 5 (breaking changes à valider)
- `zod` 3 → 4 (breaking changes à valider)
- `recharts` 2 → 3 (déjà en roadmap)
- `vite` 7 → 8 (déjà en roadmap)
- `typescript` 5 → 6
- `lucide-react` 0.577 → 1.7

---

## 🎯 PHASE 2 : FINITIONS CRITIQUES - PRIORITÉ IMMÉDIATE (1-2 semaines)

### 🗄️ Finalisation BGG & Base de Données (Impact ⭐⭐)

#### **Migration Schema BGG Étendu** - 2-3 jours
- **État** : API récupère tous les champs, BDD stockage partiel
- **Reste à faire** : Ajouter thumbnail, playing_time, min/max_playtime, categories/mechanics (JSON)
- **Impact** : Persistance complète métadonnées BGG

#### **Formulaire Édition BGG Pré-Import** - 3-4 jours
- **État** : Import direct BGG → BDD, pas d'édition pré-import
- **Référence** : board-game-scorekeep a formulaire d'édition complet
- **Reste à faire** : Interface modification tous champs avant sauvegarde
- **Impact** : Contrôle utilisateur sur données importées

#### **Système Migration Automatique** - 2-3 jours
- **État** : Schema fixe, pas de versioning
- **Reste à faire** : Scripts migration pour ajout champs sans perte données
- **Impact** : Évolutivité schema et déploiements sécurisés

### 📊 Cache BGG Local (Impact ⭐⭐) - 2-3 jours
- **État** : Appels API répétés sans cache
- **Référence** : board-game-scorekeep a cache BGG intelligent
- **Action** : Implémenter cache localStorage + expiration
- **Impact** : Performance et limitation API BGG

### 🔀 Unification Interfaces BGG (Impact ⭐⭐) - 1 jour
- **État** : `BGGGame`/`BGGGameDetails` dupliquées entre frontend et backend
- **Reste à faire** : Source de vérité unique dans `src/types/index.ts`
- **Impact** : Prévention désynchronisation silencieuse

---

## 🎨 PHASE 3 : FINITIONS UX - PRIORITÉ SECONDAIRE (2-3 semaines)

### 🔄 Thème Sombre/Clair - 2-3 jours
- **État** : ✅ Prop `darkMode` correctement propagée dans toute la chaîne (App → StatsPage → PlayerStatsPage/GameStatsPage → views). Détection DOM fragile remplacée par prop-driven. Pages Players et Stats corrigées (mars 2026).
- **Reste** : ThemeProvider (React Context), persistance localStorage, toggle SettingsPage survit au reload
- **Action** : Provider React Context, toggle fonctionnel, persistance utilisateur
- **Impact** : UX personnalisée et accessibilité améliorée

### 📊 Graphiques Temporels - 1 semaine
- **État** : Infrastructure Recharts prête, placeholders "coming soon" en place
- **Action** : Implémentation visualisations évolution scores, tendances jeux, performances temporelles
- **Impact** : Analytics visuels et insights utilisateur puissants

### 🎮 Sélection Personnages en Session - 1-2 jours
- **État** : Détection `has_characters` en place, interface sélection manquante
- **Action** : Interface modale sélection personnages pour sessions
- **Impact** : Fonctionnalité complète pour jeux à personnages

### 🌐 Harmonisation UI/UX Globale - REPORTÉ
- L'harmonisation complète des boutons, couleurs, tailles et cohérence visuelle sur toutes les pages/dialogs est reportée.
- Prochaines étapes : stabilisation technique, audit des usages, puis reprise du design UI/UX en phase dédiée.

---

## 🔄 PHASE 4 : ÉVOLUTIONS AVANCÉES - PRIORITÉ MOYENNE (1-2 mois)

### 🧪 Tests Avancés (Impact ⭐⭐⭐) - 3-4 jours

#### **Restructuration & E2E**
- **État** : 31/31 tests ✅, structure plate
- **Objectif** : Organisation mature (unit/technical/, unit/functional/, integration/) + 7 workflows E2E BGG
- **Référence** : board-game-scorekeep (52/52 tests ✅)
- **Impact** : Qualité code et robustesse application

#### **Tests Unitaires Core Étendus** - 1-2 semaines
- **Scope** : BGGService, DatabaseManager, validation Zod, hooks principaux
- **Objectif** : Couverture 80%+ des fonctions critiques, 31 → 50+ tests
- **Impact** : Prévention régressions et debugging facilité

#### **Tests d'Intégration** - 1 semaine
- **Scope** : Workflow BGG, CRUD complet, navigation
- **Objectif** : Tests end-to-end des fonctionnalités principales
- **Impact** : Validation parcours utilisateur

#### **Tests Performance** - 1-2 jours
- **Objectif** : Benchmarking et optimisation suite de tests
- **Impact** : Qualité et rapidité CI

### 🚀 Enrichissement Données (Impact ⭐⭐⭐)

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

### ⚛️ Backend Scalabilité (Impact ⭐⭐)

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

---

## ✨ PHASE 5 : FONCTIONNALITÉS AVANCÉES - LONG TERME (2-6 mois)

### 📊 Analytics & Intelligence

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

### 🎮 Expérience de Jeu Enrichie

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

### 🏆 Gamification & Social

#### **Profils & Comparaisons** - 2-3 semaines
- **Objectif** : Head-to-head, rivalités, statistiques sociales
- **Impact** : Aspect social et compétitif

#### **Partage & Export** - 1 semaine
- **Objectif** : Génération résumés parties
- **Impact** : Partage social externe

### ⚛️ Qualité & Testing

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

---

## 📋 RESSOURCES DISPONIBLES - NE PAS RÉINVENTER

### 🎮 boardGameScore (Scraping UltraBoardGames)
- **Service complet** : `backend/src/services/externalGameDataService.ts`
- **Mapping fonctionnel** : BGG ID → UltraBoardGames slug déjà fait
- **URLs testées** : Structure HTML existante avec données mockées
- **Jeux supportés** : Citadels, Dark Souls, Zombicide, Arkham Horror, This War of Mine
- **Action** : Copier directement, ne pas refaire

### 🧪 board-game-scorekeep (Tests & BGG Avancé)
- **Tests complets** : 52/52 ✅ avec Jest + React Testing Library
- **BGG schema étendu** : Tous les champs manquants dans votre DB
- **Formulaire BGG** : Édition complète avant import
- **Architecture qualité** : TypeScript strict, validation complète
- **Action** : Porter les tests et composants manquants

### 💡 Plan d'Action Smart
1. **Jour 1-2** : Copier service UltraBoardGames de boardGameScore
2. **Jour 3-4** : Ajouter champs BGG manquants de board-game-scorekeep
3. **Jour 5-8** : Porter infrastructure tests complète
4. **Jour 9-10** : Cache BGG et formulaire pré-import
5. **Semaine 3** : Finitions UX (thème, graphiques)

---

## 🎯 COMPARAISON AVEC LA ROADMAP V1 (board-game-scorekeep)

### ✅ **OBJECTIFS V1 SURPASSÉS (85% atteints ou dépassés)**

#### 🚀 **Fonctionnalités Bien Plus Avancées**
- **Extensions & Characters Management** 🚀 **DÉPASSÉ** - Gestion complète (pas prévu en v1)
- **Advanced Player Statistics** 🚀 **DÉPASSÉ** - Stats détaillées + visualisations
- **Multi-mode Game Support** 🚀 **DÉPASSÉ** - Support coopératif/versus/solo/campaign
- **Database Normalization** 🚀 **DÉPASSÉ** - Schéma relationnel avec foreign keys vs JSON

#### ✅ **Fonctionnalités V1 Complètement Implémentées**
- Backend Express + SQLite ✅
- BGG Integration avancée (recherche, XML parsing, métadonnées étendues) ✅
- CRUD complet (games, players, sessions) ✅
- Responsive design + composants modernes ✅
- Validation robuste (Zod vs validation basique) ✅

#### ⚠️ **Gaps Mineurs vs V1**
- **Theme Toggle** : Infrastructure prête, manque Provider React
- **BGG Persistance** : API récupère tout, BDD stockage partiel (métadonnées étendues)
- **BGG Édition** : Import direct, pas de formulaire pré-import
- **Tests** : V1 avait 52/52 tests, projet actuel à **31/31 ✅** (objectif : 50+)
- **Import/Export** : Fonctionnalité backup à ajouter

### 🎯 **VERDICT GLOBAL**
Le projet actuel **dépasse largement** la vision v1 avec une architecture plus robuste, des fonctionnalités bonus, et une UX moderne. Les gaps restants sont principalement des finitions techniques plutôt que des manques fonctionnels.

---

## 🎯 PROCHAINES ACTIONS — DÉCOUPAGE EN SPRINTS

### Sprint 1 — Complétude BGG (1-2 semaines)
Fermer les lacunes données BGG identifiées depuis le début :
1. **🗄️ Migration schema BGG étendu** : Ajouter thumbnail, playing_time, min/max_playtime, categories/mechanics (JSON) à la DB (2-3 jours) → [détail](changelog/sprint1-bgg-schema-migration.md)
2. **📝 Formulaire pré-import BGG** : Permettre l'édition avant sauvegarde (3-4 jours) → [détail](changelog/sprint1-bgg-preimport-form.md)
3. **📊 Cache BGG local** : localStorage + expiration (2-3 jours) → [détail](changelog/sprint1-bgg-cache.md)
4. **🔀 Unifier BGGGame/BGGGameDetails** : Source de vérité unique dans `src/types/index.ts` (1 jour) → [détail](changelog/sprint1-bgg-interfaces-unification.md)

### Sprint 2 — Tests & Qualité (1-2 semaines)
Atteindre les standards de production :
1. **🧪 Tests BGG backend** : Mocker geekdo.com avec MSW, couvrir bggService.ts + routes `/api/bgg/*` → [détail](changelog/sprint2-bgg-backend-tests.md)
2. **🏗️ Restructuration tests** : Dossiers `unit/technical/`, `unit/functional/`, `integration/`, `fixtures/` → [détail](changelog/sprint2-tests-restructure.md)
3. **📊 Fixtures réalistes** : Données BGG authentiques (Gloomhaven, Wingspan, Catan) → [détail](changelog/sprint2-realistic-fixtures.md)
4. **📈 31 → 50+ tests** : Compléter coverage jusqu'aux standards de board-game-scorekeep → [détail](changelog/sprint2-tests-coverage-50plus.md)

### Sprint 3 — Bug Fix & Polish (2-4 jours)
Items rapides, zero-risk, haute valeur perçue :
1. **🎨 Thème Sombre/Clair** : ThemeProvider React Context + localStorage persistence (2-3 jours) → [détail](changelog/sprint3-theme-toggle.md)
2. **🌐 BGGSearch FR/EN** : Harmoniser les messages dans une seule langue (< 1 jour) → [détail](changelog/sprint3-bgg-search-lang.md)
3. **👤 BGGGameDetails.characters** : Initialiser à `[]` dans `parseGeekdoItem` (< 1 jour) → [détail](changelog/sprint3-bgg-characters-init.md)
4. **🔄 has_expansion/has_characters** : Recalculer les flags après import BGG dans `handleAddGame` (< 1 jour) → [détail](changelog/sprint3-bgg-flags-recalculation.md)

### Sprint 4 — Features UX (2-4 semaines)
Nouvelles fonctionnalités visibles :
1. **📊 Graphiques temporels** : Implémenter visualisations Recharts dans StatsPage (infrastructure prête) → [détail](changelog/sprint4-temporal-charts.md)
2. **🎮 Sélection personnages en session** : Interface modale dans NewGamePage → [détail](changelog/sprint4-character-selection-session.md)
3. **🎮 Service UltraBoardGames** : Copier `externalGameDataService.ts` de boardGameScore → [détail](changelog/sprint4-ultraboardgames-service.md)
4. **💾 Export/Import données** : Implémenter les stubs existants dans `useSettingsPage` → [détail](changelog/sprint4-export-import.md)

### Sprint 5 — Évolutions Long Terme (1-3 mois)
Non bloquant, décidé selon les besoins :
1. Système Migration BDD (knex.js / versioning) → [détail](changelog/sprint5-db-migration-system.md)
2. Mode campagne multi-scénarios → [détail](changelog/sprint5-campaign-mode.md)
3. Système d'achievements / gamification → [détail](changelog/sprint5-achievements.md)
4. Système de recommandations → [détail](changelog/sprint5-recommendations.md)
5. Mode tournoi / brackets → [détail](changelog/sprint5-tournament-mode.md)
6. Tests E2E (Cypress/Playwright) → [détail](changelog/sprint5-e2e-tests.md)
7. PWA basique → [détail](changelog/sprint5-pwa.md)

---

## 🎯 **FONCTIONNALITÉS INSPIRÉES DES PROJETS EXISTANTS**

Les éléments suivants sont des améliorations pertinentes identifiées dans les projets de référence :

#### ✅ **Déjà Supérieur dans ce Projet**
- **Architecture BDD** : Normalisée avec foreign keys vs structure CSV
- **Validation Zod** : Plus robuste que validation basique
- **UI/UX** : shadcn/ui + Tailwind vs interface plus simple
- **React Query** : TanStack Query v5 déjà intégré (server state, cache, sync)

#### 🎯 **À Copier de boardGameScore (Immédiat)**
- **Service UltraBoardGames complet** : Copier `externalGameDataService.ts`
- **Mapping BGG→UltraBoardGames** : Ne pas refaire, c'est déjà fait
- **Structure scraping** : Architecture prête avec URLs testées

#### 🎯 **À Porter de board-game-scorekeep (Priorité haute)**
- **Schema BGG complet** : Tous les champs manquants en DB
- **Tests infrastructure** : 52/52 tests Jest + RTL à adapter
- **Formulaire BGG pré-import** : Édition avant sauvegarde
- **Cache BGG intelligent** : Performance et limitation API

#### 🔮 **Évolutions futures (Priorité moyenne)**
- **Mode campagne multi-scénarios** (support base existant)
- **Export/Import données** (placeholders déjà présents)
- **Système recommandations** basé patterns

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


📋 Mises à jour techniques planifiées : [changelog/planned-updates.md](changelog/planned-updates.md)

*Dernière mise à jour : Mars 2026*

---

## 🚀 CONCLUSION

**Stratégie Smart Validée** : Exploiter le travail existant permet d'avancer 10x plus vite !

- **boardGameScore** → Service UltraBoardGames fonctionnel
- **board-game-scorekeep** → Tests complets + Schema BGG étendu
- **Projet actuel** → Architecture moderne + UI/UX avancée + 31/31 tests ✅

**Résultat** : Un projet qui combine le meilleur des trois approches au lieu de repartir de zéro. C'est exactement pour ça qu'on garde les anciens projets ! 😄
