import { describe, it, expect } from 'vitest'
import type { Player, Game, GameSession } from '@shared/types'

describe('shared/types', () => {
  it('Player type has no dead stats columns', () => {
    const player: Player = {
      player_id: 1,
      player_name: 'Alice',
      pseudo: 'alice',
      favorite_game: 'Gloomhaven',
      created_at: new Date(),
    }
    // games_played, wins, total_score, average_score must NOT exist on base Player
    expect('games_played' in player).toBe(false)
    expect('wins' in player).toBe(false)
  })

  it('Game type has no game_type field', () => {
    const game: Partial<Game> = { game_id: 1, name: 'Wingspan' }
    expect('game_type' in game).toBe(false)
  })

  it('GameSession supports hybrid session_type', () => {
    const session: Partial<GameSession> = { session_type: 'hybrid' }
    expect(session.session_type).toBe('hybrid')
  })
})
