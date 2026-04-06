import { Router, text } from 'express'
import type { Response } from 'express'
import type { BGGRepository } from '../repositories/BGGRepository'
import type { AuthRequest } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { parseBggCsv } from '../database/parseBggCsv'
import { bggService } from '../bggService'
import { logger } from '../server'

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'
const PAGE_SIZE = 5000

let enrichmentRunning = false

async function runEnrichment(bggRepo: BGGRepository): Promise<void> {
  let offset = 0
  let total = 0

  try {
    while (true) {
      const sparql = `
        SELECT DISTINCT ?bggId ?nameEn ?nameFr ?nameEs WHERE {
          ?item wdt:P2339 ?bggId .
          OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn) = "en") }
          OPTIONAL { ?item rdfs:label ?nameFr FILTER(LANG(?nameFr) = "fr") }
          OPTIONAL { ?item rdfs:label ?nameEs FILTER(LANG(?nameEs) = "es") }
        } LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `
      const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`
      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'BoardGameDashboard/1.0',
        },
      })

      if (!resp.ok) {
        logger.error({ status: resp.status }, 'Wikidata SPARQL error')
        break
      }

      const json = await resp.json() as { results: { bindings: Array<{ bggId: { value: string }; nameEn?: { value: string }; nameFr?: { value: string }; nameEs?: { value: string } }> } }
      const bindings = json.results.bindings

      if (bindings.length === 0) break

      const rows = bindings.map(b => ({
        bgg_id: parseInt(b.bggId.value, 10),
        name_en: b.nameEn?.value,
        name_fr: b.nameFr?.value,
        name_es: b.nameEs?.value,
      })).filter(r => !isNaN(r.bgg_id))

      bggRepo.upsertLanguageNames(rows)
      total += rows.length
      logger.info({ offset, rows: rows.length, total }, 'Wikidata enrichment page done')

      if (bindings.length < PAGE_SIZE) break

      offset += PAGE_SIZE
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    logger.info({ total }, 'Wikidata enrichment complete')
  } finally {
    enrichmentRunning = false
  }
}

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

  // POST /api/v1/bgg/sync-langue — admin only
  // Copie les nouvelles entrées de bgg_catalog vers bgg_catalog_langue
  router.post('/sync-langue', requireRole('admin'), (_req: AuthRequest, res: Response) => {
    const inserted = bggRepo.syncCatalogToLangue()
    res.json({ inserted, ...bggRepo.getLangueStatus() })
  })

  router.get('/langue-status', requireRole('admin'), (_req: AuthRequest, res: Response) => {
    res.json(bggRepo.getLangueStatus())
  })

  // POST /api/v1/bgg/enrich-names — admin only
  // Lance l'enrichissement Wikidata (noms FR/ES) en arrière-plan
  router.post('/enrich-names', requireRole('admin'), (_req: AuthRequest, res: Response) => {
    if (enrichmentRunning) {
      res.status(409).json({ error: 'Enrichment already running' })
      return
    }
    enrichmentRunning = true
    void runEnrichment(bggRepo)
    res.json({ started: true })
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
