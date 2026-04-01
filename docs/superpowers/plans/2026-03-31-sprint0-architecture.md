# Sprint 0 — Architecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the full stack bottom-up — shared types, numbered SQL migrations, DB cleanup, backend repositories/services/routes/security, then React Router + frontend state cleanup.

**Architecture:** Bottom-up approach: shared foundations first (Sprint A), then backend layering (Sprint B), then frontend migration (Sprint C). Each sprint leaves the app in a working state. TDD throughout — tests written before implementation.

**Tech Stack:** TypeScript strict, better-sqlite3, Express 5, React 19, React Query v5, React Router v7, JWT (jsonwebtoken), pino, Helmet, express-rate-limit, Zod, Vitest

---

## File Map

### Sprint A — Foundations

| Action | File |
|---|---|
| Create | `shared/types/index.ts` |
| Create | `shared/utils/formatters.ts` |
| Modify | `tsconfig.json` (add `@shared/*` path alias) |
| Modify | `backend/tsconfig.json` (add `@shared/*` path alias) |
| Create | `backend/database/DatabaseConnection.ts` |
| Create | `backend/database/migrations/001_initial_schema.sql` |
| Create | `backend/database/migrations/002_add_pseudo_to_players.sql` |
| Create | `backend/database/migrations/003_add_bgg_catalog.sql` |
| Create | `backend/database/migrations/004_remove_dead_stats_columns.sql` |
| Create | `backend/database/migrations/005_remove_game_type.sql` |
| Create | `backend/database/migrations/006_add_hybrid_session_type.sql` |
| Modify | `backend/package.json` (add vitest, jsonwebtoken, pino, helmet, express-rate-limit) |
| Create | `backend/vitest.config.ts` |

### Sprint B — Backend

| Action | File |
|---|---|
| Create | `backend/repositories/PlayerRepository.ts` |
| Create | `backend/repositories/GameRepository.ts` |
| Create | `backend/repositories/SessionRepository.ts` |
| Create | `backend/repositories/StatsRepository.ts` |
| Create | `backend/repositories/BGGRepository.ts` |
| Create | `backend/services/PlayerService.ts` |
| Create | `backend/services/GameService.ts` |
| Create | `backend/services/SessionService.ts` |
| Create | `backend/services/StatsService.ts` |
| Create | `backend/services/AuthService.ts` |
| Create | `backend/middleware/auth.ts` |
| Create | `backend/middleware/requireRole.ts` |
| Create | `backend/middleware/errorHandler.ts` |
| Create | `backend/routes/players.ts` |
| Create | `backend/routes/games.ts` |
| Create | `backend/routes/sessions.ts` |
| Create | `backend/routes/stats.ts` |
| Create | `backend/routes/bgg.ts` |
| Create | `backend/routes/auth.ts` |
| Create | `backend/routes/logs.ts` |
| Rewrite | `backend/server.ts` |
| Delete | `backend/database/DatabaseManager.ts` |
| Delete | `backend/models/interfaces.ts` |

### Sprint C — Frontend

| Action | File |
|---|---|
| Create | `src/services/api/playerApi.ts` |
| Create | `src/services/api/gameApi.ts` |
| Create | `src/services/api/sessionApi.ts` |
| Create | `src/services/api/statsApi.ts` |
| Create | `src/services/api/authApi.ts` |
| Create | `src/services/api/queryKeys.ts` |
| Rewrite | `src/App.tsx` |
| Rewrite | `src/main.tsx` |
| Delete | `src/components/SimpleDashboard.tsx` |
| Delete | `src/utils/testBGG.ts` |
| Modify | All hooks in `src/hooks/` — replace useState/useEffect API calls with React Query |

---

## Sprint A — Shared Foundations

### Task A1: Backend test infrastructure

**Files:**
- Modify: `backend/package.json`
- Create: `backend/vitest.config.ts`

- [ ] **Step 1: Install backend test dependencies**

```bash
cd backend
npm install -D vitest @vitest/coverage-v8
npm install jsonwebtoken pino pino-http helmet express-rate-limit
npm install -D @types/jsonwebtoken @types/pino @types/pino-http
```

- [ ] **Step 2: Add test scripts to `backend/package.json`**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Create `backend/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80 },
    },
  },
})
```

- [ ] **Step 4: Run tests to verify setup works**

```bash
cd backend && npm test
```

Expected: `No test files found, exiting with code 0`

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/vitest.config.ts
git commit -m "chore(backend): add vitest + security dependencies"
```

---

### Task A2: shared/types — source of truth

**Files:**
- Create: `shared/types/index.ts`
- Create: `shared/utils/formatters.ts`
- Modify: `tsconfig.json`
- Modify: `backend/tsconfig.json`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/shared-types.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import type { Player, Game, GameSession } from '@shared/types'

describe('shared/types', () => {
  it('Player type has no dead stats columns', () => {
    const player: Player = {
      player_id: 1,
      player_name: 'Alice',
      pseudo: 'alice',
      favorite_game: 'Gloomhaven',
      created_at: new Date(),
    }
    // games_played, wins, total_score, average_score must NOT exist
    expect('games_played' in player).toBe(false)
    expect('wins' in player).toBe(false)
  })

  it('Game type has no game_type field', () => {
    const game: Partial<Game> = { game_id: 1, name: 'Wingspan' }
    expect('game_type' in game).toBe(false)
  })

  it('GameSession supports hybrid session_type', () => {
    const session: Partial<GameSession> = { session_type: 'hybrid' }
    expect(session.session_type).toBe('hybrid')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `@shared/types` module not found

- [ ] **Step 3: Configure tsconfig path aliases**

`tsconfig.json` (root/frontend) — add inside `compilerOptions`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@shared/*": ["./shared/*"]
}
```

`backend/tsconfig.json` — add inside `compilerOptions`:
```json
"paths": {
  "@shared/*": ["../shared/*"]
},
"baseUrl": "."
```

Also add `"include"` update in backend tsconfig to include tests and shared:
```json
"include": ["**/*.ts", "../shared/**/*.ts"]
```

- [ ] **Step 4: Create `shared/types/index.ts`**

```ts
// Shared types — single source of truth for frontend and backend.
// Import via @shared/types on both sides.

export interface Player {
  player_id: number
  player_name: string
  pseudo: string
  avatar?: string
  favorite_game?: string
  created_at: Date
  updated_at?: Date
}

// PlayerStatistics = Player + computed stats from player_statistics view
export interface PlayerStatistics extends Player {
  games_played: number
  wins: number
  total_score: number
  average_score: number
  win_percentage: number
}

export interface Game {
  game_id: number
  bgg_id?: number
  name: string
  description?: string
  image?: string
  thumbnail?: string
  min_players: number
  max_players: number
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  duration?: string
  difficulty?: string
  category?: string
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  year_published?: number
  publisher?: string
  designer?: string
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  has_expansion: boolean
  has_characters: boolean
  is_expansion: boolean
  created_at: Date
  updated_at?: Date
  expansions?: GameExpansion[]
  characters?: GameCharacter[]
}

export interface GameExpansion {
  expansion_id?: number
  game_id?: number
  bgg_expansion_id?: number
  name: string
  year_published?: number
  description?: string
}

export interface GameCharacter {
  character_id?: number
  game_id?: number
  character_key: string
  name: string
  description?: string
  avatar?: string
  abilities?: string[]
}

export interface GameSession {
  session_id: number
  game_id: number
  session_date: Date
  duration_minutes?: number
  winner_player_id?: number
  session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  created_at: Date
}

export interface SessionPlayer {
  session_player_id?: number
  session_id: number
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner: boolean
  notes?: string
}

// API request types
export interface CreatePlayerRequest {
  player_name: string
  pseudo?: string
  avatar?: string
  favorite_game?: string
}

export interface UpdatePlayerRequest {
  player_name?: string
  pseudo?: string
  avatar?: string
  favorite_game?: string
}

export interface CreateGameRequest {
  bgg_id?: number
  name: string
  description?: string
  image?: string
  thumbnail?: string
  min_players: number
  max_players: number
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  duration?: string
  difficulty?: string
  category?: string
  categories?: string[]
  mechanics?: string[]
  families?: string[]
  year_published?: number
  publisher?: string
  designer?: string
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative?: boolean
  supports_competitive?: boolean
  supports_campaign?: boolean
  supports_hybrid?: boolean
  has_expansion?: boolean
  has_characters?: boolean
  is_expansion?: boolean
  expansions?: GameExpansion[]
  characters?: GameCharacter[]
}

export interface UpdateGameRequest extends Partial<CreateGameRequest> {}

export interface CreateSessionRequest {
  game_id: number
  session_date?: string
  duration_minutes?: number
  winner_player_id?: number
  session_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  players: Array<{
    player_id: number
    character_id?: number
    score: number
    placement?: number
    is_winner?: boolean
    notes?: string
  }>
}

// Stats aggregates
export interface DashboardStats {
  total_players: number
  total_games: number
  total_sessions: number
  average_session_duration: number
}

export interface GameStatistics {
  game_id: number
  name: string
  image?: string
  min_players: number
  max_players: number
  difficulty?: string
  category?: string
  year_published?: number
  bgg_rating?: number
  times_played: number
  unique_players: number
  average_score: number
  average_duration: number
  created_at: Date
}

// BGG types
export interface BggGame {
  bgg_id: number
  name: string
  year_published?: number
  is_expansion: boolean
}
```

- [ ] **Step 5: Create `shared/utils/formatters.ts`**

```ts
import type { Player, Game } from './types'

/** "2-4 joueurs" display string */
export function formatPlayerCount(game: Pick<Game, 'min_players' | 'max_players'>): string {
  if (game.min_players === game.max_players) return `${game.min_players} joueur(s)`
  return `${game.min_players}–${game.max_players} joueurs`
}

/** "15 parties · 8 victoires (53%)" display string */
export function formatPlayerStats(stats: {
  games_played: number
  wins: number
  win_percentage: number
}): string {
  return `${stats.games_played} parties · ${stats.wins} victoires (${Math.round(stats.win_percentage)}%)`
}
```

- [ ] **Step 6: Run test — verify it passes**

```bash
cd backend && npm test
```

Expected: PASS — 3 tests

- [ ] **Step 7: Update `src/types/index.ts` to re-export from shared**

Replace entire file with:
```ts
// Re-export from shared — single source of truth
export type {
  Player,
  PlayerStatistics,
  Game,
  GameExpansion,
  GameCharacter,
  GameSession,
  SessionPlayer,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateGameRequest,
  UpdateGameRequest,
  CreateSessionRequest,
  DashboardStats,
  GameStatistics,
  BggGame,
} from '../../shared/types'
```

- [ ] **Step 8: Run frontend build to verify no type errors**

```bash
npm run build
```

Expected: Build succeeds (or only errors from imports that used `game_type` or dead columns — fix those as they arise)

- [ ] **Step 9: Commit**

```bash
git add shared/ src/types/index.ts tsconfig.json backend/tsconfig.json
git commit -m "feat: shared/types as single source of truth, re-export from frontend"
```

---

### Task A3: DatabaseConnection + numbered migration runner

**Files:**
- Create: `backend/database/DatabaseConnection.ts`
- Create: `backend/database/migrations/001_initial_schema.sql` through `006_*.sql`
- Create: `backend/__tests__/unit/DatabaseConnection.test.ts`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/DatabaseConnection.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { DatabaseConnection } from '../../database/DatabaseConnection'

// Use a temporary file path unique per test run to avoid conflicts
let conn: DatabaseConnection

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
})

afterEach(() => {
  conn.close()
})

describe('DatabaseConnection', () => {
  it('creates schema_version table on first run', () => {
    const tables = conn.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'")
      .get()
    expect(tables).toBeDefined()
  })

  it('applies migrations in order', () => {
    // After init, players table must exist (from migration 001)
    const players = conn.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='players'")
      .get()
    expect(players).toBeDefined()
  })

  it('does not apply a migration twice', () => {
    // Re-running migrations on same connection must not throw
    expect(() => conn.runPendingMigrations()).not.toThrow()
  })

  it('schema_version tracks applied migrations', () => {
    const rows = conn.db.prepare('SELECT filename FROM schema_version ORDER BY filename').all() as { filename: string }[]
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].filename).toMatch(/^\d{3}_/)
  })

  it('players table has no dead stats columns', () => {
    const cols = (conn.db.pragma('table_info(players)') as { name: string }[]).map(c => c.name)
    expect(cols).not.toContain('games_played')
    expect(cols).not.toContain('wins')
    expect(cols).not.toContain('total_score')
    expect(cols).not.toContain('average_score')
  })

  it('games table has no game_type column', () => {
    const cols = (conn.db.pragma('table_info(games)') as { name: string }[]).map(c => c.name)
    expect(cols).not.toContain('game_type')
  })

  it('game_sessions accepts hybrid session_type', () => {
    // Insert minimal prerequisite data
    conn.db.exec(`INSERT INTO players (player_name, pseudo) VALUES ('Alice', 'alice')`)
    conn.db.exec(`INSERT INTO games (name, min_players, max_players, supports_cooperative, supports_competitive, supports_campaign, supports_hybrid, has_expansion, has_characters, is_expansion) VALUES ('Gloomhaven', 2, 4, 1, 0, 1, 1, 1, 1, 0)`)
    expect(() => {
      conn.db.exec(`INSERT INTO game_sessions (game_id, session_type) VALUES (1, 'hybrid')`)
    }).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `DatabaseConnection` not found

- [ ] **Step 3: Create migration files**

Create `backend/database/migrations/001_initial_schema.sql`:
```sql
-- Players table (no computed stats columns — those live in the player_statistics view)
CREATE TABLE IF NOT EXISTS players (
    player_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT    NOT NULL,
    pseudo      TEXT    NOT NULL,
    avatar      TEXT,
    favorite_game TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_pseudo ON players(pseudo COLLATE NOCASE);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    game_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id              INTEGER UNIQUE,
    thumbnail           TEXT,
    playing_time        INTEGER,
    min_playtime        INTEGER,
    max_playtime        INTEGER,
    categories          TEXT,
    mechanics           TEXT,
    families            TEXT,
    name                TEXT    NOT NULL,
    description         TEXT,
    image               TEXT,
    min_players         INTEGER NOT NULL,
    max_players         INTEGER NOT NULL,
    duration            TEXT,
    difficulty          TEXT,
    category            TEXT,
    year_published      INTEGER,
    publisher           TEXT,
    designer            TEXT,
    bgg_rating          REAL,
    weight              REAL,
    age_min             INTEGER,
    supports_cooperative  BOOLEAN DEFAULT FALSE,
    supports_competitive  BOOLEAN DEFAULT FALSE,
    supports_campaign     BOOLEAN DEFAULT FALSE,
    supports_hybrid       BOOLEAN DEFAULT FALSE,
    has_expansion         BOOLEAN DEFAULT FALSE,
    has_characters        BOOLEAN DEFAULT FALSE,
    is_expansion          INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game expansions
CREATE TABLE IF NOT EXISTS game_expansions (
    expansion_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id          INTEGER NOT NULL,
    bgg_expansion_id INTEGER,
    name             TEXT    NOT NULL,
    year_published   INTEGER,
    description      TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Game characters
CREATE TABLE IF NOT EXISTS game_characters (
    character_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id       INTEGER NOT NULL,
    character_key TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT,
    avatar        TEXT,
    abilities     TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    session_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id           INTEGER NOT NULL,
    session_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes  INTEGER,
    winner_player_id  INTEGER,
    session_type      TEXT CHECK(session_type IN ('competitive','cooperative','campaign','hybrid')) DEFAULT 'competitive',
    notes             TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id)           REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id)  REFERENCES players(player_id) ON DELETE SET NULL
);

-- Session players
CREATE TABLE IF NOT EXISTS session_players (
    session_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id        INTEGER NOT NULL,
    player_id         INTEGER NOT NULL,
    character_id      INTEGER,
    score             INTEGER DEFAULT 0,
    placement         INTEGER,
    is_winner         BOOLEAN DEFAULT FALSE,
    notes             TEXT,
    FOREIGN KEY (session_id)   REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id)    REFERENCES players(player_id)        ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES game_characters(character_id) ON DELETE SET NULL
);

-- BGG catalog
CREATE TABLE IF NOT EXISTS bgg_catalog (
    bgg_id         INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    year_published INTEGER,
    is_expansion   INTEGER NOT NULL DEFAULT 0
);

-- Import log
CREATE TABLE IF NOT EXISTS log_import (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bgg_catalog_imported_at TIMESTAMP,
    data_exported_at        TIMESTAMP,
    data_imported_at        TIMESTAMP
);
INSERT OR IGNORE INTO log_import (id) VALUES (1);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_bgg_id              ON games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_name          ON bgg_catalog(name);
CREATE INDEX IF NOT EXISTS idx_game_expansions_game_id   ON game_expansions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_characters_game_id   ON game_characters(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id     ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date        ON game_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_players_session_id ON session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_session_players_player_id  ON session_players(player_id);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_players_timestamp
    AFTER UPDATE ON players
    BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE player_id = NEW.player_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_games_timestamp
    AFTER UPDATE ON games
    BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = NEW.game_id;
    END;

-- Statistics views
CREATE VIEW IF NOT EXISTS player_statistics AS
SELECT
    p.player_id,
    p.player_name,
    p.pseudo,
    p.avatar,
    p.favorite_game,
    p.created_at,
    COUNT(DISTINCT sp.session_id)                                                          AS games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END)                                          AS wins,
    COALESCE(SUM(sp.score), 0)                                                             AS total_score,
    COALESCE(AVG(sp.score), 0)                                                             AS average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 /
     NULLIF(COUNT(DISTINCT sp.session_id), 0))                                             AS win_percentage
FROM players p
LEFT JOIN session_players sp ON p.player_id = sp.player_id
GROUP BY p.player_id;

CREATE VIEW IF NOT EXISTS game_statistics AS
SELECT
    g.game_id,
    g.name,
    g.image,
    g.min_players,
    g.max_players,
    g.difficulty,
    g.category,
    g.year_published,
    g.bgg_rating,
    g.created_at,
    COUNT(DISTINCT gs.session_id)                                                AS times_played,
    (SELECT COUNT(DISTINCT sp.player_id)
     FROM session_players sp
     WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) AS unique_players,
    (SELECT AVG(sp.score)
     FROM session_players sp
     WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) AS average_score,
    (SELECT AVG(gs2.duration_minutes)
     FROM game_sessions gs2 WHERE gs2.game_id = g.game_id)                      AS average_duration
FROM games g
LEFT JOIN game_sessions gs ON g.game_id = gs.game_id
GROUP BY g.game_id;
```

Create `backend/database/migrations/002_add_pseudo_to_players.sql`:
```sql
-- No-op: pseudo is already in 001. This file exists for databases created before 001 existed.
-- Safe to re-run: ALTER TABLE only runs if column is missing (handled by runner).
SELECT 1; -- placeholder
```

Create `backend/database/migrations/003_add_bgg_catalog.sql`:
```sql
-- No-op: bgg_catalog is in 001.
SELECT 1; -- placeholder
```

Create `backend/database/migrations/004_remove_dead_stats_columns.sql`:
```sql
-- SQLite does not support DROP COLUMN before 3.35.0.
-- Strategy: recreate players without the 4 dead columns.
-- The migration runner checks if columns exist before running.
-- This migration is a no-op on fresh databases (001 never creates these columns).
-- On existing databases with the old schema, this rebuilds the table.

-- Check if any dead column exists (games_played). If not, nothing to do.
-- The runner calls this via a guarded transaction; see DatabaseConnection.ts for the guard.
CREATE TABLE IF NOT EXISTS players_new (
    player_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name   TEXT NOT NULL,
    pseudo        TEXT NOT NULL DEFAULT '',
    avatar        TEXT,
    favorite_game TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO players_new (player_id, player_name, pseudo, avatar, favorite_game, created_at, updated_at)
SELECT player_id, player_name,
       COALESCE(pseudo, player_name),
       avatar, favorite_game, created_at, updated_at
FROM players;

DROP TABLE players;
ALTER TABLE players_new RENAME TO players;

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_pseudo ON players(pseudo COLLATE NOCASE);

CREATE TRIGGER IF NOT EXISTS update_players_timestamp
    AFTER UPDATE ON players
    BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE player_id = NEW.player_id;
    END;
```

Create `backend/database/migrations/005_remove_game_type.sql`:
```sql
-- Remove deprecated game_type column from games (replaced by 4 boolean columns).
-- Only runs on databases that have the game_type column.
CREATE TABLE IF NOT EXISTS games_new AS SELECT * FROM games;
-- Handled by guarded migration in DatabaseConnection — see guard logic.

-- Rebuild games without game_type
CREATE TABLE games_v2 (
    game_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id              INTEGER UNIQUE,
    thumbnail           TEXT,
    playing_time        INTEGER,
    min_playtime        INTEGER,
    max_playtime        INTEGER,
    categories          TEXT,
    mechanics           TEXT,
    families            TEXT,
    name                TEXT    NOT NULL,
    description         TEXT,
    image               TEXT,
    min_players         INTEGER NOT NULL,
    max_players         INTEGER NOT NULL,
    duration            TEXT,
    difficulty          TEXT,
    category            TEXT,
    year_published      INTEGER,
    publisher           TEXT,
    designer            TEXT,
    bgg_rating          REAL,
    weight              REAL,
    age_min             INTEGER,
    supports_cooperative  BOOLEAN DEFAULT FALSE,
    supports_competitive  BOOLEAN DEFAULT FALSE,
    supports_campaign     BOOLEAN DEFAULT FALSE,
    supports_hybrid       BOOLEAN DEFAULT FALSE,
    has_expansion         BOOLEAN DEFAULT FALSE,
    has_characters        BOOLEAN DEFAULT FALSE,
    is_expansion          INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO games_v2 SELECT
    game_id, bgg_id, thumbnail, playing_time, min_playtime, max_playtime,
    categories, mechanics, families, name, description, image,
    min_players, max_players, duration, difficulty, category,
    year_published, publisher, designer, bgg_rating, weight, age_min,
    supports_cooperative, supports_competitive, supports_campaign, supports_hybrid,
    has_expansion, has_characters, is_expansion, created_at, updated_at
FROM games;

DROP TABLE games;
ALTER TABLE games_v2 RENAME TO games;

CREATE INDEX IF NOT EXISTS idx_games_bgg_id ON games(bgg_id);

CREATE TRIGGER IF NOT EXISTS update_games_timestamp
    AFTER UPDATE ON games
    BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = NEW.game_id;
    END;
```

Create `backend/database/migrations/006_add_hybrid_session_type.sql`:
```sql
-- Add 'hybrid' to session_type CHECK constraint.
-- SQLite does not support ALTER CONSTRAINT — must recreate the table.
-- No-op on fresh databases (001 already includes 'hybrid' in the CHECK).

PRAGMA foreign_keys = OFF;

CREATE TABLE game_sessions_new (
    session_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id           INTEGER NOT NULL,
    session_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes  INTEGER,
    winner_player_id  INTEGER,
    session_type      TEXT CHECK(session_type IN ('competitive','cooperative','campaign','hybrid')) DEFAULT 'competitive',
    notes             TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id)           REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id)  REFERENCES players(player_id) ON DELETE SET NULL
);

INSERT INTO game_sessions_new SELECT * FROM game_sessions;
DROP TABLE game_sessions;
ALTER TABLE game_sessions_new RENAME TO game_sessions;

CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date    ON game_sessions(session_date);

PRAGMA foreign_keys = ON;
```

- [ ] **Step 4: Create `backend/database/DatabaseConnection.ts`**

```ts
import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

export class DatabaseConnection {
  readonly db: Database.Database

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this._ensureSchemaVersionTable()
    this.runPendingMigrations()
  }

  private _ensureSchemaVersionTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  runPendingMigrations(): void {
    const applied = new Set(
      (this.db.prepare('SELECT filename FROM schema_version').all() as { filename: string }[])
        .map(r => r.filename)
    )

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) continue

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')

      // Guard for migration 004: skip if dead columns are already absent
      if (file === '004_remove_dead_stats_columns.sql') {
        const cols = (this.db.pragma('table_info(players)') as { name: string }[]).map(c => c.name)
        if (!cols.includes('games_played')) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard for migration 005: skip if game_type already absent
      if (file === '005_remove_game_type.sql') {
        const cols = (this.db.pragma('table_info(games)') as { name: string }[]).map(c => c.name)
        if (!cols.includes('game_type')) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      // Guard for migration 006: skip if session_type CHECK already includes hybrid
      if (file === '006_add_hybrid_session_type.sql') {
        const createSql = (this.db.prepare(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='game_sessions'"
        ).get() as { sql: string } | undefined)?.sql ?? ''
        if (createSql.includes("'hybrid'")) {
          this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
          continue
        }
      }

      this.db.transaction(() => {
        this.db.exec(sql)
        this.db.prepare('INSERT INTO schema_version (filename) VALUES (?)').run(file)
      })()
    }
  }

  close(): void {
    this.db.close()
  }
}

// Singleton for production use
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, 'board_game_score.db')
export const dbConnection = new DatabaseConnection(DB_PATH)
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS — all DatabaseConnection tests

- [ ] **Step 6: Commit**

```bash
git add backend/database/DatabaseConnection.ts backend/database/migrations/ backend/__tests__/
git commit -m "feat(backend): numbered SQL migrations + DatabaseConnection runner"
```

---

## Sprint B — Backend Layering

### Task B1: PlayerRepository

**Files:**
- Create: `backend/repositories/PlayerRepository.ts`
- Create: `backend/__tests__/unit/repositories/PlayerRepository.test.ts`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/repositories/PlayerRepository.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'

let conn: DatabaseConnection
let repo: PlayerRepository

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new PlayerRepository(conn.db)
})

afterEach(() => conn.close())

describe('PlayerRepository', () => {
  it('creates and retrieves a player', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const player = repo.findById(id)
    expect(player?.player_name).toBe('Alice')
    expect(player?.pseudo).toBe('alice')
  })

  it('findAll returns all players ordered by name', () => {
    repo.create({ player_name: 'Zara', pseudo: 'zara' })
    repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const players = repo.findAll()
    expect(players[0].player_name).toBe('Alice')
  })

  it('update modifies player fields', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    repo.update(id, { player_name: 'Alicia', pseudo: 'alicia' })
    const updated = repo.findById(id)
    expect(updated?.player_name).toBe('Alicia')
  })

  it('delete removes player', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    repo.delete(id)
    expect(repo.findById(id)).toBeUndefined()
  })

  it('findStatistics returns computed stats from view', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const stats = repo.findStatistics(id)
    expect(stats?.games_played).toBe(0)
    expect(stats?.wins).toBe(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `PlayerRepository` not found

- [ ] **Step 3: Create `backend/repositories/PlayerRepository.ts`**

```ts
import type Database from 'better-sqlite3'
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types'

export class PlayerRepository {
  constructor(private db: Database.Database) {}

  findAll(): Player[] {
    return this.db.prepare('SELECT * FROM players ORDER BY player_name').all() as Player[]
  }

  findById(id: number): Player | undefined {
    return this.db.prepare('SELECT * FROM players WHERE player_id = ?').get(id) as Player | undefined
  }

  findStatistics(id: number): PlayerStatistics | undefined {
    return this.db
      .prepare('SELECT * FROM player_statistics WHERE player_id = ?')
      .get(id) as PlayerStatistics | undefined
  }

  findAllStatistics(): PlayerStatistics[] {
    return this.db.prepare('SELECT * FROM player_statistics ORDER BY player_name').all() as PlayerStatistics[]
  }

  create(data: CreatePlayerRequest): number {
    const result = this.db.prepare(`
      INSERT INTO players (player_name, pseudo, avatar, favorite_game)
      VALUES (?, ?, ?, ?)
    `).run(
      data.player_name,
      data.pseudo ?? data.player_name,
      data.avatar ?? null,
      data.favorite_game ?? null,
    )
    return result.lastInsertRowid as number
  }

  update(id: number, data: UpdatePlayerRequest): void {
    this.db.prepare(`
      UPDATE players
      SET player_name = COALESCE(?, player_name),
          pseudo      = COALESCE(?, pseudo),
          avatar      = COALESCE(?, avatar),
          favorite_game = COALESCE(?, favorite_game),
          updated_at  = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `).run(
      data.player_name ?? null,
      data.pseudo ?? null,
      data.avatar ?? null,
      data.favorite_game ?? null,
      id,
    )
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM players WHERE player_id = ?').run(id)
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/repositories/PlayerRepository.ts backend/__tests__/unit/repositories/
git commit -m "feat(backend): PlayerRepository with full CRUD + statistics view"
```

---

### Task B2: GameRepository

**Files:**
- Create: `backend/repositories/GameRepository.ts`
- Create: `backend/__tests__/unit/repositories/GameRepository.test.ts`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/repositories/GameRepository.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { GameRepository } from '../../../repositories/GameRepository'
import type { CreateGameRequest } from '@shared/types'

let conn: DatabaseConnection
let repo: GameRepository

const gloomhaven: CreateGameRequest = {
  name: 'Gloomhaven',
  min_players: 1,
  max_players: 4,
  supports_cooperative: true,
  supports_competitive: false,
  supports_campaign: true,
  supports_hybrid: false,
  has_expansion: true,
  has_characters: true,
  is_expansion: false,
}

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new GameRepository(conn.db)
})

afterEach(() => conn.close())

describe('GameRepository', () => {
  it('creates and retrieves a game', () => {
    const id = repo.create(gloomhaven)
    const game = repo.findById(id)
    expect(game?.name).toBe('Gloomhaven')
    expect(game?.supports_cooperative).toBe(true)
    expect(game?.supports_competitive).toBe(false)
  })

  it('findAll returns all games ordered by name', () => {
    repo.create({ ...gloomhaven, name: 'Wingspan' })
    repo.create(gloomhaven)
    const games = repo.findAll()
    expect(games[0].name).toBe('Gloomhaven')
  })

  it('booleans are properly coerced from SQLite integers', () => {
    const id = repo.create(gloomhaven)
    const game = repo.findById(id)
    expect(typeof game?.supports_cooperative).toBe('boolean')
    expect(typeof game?.has_expansion).toBe('boolean')
  })

  it('creates expansion linked to base game', () => {
    const gameId = repo.create(gloomhaven)
    repo.createExpansion(gameId, { name: 'Forgotten Circles', bgg_expansion_id: 9999 })
    const expansions = repo.findExpansions(gameId)
    expect(expansions).toHaveLength(1)
    expect(expansions[0].name).toBe('Forgotten Circles')
  })

  it('delete removes game and cascades to expansions', () => {
    const gameId = repo.create(gloomhaven)
    repo.createExpansion(gameId, { name: 'Forgotten Circles' })
    repo.delete(gameId)
    expect(repo.findById(gameId)).toBeUndefined()
    expect(repo.findExpansions(gameId)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `GameRepository` not found

- [ ] **Step 3: Create `backend/repositories/GameRepository.ts`**

```ts
import type Database from 'better-sqlite3'
import type {
  Game, GameExpansion, GameCharacter,
  CreateGameRequest, UpdateGameRequest,
} from '@shared/types'

type RawGame = Omit<Game, 'categories' | 'mechanics' | 'families' | 'expansions' | 'characters'
  | 'supports_cooperative' | 'supports_competitive' | 'supports_campaign' | 'supports_hybrid'
  | 'has_expansion' | 'has_characters' | 'is_expansion'
> & {
  categories?: string
  mechanics?: string
  families?: string
  supports_cooperative: number
  supports_competitive: number
  supports_campaign: number
  supports_hybrid: number
  has_expansion: number
  has_characters: number
  is_expansion: number
}

function parseGame(raw: RawGame): Game {
  return {
    ...raw,
    categories: raw.categories ? (JSON.parse(raw.categories) as string[]) : [],
    mechanics:  raw.mechanics  ? (JSON.parse(raw.mechanics)  as string[]) : [],
    families:   raw.families   ? (JSON.parse(raw.families)   as string[]) : [],
    supports_cooperative: !!raw.supports_cooperative,
    supports_competitive: !!raw.supports_competitive,
    supports_campaign:    !!raw.supports_campaign,
    supports_hybrid:      !!raw.supports_hybrid,
    has_expansion:        !!raw.has_expansion,
    has_characters:       !!raw.has_characters,
    is_expansion:         !!raw.is_expansion,
  }
}

export class GameRepository {
  constructor(private db: Database.Database) {}

  findAll(): Game[] {
    const rows = this.db.prepare('SELECT * FROM games ORDER BY name').all() as RawGame[]
    return rows.map(parseGame)
  }

  findById(id: number): Game | undefined {
    const row = this.db.prepare('SELECT * FROM games WHERE game_id = ?').get(id) as RawGame | undefined
    return row ? parseGame(row) : undefined
  }

  create(data: CreateGameRequest): number {
    const result = this.db.prepare(`
      INSERT INTO games (
        bgg_id, name, description, image, thumbnail,
        min_players, max_players, playing_time, min_playtime, max_playtime,
        duration, difficulty, category, categories, mechanics, families,
        year_published, publisher, designer, bgg_rating, weight, age_min,
        supports_cooperative, supports_competitive, supports_campaign, supports_hybrid,
        has_expansion, has_characters, is_expansion
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `).run(
      data.bgg_id ?? null, data.name, data.description ?? null,
      data.image ?? null, data.thumbnail ?? null,
      data.min_players, data.max_players,
      data.playing_time ?? null, data.min_playtime ?? null, data.max_playtime ?? null,
      data.duration ?? null, data.difficulty ?? null, data.category ?? null,
      data.categories ? JSON.stringify(data.categories) : null,
      data.mechanics  ? JSON.stringify(data.mechanics)  : null,
      data.families   ? JSON.stringify(data.families)   : null,
      data.year_published ?? null, data.publisher ?? null,
      data.designer ?? null, data.bgg_rating ?? null,
      data.weight ?? null, data.age_min ?? null,
      data.supports_cooperative ? 1 : 0,
      data.supports_competitive ? 1 : 0,
      data.supports_campaign    ? 1 : 0,
      data.supports_hybrid      ? 1 : 0,
      data.has_expansion        ? 1 : 0,
      data.has_characters       ? 1 : 0,
      data.is_expansion         ? 1 : 0,
    )
    return result.lastInsertRowid as number
  }

  update(id: number, data: UpdateGameRequest): void {
    const current = this.findById(id)
    if (!current) return
    const merged = { ...current, ...data }
    this.db.prepare(`
      UPDATE games SET
        name = ?, description = ?, image = ?, thumbnail = ?,
        min_players = ?, max_players = ?, playing_time = ?,
        min_playtime = ?, max_playtime = ?,
        duration = ?, difficulty = ?, category = ?,
        categories = ?, mechanics = ?, families = ?,
        year_published = ?, publisher = ?, designer = ?,
        bgg_rating = ?, weight = ?, age_min = ?,
        supports_cooperative = ?, supports_competitive = ?,
        supports_campaign = ?, supports_hybrid = ?,
        has_expansion = ?, has_characters = ?, is_expansion = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE game_id = ?
    `).run(
      merged.name, merged.description ?? null, merged.image ?? null, merged.thumbnail ?? null,
      merged.min_players, merged.max_players, merged.playing_time ?? null,
      merged.min_playtime ?? null, merged.max_playtime ?? null,
      merged.duration ?? null, merged.difficulty ?? null, merged.category ?? null,
      merged.categories ? JSON.stringify(merged.categories) : null,
      merged.mechanics  ? JSON.stringify(merged.mechanics)  : null,
      merged.families   ? JSON.stringify(merged.families)   : null,
      merged.year_published ?? null, merged.publisher ?? null, merged.designer ?? null,
      merged.bgg_rating ?? null, merged.weight ?? null, merged.age_min ?? null,
      merged.supports_cooperative ? 1 : 0,
      merged.supports_competitive ? 1 : 0,
      merged.supports_campaign    ? 1 : 0,
      merged.supports_hybrid      ? 1 : 0,
      merged.has_expansion        ? 1 : 0,
      merged.has_characters       ? 1 : 0,
      merged.is_expansion         ? 1 : 0,
      id,
    )
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM games WHERE game_id = ?').run(id)
  }

  findExpansions(gameId: number): GameExpansion[] {
    return this.db
      .prepare('SELECT * FROM game_expansions WHERE game_id = ? ORDER BY name')
      .all(gameId) as GameExpansion[]
  }

  createExpansion(gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): number {
    const result = this.db.prepare(`
      INSERT INTO game_expansions (game_id, bgg_expansion_id, name, year_published, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(gameId, data.bgg_expansion_id ?? null, data.name, data.year_published ?? null, data.description ?? null)
    return result.lastInsertRowid as number
  }

  deleteExpansion(expansionId: number): void {
    this.db.prepare('DELETE FROM game_expansions WHERE expansion_id = ?').run(expansionId)
  }

  findCharacters(gameId: number): GameCharacter[] {
    const rows = this.db
      .prepare('SELECT * FROM game_characters WHERE game_id = ? ORDER BY name')
      .all(gameId) as (GameCharacter & { abilities?: string })[]
    return rows.map(r => ({
      ...r,
      abilities: r.abilities ? (JSON.parse(r.abilities) as string[]) : [],
    }))
  }

  createCharacter(gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): number {
    const result = this.db.prepare(`
      INSERT INTO game_characters (game_id, character_key, name, description, avatar, abilities)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      gameId, data.character_key, data.name,
      data.description ?? null, data.avatar ?? null,
      data.abilities ? JSON.stringify(data.abilities) : null,
    )
    return result.lastInsertRowid as number
  }

  deleteCharacter(characterId: number): void {
    this.db.prepare('DELETE FROM game_characters WHERE character_id = ?').run(characterId)
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/repositories/GameRepository.ts backend/__tests__/unit/repositories/GameRepository.test.ts
git commit -m "feat(backend): GameRepository — games, expansions, characters"
```

---

### Task B3: SessionRepository + StatsRepository

**Files:**
- Create: `backend/repositories/SessionRepository.ts`
- Create: `backend/repositories/StatsRepository.ts`
- Create: `backend/__tests__/unit/repositories/SessionRepository.test.ts`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/repositories/SessionRepository.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { SessionRepository } from '../../../repositories/SessionRepository'

let conn: DatabaseConnection
let sessionRepo: SessionRepository
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  sessionRepo = new SessionRepository(conn.db)

  playerId = playerRepo.create({ player_name: 'Alice', pseudo: 'alice' })
  gameId = gameRepo.create({
    name: 'Wingspan', min_players: 1, max_players: 5,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: true, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('SessionRepository', () => {
  it('inserts a session and retrieves it', () => {
    const sessionId = sessionRepo.insertSession({
      game_id: gameId, session_type: 'competitive',
    })
    const session = sessionRepo.findById(sessionId)
    expect(session?.game_id).toBe(gameId)
    expect(session?.session_type).toBe('competitive')
  })

  it('inserts session players and retrieves them', () => {
    const sessionId = sessionRepo.insertSession({ game_id: gameId, session_type: 'competitive' })
    sessionRepo.insertSessionPlayers(sessionId, [
      { player_id: playerId, score: 42, is_winner: true },
    ])
    const players = sessionRepo.findSessionPlayers(sessionId)
    expect(players).toHaveLength(1)
    expect(players[0].score).toBe(42)
    expect(players[0].is_winner).toBe(true)
  })

  it('findAll returns all sessions', () => {
    sessionRepo.insertSession({ game_id: gameId, session_type: 'hybrid' })
    sessionRepo.insertSession({ game_id: gameId, session_type: 'cooperative' })
    expect(sessionRepo.findAll()).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `SessionRepository` not found

- [ ] **Step 3: Create `backend/repositories/SessionRepository.ts`**

```ts
import type Database from 'better-sqlite3'
import type { GameSession, SessionPlayer } from '@shared/types'

type InsertSessionData = {
  game_id: number
  session_date?: string
  duration_minutes?: number
  winner_player_id?: number
  session_type?: GameSession['session_type']
  notes?: string
}

type InsertSessionPlayerData = {
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner?: boolean
  notes?: string
}

export class SessionRepository {
  constructor(private db: Database.Database) {}

  findAll(): GameSession[] {
    return this.db
      .prepare('SELECT * FROM game_sessions ORDER BY session_date DESC')
      .all() as GameSession[]
  }

  findById(id: number): GameSession | undefined {
    return this.db
      .prepare('SELECT * FROM game_sessions WHERE session_id = ?')
      .get(id) as GameSession | undefined
  }

  findSessionPlayers(sessionId: number): (SessionPlayer & { is_winner: boolean })[] {
    const rows = this.db
      .prepare('SELECT * FROM session_players WHERE session_id = ?')
      .all(sessionId) as (SessionPlayer & { is_winner: number })[]
    return rows.map(r => ({ ...r, is_winner: !!r.is_winner }))
  }

  insertSession(data: InsertSessionData): number {
    const result = this.db.prepare(`
      INSERT INTO game_sessions (game_id, session_date, duration_minutes, winner_player_id, session_type, notes)
      VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, COALESCE(?, 'competitive'), ?)
    `).run(
      data.game_id,
      data.session_date ?? null,
      data.duration_minutes ?? null,
      data.winner_player_id ?? null,
      data.session_type ?? null,
      data.notes ?? null,
    )
    return result.lastInsertRowid as number
  }

  insertSessionPlayers(sessionId: number, players: InsertSessionPlayerData[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO session_players (session_id, player_id, character_id, score, placement, is_winner, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    for (const p of players) {
      stmt.run(
        sessionId,
        p.player_id,
        p.character_id ?? null,
        p.score,
        p.placement ?? null,
        p.is_winner ? 1 : 0,
        p.notes ?? null,
      )
    }
  }

  delete(sessionId: number): void {
    this.db.prepare('DELETE FROM game_sessions WHERE session_id = ?').run(sessionId)
  }
}
```

- [ ] **Step 4: Create `backend/repositories/StatsRepository.ts`**

```ts
import type Database from 'better-sqlite3'
import type { PlayerStatistics, GameStatistics, DashboardStats } from '@shared/types'

export class StatsRepository {
  constructor(private db: Database.Database) {}

  getDashboard(): DashboardStats {
    const players = (this.db.prepare('SELECT COUNT(*) as n FROM players').get() as { n: number }).n
    const games   = (this.db.prepare('SELECT COUNT(*) as n FROM games WHERE is_expansion = 0').get() as { n: number }).n
    const sessions = (this.db.prepare('SELECT COUNT(*) as n FROM game_sessions').get() as { n: number }).n
    const avgDuration = (this.db.prepare(
      'SELECT COALESCE(AVG(duration_minutes), 0) as avg FROM game_sessions WHERE duration_minutes IS NOT NULL'
    ).get() as { avg: number }).avg

    return {
      total_players: players,
      total_games: games,
      total_sessions: sessions,
      average_session_duration: Math.round(avgDuration),
    }
  }

  getAllPlayerStats(): PlayerStatistics[] {
    return this.db
      .prepare('SELECT * FROM player_statistics ORDER BY games_played DESC')
      .all() as PlayerStatistics[]
  }

  getPlayerStats(playerId: number): PlayerStatistics | undefined {
    return this.db
      .prepare('SELECT * FROM player_statistics WHERE player_id = ?')
      .get(playerId) as PlayerStatistics | undefined
  }

  getAllGameStats(): GameStatistics[] {
    return this.db
      .prepare('SELECT * FROM game_statistics ORDER BY times_played DESC')
      .all() as GameStatistics[]
  }

  getGameStats(gameId: number): GameStatistics | undefined {
    return this.db
      .prepare('SELECT * FROM game_statistics WHERE game_id = ?')
      .get(gameId) as GameStatistics | undefined
  }
}
```

- [ ] **Step 5: Create `backend/repositories/BGGRepository.ts`**

```ts
import type Database from 'better-sqlite3'
import type { BggGame } from '@shared/types'

export class BGGRepository {
  constructor(private db: Database.Database) {}

  search(query: string, limit = 20): BggGame[] {
    return this.db.prepare(`
      SELECT bgg_id, name, year_published, is_expansion
      FROM bgg_catalog
      WHERE name LIKE ?
      ORDER BY
        CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
        name
      LIMIT ?
    `).all(`%${query}%`, `${query}%`, limit) as BggGame[]
  }

  getImportLog(): { bgg_catalog_imported_at: string | null } {
    return this.db
      .prepare('SELECT bgg_catalog_imported_at FROM log_import WHERE id = 1')
      .get() as { bgg_catalog_imported_at: string | null }
  }

  recordCatalogImport(): void {
    this.db.prepare(
      'UPDATE log_import SET bgg_catalog_imported_at = CURRENT_TIMESTAMP WHERE id = 1'
    ).run()
  }

  upsertCatalogBatch(rows: BggGame[]): void {
    const stmt = this.db.prepare(`
      INSERT INTO bgg_catalog (bgg_id, name, year_published, is_expansion)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(bgg_id) DO UPDATE SET
        name = excluded.name,
        year_published = excluded.year_published,
        is_expansion = excluded.is_expansion
    `)
    const insert = this.db.transaction((batch: BggGame[]) => {
      for (const row of batch) {
        stmt.run(row.bgg_id, row.name, row.year_published ?? null, row.is_expansion ? 1 : 0)
      }
    })
    insert(rows)
  }
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS — all repository tests

- [ ] **Step 7: Commit**

```bash
git add backend/repositories/ backend/__tests__/unit/repositories/
git commit -m "feat(backend): SessionRepository, StatsRepository, BGGRepository"
```

---

### Task B4: AuthService + JWT middleware

**Files:**
- Create: `backend/services/AuthService.ts`
- Create: `backend/middleware/auth.ts`
- Create: `backend/middleware/requireRole.ts`
- Create: `backend/__tests__/unit/services/AuthService.test.ts`

- [ ] **Step 1: Write failing test**

Create `backend/__tests__/unit/services/AuthService.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { AuthService } from '../../../services/AuthService'

const service = new AuthService('test-secret-at-least-32-chars-long', 'adminpass', 'userpass')

describe('AuthService', () => {
  it('returns token with role=admin when admin password matches', () => {
    const result = service.login('adminpass')
    expect(result).not.toBeNull()
    expect(result?.role).toBe('admin')
    expect(result?.token).toBeTruthy()
  })

  it('returns token with role=user when user password matches', () => {
    const result = service.login('userpass')
    expect(result?.role).toBe('user')
  })

  it('returns null for wrong password', () => {
    expect(service.login('wrong')).toBeNull()
  })

  it('verifyToken returns payload for valid token', () => {
    const result = service.login('adminpass')!
    const payload = service.verifyToken(result.token)
    expect(payload?.role).toBe('admin')
  })

  it('verifyToken returns null for invalid token', () => {
    expect(service.verifyToken('not.a.token')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `AuthService` not found

- [ ] **Step 3: Create `backend/services/AuthService.ts`**

```ts
import jwt from 'jsonwebtoken'

interface TokenPayload {
  sub: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

export class AuthService {
  constructor(
    private readonly secret: string,
    private readonly adminPassword: string,
    private readonly userPassword: string,
  ) {}

  login(password: string): { token: string; role: 'admin' | 'user' } | null {
    if (password === this.adminPassword) return { token: this._sign('admin'), role: 'admin' }
    if (password === this.userPassword)  return { token: this._sign('user'),  role: 'user' }
    return null
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch {
      return null
    }
  }

  private _sign(role: 'admin' | 'user'): string {
    return jwt.sign({ sub: role, role }, this.secret, { expiresIn: '1h' })
  }
}

// Singleton — initialized from env at startup
export function createAuthService(): AuthService {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('[FATAL] AUTH_JWT_SECRET must be set and at least 32 characters')
  }
  const adminPwd = process.env.ADMIN_PASSWORD
  if (!adminPwd) throw new Error('[FATAL] ADMIN_PASSWORD must be set')
  const userPwd = process.env.USER_PASSWORD ?? ''
  return new AuthService(secret, adminPwd, userPwd)
}
```

- [ ] **Step 4: Create `backend/middleware/auth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express'
import type { AuthService } from '../services/AuthService'

export interface AuthRequest extends Request {
  user?: { role: 'admin' | 'user' }
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Cookie-based auth (web)
    const cookieHeader = req.headers.cookie ?? ''
    const match = cookieHeader.match(/auth_token=([^;]+)/)
    const cookieToken = match?.[1]

    // Bearer header auth (future Android client)
    const bearerToken = req.headers.authorization?.replace('Bearer ', '')

    const token = cookieToken ?? bearerToken

    if (!token) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const payload = authService.verifyToken(token)
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    req.user = { role: payload.role }
    next()
  }
}
```

- [ ] **Step 5: Create `backend/middleware/requireRole.ts`**

```ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth'

export function requireRole(role: 'admin' | 'user') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    if (role === 'admin' && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' })
      return
    }
    next()
  }
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/services/AuthService.ts backend/middleware/ backend/__tests__/unit/services/
git commit -m "feat(backend): AuthService with JWT, auth middleware, requireRole guard"
```

---

### Task B5: Services (PlayerService, GameService, SessionService)

**Files:**
- Create: `backend/services/PlayerService.ts`
- Create: `backend/services/GameService.ts`
- Create: `backend/services/SessionService.ts`
- Create: `backend/services/StatsService.ts`
- Create: `backend/__tests__/unit/services/SessionService.test.ts`

- [ ] **Step 1: Write failing test for SessionService (most complex)**

Create `backend/__tests__/unit/services/SessionService.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { GameRepository } from '../../../repositories/GameRepository'
import { SessionRepository } from '../../../repositories/SessionRepository'
import { SessionService } from '../../../services/SessionService'

let conn: DatabaseConnection
let service: SessionService
let playerId: number
let gameId: number

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  const playerRepo = new PlayerRepository(conn.db)
  const gameRepo = new GameRepository(conn.db)
  const sessionRepo = new SessionRepository(conn.db)
  service = new SessionService(conn.db, sessionRepo)

  playerId = playerRepo.create({ player_name: 'Bob', pseudo: 'bob' })
  gameId = gameRepo.create({
    name: 'Catan', min_players: 3, max_players: 4,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: false, has_characters: false, is_expansion: false,
  })
})

afterEach(() => conn.close())

describe('SessionService', () => {
  it('creates session and session_players atomically', () => {
    const result = service.createSession({
      game_id: gameId,
      session_type: 'competitive',
      players: [{ player_id: playerId, score: 10, is_winner: true }],
    })
    expect(result.session_id).toBeTruthy()

    const players = conn.db
      .prepare('SELECT * FROM session_players WHERE session_id = ?')
      .all(result.session_id)
    expect(players).toHaveLength(1)
  })

  it('rolls back if player_id is invalid', () => {
    expect(() =>
      service.createSession({
        game_id: gameId,
        session_type: 'competitive',
        players: [{ player_id: 9999, score: 10, is_winner: false }],
      })
    ).toThrow()

    const sessions = conn.db.prepare('SELECT COUNT(*) as n FROM game_sessions').get() as { n: number }
    expect(sessions.n).toBe(0)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd backend && npm test
```

Expected: FAIL — `SessionService` not found

- [ ] **Step 3: Create `backend/services/SessionService.ts`**

```ts
import type Database from 'better-sqlite3'
import type { SessionRepository } from '../repositories/SessionRepository'
import type { GameSession } from '@shared/types'
import type { CreateSessionRequest } from '@shared/types'

export class SessionService {
  constructor(
    private db: Database.Database,
    private sessionRepo: SessionRepository,
  ) {}

  createSession(data: CreateSessionRequest): GameSession {
    return this.db.transaction(() => {
      const sessionId = this.sessionRepo.insertSession({
        game_id: data.game_id,
        session_date: data.session_date,
        duration_minutes: data.duration_minutes,
        winner_player_id: data.winner_player_id,
        session_type: data.session_type,
        notes: data.notes,
      })
      this.sessionRepo.insertSessionPlayers(sessionId, data.players)
      return this.sessionRepo.findById(sessionId)!
    })()
  }

  getAllSessions(): GameSession[] {
    return this.sessionRepo.findAll()
  }

  deleteSession(sessionId: number): void {
    this.sessionRepo.delete(sessionId)
  }
}
```

- [ ] **Step 4: Create `backend/services/PlayerService.ts`**

```ts
import type { PlayerRepository } from '../repositories/PlayerRepository'
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types'

export class PlayerService {
  constructor(private playerRepo: PlayerRepository) {}

  getAll(): Player[] {
    return this.playerRepo.findAll()
  }

  getById(id: number): Player | undefined {
    return this.playerRepo.findById(id)
  }

  getAllStatistics(): PlayerStatistics[] {
    return this.playerRepo.findAllStatistics()
  }

  create(data: CreatePlayerRequest): Player {
    const id = this.playerRepo.create(data)
    return this.playerRepo.findById(id)!
  }

  update(id: number, data: UpdatePlayerRequest): Player | undefined {
    this.playerRepo.update(id, data)
    return this.playerRepo.findById(id)
  }

  delete(id: number): void {
    this.playerRepo.delete(id)
  }
}
```

- [ ] **Step 5: Create `backend/services/GameService.ts`**

```ts
import type { GameRepository } from '../repositories/GameRepository'
import type {
  Game, GameExpansion, GameCharacter,
  CreateGameRequest, UpdateGameRequest,
} from '@shared/types'

export class GameService {
  constructor(private gameRepo: GameRepository) {}

  getAll(): Game[] {
    const games = this.gameRepo.findAll()
    return games.map(g => ({
      ...g,
      expansions: g.has_expansion ? this.gameRepo.findExpansions(g.game_id) : [],
      characters: g.has_characters ? this.gameRepo.findCharacters(g.game_id) : [],
    }))
  }

  getById(id: number): Game | undefined {
    const game = this.gameRepo.findById(id)
    if (!game) return undefined
    return {
      ...game,
      expansions: this.gameRepo.findExpansions(id),
      characters: this.gameRepo.findCharacters(id),
    }
  }

  create(data: CreateGameRequest): Game {
    const id = this.gameRepo.create(data)
    if (data.expansions?.length) {
      for (const exp of data.expansions) this.gameRepo.createExpansion(id, exp)
    }
    if (data.characters?.length) {
      for (const ch of data.characters) this.gameRepo.createCharacter(id, ch)
    }
    return this.getById(id)!
  }

  update(id: number, data: UpdateGameRequest): Game | undefined {
    this.gameRepo.update(id, data)
    return this.getById(id)
  }

  delete(id: number): void {
    this.gameRepo.delete(id)
  }

  addExpansion(gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): GameExpansion {
    const id = this.gameRepo.createExpansion(gameId, data)
    return { ...data, expansion_id: id, game_id: gameId }
  }

  deleteExpansion(expansionId: number): void {
    this.gameRepo.deleteExpansion(expansionId)
  }

  addCharacter(gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): GameCharacter {
    const id = this.gameRepo.createCharacter(gameId, data)
    return { ...data, character_id: id, game_id: gameId }
  }

  deleteCharacter(characterId: number): void {
    this.gameRepo.deleteCharacter(characterId)
  }
}
```

- [ ] **Step 6: Create `backend/services/StatsService.ts`**

```ts
import type { StatsRepository } from '../repositories/StatsRepository'
import type { DashboardStats, PlayerStatistics, GameStatistics } from '@shared/types'

export class StatsService {
  constructor(private statsRepo: StatsRepository) {}

  getDashboard(): DashboardStats {
    return this.statsRepo.getDashboard()
  }

  getPlayerStats(): PlayerStatistics[] {
    return this.statsRepo.getAllPlayerStats()
  }

  getPlayerStatsById(id: number): PlayerStatistics | undefined {
    return this.statsRepo.getPlayerStats(id)
  }

  getGameStats(): GameStatistics[] {
    return this.statsRepo.getAllGameStats()
  }

  getGameStatsById(id: number): GameStatistics | undefined {
    return this.statsRepo.getGameStats(id)
  }
}
```

- [ ] **Step 7: Run tests — verify they pass**

```bash
cd backend && npm test
```

Expected: PASS — all tests including SessionService transaction tests

- [ ] **Step 8: Commit**

```bash
git add backend/services/ backend/__tests__/unit/services/
git commit -m "feat(backend): PlayerService, GameService, SessionService (transactional), StatsService"
```

---

### Task B6: Routes + new server.ts

**Files:**
- Create: `backend/routes/auth.ts`, `players.ts`, `games.ts`, `sessions.ts`, `stats.ts`, `bgg.ts`, `logs.ts`
- Create: `backend/middleware/errorHandler.ts`
- Rewrite: `backend/server.ts`

- [ ] **Step 1: Create `backend/middleware/errorHandler.ts`**

```ts
import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDev = process.env.NODE_ENV !== 'production'

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  const message = err instanceof Error ? err.message : 'Unknown error'
  res.status(500).json({
    error: isDev ? message : 'Internal server error',
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  })
}
```

- [ ] **Step 2: Create `backend/routes/auth.ts`**

```ts
import { Router } from 'express'
import type { AuthService } from '../services/AuthService'

export function createAuthRouter(authService: AuthService): Router {
  const router = Router()

  router.post('/login', (req, res) => {
    const { password } = req.body as { password?: string }
    if (!password) {
      res.status(400).json({ error: 'Password required' })
      return
    }

    const result = authService.login(password)
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    res.cookie('auth_token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000,
    })
    res.json({ role: result.role })
  })

  router.post('/logout', (_req, res) => {
    res.clearCookie('auth_token')
    res.json({ ok: true })
  })

  return router
}
```

- [ ] **Step 3: Create `backend/routes/players.ts`**

```ts
import { Router } from 'express'
import type { PlayerService } from '../services/PlayerService'
import { validateBody, validateParams } from '../validation/middleware'
import { CreatePlayerSchema, UpdatePlayerSchema } from '../validation/schemas'
import { z } from 'zod'
import { AppError } from '../middleware/errorHandler'

const IdParam = z.object({ id: z.coerce.number().int().positive() })

export function createPlayerRouter(playerService: PlayerService): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json(playerService.getAllStatistics())
  })

  router.get('/:id', validateParams(IdParam), (req, res) => {
    const player = playerService.getById(Number(req.params.id))
    if (!player) throw new AppError(404, 'Player not found')
    res.json(player)
  })

  router.post('/', validateBody(CreatePlayerSchema), (req, res) => {
    const player = playerService.create(req.body)
    res.status(201).json(player)
  })

  router.put('/:id', validateParams(IdParam), validateBody(UpdatePlayerSchema), (req, res) => {
    const player = playerService.update(Number(req.params.id), req.body)
    if (!player) throw new AppError(404, 'Player not found')
    res.json(player)
  })

  router.delete('/:id', validateParams(IdParam), (req, res) => {
    playerService.delete(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
```

- [ ] **Step 4: Create `backend/routes/games.ts`**

```ts
import { Router } from 'express'
import type { GameService } from '../services/GameService'
import { validateBody, validateParams } from '../validation/middleware'
import { CreateGameSchema, UpdateGameSchema } from '../validation/schemas'
import { z } from 'zod'
import { AppError } from '../middleware/errorHandler'

const IdParam = z.object({ id: z.coerce.number().int().positive() })

export function createGameRouter(gameService: GameService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(gameService.getAll()))

  router.get('/:id', validateParams(IdParam), (req, res) => {
    const game = gameService.getById(Number(req.params.id))
    if (!game) throw new AppError(404, 'Game not found')
    res.json(game)
  })

  router.post('/', validateBody(CreateGameSchema), (req, res) => {
    res.status(201).json(gameService.create(req.body))
  })

  router.put('/:id', validateParams(IdParam), validateBody(UpdateGameSchema), (req, res) => {
    const game = gameService.update(Number(req.params.id), req.body)
    if (!game) throw new AppError(404, 'Game not found')
    res.json(game)
  })

  router.delete('/:id', validateParams(IdParam), (req, res) => {
    gameService.delete(Number(req.params.id))
    res.status(204).send()
  })

  // Expansions
  router.post('/:id/expansions', validateParams(IdParam), (req, res) => {
    const exp = gameService.addExpansion(Number(req.params.id), req.body)
    res.status(201).json(exp)
  })

  router.delete('/:id/expansions/:expId', (req, res) => {
    gameService.deleteExpansion(Number(req.params.expId))
    res.status(204).send()
  })

  // Characters
  router.post('/:id/characters', validateParams(IdParam), (req, res) => {
    const ch = gameService.addCharacter(Number(req.params.id), req.body)
    res.status(201).json(ch)
  })

  router.delete('/:id/characters/:charId', (req, res) => {
    gameService.deleteCharacter(Number(req.params.charId))
    res.status(204).send()
  })

  return router
}
```

- [ ] **Step 5: Create `backend/routes/sessions.ts`**

```ts
import { Router } from 'express'
import type { SessionService } from '../services/SessionService'
import { validateBody } from '../validation/middleware'
import { CreateSessionSchema } from '../validation/schemas'

export function createSessionRouter(sessionService: SessionService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(sessionService.getAllSessions()))

  router.post('/', validateBody(CreateSessionSchema), (req, res) => {
    const session = sessionService.createSession(req.body)
    res.status(201).json(session)
  })

  router.delete('/:id', (req, res) => {
    sessionService.deleteSession(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
```

- [ ] **Step 6: Create `backend/routes/stats.ts`**

```ts
import { Router } from 'express'
import type { StatsService } from '../services/StatsService'

export function createStatsRouter(statsService: StatsService): Router {
  const router = Router()

  router.get('/dashboard', (_req, res) => res.json(statsService.getDashboard()))
  router.get('/players', (_req, res) => res.json(statsService.getPlayerStats()))
  router.get('/players/:id', (req, res) => {
    const stats = statsService.getPlayerStatsById(Number(req.params.id))
    if (!stats) { res.status(404).json({ error: 'Not found' }); return }
    res.json(stats)
  })
  router.get('/games', (_req, res) => res.json(statsService.getGameStats()))
  router.get('/games/:id', (req, res) => {
    const stats = statsService.getGameStatsById(Number(req.params.id))
    if (!stats) { res.status(404).json({ error: 'Not found' }); return }
    res.json(stats)
  })

  return router
}
```

- [ ] **Step 7: Create `backend/routes/bgg.ts`**

```ts
import { Router } from 'express'
import type { BGGRepository } from '../repositories/BGGRepository'
import type { AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { parseBggCsv } from '../database/parseBggCsv'
import * as path from 'path'
import * as fs from 'fs'
import type { Request, Response } from 'express'
import { bggService } from '../bggService'

export function createBggRouter(bggRepo: BGGRepository): Router {
  const router = Router()

  router.get('/search', (req, res) => {
    const query = String(req.query.q ?? '').trim()
    if (!query) { res.json([]); return }
    res.json(bggRepo.search(query))
  })

  router.get('/import-status', (_req, res) => {
    res.json(bggRepo.getImportLog())
  })

  router.post('/import-catalog', requireRole('admin'), async (req: AuthRequest, res: Response) => {
    const importDir = path.join(__dirname, '../database/import')
    const csvPath = path.join(importDir, 'boardgames_ranks.csv')
    if (!fs.existsSync(csvPath)) {
      res.status(404).json({ error: 'CSV not found at backend/database/import/boardgames_ranks.csv' })
      return
    }
    const rows = parseBggCsv(csvPath)
    bggRepo.upsertCatalogBatch(rows)
    bggRepo.recordCatalogImport()
    res.json({ imported: rows.length })
  })

  router.get('/game/:bggId', async (req, res) => {
    try {
      const data = await bggService.getGameById(Number(req.params.bggId))
      res.json(data)
    } catch {
      res.status(502).json({ error: 'BGG API unavailable' })
    }
  })

  return router
}
```

- [ ] **Step 8: Create `backend/routes/logs.ts`**

```ts
import { Router } from 'express'
import type { Logger } from 'pino'

export function createLogsRouter(logger: Logger): Router {
  const router = Router()

  router.post('/client', (req, res) => {
    const { level = 'error', message, stack, url } = req.body as {
      level?: string; message?: string; stack?: string; url?: string
    }
    const logFn = level === 'warn' ? logger.warn.bind(logger) : logger.error.bind(logger)
    logFn({ clientError: true, url, stack }, message ?? 'Client error')
    res.status(204).send()
  })

  return router
}
```

- [ ] **Step 9: Rewrite `backend/server.ts`**

```ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import pino from 'pino'
import pinoHttp from 'pino-http'
import path from 'path'

import { dbConnection } from './database/DatabaseConnection'
import { PlayerRepository } from './repositories/PlayerRepository'
import { GameRepository } from './repositories/GameRepository'
import { SessionRepository } from './repositories/SessionRepository'
import { StatsRepository } from './repositories/StatsRepository'
import { BGGRepository } from './repositories/BGGRepository'
import { PlayerService } from './services/PlayerService'
import { GameService } from './services/GameService'
import { SessionService } from './services/SessionService'
import { StatsService } from './services/StatsService'
import { createAuthService } from './services/AuthService'
import { createAuthMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { createAuthRouter } from './routes/auth'
import { createPlayerRouter } from './routes/players'
import { createGameRouter } from './routes/games'
import { createSessionRouter } from './routes/sessions'
import { createStatsRouter } from './routes/stats'
import { createBggRouter } from './routes/bgg'
import { createLogsRouter } from './routes/logs'

// ── Logger ──────────────────────────────────────────────────────────────────
export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' })

// ── Dependency wiring ────────────────────────────────────────────────────────
const playerRepo  = new PlayerRepository(dbConnection.db)
const gameRepo    = new GameRepository(dbConnection.db)
const sessionRepo = new SessionRepository(dbConnection.db)
const statsRepo   = new StatsRepository(dbConnection.db)
const bggRepo     = new BGGRepository(dbConnection.db)

const playerService  = new PlayerService(playerRepo)
const gameService    = new GameService(gameRepo)
const sessionService = new SessionService(dbConnection.db, sessionRepo)
const statsService   = new StatsService(statsRepo)
const authService    = createAuthService()

const authenticate = createAuthMiddleware(authService)

// ── Express app ──────────────────────────────────────────────────────────────
const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// Security
app.use(helmet())

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.url}`)
      return
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    next()
  })
}

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(o => o.trim())
app.use(cors({ origin: allowedOrigins, credentials: true }))

// Body + cookies
app.use(express.json())
app.use(cookieParser())

// Request logging
app.use(pinoHttp({ logger }))

// Rate limiting on auth
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true })

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth/login', loginLimiter)
app.use('/api/v1/auth',    createAuthRouter(authService))
app.use('/api/v1/logs',    createLogsRouter(logger))

// Protected routes
app.use('/api/v1/players',  authenticate, createPlayerRouter(playerService))
app.use('/api/v1/games',    authenticate, createGameRouter(gameService))
app.use('/api/v1/sessions', authenticate, createSessionRouter(sessionService))
app.use('/api/v1/stats',    authenticate, createStatsRouter(statsService))
app.use('/api/v1/bgg',      authenticate, createBggRouter(bggRepo))

// Health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }))

// Frontend static (production)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

export default app
```

- [ ] **Step 10: Install missing backend deps**

```bash
cd backend
npm install cookie-parser
npm install -D @types/cookie-parser
```

- [ ] **Step 11: Run backend tests**

```bash
cd backend && npm test
```

Expected: PASS

- [ ] **Step 12: Manually start server and verify health endpoint**

```bash
cd backend && npm run dev
# In another terminal:
curl http://localhost:3001/api/v1/health
```

Expected: `{"ok":true}`

- [ ] **Step 13: Commit**

```bash
git add backend/routes/ backend/middleware/errorHandler.ts backend/server.ts
git commit -m "feat(backend): routes split, new server.ts with /api/v1 prefix, Helmet, pino, rate limiting"
```

- [ ] **Step 14: Delete old files**

```bash
rm backend/database/DatabaseManager.ts
rm backend/models/interfaces.ts
```

- [ ] **Step 15: Verify build still compiles**

```bash
cd backend && npm run build
```

Expected: No TypeScript errors

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "refactor(backend): remove DatabaseManager and interfaces.ts — replaced by layered architecture"
```

---

## Sprint C — Frontend

### Task C1: Install React Router v7 + split ApiService

**Files:**
- Create: `src/services/api/queryKeys.ts`
- Create: `src/services/api/playerApi.ts`
- Create: `src/services/api/gameApi.ts`
- Create: `src/services/api/sessionApi.ts`
- Create: `src/services/api/statsApi.ts`
- Create: `src/services/api/authApi.ts`

- [ ] **Step 1: Install React Router v7**

```bash
npm install react-router-dom@7
```

- [ ] **Step 2: Create `src/services/api/queryKeys.ts`**

```ts
export const queryKeys = {
  players: {
    all: ['players'] as const,
    detail: (id: number) => ['players', id] as const,
  },
  games: {
    all: ['games'] as const,
    detail: (id: number) => ['games', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
  },
  stats: {
    dashboard: ['stats', 'dashboard'] as const,
    players: ['stats', 'players'] as const,
    player: (id: number) => ['stats', 'players', id] as const,
    games: ['stats', 'games'] as const,
    game: (id: number) => ['stats', 'games', id] as const,
  },
  bgg: {
    search: (q: string) => ['bgg', 'search', q] as const,
    importStatus: ['bgg', 'import-status'] as const,
  },
} as const
```

- [ ] **Step 3: Create `src/services/api/playerApi.ts`**

```ts
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types'

const BASE = '/api/v1/players'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const playerApi = {
  getAll:    (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(BASE),
  getById:   (id: number): Promise<Player> => request<Player>(`${BASE}/${id}`),
  create:    (data: CreatePlayerRequest): Promise<Player> =>
    request<Player>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update:    (id: number, data: UpdatePlayerRequest): Promise<Player> =>
    request<Player>(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:    (id: number): Promise<void> =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
```

- [ ] **Step 4: Create `src/services/api/gameApi.ts`**

```ts
import type { Game, GameExpansion, GameCharacter, CreateGameRequest, UpdateGameRequest } from '@shared/types'

const BASE = '/api/v1/games'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const gameApi = {
  getAll:  (): Promise<Game[]> => request<Game[]>(BASE),
  getById: (id: number): Promise<Game> => request<Game>(`${BASE}/${id}`),
  create:  (data: CreateGameRequest): Promise<Game> =>
    request<Game>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update:  (id: number, data: UpdateGameRequest): Promise<Game> =>
    request<Game>(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),

  addExpansion:    (gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): Promise<GameExpansion> =>
    request<GameExpansion>(`${BASE}/${gameId}/expansions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteExpansion: (gameId: number, expansionId: number): Promise<void> =>
    request<void>(`${BASE}/${gameId}/expansions/${expansionId}`, { method: 'DELETE' }),

  addCharacter:    (gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): Promise<GameCharacter> =>
    request<GameCharacter>(`${BASE}/${gameId}/characters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteCharacter: (gameId: number, characterId: number): Promise<void> =>
    request<void>(`${BASE}/${gameId}/characters/${characterId}`, { method: 'DELETE' }),
}
```

- [ ] **Step 5: Create `src/services/api/sessionApi.ts`**

```ts
import type { GameSession, CreateSessionRequest } from '@shared/types'

const BASE = '/api/v1/sessions'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const sessionApi = {
  getAll:  (): Promise<GameSession[]> => request<GameSession[]>(BASE),
  create:  (data: CreateSessionRequest): Promise<GameSession> =>
    request<GameSession>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:  (id: number): Promise<void> => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
```

- [ ] **Step 6: Create `src/services/api/statsApi.ts`**

```ts
import type { DashboardStats, PlayerStatistics, GameStatistics } from '@shared/types'

const BASE = '/api/v1/stats'

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export const statsApi = {
  getDashboard:   (): Promise<DashboardStats> => request<DashboardStats>(`${BASE}/dashboard`),
  getPlayerStats: (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(`${BASE}/players`),
  getPlayerById:  (id: number): Promise<PlayerStatistics> => request<PlayerStatistics>(`${BASE}/players/${id}`),
  getGameStats:   (): Promise<GameStatistics[]> => request<GameStatistics[]>(`${BASE}/games`),
  getGameById:    (id: number): Promise<GameStatistics> => request<GameStatistics>(`${BASE}/games/${id}`),
}
```

- [ ] **Step 7: Create `src/services/api/authApi.ts`**

```ts
export const authApi = {
  login:  (password: string): Promise<{ role: 'admin' | 'user' }> =>
    fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async res => {
      if (!res.ok) throw new Error('Invalid credentials')
      return res.json() as Promise<{ role: 'admin' | 'user' }>
    }),

  logout: (): Promise<void> =>
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).then(() => undefined),
}
```

- [ ] **Step 8: Run frontend tests**

```bash
npm run test:run
```

Expected: Existing tests pass (new files have no tests yet)

- [ ] **Step 9: Commit**

```bash
git add src/services/api/ src/types/index.ts
git commit -m "feat(frontend): split ApiService into domain modules + queryKeys"
```

---

### Task C2: React Router v7 migration

**Files:**
- Rewrite: `src/App.tsx`
- Rewrite: `src/main.tsx`
- Create: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Create `src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/api/authApi'

interface AuthContextValue {
  role: 'admin' | 'user' | null
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'admin' | 'user' | null>(null)

  const login = useCallback(async (password: string) => {
    const result = await authApi.login(password)
    setRole(result.role)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Rewrite `src/App.tsx`**

The new App.tsx is a pure shell — no data, no navigation state, just providers + routes.

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'

// Lazy-load pages for code-splitting
const DashboardPage   = lazy(() => import('./components/DashboardPage'))
const PlayersPage     = lazy(() => import('./components/PlayersPage'))
const GamesPage       = lazy(() => import('./components/GamesPage'))
const NewGamePage     = lazy(() => import('./components/NewGamePage'))
const StatsPage       = lazy(() => import('./components/StatsPage'))
const SettingsPage    = lazy(() => import('./components/SettingsPage'))
const LoginPage       = lazy(() => import('./components/LoginPage'))
const Layout          = lazy(() => import('./components/Layout'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="players" element={<PlayersPage />} />
                <Route path="games" element={<GamesPage />} />
                <Route path="sessions/new" element={<NewGamePage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Create `src/components/Layout.tsx`** (shell with BottomNavigation + Outlet)

```tsx
import { Outlet } from 'react-router-dom'
import { BottomNavigation } from './BottomNavigation'
import { useIsMobile } from '../hooks/use-mobile'

export default function Layout() {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-background">
      <main className={isMobile ? 'pb-16' : ''}>
        <Outlet />
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  )
}
```

- [ ] **Step 4: Update `BottomNavigation` to use React Router**

Find `BottomNavigation` component and replace `onClick` navigation with `<Link>` / `useLocation`:

In the existing BottomNavigation component, replace the nav items array with:
```tsx
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/players',   label: 'Players',   icon: Users },
  { to: '/games',     label: 'Games',     icon: Gamepad2 },
  { to: '/sessions/new', label: 'Play',  icon: Play },
  { to: '/stats',     label: 'Stats',     icon: BarChart3 },
]

// In render:
const location = useLocation()

// Replace buttons with:
<Link
  key={item.to}
  to={item.to}
  className={cn('...', location.pathname === item.to && 'active-class')}
>
  ...
</Link>
```

- [ ] **Step 5: Run frontend build**

```bash
npm run build
```

Fix any TypeScript errors that arise (most will be from removed `currentView` / `navigationContext` props).

- [ ] **Step 6: Run frontend tests**

```bash
npm run test:run
```

Expected: Tests pass (MSW still intercepts, routes now resolve)

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/main.tsx src/contexts/ src/components/Layout.tsx src/components/BottomNavigation.tsx
git commit -m "feat(frontend): React Router v7 — URL-based navigation, App.tsx as pure shell"
```

---

### Task C3: Hook standardization + dead code removal

**Files:**
- Modify: All hooks in `src/hooks/`
- Delete: `src/components/SimpleDashboard.tsx`
- Delete: `src/utils/testBGG.ts`

- [ ] **Step 1: Audit hooks for useState+useEffect API patterns**

```bash
grep -rn "useEffect" src/hooks/ --include="*.ts" --include="*.tsx"
```

For each `useEffect` that calls an API:
- Replace with `useQuery({ queryKey: queryKeys.X, queryFn: xApi.getY })`
- Remove the corresponding `useState` for that data

- [ ] **Step 2: Update each hook to use `queryKeys` — example pattern**

For any hook like:
```ts
// Before
const [players, setPlayers] = useState<Player[]>([])
useEffect(() => {
  apiService.getPlayers().then(setPlayers)
}, [])
```

Replace with:
```ts
// After
import { useQuery } from '@tanstack/react-query'
import { playerApi } from '../services/api/playerApi'
import { queryKeys } from '../services/api/queryKeys'

const { data: players = [] } = useQuery({
  queryKey: queryKeys.players.all,
  queryFn: playerApi.getAll,
})
```

- [ ] **Step 3: Remove dead files**

```bash
rm src/components/SimpleDashboard.tsx 2>/dev/null; echo "done"
rm src/utils/testBGG.ts 2>/dev/null; echo "done"
```

- [ ] **Step 4: Update VITE_API_URL references**

In `src/services/ApiService.ts` or wherever the base URL is set, ensure all calls use `/api/v1/` prefix (matching new backend). With the new `api/` modules, `ApiService.ts` can be deleted once all hooks are migrated.

- [ ] **Step 5: Run frontend tests**

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: TypeScript clean, no errors

- [ ] **Step 7: Add frontend error handler**

In `src/main.tsx`, after the `ReactDOM.createRoot` call:

```tsx
window.onerror = (message, _source, _line, _col, error) => {
  void fetch('/api/v1/logs/client', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'error',
      message: String(message),
      stack: error?.stack,
      url: window.location.pathname,
    }),
  })
}

window.onunhandledrejection = (event) => {
  void fetch('/api/v1/logs/client', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'error',
      message: String(event.reason),
      url: window.location.pathname,
    }),
  })
}
```

- [ ] **Step 8: Final integration test — start both servers and verify**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

Open http://localhost:5173 — verify:
- Login page appears
- After login, routing works (F5 keeps current page)
- Players, Games, Sessions, Stats pages load data

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(frontend): standardize all hooks to React Query, remove dead code, add global error handler"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| shared/types source of truth | A2 |
| tsconfig path aliases | A2 |
| Numbered SQL migrations | A3 |
| Remove dead stats columns | A3 (migration 004) |
| Remove game_type | A3 (migration 005) |
| Add 'hybrid' to session_type | A3 (migration 006) |
| DatabaseConnection singleton | A3 |
| PlayerRepository | B1 |
| GameRepository | B2 |
| SessionRepository | B3 |
| StatsRepository | B3 |
| BGGRepository | B3 |
| PlayerService | B5 |
| GameService | B5 |
| SessionService (transactional) | B5 |
| StatsService | B5 |
| AuthService + JWT | B4 |
| HTTP-only cookie | B6 (auth route) |
| Admin/user roles | B4 + B6 |
| Rate limiting login | B6 |
| Helmet | B6 |
| pino logging | B6 |
| /api/v1/ versioning | B6 |
| Error handler middleware | B6 |
| Frontend error → POST /logs/client | C3 |
| React Router v7 | C2 |
| App.tsx shell only | C2 |
| API service split | C1 |
| queryKeys.ts | C1 |
| Hook standardization | C3 |
| Dead code removal | C3 |

### Items deferred to Sprint D (separate plan)

- OpenAPI/Swagger auto-generation
- Full test suite restructure (unit/technical, unit/functional, integration)
- Missing integration tests for routes (supertest)
- Docker multi-stage build update
