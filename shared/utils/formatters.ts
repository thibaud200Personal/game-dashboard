import type { Game } from '../types'

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
