# Database Structure for Board Game Score Tracker

## Overview

This document describes the database schema for the Board Game Score Tracker. SQLite with `better-sqlite3`. Numbered migrations applied at startup (001 → 014).

**Active tables:** `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `players_play`, `bgg_catalog`, `bgg_catalog_language`, `labels`, `refresh_tokens`, `log_import`, `schema_version`

**SQL views:** `player_statistics`, `game_statistics`

## Tables

### 1. Players Table
Stores information about individual players in the system.

```sql
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    pseudo TEXT, -- unique alias (added via runMigrations(), UNIQUE INDEX idx_players_pseudo COLLATE NOCASE)
    avatar TEXT, -- URL to avatar image
    games_played INTEGER DEFAULT 0,  -- ⚠️ see technical debt note below
    wins INTEGER DEFAULT 0,           -- ⚠️ see technical debt note below
    total_score INTEGER DEFAULT 0,    -- ⚠️ see technical debt note below
    average_score REAL DEFAULT 0.0,   -- ⚠️ see technical debt note below
    favorite_game TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> ⚠️ **Technical Debt — denormalized stats columns**
>
> The columns `games_played`, `wins`, `total_score`, `average_score` are **duplicated**: they exist in the `players` table **and** are dynamically recalculated in the `player_statistics` view from real `session_players` data.
>
> **Current situation:** the backend always reads via the view (`player_statistics`), never from the stored columns. The table columns therefore remain at their default value (`0`) — they are never updated by the session system. There is no trigger or application logic that synchronizes them.
>
> **Consequence:** these columns are dead on read. All displayed values come from the view.
>
> **Decision needed:**
> - **Option A (recommended) — drop the columns from `players`**, use only the view. Single source of truth, no desync risk.
> - **Option B — keep and sync**: update the columns on each session creation/modification (via SQL trigger or application code). Redundant but sometimes useful for performance at very large scale.
>
> **Status:** unresolved. Kept for now (API backward compatibility), to be cleaned up in a dedicated sprint.

### 2. Games Table
Stores comprehensive information about board games.

```sql
CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id INTEGER UNIQUE, -- BoardGameGeek ID
    thumbnail TEXT, -- BGG thumbnail URL
    playing_time INTEGER, -- typical duration in minutes
    min_playtime INTEGER,
    max_playtime INTEGER,
    categories TEXT, -- JSON array
    mechanics TEXT, -- JSON array
    families TEXT, -- JSON array
    name TEXT NOT NULL,
    description TEXT,
    image TEXT, -- URL to game image
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    duration TEXT, -- e.g., "60-90 min"
    difficulty TEXT, -- Beginner, Intermediate, Expert
    category TEXT,
    year_published INTEGER,
    publisher TEXT,
    designer TEXT,
    bgg_rating REAL, -- BGG rating (0.0-10.0)
    weight REAL, -- BGG complexity weight (1.0-5.0)
    age_min INTEGER,
    game_type TEXT CHECK (game_type IN ('competitive', 'cooperative', 'campaign', 'hybrid')),
    supports_cooperative BOOLEAN DEFAULT FALSE,
    supports_competitive BOOLEAN DEFAULT FALSE,
    supports_campaign BOOLEAN DEFAULT FALSE,
    supports_hybrid BOOLEAN DEFAULT FALSE,
    has_expansion BOOLEAN DEFAULT FALSE,
    has_characters BOOLEAN DEFAULT FALSE,
    is_expansion INTEGER DEFAULT 0, -- 1 if this game is itself an expansion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Game Expansions Table
Stores information about game expansions.

```sql
CREATE TABLE game_expansions (
    expansion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    bgg_expansion_id INTEGER,
    name TEXT NOT NULL,
    year_published INTEGER,
    description TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);
```

### 4. Game Characters Table
Stores information about character roles/classes available in games.

```sql
CREATE TABLE game_characters (
    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    character_key TEXT NOT NULL, -- unique identifier for the character
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT, -- URL to character avatar image
    abilities TEXT, -- JSON array of abilities
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);
```

### 5. Game Plays Table
Stores information about individual game plays (renamed from `game_sessions` via migration 013).

```sql
CREATE TABLE game_plays (
    play_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    play_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    winner_player_id INTEGER,
    play_type TEXT CHECK (play_type IN ('competitive', 'cooperative', 'campaign', 'hybrid')) DEFAULT 'competitive',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id) REFERENCES players(player_id) ON DELETE SET NULL
);
```

### 6. Players Play Table
Links players to game plays with their scores and performance (renamed from `session_players` via migration 013).

```sql
CREATE TABLE players_play (
    players_play_id INTEGER PRIMARY KEY AUTOINCREMENT,
    play_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    character_id INTEGER, -- Character/role played (if applicable)
    score INTEGER DEFAULT 0,
    placement INTEGER, -- Final ranking/placement in the game
    is_winner BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (play_id) REFERENCES game_plays(play_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES game_characters(character_id) ON DELETE SET NULL
);
```

### 7. Player Statistics View
A view that calculates player statistics dynamically from `players_play`.

```sql
CREATE VIEW player_statistics AS
SELECT
    p.player_id,
    p.player_name,
    p.pseudo,
    p.avatar,
    COUNT(DISTINCT pp.play_id) as games_played,
    COUNT(CASE WHEN pp.is_winner = 1 THEN 1 END) as wins,
    COALESCE(SUM(pp.score), 0) as total_score,
    COALESCE(AVG(pp.score), 0) as average_score,
    (COUNT(CASE WHEN pp.is_winner = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT pp.play_id), 0)) as win_percentage,
    p.favorite_game,
    p.created_at
FROM players p
LEFT JOIN players_play pp ON p.player_id = pp.player_id
GROUP BY p.player_id, p.player_name, p.avatar, p.favorite_game, p.created_at;
```

### 8. Game Statistics View
A view that calculates game statistics dynamically from `game_plays` and `players_play`.

```sql
CREATE VIEW game_statistics AS
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
    COUNT(DISTINCT gp.play_id) as times_played,
    (SELECT COUNT(DISTINCT pp.player_id) FROM players_play pp WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id)) as unique_players,
    (SELECT AVG(pp.score) FROM players_play pp WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id)) as average_score,
    (SELECT AVG(gp_inner.duration_minutes) FROM game_plays gp_inner WHERE gp_inner.game_id = g.game_id) as average_duration,
    g.created_at
FROM games g
LEFT JOIN game_plays gp ON g.game_id = gp.game_id
GROUP BY g.game_id, g.name, g.image, g.min_players, g.max_players,
         g.difficulty, g.category, g.year_published, g.bgg_rating, g.created_at;
```

### 9. Labels Table
Stores i18n labels for all UI strings, per locale.

```sql
CREATE TABLE IF NOT EXISTS labels (
    key    TEXT NOT NULL,
    locale TEXT NOT NULL,
    value  TEXT NOT NULL,
    PRIMARY KEY (key, locale)
);
```

**Usage:** `GET /api/v1/labels?locale=fr` returns all labels for the requested locale. Offline fallback via `src/shared/i18n/en.json`. Labels added/modified only via numbered migrations.

### 10. Refresh Tokens Table
Stores refresh tokens for JWT rotation.

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    token      TEXT NOT NULL UNIQUE,
    family_id  TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    role       TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked    INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Mechanism:** on each refresh, the old token is marked `revoked = 1` and a new one is issued. If a revoked token is reused, the entire family is revoked (theft detection).

### 11. BGG Catalog Language Table
Localized names for BGG games (Wikidata enrichment).

```sql
CREATE TABLE IF NOT EXISTS bgg_catalog_language (
    bgg_id  INTEGER NOT NULL REFERENCES bgg_catalog(bgg_id) ON DELETE CASCADE,
    locale  TEXT NOT NULL,  -- 'fr', 'de', 'es', etc.
    name    TEXT NOT NULL,
    PRIMARY KEY (bgg_id, locale)
);
```

**Usage:** populated by `POST /api/v1/bgg/enrich-names` (admin) via Wikidata SPARQL queries. Consulted during BGG search to provide localized names.

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(session_date);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_session_players_session_id ON session_players(session_id);
CREATE INDEX idx_session_players_player_id ON session_players(player_id);
CREATE INDEX idx_game_expansions_game_id ON game_expansions(game_id);
CREATE INDEX idx_game_characters_game_id ON game_characters(game_id);
```

## Sample Data Relationships

### Example Player Record
```json
{
  "player_id": 1,
  "player_name": "Jane",
  "avatar": "https://example.com/avatar.jpg",
  "games_played": 45,
  "wins": 28,
  "total_score": 2100,
  "average_score": 46.7,
  "favorite_game": "Strategy Pro"
}
```

### Example Game Record
```json
{
  "game_id": 1,
  "bgg_id": 12345,
  "name": "Strategy Pro",
  "min_players": 2,
  "max_players": 4,
  "game_type": "competitive",
  "has_characters": true,
  "has_expansion": false
}
```

### Example Play Record
```json
{
  "play_id": 1,
  "game_id": 1,
  "play_date": "2024-03-15 19:30:00",
  "duration_minutes": 75,
  "winner_player_id": 1,
  "play_type": "competitive"
}
```

## BGG Catalog Table

Local catalog table containing all BGG games, imported from BoardGameGeek's monthly CSV dump. Enables full-text search and filtering by year/expansion without depending on the geekdo API in real time.

```sql
CREATE TABLE IF NOT EXISTS bgg_catalog (
    bgg_id         INTEGER PRIMARY KEY,  -- BGG ID (source: CSV dump)
    name           TEXT NOT NULL,         -- Game name
    year_published INTEGER,               -- Publication year (nullable)
    is_expansion   INTEGER NOT NULL DEFAULT 0  -- 0 = base game, 1 = expansion
);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_name ON bgg_catalog(name);
```

**Usage:** The table is populated via `POST /api/v1/bgg/import-catalog` (CSV admin upload in Settings). BGG search (`BGGSearch`) queries `bgg_catalog` + `bgg_catalog_language` locally. On clicking a result, `getGameDetails(bgg_id)` always calls the geekdo API for full metadata (image, mechanics, etc.).

**Source:** `boardgames_ranks.csv` — monthly BGG dump (~175k rows, columns: id, name, yearpublished, rank, bayesaverage, is_expansion).

## Import / Export Log Table

Single-row table (always `id = 1`) serving as a log of the latest data management operations. Automatically updated on each operation.

```sql
CREATE TABLE IF NOT EXISTS log_import (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bgg_catalog_imported_at TIMESTAMP,  -- last BGG catalog import
    data_exported_at        TIMESTAMP,  -- last data export
    data_imported_at        TIMESTAMP   -- last data import
);
```

**Columns:**
- `bgg_catalog_imported_at`: updated by `importBggCatalog()` in `DatabaseManager`
- `data_exported_at`: updated on future data export implementation
- `data_imported_at`: updated on future data import implementation

**DatabaseManager methods:** `getImportLog()`, `updateImportLog(field)`

## Migration Notes

- Never modify an already-applied migration file — create a new numbered file
- The `DatabaseConnection.ts` runner checks `MAX(version)` in `schema_version` and applies missing files in an atomic transaction
- i18n labels are added/modified only via migrations (never directly in the DB)
- DB naming: `snake_case`, entity prefix (`game_plays`, `players_play`)
- Wikidata enrichment (`bgg_catalog_language`) can be re-triggered manually from Settings (admin)
