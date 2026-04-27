/**
 * match-wikidata-to-catalog.ts
 * Compare wikidata_games.csv avec bgg_catalog_language.name_en.
 * Sortie : wikidata_matches.csv — uniquement les lignes qui matchent
 * ET apportent un nom FR ou ES absent de la BDD.
 *
 * Usage : npx ts-node scripts/match-wikidata-to-catalog.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import pino from 'pino'
import { DatabaseConnection } from '../database/DatabaseConnection'

const logger = pino({ level: 'info' })

const CSV_IN  = path.join(process.cwd(), 'wikidata_games.csv')
const CSV_OUT = path.join(process.cwd(), 'wikidata_matches.csv')
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '../database/board_game_score.db')

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function escapeCsv(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

type WikiRow = {
  wikidataId: string
  bggId:      string
  nameEn:     string
  nameFr:     string
  nameEs:     string
}

async function readCsv(file: string): Promise<WikiRow[]> {
  const rows: WikiRow[] = []
  const rl = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity })
  let header = true
  for await (const line of rl) {
    if (header) { header = false; continue }
    // Simple CSV split — handles quoted fields
    const fields = parseCsvLine(line)
    if (fields.length < 5) continue
    rows.push({
      wikidataId: fields[0],
      bggId:      fields[1],
      nameEn:     fields[2],
      nameFr:     fields[3],
      nameEs:     fields[4],
    })
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current); current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

async function main(): Promise<void> {
  logger.info({ csv: CSV_IN, db: DB_PATH }, 'Loading data')

  // 1. Charge le CSV Wikidata
  const wikiRows = await readCsv(CSV_IN)
  logger.info({ total: wikiRows.length }, 'Wikidata CSV loaded')

  // Index par nameEn normalisé — garde la première occurrence
  const wikiByName = new Map<string, WikiRow>()
  for (const row of wikiRows) {
    if (!row.nameEn) continue
    const key = normalize(row.nameEn)
    if (!wikiByName.has(key)) wikiByName.set(key, row)
  }
  logger.info({ uniqueNames: wikiByName.size }, 'Unique EN names in Wikidata')

  // 2. Charge bgg_catalog_language depuis la BDD
  const conn = new DatabaseConnection(DB_PATH)
  type DbRow = { bgg_id: number; name_en: string; name_fr: string | null; name_es: string | null }
  const dbRows = conn.db.prepare(
    'SELECT bgg_id, name_en, name_fr, name_es FROM bgg_catalog_language'
  ).all() as DbRow[]
  conn.close()
  logger.info({ total: dbRows.length }, 'DB rows loaded')

  // 3. Match et filtre
  const out = fs.createWriteStream(CSV_OUT, { encoding: 'utf8' })
  out.write('bgg_id,name_en_db,wikidataId,bggId_wiki,nameFr_wiki,nameEs_wiki,has_fr_db,has_es_db\n')

  let matched = 0
  let newFr = 0
  let newEs = 0
  let noMatch = 0

  for (const db of dbRows) {
    if (!db.name_en) continue
    const key = normalize(db.name_en)
    const wiki = wikiByName.get(key)

    if (!wiki) { noMatch++; continue }

    // Ne garder que si Wikidata apporte quelque chose de nouveau
    const bringsNewFr = !!wiki.nameFr && !db.name_fr
    const bringsNewEs = !!wiki.nameEs && !db.name_es

    matched++
    if (bringsNewFr) newFr++
    if (bringsNewEs) newEs++

    if (bringsNewFr || bringsNewEs) {
      out.write([
        db.bgg_id,
        escapeCsv(db.name_en),
        wiki.wikidataId,
        wiki.bggId,
        escapeCsv(wiki.nameFr),
        escapeCsv(wiki.nameEs),
        db.name_fr ? '1' : '0',
        db.name_es ? '1' : '0',
      ].join(',') + '\n')
    }
  }

  out.end()

  logger.info({
    dbTotal:    dbRows.length,
    noMatch,
    matched,
    matchRate:  `${((matched / dbRows.length) * 100).toFixed(1)}%`,
    newFr,
    newEs,
    file: CSV_OUT,
  }, 'Matching done')
}

main().catch(err => {
  logger.error({ err }, 'Fatal error')
  process.exit(1)
})
