// backend/__tests__/unit/services/PlayerService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { PlayerRepository } from '../../../repositories/PlayerRepository'
import { PlayerService } from '../../../services/PlayerService'

let conn: DatabaseConnection
let service: PlayerService

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  service = new PlayerService(new PlayerRepository(conn.db))
})
afterEach(() => conn.close())

describe('PlayerService.create', () => {
  it('crée un joueur et le retourne', () => {
    const p = service.create({ player_name: 'Alice', pseudo: 'alice' })
    expect(p.player_id).toBeTruthy()
    expect(p.player_name).toBe('Alice')
  })

  it('lance duplicate_pseudo quand un pseudo existe déjà', () => {
    service.create({ player_name: 'Alice', pseudo: 'alice' })
    expect(() => {
      service.create({ player_name: 'Bob', pseudo: 'alice' })
    }).toThrow('duplicate_pseudo')
  })
})

describe('PlayerService.update', () => {
  it('met à jour le pseudo', () => {
    const p = service.create({ player_name: 'Alice', pseudo: 'alice' })
    const updated = service.update(p.player_id, { player_name: 'Alice', pseudo: 'alice2' })
    expect(updated?.pseudo).toBe('alice2')
  })

  it('retourne undefined si id inexistant', () => {
    expect(service.update(9999, { player_name: 'Ghost' })).toBeUndefined()
  })
})

describe('PlayerService.delete', () => {
  it('supprime le joueur', () => {
    const p = service.create({ player_name: 'Alice', pseudo: 'alice' })
    service.delete(p.player_id)
    expect(service.getById(p.player_id)).toBeUndefined()
  })
})

describe('PlayerService.getAll / getAllStatistics', () => {
  it('retourne tous les joueurs', () => {
    service.create({ player_name: 'Alice', pseudo: 'alice' })
    service.create({ player_name: 'Bob', pseudo: 'bob' })
    expect(service.getAll()).toHaveLength(2)
  })

  it('getAllStatistics inclut les stats calculées', () => {
    service.create({ player_name: 'Alice', pseudo: 'alice' })
    const stats = service.getAllStatistics()
    expect(stats[0].games_played).toBe(0)
    expect(stats[0].wins).toBe(0)
  })
})
