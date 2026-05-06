# Database Structure for Board Game Score Tracker

## Overview

This document describes the database schema for the Board Game Score Tracker. SQLite with `better-sqlite3`. Numbered migrations applied at startup (001 → 027).

**Active tables:** `players`, `games`, `game_expansions`, `game_characters`, `game_plays`, `players_play`, `bgg_catalog`, `bgg_catalog_language`, `labels`, `refresh_tokens`, `log_import`, `schema_version`

**SQL views:** `player_statistics`, `game_statistics`

## Tables

### 1. Players Table
Stores information about individual players in the system.

```sql
CREATE TABLE players (
    player_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name   TEXT    NOT NULL,
    pseudo        TEXT    NOT NULL DEFAULT '',  -- unique alias (UNIQUE INDEX COLLATE NOCASE)
    avatar        TEXT,
    favorite_game TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_players_pseudo ON players(pseudo COLLATE NOCASE);

CREATE TRIGGER update_players_timestamp
    AFTER UPDATE ON players
    BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE player_id = NEW.player_id;
    END;
```

> Stats columns (`games_played`, `wins`, `total_score`, `average_score`) were removed from this table in migration 004. All stats are now computed exclusively via the `player_statistics` view.

### 2. Games Table
Stores comprehensive information about board games.

```sql
CREATE TABLE games (
    game_id              INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id               INTEGER UNIQUE,
    thumbnail            TEXT,
    playing_time         INTEGER,
    min_playtime         INTEGER,
    max_playtime         INTEGER,
    categories           TEXT,        -- JSON array
    mechanics            TEXT,        -- JSON array
    families             TEXT,        -- JSON array
    name                 TEXT    NOT NULL,
    description          TEXT,
    image                TEXT,
    min_players          INTEGER NOT NULL,
    max_players          INTEGER NOT NULL,
    duration             TEXT,
    difficulty           TEXT,
    category             TEXT,
    year_published       INTEGER,
    publisher            TEXT,
    designer             TEXT,
    bgg_rating           REAL,
    weight               REAL,
    age_min              INTEGER,
    supports_cooperative BOOLEAN DEFAULT FALSE,
    supports_competitive BOOLEAN DEFAULT FALSE,
    supports_campaign    BOOLEAN DEFAULT FALSE,
    supports_hybrid      BOOLEAN DEFAULT FALSE,
    has_expansion        BOOLEAN DEFAULT FALSE,
    has_characters       BOOLEAN DEFAULT FALSE,
    is_expansion         INTEGER DEFAULT 0,      -- 1 if this game is itself an expansion
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_games_bgg_id ON games(bgg_id);

CREATE TRIGGER update_games_timestamp
    AFTER UPDATE ON games
    BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = NEW.game_id;
    END;
```

> The `game_type` column was removed in migration 005. Game modes are tracked via the four boolean columns (`supports_cooperative`, `supports_competitive`, `supports_campaign`, `supports_hybrid`).

### 3. Game Expansions Table
Stores information about game expansions.

```sql
CREATE TABLE game_expansions (
    expansion_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id          INTEGER NOT NULL,
    bgg_expansion_id INTEGER,
    name             TEXT    NOT NULL,
    year_published   INTEGER,
    description      TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_game_expansions_game_id ON game_expansions(game_id);
```

### 4. Game Characters Table
Stores information about character roles/classes available in games.

```sql
CREATE TABLE game_characters (
    character_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id       INTEGER NOT NULL,
    character_key TEXT    NOT NULL,
    name          TEXT    NOT NULL,
    description   TEXT,
    avatar        TEXT,
    abilities     TEXT,   -- JSON array of abilities
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_game_characters_game_id ON game_characters(game_id);
```

### 5. Game Plays Table
Stores information about individual game plays (renamed from `game_sessions` via migration 013).

```sql
CREATE TABLE game_plays (
    play_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id          INTEGER NOT NULL,
    play_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    winner_player_id INTEGER,
    play_type        TEXT CHECK(play_type IN ('competitive','cooperative','campaign','hybrid')) DEFAULT 'competitive',
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id)           REFERENCES games(game_id)   ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id)  REFERENCES players(player_id) ON DELETE SET NULL
);

CREATE INDEX idx_game_plays_game_id ON game_plays(game_id);
CREATE INDEX idx_game_plays_date    ON game_plays(play_date);
```

### 6. Players Play Table
Links players to game plays with their scores and performance (renamed from `session_players` via migration 013).

```sql
CREATE TABLE players_play (
    players_play_id INTEGER PRIMARY KEY AUTOINCREMENT,
    play_id         INTEGER NOT NULL,
    player_id       INTEGER NOT NULL,
    character_id    INTEGER,
    score           INTEGER DEFAULT 0,
    placement       INTEGER,
    is_winner       BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    FOREIGN KEY (play_id)       REFERENCES game_plays(play_id)             ON DELETE CASCADE,
    FOREIGN KEY (player_id)     REFERENCES players(player_id)              ON DELETE CASCADE,
    FOREIGN KEY (character_id)  REFERENCES game_characters(character_id)   ON DELETE SET NULL
);

CREATE INDEX idx_players_play_play_id   ON players_play(play_id);
CREATE INDEX idx_players_play_player_id ON players_play(player_id);
```

### 7. Player Statistics View
Computes player statistics dynamically from `players_play` (created/updated in migrations 007 and 013).

```sql
CREATE VIEW player_statistics AS
SELECT
    p.player_id,
    p.player_name,
    p.pseudo,
    p.avatar,
    p.favorite_game,
    p.created_at,
    COUNT(DISTINCT sp.play_id)                                              AS games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END)                           AS wins,
    COALESCE(SUM(sp.score), 0)                                             AS total_score,
    COALESCE(AVG(sp.score), 0)                                             AS average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 /
     NULLIF(COUNT(DISTINCT sp.play_id), 0))                                AS win_percentage
FROM players p
LEFT JOIN players_play sp ON p.player_id = sp.player_id
GROUP BY p.player_id;
```

### 8. Game Statistics View
Computes game statistics dynamically from `game_plays` and `players_play` (created/updated in migrations 007 and 013).

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
    g.created_at,
    COUNT(DISTINCT gp.play_id)                                                          AS times_played,
    (SELECT COUNT(DISTINCT pp.player_id)
     FROM players_play pp
     WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id))    AS unique_players,
    (SELECT COALESCE(AVG(pp.score), 0)
     FROM players_play pp
     WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id))    AS average_score,
    (SELECT COALESCE(AVG(gp2.duration_minutes), 0)
     FROM game_plays gp2 WHERE gp2.game_id = g.game_id)                                AS average_duration
FROM games g
LEFT JOIN game_plays gp ON g.game_id = gp.game_id
GROUP BY g.game_id;
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

CREATE INDEX idx_labels_locale ON labels(locale);
```

**Usage:** `GET /api/v1/labels?locale=fr` returns all labels for the requested locale. Offline fallback via `src/shared/i18n/en.json`. Labels added/modified only via numbered migrations (011–027).

### 10. Refresh Tokens Table
Stores hashed refresh tokens for JWT rotation.

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT    NOT NULL UNIQUE,                        -- SHA-256 hash of the raw token
    role       TEXT    NOT NULL CHECK (role IN ('admin', 'user')),
    family_id  TEXT    NOT NULL,                               -- groups related tokens for theft detection
    expires_at INTEGER NOT NULL,                               -- Unix timestamp
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_refresh_tokens_hash   ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);
```

**Mechanism:** On each refresh, the old token row is deleted and a new one is inserted. If a token from a known family_id is presented but not found (already rotated), the entire family is revoked (theft detection).

### 11. BGG Catalog Table
Local catalog containing all BGG games, imported from BoardGameGeek's monthly CSV dump.

```sql
CREATE TABLE IF NOT EXISTS bgg_catalog (
    bgg_id              INTEGER PRIMARY KEY,
    name                TEXT    NOT NULL,
    year_published      INTEGER,
    is_expansion        INTEGER NOT NULL DEFAULT 0,
    rank                INTEGER,
    bgg_rating          REAL,
    users_rated         INTEGER,
    abstracts_rank      INTEGER,
    cgs_rank            INTEGER,
    childrensgames_rank INTEGER,
    familygames_rank    INTEGER,
    partygames_rank     INTEGER,
    strategygames_rank  INTEGER,
    thematic_rank       INTEGER,
    wargames_rank       INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bgg_catalog_name ON bgg_catalog(name);
```

**Usage:** Populated via `POST /api/v1/bgg/import-catalog` (CSV admin upload in Settings). BGG search queries `bgg_catalog` + `bgg_catalog_language` locally. On clicking a result, `getGameDetails(bgg_id)` calls the geekdo API for full metadata.

**Source:** `boardgames_ranks.csv` — monthly BGG dump (~175k rows, columns: id, name, yearpublished, rank, bayesaverage, is_expansion + sub-category ranks).

### 12. BGG Catalog Language Table
Denormalized table storing localized names and ranking data per BGG game. One row per `bgg_id` with a column per language (not a locale-normalized table).

```sql
CREATE TABLE IF NOT EXISTS bgg_catalog_language (
    bgg_id              INTEGER PRIMARY KEY,
    name_en             TEXT    NOT NULL,   -- English name (from BGG)
    name_fr             TEXT,               -- French name (Wikidata / manual enrichment)
    name_es             TEXT,               -- Spanish name (Wikidata / manual enrichment)
    year_published      INTEGER,
    is_expansion        INTEGER NOT NULL DEFAULT 0,
    rank                INTEGER,
    bgg_rating          REAL,
    users_rated         INTEGER,
    abstracts_rank      INTEGER,
    cgs_rank            INTEGER,
    childrensgames_rank INTEGER,
    familygames_rank    INTEGER,
    partygames_rank     INTEGER,
    strategygames_rank  INTEGER,
    thematic_rank       INTEGER,
    wargames_rank       INTEGER,
    thumbnail           TEXT                -- BGG thumbnail URL (migration 026)
);

CREATE INDEX idx_bgg_catalog_language_name_en ON bgg_catalog_language(name_en);
CREATE INDEX idx_bgg_catalog_language_name_fr ON bgg_catalog_language(name_fr);
CREATE INDEX idx_bgg_catalog_language_name_es ON bgg_catalog_language(name_es);
```

**Usage:** Consulted during BGG search to surface localized names. Populated by the BGG catalog import script and enriched via `POST /api/v1/bgg/enrich-names` (admin, Wikidata SPARQL). `thumbnail` is populated during import and surfaced via `BGGSearchResult.thumbnail`.

### 13. Import / Export Log Table
Single-row table (always `id = 1`) logging the latest data management operations.

```sql
CREATE TABLE IF NOT EXISTS log_import (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bgg_catalog_imported_at TIMESTAMP,
    data_exported_at        TIMESTAMP,
    data_imported_at        TIMESTAMP
);
```

**DatabaseManager methods:** `getImportLog()`, `updateImportLog(field)`

## Indexes Summary

```sql
-- players
CREATE UNIQUE INDEX idx_players_pseudo          ON players(pseudo COLLATE NOCASE);

-- games
CREATE INDEX idx_games_bgg_id                   ON games(bgg_id);
CREATE INDEX idx_game_expansions_game_id        ON game_expansions(game_id);
CREATE INDEX idx_game_characters_game_id        ON game_characters(game_id);

-- plays
CREATE INDEX idx_game_plays_game_id             ON game_plays(game_id);
CREATE INDEX idx_game_plays_date                ON game_plays(play_date);
CREATE INDEX idx_players_play_play_id           ON players_play(play_id);
CREATE INDEX idx_players_play_player_id         ON players_play(player_id);

-- bgg
CREATE INDEX idx_bgg_catalog_name               ON bgg_catalog(name);
CREATE INDEX idx_bgg_catalog_language_name_en   ON bgg_catalog_language(name_en);
CREATE INDEX idx_bgg_catalog_language_name_fr   ON bgg_catalog_language(name_fr);
CREATE INDEX idx_bgg_catalog_language_name_es   ON bgg_catalog_language(name_es);

-- labels & tokens
CREATE INDEX idx_labels_locale                  ON labels(locale);
CREATE INDEX idx_refresh_tokens_hash            ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_family          ON refresh_tokens(family_id);
```

## Sample Data Relationships

### Example Player Record
```json
{
  "player_id": 1,
  "player_name": "Jane",
  "pseudo": "jane42",
  "avatar": "https://example.com/avatar.jpg",
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
  "supports_competitive": true,
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

## Migration Notes

- Never modify an already-applied migration file — create a new numbered file
- The `DatabaseConnection.ts` runner checks `MAX(version)` in `schema_version` and applies missing files in an atomic transaction
- i18n labels are added/modified only via migrations (never directly in the DB)
- DB naming: `snake_case`, entity prefix (`game_plays`, `players_play`)
- Views are recreated whenever a referenced table is renamed (to avoid SQLite view invalidation errors)
- Wikidata enrichment (`bgg_catalog_language`) can be re-triggered manually from Settings (admin)
