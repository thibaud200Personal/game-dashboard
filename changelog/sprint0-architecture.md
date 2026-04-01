# Sprint 0 — Refactoring Architecture

## Contexte

Avant d'aller plus loin en features, un refactoring architectural complet est nécessaire pour préparer l'exposition internet multi-client, corriger la dette technique, et poser des bases maintenables.

**Design doc complet** : `docs/superpowers/specs/2026-03-31-architecture-redesign.md`

---

## A — Fondations partagées

### `shared/types/` — source de vérité unique
- Créer `shared/types/index.ts`
- Configurer path aliases dans `tsconfig.json` (frontend) et `backend/tsconfig.json`
- Supprimer `backend/models/interfaces.ts`
- `src/types/index.ts` réexporte uniquement depuis `shared/types`

### Migrations SQL numérotées
- Créer `backend/database/migrations/` avec fichiers numérotés (`001_`, `002_`...)
- Créer le runner + table `schema_version`
- Supprimer `runMigrations()` dans `DatabaseManager`

### Nettoyage BDD
- Supprimer les 4 colonnes mortes de `players` (`games_played`, `wins`, `total_score`, `average_score`)
- Supprimer `game_type` de la table `games` (obsolète, remplacé par 4 booléens)
- Ajouter `'hybrid'` au `CHECK` de `session_type` dans `game_sessions`

---

## B — Backend en couches

### Éclater `DatabaseManager` (896 lignes → repositories)
- `PlayerRepository.ts`
- `GameRepository.ts` (jeux + extensions + personnages)
- `SessionRepository.ts` (sessions + session_players)
- `StatsRepository.ts` (vues SQL)
- `BGGRepository.ts` (bgg_catalog + log_import)
- `DatabaseConnection.ts` (connexion + migrations uniquement)

### Couche Services
- `PlayerService.ts`
- `GameService.ts`
- `SessionService.ts` — orchestre les transactions (`game_sessions` + `session_players`)
- `StatsService.ts`
- `AuthService.ts` — génération/validation JWT

### Éclater `server.ts` → `routes/`
- `routes/players.ts`, `routes/games.ts`, `routes/sessions.ts`
- `routes/stats.ts`, `routes/bgg.ts`, `routes/auth.ts`

### Sécurité
- JWT signé (remplace token 64-hex en mémoire) — résistant aux redémarrages Docker
- Cookie `HttpOnly; SameSite=Strict` pour web (remplace `localStorage`)
- Rate limiting sur `/auth/login` (5 tentatives / 15 min)
- Rôles admin/user (import BGG catalog protégé)
- Helmet (headers HTTP sécurité)
- Validation Zod étendue aux params de route et query strings
- Erreurs masquées en production

### Logging
- `pino` + `pino-http` — logs JSON structurés sur stdout
- Error handler frontend → `POST /api/v1/logs/client`

### API versioning
- Toutes les routes → `/api/v1/...`
- OpenAPI/Swagger auto-généré sur `/api/docs`

---

## C — Frontend

### React Router v7
- Remplacer `currentView` + `navigationContext` + `handleNavigation`
- Chaque page = une URL (F5, deep links, historique navigateur)
- Navigation contextuelle mobile : `navigate(-1)` + `location.state`
- `BottomNavigation` : `useLocation()` pour état actif, `<Link>` pour navigation

### App.tsx — shell pur
- Supprimer `players`, `games`, `stats` de l'état App.tsx
- React Query = seule source de vérité pour les données serveur
- App.tsx = `QueryClientProvider` + `<BrowserRouter>` + `<Routes>` + providers

### Split ApiService
- `src/services/api/playerApi.ts`, `gameApi.ts`, `sessionApi.ts`
- `src/services/api/statsApi.ts`, `authApi.ts`, `bggApi.ts`
- `src/services/api/queryKeys.ts` — clés React Query centralisées

### Nettoyage
- Supprimer `SimpleDashboard.tsx`, `utils/testBGG.ts`
- Standardiser tous les hooks sur React Query (plus de useState + useEffect pour API)

---

## D — Documentation et qualité

- Restructurer tests : `unit/technical/`, `unit/functional/`, `integration/`, `fixtures/`
- Écrire tests backend manquants (repositories + services)
- `CONTRIBUTING.md` ✅, `DEPLOYMENT.md` ✅, `.env.example` ✅, ADRs ✅
- Docs architecture réorganisées dans `docs/` ✅
