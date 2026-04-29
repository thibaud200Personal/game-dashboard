import type Database from 'better-sqlite3'
import type { PlayerStatistics, GameStatistics, DashboardStats, PlayerRecentPlay } from '@shared/types'

export class StatsRepository {
  constructor(private db: Database.Database) {}

  getDashboard(): DashboardStats {
    const players  = (this.db.prepare('SELECT COUNT(*) as n FROM players').get() as { n: number }).n
    const games    = (this.db.prepare('SELECT COUNT(*) as n FROM games WHERE is_expansion = 0').get() as { n: number }).n
    const plays  = (this.db.prepare('SELECT COUNT(*) as n FROM game_plays').get() as { n: number }).n
    const avgRow = this.db.prepare(
      'SELECT COALESCE(AVG(duration_minutes), 0) as avg FROM game_plays WHERE duration_minutes IS NOT NULL'
    ).get() as { avg: number }

    return {
      total_players: players,
      total_games: games,
      total_plays: plays,
      average_play_duration: Math.round(avgRow.avg),
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

  getPlayerRecentPlays(playerId: number, limit = 10): PlayerRecentPlay[] {
    return this.db.prepare(`
      SELECT
        gp.play_id,
        g.game_id,
        g.name        AS game_name,
        pp.player_id,
        p.player_name,
        COALESCE(pp.score, 0) AS score,
        pp.is_winner,
        gp.play_date
      FROM players_play pp
      JOIN game_plays gp ON pp.play_id = gp.play_id
      JOIN games g       ON gp.game_id  = g.game_id
      JOIN players p     ON pp.player_id = p.player_id
      WHERE pp.player_id = ?
      ORDER BY gp.play_date DESC
      LIMIT ?
    `).all(playerId, limit) as PlayerRecentPlay[]
  }
}
