export type BggCatalogRow = {
  bgg_id: number
  name: string
  year_published: number | null
  is_expansion: number
  rank: number | null
  bgg_rating: number | null
  users_rated: number | null
  abstracts_rank: number | null
  cgs_rank: number | null
  childrensgames_rank: number | null
  familygames_rank: number | null
  partygames_rank: number | null
  strategygames_rank: number | null
  thematic_rank: number | null
  wargames_rank: number | null
}

// Même structure que BggCatalogRow mais avec noms multilingues
export type BggCatalogLanguageRow = Omit<BggCatalogRow, 'name'> & {
  name_en: string
  name_fr: string | null
  name_es: string | null
}

// CSV columns (boardgames_ranks.csv):
// 0:id  1:name  2:yearpublished  3:rank  4:bayesaverage  5:average
// 6:usersrated  7:is_expansion  8:abstracts_rank  9:cgs_rank
// 10:childrensgames_rank  11:familygames_rank  12:partygames_rank
// 13:strategygames_rank  14:thematic_rank  15:wargames_rank

function parseLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

function int(v: string): number | null {
  const n = parseInt(v, 10)
  return isNaN(n) ? null : n
}

function float(v: string): number | null {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

/**
 * Parses a BGG CSV dump (boardgames_ranks.csv) into importable rows.
 * Handles quoted names with commas (e.g. "Brass: Birmingham").
 */
export function parseBggCsv(csv: string): BggCatalogRow[] {
  const lines = csv.split('\n')
  const results: BggCatalogRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const f = parseLine(line)
    if (f.length < 8) continue

    const bgg_id = int(f[0])
    if (!bgg_id || bgg_id <= 0) continue

    const name = f[1].trim()
    if (!name) continue

    results.push({
      bgg_id,
      name,
      year_published:       int(f[2]),
      rank:                 int(f[3]),
      bgg_rating:           float(f[4]),
      users_rated:          int(f[6]),
      is_expansion:         int(f[7]) === 1 ? 1 : 0,
      abstracts_rank:       int(f[8]  ?? ''),
      cgs_rank:             int(f[9]  ?? ''),
      childrensgames_rank:  int(f[10] ?? ''),
      familygames_rank:     int(f[11] ?? ''),
      partygames_rank:      int(f[12] ?? ''),
      strategygames_rank:   int(f[13] ?? ''),
      thematic_rank:        int(f[14] ?? ''),
      wargames_rank:        int(f[15] ?? ''),
    })
  }

  return results
}
