import { describe, it, expect } from 'vitest'
import type { Player, Game, GamePlay } from '@shared/types'

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

  it('GamePlay supports hybrid play_type', () => {
    const play: Partial<GamePlay> = { play_type: 'hybrid' }
    expect(play.play_type).toBe('hybrid')
  })
})
