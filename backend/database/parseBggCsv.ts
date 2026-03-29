export type BggCatalogRow = {
  bgg_id: number;
  name: string;
  year_published: number | null;
  is_expansion: number;
};

/**
 * Parses a BGG CSV dump (boardgames_ranks.csv) into importable rows.
 * Handles quoted names with commas (e.g. "Brass: Birmingham").
 * Columns: id, name, yearpublished, rank, bayesaverage, average, usersrated, is_expansion, ...
 */
export function parseBggCsv(csv: string): BggCatalogRow[] {
  const lines = csv.split('\n');
  const results: BggCatalogRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = line.match(/^(\d+),"?([^",]*(?:"[^"]*"[^",]*)*)"?,(\d*),(?:[^,]*,){4}(\d)/);
    if (!m) continue;
    const bgg_id = parseInt(m[1]);
    if (isNaN(bgg_id) || bgg_id <= 0) continue;
    const name = m[2].trim();
    if (!name) continue;
    const year = parseInt(m[3]);
    results.push({
      bgg_id,
      name,
      year_published: isNaN(year) ? null : year,
      is_expansion: parseInt(m[4]) === 1 ? 1 : 0,
    });
  }
  return results;
}
