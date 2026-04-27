import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import pino from 'pino'
import { DatabaseConnection } from '../database/DatabaseConnection'

const logger = pino({ level: 'info' })

const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '../database/board_game_score.db')
const IMPORT_DIR = path.join(__dirname, '../database/import')

const ALLOWED_EXTENSIONS = new Set(['.json', '.csv'])

const BGG_CSV_REQUIRED_HEADERS = ['id', 'name', 'yearpublished']

const JSON_EXPECTED_KEYS = new Set(['bgg_id', 'name_fr', 'year'])

interface FrEntry {
  bgg_id: number
  name_fr: string
}

// CSV: exit if column count or headers don't match BGG format
function parseCsv(filePath: string): FrEntry[] {
  const raw = parse(fs.readFileSync(filePath, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>

  if (!raw.length) return []

  const headers = Object.keys(raw[0])
  const missingRequired = BGG_CSV_REQUIRED_HEADERS.filter(h => !headers.includes(h))

  if (missingRequired.length) {
    logger.error(
      { file: filePath, missing: missingRequired },
      'CSV missing required BGG columns (id, name, yearpublished) — aborting'
    )
    process.exit(1)
  }

  const extraOrMissing = headers.filter(h => !BGG_CSV_REQUIRED_HEADERS.includes(h))
  if (extraOrMissing.length) {
    logger.warn({ file: filePath, columns: extraOrMissing }, 'CSV has extra/optional columns — continuing')
  }

  // BGG CSV has no name_fr — nothing to import yet
  return raw
    .filter(r => r.id && r.name)
    .map(r => ({ bgg_id: parseInt(r.id, 10), name_fr: '' }))
    .filter(r => !isNaN(r.bgg_id) && r.name_fr)
}

// JSON: error if bgg_id or name_fr missing, warning if wrong number of fields
function parseJson(filePath: string): FrEntry[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<Record<string, unknown>>
  const entries: FrEntry[] = []

  for (const [i, entry] of raw.entries()) {
    const hasBggId = typeof entry.bgg_id === 'number'
    const hasNameFr = typeof entry.name_fr === 'string' && entry.name_fr !== ''

    if (!hasBggId || !hasNameFr) {
      logger.error(
        { file: filePath, index: i, entry },
        'JSON entry missing bgg_id or name_fr — aborting'
      )
      process.exit(1)
    }

    const keys = Object.keys(entry)
    if (keys.length !== JSON_EXPECTED_KEYS.size || !keys.every(k => JSON_EXPECTED_KEYS.has(k))) {
      logger.warn(
        { file: filePath, index: i, got: keys, expected: [...JSON_EXPECTED_KEYS] },
        'JSON entry has unexpected fields — processing anyway'
      )
    }

    entries.push({ bgg_id: entry.bgg_id as number, name_fr: entry.name_fr as string })
  }

  return entries
}

function loadFile(filePath: string): FrEntry[] | null {
  const ext = path.extname(filePath).toLowerCase()

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    logger.warn({ file: filePath, ext }, 'Unsupported file type — blocked')
    return null
  }

  try {
    return ext === '.json' ? parseJson(filePath) : parseCsv(filePath)
  } catch (err) {
    logger.error({ file: filePath, err }, 'Failed to parse file — skipping')
    return null
  }
}

function main(): void {
  const conn = new DatabaseConnection(DB_PATH)
  const db = conn.db

  const files = fs.readdirSync(IMPORT_DIR)
    .map(f => path.join(IMPORT_DIR, f))
    .filter(f => fs.statSync(f).isFile())

  logger.info({ dir: IMPORT_DIR, total: files.length }, 'Scanning import directory')

  const selectStmt = db.prepare<[number], { name_fr: string | null }>(
    'SELECT name_fr FROM bgg_catalog_language WHERE bgg_id = ?'
  )
  const updateStmt = db.prepare(
    'UPDATE bgg_catalog_language SET name_fr = ? WHERE bgg_id = ?'
  )

  let inserted = 0
  let skipped = 0
  let conflicts = 0
  let notFound = 0

  const applyBatch = db.transaction((entries: FrEntry[], file: string) => {
    for (const entry of entries) {
      const row = selectStmt.get(entry.bgg_id)

      if (!row) {
        logger.warn({ bgg_id: entry.bgg_id, file }, 'bgg_id not found in bgg_catalog_language')
        notFound++
        continue
      }

      if (!row.name_fr) {
        updateStmt.run(entry.name_fr, entry.bgg_id)
        inserted++
      } else if (row.name_fr === entry.name_fr) {
        skipped++
      } else {
        logger.info(
          { bgg_id: entry.bgg_id, db: row.name_fr, incoming: entry.name_fr, file },
          'conflict — keeping existing value'
        )
        conflicts++
      }
    }
  })

  for (const filePath of files) {
    const entries = loadFile(filePath)
    if (!entries?.length) continue

    logger.info({ file: path.basename(filePath), count: entries.length }, 'Processing')
    applyBatch(entries, path.basename(filePath))
  }

  logger.info({ inserted, skipped, conflicts, notFound }, 'Import complete')
  conn.close()
}

main()
