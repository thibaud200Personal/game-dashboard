# Architecture Redesign — Board Game Dashboard
**Date** : 31 mars 2026
**Statut** : Approuvé — en attente d'implémentation
**Branche** : `architecture`

---

## Contexte et motivation

Le projet a atteint un niveau de maturité fonctionnelle satisfaisant (Phase 1 complète). Avant d'aller plus loin en features, un refactoring architectural s'impose pour :

- Préparer l'exposition internet multi-client (web + Android futur)
- Corriger la dette technique documentée
- Garantir la maintenabilité par un autre développeur
- Renforcer la sécurité
- Poser des bases solides pour les évolutions de Phase 3-5

---

## Périmètre

Ce document couvre le **redesign complet frontend + backend** sans changement de stack (pas de migration vers Next.js/tRPC). Le stack React 19 + TypeScript + Express + SQLite est conservé.

---

## 1. Frontend

### 1.1 Problèmes actuels

| Problème | Impact |
|---|---|
| `App.tsx` gère état global + navigation + shell | Couplage fort, difficile à tester |
| Navigation state-based (`currentView`) | Pas d'URL, pas d'historique, F5 = retour accueil |
| `ApiService.ts` monolithique | Toutes entités dans un seul fichier |
| Hooks incohérents (React Query + useState/useEffect mélangés) | Comportement imprévisible du cache |
| `Player.stats` et `Game.players` dans les types | Champs d'affichage dans les interfaces de données |
| Code mort (`SimpleDashboard.tsx`, `utils/testBGG.ts`) | Confusion pour les nouveaux devs |
| `game_type` absent du type `Game` | Champ BDD non représenté |
| `session_type: 'hybrid'` absent du CHECK BDD | Incohérence TypeScript ↔ BDD |

### 1.2 Navigation — React Router v7

Remplacer `currentView` + `navigationContext` + `handleNavigation` par React Router v7.

**Routes cibles :**
```
/                          → Dashboard
/players                   → PlayersPage
/games                     → GamesPage
/games/:id                 → GameDetailPage
/games/:id/expansions      → GameExpansionsPage
/games/:id/characters      → GameCharactersPage
/sessions/new              → NewGamePage
/stats                     → StatsPage
/stats/players/:id         → PlayerStatsPage
/stats/games/:id           → GameStatsPage
/settings                  → SettingsPage
/login                     → LoginPage (publique)
```

**Navigation contextuelle mobile** : le `navigationContext` actuel (source du retour) est remplacé par `navigate(-1)` pour les cas simples, et par `location.state` pour les cas où le contexte d'origine doit être conservé :
```ts
// Depuis GameStatsPage, retourner à l'onglet d'origine (players ou games)
navigate('/stats/players/42', { state: { from: 'games' } })
// Dans la page stats :
const { state } = useLocation()
const backPath = state?.from === 'games' ? '/games' : '/players'
```

**Responsive** : le layout adaptatif (BottomNavigation mobile, nav desktop) est orthogonal au routeur. `BottomNavigation` utilise `useLocation()` pour l'état actif et `<Link>` pour la navigation. Aucun changement à la logique responsive existante.

### 1.3 State management

React Query devient la **seule** source de vérité pour les données serveur.

```
Avant : App.tsx [players useState] + hook [useQuery players] → doublon
Après : App.tsx [shell pur + QueryClientProvider] + chaque hook [useQuery]
```

`App.tsx` ne contient plus que :
- `QueryClientProvider`
- `<Router>` + `<Routes>`
- Les providers globaux (thème, auth context)

### 1.4 Split ApiService

```
src/services/api/
├── playerApi.ts       → CRUD /players
├── gameApi.ts         → CRUD /games + expansions + characters
├── sessionApi.ts      → GET/POST /sessions
├── statsApi.ts        → GET /stats/*
├── authApi.ts         → POST /auth/login, /auth/logout
├── bggApi.ts          → (déjà séparé, déplacé ici)
└── queryKeys.ts       → constantes React Query centralisées
```

`queryKeys.ts` centralise les clés de cache :
```ts
export const queryKeys = {
  players: { all: ['players'] as const, detail: (id: number) => ['players', id] as const },
  games: { all: ['games'] as const, detail: (id: number) => ['games', id] as const },
  sessions: { all: ['sessions'] as const },
  stats: { players: ['stats', 'players'] as const, games: ['stats', 'games'] as const },
}
```

### 1.5 Nettoyage des types

- Supprimer `stats?: string` de `Player` → `formatPlayerStats(p: Player): string` dans `shared/utils/formatters.ts`
- Supprimer `players?: string` de `Game` → `formatPlayerCount(g: Game): string`
- Supprimer `game_type` de la table `games` (rendu obsolète par les 4 booléens)
- Ajouter `'hybrid'` au `CHECK` BDD de `session_type` dans `game_sessions`
- Supprimer `SimpleDashboard.tsx`, `utils/testBGG.ts`
- Déplacer `utils/testBGG.ts` → `scripts/test-bgg.ts` (hors src/)

### 1.6 Hooks — standardisation React Query

Tout hook accédant à des données serveur utilise `useQuery` / `useMutation`. Plus de `useState` + `useEffect` pour des appels API. Règle : si la donnée vient du backend, elle est dans React Query.

---

## 2. Backend

### 2.1 Problèmes actuels

| Problème | Impact |
|---|---|
| `DatabaseManager.ts` 896 lignes, god class | Non testable, non maintenable |
| `server.ts` 340 lignes, routes inline | Logique métier mélangée au HTTP |
| Pas de couche service | Transactions complexes impossibles à isoler |
| `backend/models/interfaces.ts` duplique `src/types/index.ts` | Divergence silencieuse |
| Auth par token en mémoire | Invalide au redémarrage, pas extensible |
| Pas de versioning API | Breaking changes impossibles à gérer |
| Pas de rate limiting | Brute-force sur `/auth/login` possible |
| Pas de headers sécurité (Helmet) | Classe d'attaques non couverte |
| Migrations ad hoc dans `runMigrations()` | Non versionné, non reproductible |
| 4 colonnes mortes dans `players` | Confusion source de vérité |
| `game_type` dans `games` | Obsolète, doublon des booléens |

### 2.2 Architecture cible en couches

```
HTTP Request
  ↓
[auth middleware]       → vérifie JWT, injecte user context
  ↓
[validation middleware] → Zod schemas (body, params, query)
  ↓
[Route handler]         → parsing HTTP uniquement, délègue au service
  ↓
[Service]               → logique métier, orchestration, transactions
  ↓
[Repository]            → requêtes SQL, une entité par repository
  ↓
[DatabaseConnection]    → connexion SQLite + migrations
  ↓
HTTP Response
  ↓ (en cas d'erreur)
[errorHandler middleware] → mapping erreurs typées → codes HTTP
```

### 2.3 Structure de fichiers cible

```
backend/
├── server.ts                    → Express setup + route registration uniquement
├── routes/
│   ├── players.ts
│   ├── games.ts                 → jeux + extensions + personnages
│   ├── sessions.ts
│   ├── stats.ts
│   ├── bgg.ts
│   └── auth.ts
├── services/
│   ├── PlayerService.ts
│   ├── GameService.ts
│   ├── SessionService.ts        → logique complexe, transactions
│   ├── StatsService.ts
│   └── AuthService.ts
├── repositories/
│   ├── PlayerRepository.ts
│   ├── GameRepository.ts
│   ├── SessionRepository.ts
│   ├── StatsRepository.ts
│   └── BGGRepository.ts
├── database/
│   ├── DatabaseConnection.ts    → connexion + runner de migrations
│   ├── migrations/              → fichiers SQL numérotés
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_pseudo_to_players.sql
│   │   └── ...
│   └── schema.sql               → schéma de référence (documentation)
├── middleware/
│   ├── auth.ts                  → vérification JWT + injection role
│   ├── requireRole.ts           → guard admin vs user
│   └── errorHandler.ts          → mapping erreurs → HTTP
├── validation/
│   ├── schemas.ts               → Zod schemas (inchangé)
│   └── middleware.ts            → validation middleware (inchangé)
└── scripts/
    ├── import-bgg-catalog.ts
    └── init-database.ts
```

### 2.4 Transactions — pattern Repository + Service

Les repositories reçoivent la connexion en injection de dépendance. Les services gèrent les transactions qui couvrent plusieurs repositories :

```ts
// SessionService.ts
createSession(payload: CreateSessionPayload): GameSession {
  return this.db.transaction(() => {
    const session = this.sessionRepo.insertSession(...)
    this.sessionRepo.insertSessionPlayers(session.session_id, payload.players)
    return session
  })()
}
```

Règle : **une transaction ne sort jamais d'un service**. Les repositories ne savent pas qu'ils sont dans une transaction — ils font juste leurs requêtes. C'est le service qui enveloppe.

### 2.5 Migrations — fichiers SQL numérotés

Remplace `runMigrations()` ad hoc. Un runner lit la table `schema_version`, applique les fichiers non encore appliqués dans l'ordre, en transaction :

```sql
-- 001_initial_schema.sql
-- 002_add_pseudo_to_players.sql
-- 003_add_bgg_catalog.sql
-- 004_remove_dead_stats_columns.sql   ← supprimer games_played/wins/total_score/average_score de players
-- 005_remove_game_type.sql            ← supprimer game_type de games
-- 006_add_hybrid_session_type.sql     ← ajouter 'hybrid' au CHECK session_type
```

### 2.6 Versioning API

Toutes les routes deviennent `/api/v1/...`. Un préfixe dans `server.ts` :
```ts
app.use('/api/v1/players', playerRoutes)
app.use('/api/v1/games', gameRoutes)
// ...
```

### 2.7 OpenAPI/Swagger

Annotations JSDoc sur les routes → spec auto-générée servie à `/api/docs`. Zéro maintenance manuelle.

---

## 3. Types partagés — `shared/`

```
game-dashboard/
├── shared/
│   ├── types/
│   │   └── index.ts    → source de vérité unique (Player, Game, GameSession, etc.)
│   └── utils/
│       └── formatters.ts → formatPlayerStats, formatPlayerCount
├── src/                 → frontend : importe depuis ../../shared/types
└── backend/             → backend : importe depuis ../shared/types
```

**Configuration TypeScript :**
```json
// tsconfig.json (root/frontend)
{ "compilerOptions": { "paths": { "@shared/*": ["./shared/*"] } } }

// backend/tsconfig.json
{ "compilerOptions": { "paths": { "@shared/*": ["../shared/*"] } } }
```

`backend/models/interfaces.ts` est **supprimé**.

---

## 4. Sécurité

### 4.1 JWT — remplacement du token statique

```
Avant : token 64-hex en mémoire, invalide au redémarrage
Après : JWT signé avec secret .env, expiration 1h
```

Payload JWT :
```ts
{ sub: 'user', role: 'admin' | 'user', iat: number, exp: number }
```

Token stocké :
- **Web** : cookie `HttpOnly` + `SameSite=Strict` (non accessible en JS → résistant XSS)
- **Android futur** : header `Authorization: Bearer <token>`

### 4.2 Rôles admin/user

Le rôle est configuré par mot de passe : `ADMIN_PASSWORD` et `USER_PASSWORD` dans `.env`.

| Rôle | Accès |
|---|---|
| `user` | Lecture + création sessions, ajout jeux/joueurs |
| `admin` | Tout user + import BGG catalog + actions destructives |

Frontend : le bouton "Importer le catalogue BGG" dans Settings est conditionnel au rôle `admin` lu depuis le JWT décodé.

Backend : middleware `requireRole('admin')` sur les routes sensibles.

### 4.3 Rate limiting

```ts
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })
app.use('/api/v1/auth/login', loginLimiter)
```

Tentatives échouées loguées en niveau `warn` via pino.

### 4.4 Helmet

```ts
import helmet from 'helmet'
app.use(helmet())
```

Headers automatiques : `X-Content-Type-Options`, `X-Frame-Options`, `CSP`, etc.

### 4.5 Masquage erreurs en production

```ts
res.status(500).json({
  error: isDev ? err.message : 'Internal server error',
  stack: isDev ? err.stack : undefined
})
```

### 4.6 Validation params GET

Middleware Zod étendu aux paramètres de route et query strings :
```ts
validateParams(z.object({ id: z.coerce.number().int().positive() }))
validateQuery(z.object({ search: z.string().max(100).optional() }))
```

---

## 5. Logging

### Backend — pino

```ts
import pino from 'pino'
export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })
app.use(pinoHttp({ logger }))
```

Logs JSON structurés sur `stdout`. Docker collecte nativement.

### Frontend — error handler global

```ts
window.onerror = (message, source, line, col, error) => {
  fetch('/api/v1/logs/client', {
    method: 'POST',
    body: JSON.stringify({ level: 'error', message, stack: error?.stack, url: window.location.pathname })
  })
}
window.onunhandledrejection = (event) => { /* idem */ }
```

Route backend `POST /api/v1/logs/client` → logue via pino. Même flux stdout, même outil de consultation.

---

## 6. Tests

### Principe TDD

**Tests écrits avant le code.** Pour chaque feature ou bugfix :
1. Écrire le test qui décrit le comportement attendu
2. Vérifier qu'il échoue (red)
3. Écrire le code minimal pour le faire passer (green)
4. Refactorer (refactor)

### Structure cible

```
src/__tests__/
├── unit/
│   ├── technical/      → fonctions pures, utils, formatters
│   └── functional/     → hooks, composants isolés
├── integration/        → flux complets avec MSW
└── fixtures/           → données de test réalistes (Gloomhaven, Wingspan, Catan)

backend/__tests__/
├── unit/
│   ├── services/       → logique métier isolée (repositories mockés)
│   └── repositories/   → requêtes SQL sur DB de test en mémoire
├── integration/        → routes HTTP complètes (supertest)
└── fixtures/           → données de test partagées
```

### Règles

- Zéro `any` dans les tests
- Fixtures réalistes, pas de données génériques ("test", "foo", 123)
- Chaque repository testé contre une vraie DB SQLite en mémoire (pas de mock DB)
- Chaque service testé avec repositories mockés (injection de dépendance)

---

## 7. Docker

### Maintenant — single container

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /app
COPY shared/ ./shared/
COPY src/ ./src/
COPY backend/ ./backend/
COPY package*.json ./
RUN npm ci && npm run test:run && npm run build

FROM node:24-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
CMD ["node", "backend/dist/server.js"]
```

Le frontend `dist/` est servi par Express en static. Tests en stage 1 — l'image ne se construit pas si un test échoue.

### Futur — deux containers

```yaml
services:
  nginx:
    image: nginx:alpine
    volumes: ["./dist:/usr/share/nginx/html"]
    # proxy /api/* → backend:3001
  backend:
    build: ./backend
    volumes: ["db_data:/app/data"]
volumes:
  db_data:
```

SQLite reste accessible uniquement par le conteneur backend.

---

## 8. Documentation — nouvelle structure

```
docs/
├── architecture/
│   ├── OVERVIEW.md         → vue globale full-stack
│   ├── FRONTEND.md         → architecture frontend détaillée
│   ├── BACKEND.md          → architecture backend détaillée
│   ├── DATABASE.md         → schéma BDD + vues SQL
│   └── DATA_MAPPING.md     → interfaces TS ↔ tables BDD
├── guides/
│   ├── CONTRIBUTING.md     → onboarding nouveau développeur
│   ├── DEVELOPMENT.md      → patterns et conventions
│   └── DEPLOYMENT.md       → Docker, variables d'environnement
├── security/
│   └── SECURITY.md         → modèle de menace, JWT, pratiques
├── decisions/
│   ├── ADR-001-shared-types.md
│   ├── ADR-002-react-router.md
│   ├── ADR-003-repository-pattern.md
│   └── ADR-004-jwt-roles.md
└── superpowers/
    └── specs/
        └── 2026-03-31-architecture-redesign.md  ← ce fichier
```

**Fichiers supprimés :**
- `src/docs/ARCHITECTURE.md` → remplacé par `docs/architecture/FRONTEND.md` + `OVERVIEW.md`
- `src/docs/DEVELOPMENT_GUIDE.md` → remplacé par `docs/guides/DEVELOPMENT.md`
- `src/docs/DATA_MAPPING.md` → déplacé vers `docs/architecture/DATA_MAPPING.md`
- `backend/database/database-structure.md` → déplacé vers `docs/architecture/DATABASE.md`

---

## 9. Principes transverses

| Principe | Règle |
|---|---|
| Types | `strict: true`, zéro `any`, `shared/types` source unique |
| Tests | TDD, tests avant le code, DB SQLite in-memory pour repositories |
| Sécurité | JWT signé, cookie HttpOnly web, rate limiting, Helmet, erreurs masquées prod |
| Migrations | Fichiers SQL numérotés, table `schema_version`, transaction atomique |
| Logging | pino backend + error handler frontend → stdout → Docker |
| Documentation | `CONTRIBUTING.md` obligatoire, guides frontend ET backend, `.env.example` commité |
| Build CI | `npm audit` + tests en stage Docker build, bloque si échec |
| API | Versioning `/api/v1/`, OpenAPI auto-généré |

---

## 10. Plan d'implémentation recommandé

### Sprint A — Fondations (à faire en premier)
1. Créer `shared/types/index.ts` + configurer tsconfig des deux côtés
2. Supprimer `backend/models/interfaces.ts`
3. Migrations SQL numérotées + runner (remplace `runMigrations()`)
4. Nettoyage BDD : supprimer 4 colonnes mortes, `game_type`, ajouter `'hybrid'`

### Sprint B — Backend layering
1. Splitter `DatabaseManager` → repositories
2. Créer les services (en commençant par `SessionService` — le plus complexe)
3. Splitter `server.ts` → modules de routes
4. JWT + rôles admin/user
5. Helmet + rate limiting + validation params GET
6. Logging pino

### Sprint C — Frontend
1. React Router v7 — migration navigation
2. Nettoyage App.tsx (supprimer état serveur)
3. Split ApiService → api/
4. `queryKeys.ts`
5. Standardiser hooks sur React Query
6. Supprimer code mort

### Sprint D — Documentation et qualité
1. Rédiger `docs/` complet
2. Restructurer tests (unit/technical, unit/functional, integration)
3. Écrire tests manquants backend (services, repositories)
4. OpenAPI/Swagger
5. `.env.example`
6. ROADMAP cleanup
