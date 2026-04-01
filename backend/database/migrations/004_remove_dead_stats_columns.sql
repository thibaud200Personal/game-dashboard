-- Remove 4 dead computed columns from players table.
-- games_played, wins, total_score, average_score are derived from session_players
-- via the player_statistics view. Storing them in the players table creates
-- a diverging source of truth.
--
-- This migration rebuilds the players table without those columns.
-- Guard in DatabaseConnection.ts skips this if games_played column is already absent.

PRAGMA foreign_keys = OFF;

CREATE TABLE players_new (
    player_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name   TEXT NOT NULL,
    pseudo        TEXT NOT NULL DEFAULT '',
    avatar        TEXT,
    favorite_game TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO players_new (player_id, player_name, pseudo, avatar, favorite_game, created_at, updated_at)
SELECT
    player_id,
    player_name,
    COALESCE(pseudo, player_name),
    avatar,
    favorite_game,
    created_at,
    updated_at
FROM players;

DROP TABLE players;
ALTER TABLE players_new RENAME TO players;

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_pseudo ON players(pseudo COLLATE NOCASE);

CREATE TRIGGER IF NOT EXISTS update_players_timestamp
    AFTER UPDATE ON players
    BEGIN
        UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE player_id = NEW.player_id;
    END;

PRAGMA foreign_keys = ON;
