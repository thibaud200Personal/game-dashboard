-- Add 'hybrid' to session_type CHECK constraint in game_sessions.
-- SQLite does not support ALTER CONSTRAINT — the table must be recreated.
-- Guard in DatabaseConnection.ts skips this if the CHECK already includes 'hybrid'.
-- No-op on databases created with migration 001 (hybrid is already in the CHECK).

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
