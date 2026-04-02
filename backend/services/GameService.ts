import type { GameRepository } from '../repositories/GameRepository'
import type {
  Game, GameExpansion, GameCharacter,
  CreateGameRequest, UpdateGameRequest,
} from '@shared/types'

export class GameService {
  constructor(private gameRepo: GameRepository) {}

  getAll(): Game[] {
    const games = this.gameRepo.findAll()
    return games.map(g => ({
      ...g,
      expansions: g.has_expansion ? this.gameRepo.findExpansions(g.game_id) : [],
      characters: g.has_characters ? this.gameRepo.findCharacters(g.game_id) : [],
    }))
  }

  getById(id: number): Game | undefined {
    const game = this.gameRepo.findById(id)
    if (!game) return undefined
    return {
      ...game,
      expansions: this.gameRepo.findExpansions(id),
      characters: this.gameRepo.findCharacters(id),
    }
  }

  create(data: CreateGameRequest): Game {
    let id: number
    try {
      id = this.gameRepo.create(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('UNIQUE constraint failed')) throw new Error('duplicate_game')
      throw e
    }
    if (data.expansions?.length) {
      for (const exp of data.expansions) this.gameRepo.createExpansion(id, exp)
    }
    if (data.characters?.length) {
      for (const ch of data.characters) this.gameRepo.createCharacter(id, ch)
    }
    return this.getById(id)!
  }

  update(id: number, data: UpdateGameRequest): Game | undefined {
    this.gameRepo.update(id, data)
    return this.getById(id)
  }

  delete(id: number): void {
    this.gameRepo.delete(id)
  }

  addExpansion(gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): GameExpansion {
    const id = this.gameRepo.createExpansion(gameId, data)
    return { ...data, expansion_id: id, game_id: gameId }
  }

  deleteExpansion(expansionId: number): void {
    this.gameRepo.deleteExpansion(expansionId)
  }

  addCharacter(gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): GameCharacter {
    const id = this.gameRepo.createCharacter(gameId, data)
    return { ...data, character_id: id, game_id: gameId }
  }

  deleteCharacter(characterId: number): void {
    this.gameRepo.deleteCharacter(characterId)
  }
}
