import { Router } from 'express'
import type { PlayService } from '../services/PlayService'
import { validateBody } from '../validation/middleware'
import { CreateSessionSchema } from '../validation/schemas'

export function createPlayRouter(playService: PlayService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(playService.getAllSessions()))

  router.post('/', validateBody(CreateSessionSchema), (req, res) => {
    const session = playService.createSession(req.body)
    res.status(201).json(session)
  })

  router.delete('/:id', (req, res) => {
    playService.deleteSession(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
