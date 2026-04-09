import * as path from 'path'
import pino from 'pino'
import { DatabaseConnection } from '../database/DatabaseConnection'
import { BGGRepository } from '../repositories/BGGRepository'

const logger = pino({ level: 'info' })

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'
const PAGE_SIZE = 5000

function cleanWikidataValue(v: string | undefined): string | undefined {
  if (!v) return undefined
  const t = v.trim()
  return t.startsWith('"') && t.endsWith('"') && t.length > 2 ? t.slice(1, -1) : t
}

async function main(): Promise<void> {
  const conn = new DatabaseConnection(process.env.DB_PATH ?? path.join(__dirname, '../database/board_game_score.db'))
  const repo = new BGGRepository(conn.db)

  const status = repo.getLanguageStatus()
  logger.info(status, 'bgg_catalog_language status before enrichment')

  let offset = 0
  let total = 0
  let withFr = 0
  let withEs = 0

  logger.info('Wikidata enrichment starting')

  while (true) {
    const sparql = `
      SELECT ?bggId ?nameEn ?nameFr ?nameEs WHERE {
        ?item wdt:P2339 ?bggId .
        OPTIONAL { ?item rdfs:label ?nameEn . FILTER(LANG(?nameEn) = "en") }
        OPTIONAL { ?item rdfs:label ?nameFr . FILTER(LANG(?nameFr) = "fr") }
        OPTIONAL { ?item rdfs:label ?nameEs . FILTER(LANG(?nameEs) = "es") }
      } LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`

    let resp: Response
    try {
      resp = await fetch(url, {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'BoardGameDashboard/1.0',
        },
      })
    } catch (err) {
      logger.error({ err }, 'Wikidata fetch failed (network error)')
      break
    }

    if (!resp.ok) {
      logger.error({ status: resp.status, body: await resp.text() }, 'Wikidata SPARQL HTTP error')
      break
    }

    const json = await resp.json() as { results: { bindings: Array<{ bggId: { value: string }; nameEn?: { value: string }; nameFr?: { value: string }; nameEs?: { value: string } }> } }
    const bindings = json.results.bindings

    if (bindings.length === 0) {
      logger.info({ offset }, 'Empty page — enrichment complete')
      break
    }

    const rows = bindings.map(b => ({
      bgg_id: parseInt(b.bggId.value.trim(), 10),
      name_en: cleanWikidataValue(b.nameEn?.value),
      name_fr: cleanWikidataValue(b.nameFr?.value),
      name_es: cleanWikidataValue(b.nameEs?.value),
    })).filter(r => !isNaN(r.bgg_id))

    const pageFr = rows.filter(r => r.name_fr).length
    const pageEs = rows.filter(r => r.name_es).length
    withFr += pageFr
    withEs += pageEs

    repo.upsertLanguageNames(rows)
    total += rows.length
    logger.info({ offset, rows: rows.length, total, pageFr, pageEs }, 'Page done')

    if (bindings.length < PAGE_SIZE) {
      logger.info({ offset }, 'Last page reached')
      break
    }

    offset += PAGE_SIZE
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  logger.info({ total, withFr, withEs }, 'Wikidata enrichment complete')
  conn.close()
}

main().catch(err => {
  logger.error({ err }, 'Fatal error')
  process.exit(1)
})
