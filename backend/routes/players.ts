import { Router } from 'express'
import { z } from 'zod'
import type { PlayerService } from '../services/PlayerService'
import { validateBody, validateParams } from '../validation/middleware'
import { CreatePlayerSchema, UpdatePlayerSchema } from '../validation/schemas'
import { AppError } from '../middleware/errorHandler'

const IdParam = z.object({ id: z.coerce.number().int().positive() })

export function createPlayerRouter(playerService: PlayerService): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json(playerService.getAllStatistics())
  })

  router.get('/:id', validateParams(IdParam), (req, res) => {
    const player = playerService.getById(Number(req.params.id))
    if (!player) throw new AppError(404, 'Player not found')
    res.json(player)
  })

  router.post('/', validateBody(CreatePlayerSchema), (req, res) => {
    const player = playerService.create(req.body)
    res.status(201).json(player)
  })

  router.put('/:id', validateParams(IdParam), validateBody(UpdatePlayerSchema), (req, res) => {
    const player = playerService.update(Number(req.params.id), req.body)
    if (!player) throw new AppError(404, 'Player not found')
    res.json(player)
  })

  router.delete('/:id', validateParams(IdParam), (req, res) => {
    playerService.delete(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
