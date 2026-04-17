-- Migration 013: Renommage sessions → plays
-- Raison : "session" est réservé aux sessions utilisateur JWT, une partie de jeu s'appelle "play"

-- 1. Renommer les tables
ALTER TABLE game_sessions RENAME TO game_plays;
ALTER TABLE session_players RENAME TO players_play;

-- 2. Renommer les colonnes de game_plays
ALTER TABLE game_plays RENAME COLUMN session_id   TO play_id;
ALTER TABLE game_plays RENAME COLUMN session_date TO play_date;
ALTER TABLE game_plays RENAME COLUMN session_type TO play_type;

-- 3. Renommer les colonnes de players_play
ALTER TABLE players_play RENAME COLUMN session_player_id TO players_play_id;
ALTER TABLE players_play RENAME COLUMN session_id        TO play_id;

-- 4. Mettre à jour les index
DROP INDEX IF EXISTS idx_game_sessions_game_id;
DROP INDEX IF EXISTS idx_game_sessions_date;
DROP INDEX IF EXISTS idx_session_players_session_id;
DROP INDEX IF EXISTS idx_session_players_player_id;

CREATE INDEX IF NOT EXISTS idx_game_plays_game_id      ON game_plays(game_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_date         ON game_plays(play_date);
CREATE INDEX IF NOT EXISTS idx_players_play_play_id    ON players_play(play_id);
CREATE INDEX IF NOT EXISTS idx_players_play_player_id  ON players_play(player_id);

-- 5. Recréer les vues (elles référençaient les anciens noms)
DROP VIEW IF EXISTS player_statistics;
DROP VIEW IF EXISTS game_statistics;

CREATE VIEW player_statistics AS
SELECT
    p.player_id,
    p.player_name,
    p.pseudo,
    p.avatar,
    p.favorite_game,
    p.created_at,
    COUNT(DISTINCT sp.play_id)                                                             AS games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END)                                          AS wins,
    COALESCE(SUM(sp.score), 0)                                                             AS total_score,
    COALESCE(AVG(sp.score), 0)                                                             AS average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 /
     NULLIF(COUNT(DISTINCT sp.play_id), 0))                                                AS win_percentage
FROM players p
LEFT JOIN players_play sp ON p.player_id = sp.player_id
GROUP BY p.player_id;

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
    COUNT(DISTINCT gp.play_id)                                                   AS times_played,
    (SELECT COUNT(DISTINCT pp.player_id)
     FROM players_play pp
     WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id)) AS unique_players,
    (SELECT COALESCE(AVG(pp.score), 0)
     FROM players_play pp
     WHERE pp.play_id IN (SELECT play_id FROM game_plays WHERE game_id = g.game_id)) AS average_score,
    (SELECT COALESCE(AVG(gp2.duration_minutes), 0)
     FROM game_plays gp2 WHERE gp2.game_id = g.game_id)                          AS average_duration
FROM games g
LEFT JOIN game_plays gp ON g.game_id = gp.game_id
GROUP BY g.game_id;
