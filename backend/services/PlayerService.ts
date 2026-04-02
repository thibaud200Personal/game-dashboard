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
    const id = this.playerRepo.create(data)
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
