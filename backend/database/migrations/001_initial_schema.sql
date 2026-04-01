-- Players table (no computed stats columns — those live in the player_statistics view)
CREATE TABLE IF NOT EXISTS players (
    player_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT    NOT NULL,
    pseudo      TEXT    NOT NULL DEFAULT '',
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

-- Views are created in 007_create_views.sql, after all table-rebuild migrations,
-- to avoid SQLite view invalidation errors during table DROP/RENAME operations.
