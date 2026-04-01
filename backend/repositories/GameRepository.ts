import type Database from 'better-sqlite3'
import type {
  Game, GameExpansion, GameCharacter,
  CreateGameRequest, UpdateGameRequest,
} from '@shared/types'

type RawGame = Omit<Game,
  | 'categories' | 'mechanics' | 'families' | 'expansions' | 'characters'
  | 'supports_cooperative' | 'supports_competitive' | 'supports_campaign' | 'supports_hybrid'
  | 'has_expansion' | 'has_characters' | 'is_expansion'
> & {
  categories?: string
  mechanics?: string
  families?: string
  supports_cooperative: number
  supports_competitive: number
  supports_campaign: number
  supports_hybrid: number
  has_expansion: number
  has_characters: number
  is_expansion: number
}

function parseGame(raw: RawGame): Game {
  return {
    ...raw,
    categories: raw.categories ? (JSON.parse(raw.categories) as string[]) : [],
    mechanics:  raw.mechanics  ? (JSON.parse(raw.mechanics)  as string[]) : [],
    families:   raw.families   ? (JSON.parse(raw.families)   as string[]) : [],
    supports_cooperative: !!raw.supports_cooperative,
    supports_competitive: !!raw.supports_competitive,
    supports_campaign:    !!raw.supports_campaign,
    supports_hybrid:      !!raw.supports_hybrid,
    has_expansion:        !!raw.has_expansion,
    has_characters:       !!raw.has_characters,
    is_expansion:         !!raw.is_expansion,
  }
}

export class GameRepository {
  constructor(private db: Database.Database) {}

  findAll(): Game[] {
    return (this.db.prepare('SELECT * FROM games ORDER BY name').all() as RawGame[]).map(parseGame)
  }

  findById(id: number): Game | undefined {
    const row = this.db.prepare('SELECT * FROM games WHERE game_id = ?').get(id) as RawGame | undefined
    return row ? parseGame(row) : undefined
  }

  create(data: CreateGameRequest): number {
    const result = this.db.prepare(`
      INSERT INTO games (
        bgg_id, name, description, image, thumbnail,
        min_players, max_players, playing_time, min_playtime, max_playtime,
        duration, difficulty, category, categories, mechanics, families,
        year_published, publisher, designer, bgg_rating, weight, age_min,
        supports_cooperative, supports_competitive, supports_campaign, supports_hybrid,
        has_expansion, has_characters, is_expansion
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `).run(
      data.bgg_id ?? null, data.name, data.description ?? null,
      data.image ?? null, data.thumbnail ?? null,
      data.min_players, data.max_players,
      data.playing_time ?? null, data.min_playtime ?? null, data.max_playtime ?? null,
      data.duration ?? null, data.difficulty ?? null, data.category ?? null,
      data.categories ? JSON.stringify(data.categories) : null,
      data.mechanics  ? JSON.stringify(data.mechanics)  : null,
      data.families   ? JSON.stringify(data.families)   : null,
      data.year_published ?? null, data.publisher ?? null, data.designer ?? null,
      data.bgg_rating ?? null, data.weight ?? null, data.age_min ?? null,
      data.supports_cooperative ? 1 : 0,
      data.supports_competitive ? 1 : 0,
      data.supports_campaign    ? 1 : 0,
      data.supports_hybrid      ? 1 : 0,
      data.has_expansion        ? 1 : 0,
      data.has_characters       ? 1 : 0,
      data.is_expansion         ? 1 : 0,
    )
    return result.lastInsertRowid as number
  }

  update(id: number, data: UpdateGameRequest): void {
    const current = this.findById(id)
    if (!current) return
    const merged: CreateGameRequest = { ...current, ...data, min_players: data.min_players ?? current.min_players, max_players: data.max_players ?? current.max_players }
    this.db.prepare(`
      UPDATE games SET
        name = ?, description = ?, image = ?, thumbnail = ?,
        min_players = ?, max_players = ?, playing_time = ?,
        min_playtime = ?, max_playtime = ?,
        duration = ?, difficulty = ?, category = ?,
        categories = ?, mechanics = ?, families = ?,
        year_published = ?, publisher = ?, designer = ?,
        bgg_rating = ?, weight = ?, age_min = ?,
        supports_cooperative = ?, supports_competitive = ?,
        supports_campaign = ?, supports_hybrid = ?,
        has_expansion = ?, has_characters = ?, is_expansion = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE game_id = ?
    `).run(
      merged.name, merged.description ?? null, merged.image ?? null, merged.thumbnail ?? null,
      merged.min_players, merged.max_players, merged.playing_time ?? null,
      merged.min_playtime ?? null, merged.max_playtime ?? null,
      merged.duration ?? null, merged.difficulty ?? null, merged.category ?? null,
      merged.categories ? JSON.stringify(merged.categories) : null,
      merged.mechanics  ? JSON.stringify(merged.mechanics)  : null,
      merged.families   ? JSON.stringify(merged.families)   : null,
      merged.year_published ?? null, merged.publisher ?? null, merged.designer ?? null,
      merged.bgg_rating ?? null, merged.weight ?? null, merged.age_min ?? null,
      merged.supports_cooperative ? 1 : 0,
      merged.supports_competitive ? 1 : 0,
      merged.supports_campaign    ? 1 : 0,
      merged.supports_hybrid      ? 1 : 0,
      merged.has_expansion        ? 1 : 0,
      merged.has_characters       ? 1 : 0,
      merged.is_expansion         ? 1 : 0,
      id,
    )
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM games WHERE game_id = ?').run(id)
  }

  findExpansions(gameId: number): GameExpansion[] {
    return this.db
      .prepare('SELECT * FROM game_expansions WHERE game_id = ? ORDER BY name')
      .all(gameId) as GameExpansion[]
  }

  createExpansion(gameId: number, data: Omit<GameExpansion, 'expansion_id' | 'game_id'>): number {
    const result = this.db.prepare(`
      INSERT INTO game_expansions (game_id, bgg_expansion_id, name, year_published, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      gameId,
      data.bgg_expansion_id ?? null,
      data.name,
      data.year_published ?? null,
      data.description ?? null,
    )
    return result.lastInsertRowid as number
  }

  deleteExpansion(expansionId: number): void {
    this.db.prepare('DELETE FROM game_expansions WHERE expansion_id = ?').run(expansionId)
  }

  findCharacters(gameId: number): GameCharacter[] {
    const rows = this.db
      .prepare('SELECT * FROM game_characters WHERE game_id = ? ORDER BY name')
      .all(gameId) as (GameCharacter & { abilities?: string })[]
    return rows.map(r => ({
      ...r,
      abilities: r.abilities ? (JSON.parse(r.abilities) as string[]) : [],
    }))
  }

  createCharacter(gameId: number, data: Omit<GameCharacter, 'character_id' | 'game_id'>): number {
    const result = this.db.prepare(`
      INSERT INTO game_characters (game_id, character_key, name, description, avatar, abilities)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      gameId,
      data.character_key,
      data.name,
      data.description ?? null,
      data.avatar ?? null,
      data.abilities ? JSON.stringify(data.abilities) : null,
    )
    return result.lastInsertRowid as number
  }

  deleteCharacter(characterId: number): void {
    this.db.prepare('DELETE FROM game_characters WHERE character_id = ?').run(characterId)
  }
}
