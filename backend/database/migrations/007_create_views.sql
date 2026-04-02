-- Create statistics views after all table-rebuild migrations have completed.
-- Placed last so DROP TABLE / RENAME TABLE operations in 004-006 don't
-- cause SQLite view invalidation errors.

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
    COUNT(DISTINCT sp.session_id)                                                          AS games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END)                                          AS wins,
    COALESCE(SUM(sp.score), 0)                                                             AS total_score,
    COALESCE(AVG(sp.score), 0)                                                             AS average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 /
     NULLIF(COUNT(DISTINCT sp.session_id), 0))                                             AS win_percentage
FROM players p
LEFT JOIN session_players sp ON p.player_id = sp.player_id
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
    COUNT(DISTINCT gs.session_id)                                                AS times_played,
    (SELECT COUNT(DISTINCT sp.player_id)
     FROM session_players sp
     WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) AS unique_players,
    (SELECT COALESCE(AVG(sp.score), 0)
     FROM session_players sp
     WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) AS average_score,
    (SELECT COALESCE(AVG(gs2.duration_minutes), 0)
     FROM game_sessions gs2 WHERE gs2.game_id = g.game_id)                      AS average_duration
FROM games g
LEFT JOIN game_sessions gs ON g.game_id = gs.game_id
GROUP BY g.game_id;
