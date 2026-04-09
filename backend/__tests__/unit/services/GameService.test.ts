// backend/__tests__/unit/services/GameService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { GameRepository } from '../../../repositories/GameRepository'
import { GameService } from '../../../services/GameService'
import type { CreateGameRequest } from '@shared/types'

let conn: DatabaseConnection
let service: GameService

const catan: CreateGameRequest = {
  name: 'Catan', min_players: 3, max_players: 4,
  supports_cooperative: false, supports_competitive: true,
  supports_campaign: false, supports_hybrid: false,
  has_expansion: false, has_characters: false, is_expansion: false,
}

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  service = new GameService(new GameRepository(conn.db))
})
afterEach(() => conn.close())

describe('GameService.create', () => {
  it('crée un jeu et retourne l\'objet complet', () => {
    const game = service.create(catan)
    expect(game.game_id).toBeTruthy()
    expect(game.name).toBe('Catan')
    expect(game.expansions).toEqual([])
    expect(game.characters).toEqual([])
  })

  it('crée avec expansions et characters inline', () => {
    const game = service.create({
      ...catan,
      has_expansion: true,
      has_characters: true,
      expansions: [{ name: 'Seafarers', bgg_expansion_id: 999 }],
      characters: [{ character_key: 'knight', name: 'Chevalier', abilities: [] }],
    })
    expect(game.expansions).toHaveLength(1)
    expect(game.characters).toHaveLength(1)
  })

  it('lève duplicate_game si bgg_id déjà présent', () => {
    service.create({ ...catan, bgg_id: 174430 })
    expect(() => service.create({ ...catan, name: 'Clone', bgg_id: 174430 })).toThrow('duplicate_game')
  })
})

describe('GameService.update', () => {
  it('met à jour le nom et retourne le jeu', () => {
    const game = service.create(catan)
    const updated = service.update(game.game_id, { name: 'Catan Updated' })
    expect(updated?.name).toBe('Catan Updated')
  })

  it('retourne undefined si id inexistant', () => {
    const result = service.update(9999, { name: 'Ghost' })
    expect(result).toBeUndefined()
  })
})

describe('GameService.delete', () => {
  it('supprime le jeu', () => {
    const game = service.create(catan)
    service.delete(game.game_id)
    expect(service.getById(game.game_id)).toBeUndefined()
  })
})

describe('GameService.addExpansion / deleteExpansion', () => {
  it('ajoute et supprime une expansion', () => {
    const game = service.create({ ...catan, has_expansion: true })
    const exp = service.addExpansion(game.game_id, { name: 'Seafarers', bgg_expansion_id: 5 })
    expect(exp.expansion_id).toBeTruthy()
    service.deleteExpansion(exp.expansion_id)
    const updated = service.getById(game.game_id)
    expect(updated?.expansions).toHaveLength(0)
  })
})

describe('GameService.addCharacter / deleteCharacter', () => {
  it('ajoute et supprime un character', () => {
    const game = service.create({ ...catan, has_characters: true })
    const ch = service.addCharacter(game.game_id, {
      character_key: 'brute', name: 'Brute', abilities: ['Move'],
    })
    expect(ch.character_id).toBeTruthy()
    service.deleteCharacter(ch.character_id)
    const updated = service.getById(game.game_id)
    expect(updated?.characters).toHaveLength(0)
  })
})
