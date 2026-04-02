import { Router } from 'express'
import type { SessionService } from '../services/SessionService'
import { validateBody } from '../validation/middleware'
import { CreateSessionSchema } from '../validation/schemas'

export function createSessionRouter(sessionService: SessionService): Router {
  const router = Router()

  router.get('/', (_req, res) => res.json(sessionService.getAllSessions()))

  router.post('/', validateBody(CreateSessionSchema), (req, res) => {
    const session = sessionService.createSession(req.body)
    res.status(201).json(session)
  })

  router.delete('/:id', (req, res) => {
    sessionService.deleteSession(Number(req.params.id))
    res.status(204).send()
  })

  return router
}
