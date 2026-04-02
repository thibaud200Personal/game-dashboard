-- Remove deprecated game_type column from games table.
-- game_type ('competitive'|'cooperative'|'campaign'|'hybrid') is made redundant
-- by the four boolean columns: supports_cooperative, supports_competitive,
-- supports_campaign, supports_hybrid.
--
-- Guard in DatabaseConnection.ts skips this if game_type column is already absent.

PRAGMA foreign_keys = OFF;

CREATE TABLE games_new (
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

INSERT INTO games_new SELECT
    game_id, bgg_id, thumbnail, playing_time, min_playtime, max_playtime,
    categories, mechanics, families, name, description, image,
    min_players, max_players, duration, difficulty, category,
    year_published, publisher, designer, bgg_rating, weight, age_min,
    supports_cooperative, supports_competitive, supports_campaign, supports_hybrid,
    has_expansion, has_characters, is_expansion, created_at, updated_at
FROM games;

DROP TABLE games;
ALTER TABLE games_new RENAME TO games;

CREATE INDEX IF NOT EXISTS idx_games_bgg_id ON games(bgg_id);

CREATE TRIGGER IF NOT EXISTS update_games_timestamp
    AFTER UPDATE ON games
    BEGIN
        UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE game_id = NEW.game_id;
    END;

PRAGMA foreign_keys = ON;
