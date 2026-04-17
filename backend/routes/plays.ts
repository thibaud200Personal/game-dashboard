import { Router } from 'express'
import type { PlayService } from '../services/PlayService'
import { validateBody } from '../validation/middleware'
import { CreateSessionSchema } from '../validation/schemas'

export function createPlayRouter(playService: PlayService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(playService.getAllPlays()))

  router.post('/', validateBody(CreateSessionSchema), (req, res) => {
    const play = playService.createPlay(req.body)
    res.status(201).json(play)
  })

  router.delete('/:id', (req, res) => {
    playService.deletePlay(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
