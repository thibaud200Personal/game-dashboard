import { Router } from 'express'
import type { StatsService } from '../services/StatsService'
import { validateParams, validateQuery } from '../validation/middleware'
import { IdParamSchema, LimitQuerySchema } from '../validation/schemas'

export function createStatsRouter(statsService: StatsService): Router {
  const router = Router()

  router.get('/dashboard', (_req, res) => res.json(statsService.getDashboard()))

  router.get('/players', (_req, res) => res.json(statsService.getPlayerStats()))

  router.get('/players/:id', validateParams(IdParamSchema), (req, res) => {
    const stats = statsService.getPlayerStatsById(Number(req.params.id))
    if (!stats) { res.status(404).json({ error: 'Not found' }); return }
    res.json(stats)
  })

  router.get('/players/:id/recent-plays', validateParams(IdParamSchema), validateQuery(LimitQuerySchema), (req, res) => {
    const limit = req.query.limit as unknown as number
    res.json(statsService.getPlayerRecentPlays(Number(req.params.id), limit))
  })

  router.get('/games', (_req, res) => res.json(statsService.getGameStats()))

  router.get('/games/:id', validateParams(IdParamSchema), (req, res) => {
    const stats = statsService.getGameStatsById(Number(req.params.id))
    if (!stats) { res.status(404).json({ error: 'Not found' }); return }
    res.json(stats)
  })

  return router
}
