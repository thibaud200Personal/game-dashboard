import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'

let conn: DatabaseConnection
let repo: PlayerRepository

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new PlayerRepository(conn.db)
})

afterEach(() => conn.close())

describe('PlayerRepository', () => {
  it('creates and retrieves a player', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const player = repo.findById(id)
    expect(player?.player_name).toBe('Alice')
    expect(player?.pseudo).toBe('alice')
  })

  it('findAll returns all players ordered by name', () => {
    repo.create({ player_name: 'Zara', pseudo: 'zara' })
    repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const players = repo.findAll()
    expect(players[0].player_name).toBe('Alice')
  })

  it('update modifies player fields', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    repo.update(id, { player_name: 'Alicia', pseudo: 'alicia' })
    const updated = repo.findById(id)
    expect(updated?.player_name).toBe('Alicia')
  })

  it('delete removes player', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    repo.delete(id)
    expect(repo.findById(id)).toBeUndefined()
  })

  it('findStatistics returns computed stats from view', () => {
    const id = repo.create({ player_name: 'Alice', pseudo: 'alice' })
    const stats = repo.findStatistics(id)
    expect(stats?.games_played).toBe(0)
    expect(stats?.wins).toBe(0)
    expect(stats?.win_percentage).toBeNull()
  })

  it('findAllStatistics returns all players with stats', () => {
    repo.create({ player_name: 'Alice', pseudo: 'alice' })
    repo.create({ player_name: 'Bob', pseudo: 'bob' })
    expect(repo.findAllStatistics()).toHaveLength(2)
  })
})
