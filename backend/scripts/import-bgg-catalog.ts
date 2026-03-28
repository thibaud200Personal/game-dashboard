import * as fs from 'fs'
import * as path from 'path'
import DatabaseManager from '../database/DatabaseManager'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: npm run import-bgg-catalog -- <path/to/boardgames_ranks.csv>')
  console.error('Example: npm run import-bgg-catalog -- "C:/Users/thibs/Downloads/boardgames_ranks_2026-03-28/boardgames_ranks.csv"')
  process.exit(1)
}

const resolved = path.resolve(filePath)
if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`)
  process.exit(1)
}

console.log(`Reading ${resolved}…`)
const csv = fs.readFileSync(resolved, 'utf-8')
const lines = csv.split('\n')
console.log(`${lines.length - 1} lignes à parser…`)

const rows: { bgg_id: number; name: string; year_published: number | null; is_expansion: number }[] = []
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  const m = line.match(/^(\d+),"?([^",]*(?:"[^"]*"[^",]*)*)"?,(\d*),(?:[^,]*,){4}(\d)/)
  if (!m) continue
  const bgg_id = parseInt(m[1])
  if (isNaN(bgg_id) || bgg_id <= 0) continue
  const name = m[2].trim()
  if (!name) continue
  const year = parseInt(m[3])
  rows.push({
    bgg_id,
    name,
    year_published: isNaN(year) ? null : year,
    is_expansion: parseInt(m[4]) === 1 ? 1 : 0,
  })
}

console.log(`${rows.length} entrées valides, import en base…`)
const db = new DatabaseManager()
const count = db.importBggCatalog(rows)
db.close()
console.log(`✓ ${count.toLocaleString()} jeux importés dans bgg_catalog`)
