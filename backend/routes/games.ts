import { Router } from 'express'
import { z } from 'zod'
import type { GameService } from '../services/GameService'
import { validateBody, validateParams } from '../validation/middleware'
import { CreateGameSchema, UpdateGameSchema } from '../validation/schemas'
import { AppError } from '../middleware/errorHandler'

const IdParam = z.object({ id: z.coerce.number().int().positive() })

export function createGameRouter(gameService: GameService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(gameService.getAll()))

  router.get('/:id', validateParams(IdParam), (req, res) => {
    const game = gameService.getById(Number(req.params.id))
    if (!game) throw new AppError(404, 'Game not found')
    res.json(game)
  })

  router.post('/', validateBody(CreateGameSchema), (req, res) => {
    res.status(201).json(gameService.create(req.body))
  })

  router.put('/:id', validateParams(IdParam), validateBody(UpdateGameSchema), (req, res) => {
    const game = gameService.update(Number(req.params.id), req.body)
    if (!game) throw new AppError(404, 'Game not found')
    res.json(game)
  })

  router.delete('/:id', validateParams(IdParam), (req, res) => {
    gameService.delete(Number(req.params.id))
    res.status(204).send()
  })

  // Expansions
  router.post('/:id/expansions', validateParams(IdParam), (req, res) => {
    const exp = gameService.addExpansion(Number(req.params.id), req.body)
    res.status(201).json(exp)
  })

  router.delete('/:id/expansions/:expId', (req, res) => {
    gameService.deleteExpansion(Number(req.params.expId))
    res.status(204).send()
  })

  // Characters
  router.post('/:id/characters', validateParams(IdParam), (req, res) => {
    const ch = gameService.addCharacter(Number(req.params.id), req.body)
    res.status(201).json(ch)
  })

  router.delete('/:id/characters/:charId', (req, res) => {
    gameService.deleteCharacter(Number(req.params.charId))
    res.status(204).send()
  })

  return router
}
