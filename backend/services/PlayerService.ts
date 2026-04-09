import type { PlayerRepository } from '../repositories/PlayerRepository'
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types'

export class PlayerService {
  constructor(private playerRepo: PlayerRepository) {}

  getAll(): Player[] {
    return this.playerRepo.findAll()
  }

  getById(id: number): Player | undefined {
    return this.playerRepo.findById(id)
  }

  getAllStatistics(): PlayerStatistics[] {
    return this.playerRepo.findAllStatistics()
  }

  create(data: CreatePlayerRequest): Player {
    let id: number
    try {
      id = this.playerRepo.create(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('UNIQUE constraint failed: players.pseudo')) throw new Error('duplicate_pseudo')
      throw e
    }
    return this.playerRepo.findById(id)!
  }

  update(id: number, data: UpdatePlayerRequest): Player | undefined {
    this.playerRepo.update(id, data)
    return this.playerRepo.findById(id)
  }

  delete(id: number): void {
    this.playerRepo.delete(id)
  }
}
