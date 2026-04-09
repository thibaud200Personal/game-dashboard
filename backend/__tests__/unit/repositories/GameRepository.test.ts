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

describe('GameRepository — additional coverage', () => {
  it('update modifies game name and fields', () => {
    const id = repo.create(gloomhaven)
    repo.update(id, { name: 'Gloomhaven Second Edition', min_players: 1, max_players: 4 })
    const updated = repo.findById(id)
    expect(updated?.name).toBe('Gloomhaven Second Edition')
  })

  it('update does nothing if id does not exist', () => {
    expect(() => repo.update(9999, { name: 'Ghost' })).not.toThrow()
  })

  it('createCharacter + findCharacters + deleteCharacter', () => {
    const gameId = repo.create({ ...gloomhaven, has_characters: true })
    const charId = repo.createCharacter(gameId, {
      character_key: 'brute', name: 'Brute', abilities: ['Move 2', 'Attack 2'],
    })
    const chars = repo.findCharacters(gameId)
    expect(chars).toHaveLength(1)
    expect(chars[0].name).toBe('Brute')
    expect(chars[0].abilities).toEqual(['Move 2', 'Attack 2'])
    repo.deleteCharacter(charId)
    expect(repo.findCharacters(gameId)).toHaveLength(0)
  })

  it('deleteExpansion removes only the target expansion', () => {
    const gameId = repo.create({ ...gloomhaven, has_expansion: true })
    const expId = repo.createExpansion(gameId, { name: 'Forgotten Circles', bgg_expansion_id: 1001 })
    repo.createExpansion(gameId, { name: 'Jaws of the Lion', bgg_expansion_id: 1002 })
    repo.deleteExpansion(expId)
    const remaining = repo.findExpansions(gameId)
    expect(remaining).toHaveLength(1)
    expect(remaining[0].name).toBe('Jaws of the Lion')
  })

  it('duplicate bgg_id throws unique constraint error', () => {
    repo.create({ ...gloomhaven, bgg_id: 174430 })
    expect(() => repo.create({ ...gloomhaven, name: 'Clone', bgg_id: 174430 })).toThrow()
  })
})
