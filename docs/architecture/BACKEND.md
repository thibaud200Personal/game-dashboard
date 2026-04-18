# Backend Architecture

## Overview

The backend is an Express 5 API in TypeScript, organized in strict layers. It is designed as a **first-class API** capable of serving multiple clients (web, Android).

## File Structure

```
backend/
├── server.ts                    → Express setup + route registration
├── routes/                      → HTTP handlers (parsing only)
│   ├── players.ts
│   ├── games.ts
│   ├── plays.ts
│   ├── stats.ts
│   ├── bgg.ts
│   ├── labels.ts
│   ├── data.ts
│   ├── logs.ts
│   └── auth.ts
├── services/                    → business logic + transactions
│   ├── PlayerService.ts
│   ├── GameService.ts
│   ├── PlayService.ts
│   ├── StatsService.ts
│   ├── LabelsService.ts
│   └── AuthService.ts
├── repositories/                → DB access (one file per entity)
│   ├── PlayerRepository.ts
│   ├── GameRepository.ts
│   ├── PlayRepository.ts
│   ├── StatsRepository.ts
│   ├── BGGRepository.ts
│   ├── LabelsRepository.ts
│   └── RefreshTokenRepository.ts
├── database/
│   ├── DatabaseConnection.ts    → SQLite connection + migration runner
│   └── migrations/              → numbered SQL files (001 → 015)
├── middleware/
│   ├── auth.ts                  → JWT verification (cookie + Bearer)
│   ├── requireRole.ts           → admin/user guard
│   └── errorHandler.ts          → error → HTTP mapping
└── validation/
    ├── schemas.ts               → Zod schemas
    └── middleware.ts            → validation middleware
```

## Request Flow

```
HTTP Request
  ↓ [cors, helmet, json parser]
  ↓ [auth middleware]         → verifies JWT, injects { sub, role } into req
  ↓ [requireRole middleware]  → on admin-protected routes
  ↓ [validation middleware]   → Zod: body + params + query
  ↓ [Route handler]           → extracts data, calls the service
  ↓ [Service]                 → business logic, transactions
  ↓ [Repository]              → typed SQL queries
  ↓ [DatabaseConnection]      → SQLite
  ↓ [errorHandler]            → on exception: maps to HTTP code
→ JSON Response
```

## Routes Layer

**Single responsibility**: HTTP parsing. A route contains no business logic.

```ts
// routes/players.ts
router.post('/', validateBody(CreatePlayerSchema), async (req, res) => {
  const player = await playerService.createPlayer(req.body)
  res.status(201).json(player)
})
```

Routes have no knowledge of how data is stored.

## Services Layer

**Responsibility**: business logic + transaction orchestration.

Rules:
- A service can call multiple repositories
- Transactions are confined to the service — never exposed to the route
- Services throw typed errors (`NotFoundError`, `ConflictError`)

```ts
// services/PlayService.ts
createPlay(payload: CreatePlayRequest): GamePlay {
  return this.db.transaction(() => {
    const playId = this.playRepo.insertPlay(payload)
    this.playRepo.insertPlayPlayers(playId, payload.players)
    return this.playRepo.findById(playId)!
  })()
}
```

## Repositories Layer

**Responsibility**: SQL queries for one entity. Each repository receives `DatabaseConnection` as a constructor parameter (dependency injection → testable).

```ts
// repositories/PlayerRepository.ts
export class PlayerRepository {
  constructor(private db: DatabaseConnection) {}

  findAll(): Player[] {
    return this.db.prepare('SELECT * FROM player_statistics').all() as Player[]
  }

  findById(id: number): Player | undefined {
    return this.db.prepare('SELECT * FROM player_statistics WHERE player_id = ?').get(id) as Player
  }
}
```

Repositories have no knowledge of being inside a transaction.

## Typed Errors

```ts
// middleware/errorHandler.ts
export class NotFoundError extends Error { constructor(msg: string) { super(msg); this.name = 'NotFoundError' } }
export class ConflictError extends Error { ... }
export class ValidationError extends Error { ... }
export class ForbiddenError extends Error { ... }

// Automatic mapping:
// NotFoundError   → 404
// ConflictError   → 409
// ValidationError → 400
// ForbiddenError  → 403
// Others          → 500 (message hidden in production)
```

## JWT Authentication

```
POST /api/v1/auth/login
  Body: { password: string }
  → validates against ADMIN_PASSWORD or USER_PASSWORD (.env)
  → generates signed JWT: { sub: 'user', role: 'admin'|'user', exp: now+1h }
  → sets HttpOnly cookie (accessToken, 1h) + refreshToken (7d)
  → web: Set-Cookie httpOnly + SameSite=Strict
  → Android: { token, expiresIn }

POST /api/v1/auth/refresh
  → reads refreshToken from cookie
  → rotation: old token invalidated, new one issued
  → responds with new accessToken

Protected routes:
  → auth.ts middleware verifies JWT (cookie OR Authorization header)
  → injects req.user = { sub, role }

Admin-only routes:
  → requireRole('admin') middleware
  → 403 if role !== 'admin'
```

**Refresh token rotation**: each refresh invalidates the previous token (`refresh_tokens` table). A reused revoked token triggers revocation of the entire family (protection against token theft).

Roles:
| Role | Access |
|---|---|
| `user` | Read + create plays/games/players, data export |
| `admin` | All user access + BGG catalog import + Wikidata enrichment + bulk deletion |

## DB Migrations

Migrations are numbered SQL files applied sequentially at startup.

```
backend/database/migrations/
├── 001_initial_schema.sql
├── 002_add_pseudo_to_players.sql
├── 003_add_bgg_catalog.sql
├── 004_remove_dead_stats_columns.sql
├── 005_remove_game_type.sql
├── 006_add_hybrid_session_type.sql
├── 007_create_views.sql
├── 008_extend_bgg_catalog.sql
├── 009_add_bgg_catalog_langue.sql
├── 010_rename_bgg_catalog_langue.sql
├── 011_create_labels.sql
├── 012_refresh_tokens.sql
├── 013_rename_sessions_to_plays.sql
└── 014_add_enrich_labels.sql
```

Tracking table:
```sql
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

The runner checks `MAX(version)`, applies missing files in an atomic transaction. A crash mid-migration leaves the DB in its previous state.

## Adding an Endpoint — Checklist

1. Add the type in `shared/types/index.ts` if needed
2. Add the Zod schema in `backend/validation/schemas.ts`
3. Add the method in the relevant repository
4. Add the logic in the relevant service
5. Add the route in `backend/routes/`
6. Register the route in `server.ts`
7. Write tests: repository (in-memory DB) + service (mocks) + route (supertest)
8. Update `docs/architecture/DATA_MAPPING.md` if a type changes
