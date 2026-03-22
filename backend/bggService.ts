/**
 * BGG Service — intègre l'API BoardGameGeek côté backend
 * - Détails : API JSON interne geekdo.com (pas d'auth nécessaire)
 * - Cache 24h + rate limiting
 */
// --- Types geekdo search API ---

interface GeekdoSearchResponse {
  search: string
  items: GeekdoSearchItem[]
}

interface GeekdoSearchItem {
  objecttype: string
  objectid: string
  name: string
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

// --- Types retournés au frontend ---

export interface BGGSearchResult {
  id: number
  name: string
  year_published: number
  type: string
}

export interface BGGExpansion {
  bgg_expansion_id: number
  name: string
  year_published: number
}

export interface BGGCharacter {
  character_key: string
  name: string
  description: string
  abilities: string[]
}

export interface BGGGameDetails {
  id: number
  name: string
  description: string
  image: string
  thumbnail: string
  min_players: number
  max_players: number
  playing_time: number
  min_playtime: number
  max_playtime: number
  min_age: number
  year_published: number
  designers: string[]
  publishers: string[]
  categories: string[]
  mechanics: string[]
  families: string[]
  rating: number
  weight: number
  difficulty: string
  expansions: BGGExpansion[]
  characters: BGGCharacter[]
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  is_expansion: boolean
  base_game_id?: number
}

interface CacheEntry {
  data: BGGGameDetails
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
   * Utilise l'API JSON interne de geekdo.com — pas d'authentification requise.
   */
  async searchGames(query: string): Promise<BGGSearchResult[]> {
    await this.rateLimit()

    const url = `${this.GEEKDO_BASE_URL}/geekitems?nosession=1&objecttype=thing&subtype=boardgame&showcount=50&pageid=1&search=${encodeURIComponent(query)}`
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })

    if (!response.ok) {
      throw new Error(`BGG search API error: ${response.status}`)
    }

    const data = await response.json() as GeekdoSearchResponse
    if (!data.items) return []

    return data.items
      .filter(item => item.objectid && item.name)
      .map(item => ({
        id: parseInt(item.objectid),
        name: item.name,
        year_published: 0,
        type: 'boardgame'
      }))
      .filter(r => r.id > 0)
  }

  /**
   * Récupère les détails d'un jeu par son BGG ID.
   * Utilise l'API JSON interne de geekdo.com (pas d'auth requise).
   */
  async getGameDetails(bggId: number): Promise<BGGGameDetails | null> {
    const cacheKey = String(bggId)
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.data

    await this.rateLimit()
    const url = `${this.GEEKDO_BASE_URL}/geekitems?nosession=1&objectid=${bggId}&objecttype=thing&subtype=boardgame`
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } })

    if (!response.ok) throw new Error(`BGG geekdo API error: ${response.status}`)

    const data = await response.json()
    const item: GeekdoItem = data?.item
    if (!item) return null

    const details = this.parseGeekdoItem(item)
    this.cache.set(cacheKey, { data: details, expiresAt: Date.now() + this.CACHE_DURATION })
    return details
  }

  private parseGeekdoItem(item: GeekdoItem): BGGGameDetails {
    const categories = (item.links?.boardgamecategory || []).map(l => l.name)
    const mechanics = (item.links?.boardgamemechanic || []).map(l => l.name)
    const families = (item.links?.boardgamefamily || []).map(l => l.name)
    const designers = (item.links?.boardgamedesigner || []).map(l => l.name)
    const publishers = (item.links?.boardgamepublisher || []).map(l => l.name)
    const expansions: BGGExpansion[] = (item.links?.boardgameexpansion || [])
      .map(l => ({
        bgg_expansion_id: parseInt(l.objectid),
        name: l.name,
        year_published: 0
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
