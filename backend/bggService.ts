/**
 * BGG Service — intègre l'API BoardGameGeek côté backend
 * - Détails : API JSON interne geekdo.com (pas d'auth nécessaire)
 * - Cache 24h + rate limiting
 */
import type { BGGGame, BGGExpansion, BGGCharacter } from '@shared/types'

export type { BGGGame, BGGExpansion, BGGCharacter } from '@shared/types'

// --- Types geekdo search API ---

interface GeekdoSearchResponse {
  search: string
  items: GeekdoSearchItem[]
}

interface GeekdoSearchItem {
  objecttype: string
  objectid: string
  name: string
  yearpublished?: string
  imageurl?: string
  'imageurl@2x'?: string
  images?: { thumb?: string; square?: string; original?: string }
}

// --- Types API interne geekdo.com ---

interface GeekdoLink {
  objectid: string
  name: string
}

interface GeekdoItem {
  objectid: number
  name: string
  yearpublished?: string
  minplayers?: string
  maxplayers?: string
  minplaytime?: string
  maxplaytime?: string
  minage?: string
  description?: string
  short_description?: string
  imageurl?: string
  'imageurl@2x'?: string
  images?: { thumb?: string; square?: string; original?: string }
  stats?: { average?: number; stddev?: number; avgweight?: number }
  links?: {
    boardgamecategory?: GeekdoLink[]
    boardgamemechanic?: GeekdoLink[]
    boardgamefamily?: GeekdoLink[]
    boardgamedesigner?: GeekdoLink[]
    boardgamepublisher?: GeekdoLink[]
    boardgameexpansion?: GeekdoLink[]
    expandsboardgame?: GeekdoLink[]
  }
}

// --- Type interne geekdo search (non exposé) ---

interface GeekdoSearchEntry {
  id: number
  name: string
  year_published: number
  type: string
  thumbnail: string
}

interface CacheEntry {
  data: BGGGame
  expiresAt: number
}

class BGGService {
  private cache = new Map<string, CacheEntry>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24h
  private readonly GEEKDO_BASE_URL = 'https://api.geekdo.com/api'
  private readonly RATE_LIMIT_DELAY = 1000 // 1s entre requêtes
  private lastRequestTime = 0

  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    this.lastRequestTime = now
    if (elapsed < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - elapsed))
    }
  }

  /**
   * Recherche des jeux sur BGG par nom.
   * Retourne jusqu'à 15 résultats uniques instantanément depuis geekdo search.
   * Thumbnails + années sont vides ici — le frontend les charge en arrière-plan via getGameDetails.
   */
  async searchGames(query: string): Promise<GeekdoSearchEntry[]> {
    await this.rateLimit()

    const url = `${this.GEEKDO_BASE_URL}/geekitems?nosession=1&objecttype=thing&subtype=boardgame&showcount=20&pageid=1&search=${encodeURIComponent(query)}`
    const searchResp = await fetch(url, { headers: { 'Accept': 'application/json' } })

    if (!searchResp.ok) throw new Error(`BGG search API error: ${searchResp.status}`)

    const data = await searchResp.json() as GeekdoSearchResponse
    if (!data.items || data.items.length === 0) return []

    // Deduplicate by ID (geekdo returns multilingual duplicates), keep top 15
    const seenIds = new Set<number>()
    return data.items
      .filter(item => item.objectid && item.name)
      .map(item => {
        const id = parseInt(item.objectid, 10)
        return isNaN(id) || id <= 0 || id > Number.MAX_SAFE_INTEGER ? null : { item, id }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .filter(({ id }) => {
        if (seenIds.has(id)) return false
        seenIds.add(id)
        return true
      })
      .slice(0, 15)
      .map(({ item, id }) => ({
        id,
        name: item.name,
        year_published: 0,
        type: 'boardgame' as const,
        thumbnail: '',
      }))
  }

  /**
   * Récupère les détails d'un jeu par son BGG ID.
   * Utilise l'API JSON interne de geekdo.com (pas d'auth requise).
   */
  async getGameDetails(bggId: number): Promise<BGGGame | null> {
    const cacheKey = String(bggId)
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.data

    await this.rateLimit()
    const url = `${this.GEEKDO_BASE_URL}/geekitems?nosession=1&objectid=${bggId}&objecttype=thing&subtype=boardgame`
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })

    if (!response.ok) throw new Error(`BGG geekdo API error: ${response.status}`)

    const data = await response.json() as { item?: GeekdoItem }
    const item = data?.item
    if (!item) return null

    const details = this.parseGeekdoItem(item)
    this.cache.set(cacheKey, { data: details, expiresAt: Date.now() + this.CACHE_DURATION })
    return details
  }

  private parseGeekdoItem(item: GeekdoItem): BGGGame {
    const categories = (item.links?.boardgamecategory || []).map(l => l.name)
    const mechanics = (item.links?.boardgamemechanic || []).map(l => l.name)
    const families = (item.links?.boardgamefamily || []).map(l => l.name)
    const designers = (item.links?.boardgamedesigner || []).map(l => l.name)
    const publishers = (item.links?.boardgamepublisher || []).map(l => l.name)
    const expansions: BGGExpansion[] = (item.links?.boardgameexpansion || [])
      .map(l => ({
        bgg_expansion_id: parseInt(l.objectid),
        name: l.name,
        // year_published not available from geekdo links API — omit to avoid Zod min(1800) rejection
      }))
      .filter(e => e.bgg_expansion_id > 0)

    const isExpansion = (item.links?.expandsboardgame || []).length > 0
    const baseGameId = isExpansion
      ? parseInt(item.links?.expandsboardgame?.[0]?.objectid || '0') || undefined
      : undefined

    const weight = item.stats?.avgweight || 0
    const rating = item.stats?.average || 0
    const minPlaytime = parseInt(item.minplaytime || '0')
    const maxPlaytime = parseInt(item.maxplaytime || '0')
    const playingTime = maxPlaytime || minPlaytime

    const description = this.cleanDescription(item.description || item.short_description || '')
    const image = item.imageurl || item['imageurl@2x'] || item.images?.original || item.images?.square || ''
    const thumbnail = item.images?.thumb || item.images?.square || image

    const gameModes = this.determineGameModes(categories, mechanics)

    return {
      id: item.objectid,
      name: item.name,
      description,
      image,
      thumbnail,
      min_players: parseInt(item.minplayers || '1'),
      max_players: parseInt(item.maxplayers || '1'),
      playing_time: playingTime,
      min_playtime: minPlaytime,
      max_playtime: maxPlaytime,
      min_age: parseInt(item.minage || '8'),
      year_published: parseInt(item.yearpublished || '0'),
      designers,
      publishers,
      categories,
      mechanics,
      families,
      rating,
      weight,
      difficulty: this.mapWeightToDifficulty(weight),
      expansions,
      characters: [],
      supports_cooperative: gameModes.cooperative,
      supports_competitive: gameModes.competitive,
      supports_campaign: gameModes.campaign,
      supports_hybrid: gameModes.hybrid,
      is_expansion: isExpansion,
      base_game_id: baseGameId
    }
  }

  private cleanDescription(raw: string): string {
    return raw
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#10;/g, ' ')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .trim()
  }

  private mapWeightToDifficulty(weight: number): string {
    if (weight <= 2.0) return 'Beginner'
    if (weight <= 3.5) return 'Intermediate'
    return 'Expert'
  }

  private determineGameModes(categories: string[], mechanics: string[]) {
    const cats = categories.join(' ').toLowerCase()
    const mechs = mechanics.join(' ').toLowerCase()
    const cooperative = mechs.includes('cooperative') || mechs.includes('co-op') || cats.includes('cooperative')
    const campaign = mechs.includes('campaign') || mechs.includes('legacy') || mechs.includes('story')
    const hybrid = mechs.includes('semi-cooperative') || mechs.includes('traitor') || mechs.includes('hidden role')
    const competitive = !cooperative || hybrid
    return { cooperative, competitive, campaign, hybrid }
  }

  cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) this.cache.delete(key)
    }
  }
}

export const bggService = new BGGService()

// Nettoyage cache toutes les heures
setInterval(() => bggService.cleanExpiredCache(), 60 * 60 * 1000)
