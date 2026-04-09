/**
 * fetch-wikidata-games.ts
 * Récupère tous les jeux de société Wikidata (instance of board game)
 * avec leurs noms EN/FR/ES et le BGG ID si dispo.
 * Sortie : wikidata_games.csv dans le répertoire courant.
 *
 * Usage : npx ts-node scripts/fetch-wikidata-games.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import pino from 'pino'

const logger = pino({ level: 'info' })

const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'
const PAGE_SIZE = 5000
const OUT_FILE = path.join(process.cwd(), 'wikidata_games.csv')

type Binding = {
  item:    { value: string }
  nameEn:  { value: string }
  nameFr?: { value: string }
  nameEs?: { value: string }
  bggId?:  { value: string }
}

function clean(v: string | undefined): string {
  if (!v) return ''
  const t = v.trim()
  // strip surrounding quotes
  return t.startsWith('"') && t.endsWith('"') && t.length > 2 ? t.slice(1, -1) : t
}

function escapeCsv(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

async function main(): Promise<void> {
  const out = fs.createWriteStream(OUT_FILE, { encoding: 'utf8' })
  out.write('wikidataId,bggId,nameEn,nameFr,nameEs\n')

  let offset = 0
  let total = 0
  let withFr = 0
  let withEs = 0
  let withBggId = 0

  logger.info({ out: OUT_FILE }, 'Starting Wikidata board game fetch')

  while (true) {
    const sparql = `
      SELECT DISTINCT ?item ?nameEn ?nameFr ?nameEs ?bggId WHERE {
        VALUES ?type {
          wd:Q131436   # board game
          wd:Q142714   # card game
          wd:Q839715   # tabletop game
          wd:Q516780   # war game
          wd:Q734272   # tile-based game
          wd:Q1191735  # dice game
          wd:Q13406463 # dedicated deck card game
        }
        ?item wdt:P31 ?type .
        ?item rdfs:label ?nameEn . FILTER(LANG(?nameEn) = "en")
        OPTIONAL { ?item rdfs:label ?nameFr . FILTER(LANG(?nameFr) = "fr") }
        OPTIONAL { ?item rdfs:label ?nameEs . FILTER(LANG(?nameEs) = "es") }
        OPTIONAL { ?item wdt:P2339 ?bggId }
      } LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `

    const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}`

    let resp: Response
    try {
      resp = await fetch(url, {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'BoardGameDashboard/1.0 (research)',
        },
      })
    } catch (err) {
      logger.error({ err }, 'Fetch failed (network error)')
      break
    }

    if (!resp.ok) {
      const body = await resp.text()
      logger.error({ status: resp.status, body }, 'Wikidata SPARQL HTTP error')
      break
    }

    const json = await resp.json() as { results: { bindings: Binding[] } }
    const bindings = json.results.bindings

    if (bindings.length === 0) {
      logger.info({ offset }, 'Empty page — done')
      break
    }

    for (const b of bindings) {
      const wikidataId = b.item.value.replace('http://www.wikidata.org/entity/', '')
      const bggId      = clean(b.bggId?.value)
      const nameEn     = clean(b.nameEn.value)
      const nameFr     = clean(b.nameFr?.value)
      const nameEs     = clean(b.nameEs?.value)

      if (nameFr) withFr++
      if (nameEs) withEs++
      if (bggId)  withBggId++

      out.write([wikidataId, bggId, nameEn, nameFr, nameEs].map(escapeCsv).join(',') + '\n')
    }

    total += bindings.length
    logger.info({ offset, page: bindings.length, total, withFr, withEs, withBggId }, 'Page done')

    if (bindings.length < PAGE_SIZE) {
      logger.info({ offset }, 'Last page reached')
      break
    }

    offset += PAGE_SIZE
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  out.end()
  logger.info({ total, withFr, withEs, withBggId, file: OUT_FILE }, 'Done')
}

main().catch(err => {
  logger.error({ err }, 'Fatal error')
  process.exit(1)
})
