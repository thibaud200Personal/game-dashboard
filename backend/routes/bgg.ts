import { Router } from 'express'
import * as path from 'path'
import * as fs from 'fs'
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
    res.json(bggRepo.getImportLog())
  })

  router.post('/import-catalog', requireRole('admin'), async (req: AuthRequest, res: Response) => {
    const importDir = path.join(__dirname, '../database/import')
    const csvPath = path.join(importDir, 'boardgames_ranks.csv')
    if (!fs.existsSync(csvPath)) {
      res.status(404).json({ error: 'CSV not found at backend/database/import/boardgames_ranks.csv' })
      return
    }
    const csvText = fs.readFileSync(csvPath, 'utf8')
    const rows = parseBggCsv(csvText)
    bggRepo.upsertCatalogBatch(rows)
    bggRepo.recordCatalogImport()
    res.json({ imported: rows.length })
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
