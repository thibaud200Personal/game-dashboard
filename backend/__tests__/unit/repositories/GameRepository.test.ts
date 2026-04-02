import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { GameRepository } from '../../../repositories/GameRepository'
import type { CreateGameRequest } from '@shared/types'

let conn: DatabaseConnection
let repo: GameRepository

const gloomhaven: CreateGameRequest = {
  name: 'Gloomhaven',
  min_players: 1,
  max_players: 4,
  supports_cooperative: true,
  supports_competitive: false,
  supports_campaign: true,
  supports_hybrid: false,
  has_expansion: true,
  has_characters: true,
  is_expansion: false,
}

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new GameRepository(conn.db)
})

afterEach(() => conn.close())

describe('GameRepository', () => {
  it('creates and retrieves a game', () => {
    const id = repo.create(gloomhaven)
    const game = repo.findById(id)
    expect(game?.name).toBe('Gloomhaven')
    expect(game?.supports_cooperative).toBe(true)
    expect(game?.supports_competitive).toBe(false)
  })

  it('findAll returns all games ordered by name', () => {
    repo.create({ ...gloomhaven, name: 'Wingspan' })
    repo.create(gloomhaven)
    const games = repo.findAll()
    expect(games[0].name).toBe('Gloomhaven')
  })

  it('booleans are properly coerced from SQLite integers', () => {
    const id = repo.create(gloomhaven)
    const game = repo.findById(id)
    expect(typeof game?.supports_cooperative).toBe('boolean')
    expect(typeof game?.has_expansion).toBe('boolean')
    expect(game?.is_expansion).toBe(false)
  })

  it('creates expansion linked to base game', () => {
    const gameId = repo.create(gloomhaven)
    repo.createExpansion(gameId, { name: 'Forgotten Circles', bgg_expansion_id: 9999 })
    const expansions = repo.findExpansions(gameId)
    expect(expansions).toHaveLength(1)
    expect(expansions[0].name).toBe('Forgotten Circles')
  })

  it('delete removes game and cascades to expansions', () => {
    const gameId = repo.create(gloomhaven)
    repo.createExpansion(gameId, { name: 'Forgotten Circles' })
    repo.delete(gameId)
    expect(repo.findById(gameId)).toBeUndefined()
    expect(repo.findExpansions(gameId)).toHaveLength(0)
  })

  it('stores and parses JSON fields correctly', () => {
    const id = repo.create({ ...gloomhaven, categories: ['Adventure', 'Fantasy'], mechanics: ['Dice Rolling'] })
    const game = repo.findById(id)
    expect(game?.categories).toEqual(['Adventure', 'Fantasy'])
    expect(game?.mechanics).toEqual(['Dice Rolling'])
  })
})
