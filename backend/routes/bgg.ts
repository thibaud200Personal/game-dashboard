import { Router, text } from 'express'
import type { Response } from 'express'
import type { BGGRepository } from '../repositories/BGGRepository'
import type { AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { parseBggCsv } from '../database/parseBggCsv'
import { bggService } from '../bggService'

export function createBggRouter(bggRepo: BGGRepository): Router {
  const router = Router()

  router.get('/search', (req, res) => {
    const query = String(req.query.q ?? '').trim()
    if (!query) { res.json([]); return }
    res.json(bggRepo.search(query))
  })

  router.get('/import-status', (_req, res) => {
    res.json(bggRepo.getCatalogStatus())
  })

  router.post('/import-catalog', requireRole('admin'), text({ limit: '25mb' }), async (req: AuthRequest, res: Response) => {
    const csvText = typeof req.body === 'string' ? req.body : ''
    if (!csvText) {
      res.status(400).json({ error: 'CSV body required' })
      return
    }
    const rows = parseBggCsv(csvText)
    bggRepo.upsertCatalogBatch(rows)
    bggRepo.recordCatalogImport()
    res.json({ count: rows.length })
  })

  router.get('/game/:bggId', async (req, res) => {
    try {
      const data = await bggService.getGameDetails(Number(req.params.bggId))
      res.json(data)
    } catch {
      res.status(502).json({ error: 'BGG API unavailable' })
    }
  })

  return router
}
