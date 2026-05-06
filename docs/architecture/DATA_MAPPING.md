# Field Mapping Documentation: Frontend ↔ Database

## Overview

This document presents the mappings between frontend interfaces (`shared/types/index.d.ts`) and the database for the Board Game Dashboard project.

## Audit Methodology

✅ **Exact match** — Field exists with the same name and type  
🔄 **Computed field** — Virtual field generated on the frontend or via view  
🔗 **Relation** — Field linked to another table

---

## 1. PLAYER INTERFACE

The `Player` base type holds persisted fields only. Stats are exposed separately via `PlayerStatistics`.

### Frontend Interface
```typescript
interface Player {
  player_id: number
  player_name: string
  pseudo: string         // unique alias (UNIQUE INDEX COLLATE NOCASE)
  avatar?: string
  favorite_game?: string
  created_at: Date
  updated_at?: Date
}

// PlayerStatistics = Player + computed stats from player_statistics view
interface PlayerStatistics extends Player {
  games_played: number
  wins: number
  total_score: number
  average_score: number
  win_percentage: number
}
```

### Database Mappings — `players` table

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `player_id` | `player_id` | INTEGER | ✅ Exact match | |
| `player_name` | `player_name` | TEXT | ✅ Exact match | |
| `pseudo` | `pseudo` | TEXT UNIQUE | ✅ Exact match | UNIQUE INDEX COLLATE NOCASE |
| `avatar` | `avatar` | TEXT | ✅ Exact match | Optional on both sides |
| `favorite_game` | `favorite_game` | TEXT | ✅ Exact match | Optional on both sides |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Exact match | Auto-updated via trigger |

### Database Mappings — `player_statistics` view (for `PlayerStatistics`)

| **Frontend Field** | **Source** | **Status** | **Notes** |
|-------------------|------------|------------|-----------|
| `games_played` | `COUNT(DISTINCT play_id)` | 🔄 View computed | |
| `wins` | `COUNT(CASE WHEN is_winner = 1)` | 🔄 View computed | |
| `total_score` | `COALESCE(SUM(score), 0)` | 🔄 View computed | |
| `average_score` | `COALESCE(AVG(score), 0)` | 🔄 View computed | |
| `win_percentage` | `wins * 100.0 / games_played` | 🔄 View computed | |

---

## 2. GAME INTERFACE

### Frontend Interface
```typescript
interface Game {
  game_id: number
  bgg_id?: number
  thumbnail?: string
  playing_time?: number
  min_playtime?: number
  max_playtime?: number
  categories?: string[]   // JSON array (stored as TEXT in DB)
  mechanics?: string[]    // JSON array
  families?: string[]     // JSON array
  name: string
  description?: string
  image?: string
  min_players: number
  max_players: number
  duration?: string
  difficulty?: string
  category?: string
  year_published?: number
  publisher?: string
  designer?: string
  bgg_rating?: number
  weight?: number
  age_min?: number
  supports_cooperative: boolean
  supports_competitive: boolean
  supports_campaign: boolean
  supports_hybrid: boolean
  has_expansion: boolean
  has_characters: boolean
  is_expansion: boolean
  created_at: Date
  updated_at?: Date
  expansions?: GameExpansion[]
  characters?: GameCharacter[]
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `game_id` | `game_id` | INTEGER | ✅ Exact match | |
| `bgg_id` | `bgg_id` | INTEGER | ✅ Exact match | Optional, UNIQUE |
| `thumbnail` | `thumbnail` | TEXT | ✅ Exact match | Optional |
| `playing_time` | `playing_time` | INTEGER | ✅ Exact match | Optional |
| `min_playtime` | `min_playtime` | INTEGER | ✅ Exact match | Optional |
| `max_playtime` | `max_playtime` | INTEGER | ✅ Exact match | Optional |
| `categories` | `categories` | TEXT (JSON) | ✅ Exact match | Serialized as JSON string |
| `mechanics` | `mechanics` | TEXT (JSON) | ✅ Exact match | Serialized as JSON string |
| `families` | `families` | TEXT (JSON) | ✅ Exact match | Serialized as JSON string |
| `name` | `name` | TEXT | ✅ Exact match | |
| `description` | `description` | TEXT | ✅ Exact match | Optional |
| `image` | `image` | TEXT | ✅ Exact match | Optional |
| `min_players` | `min_players` | INTEGER | ✅ Exact match | |
| `max_players` | `max_players` | INTEGER | ✅ Exact match | |
| `duration` | `duration` | TEXT | ✅ Exact match | Optional |
| `difficulty` | `difficulty` | TEXT | ✅ Exact match | Optional |
| `category` | `category` | TEXT | ✅ Exact match | Optional |
| `year_published` | `year_published` | INTEGER | ✅ Exact match | Optional |
| `publisher` | `publisher` | TEXT | ✅ Exact match | Optional |
| `designer` | `designer` | TEXT | ✅ Exact match | Optional |
| `bgg_rating` | `bgg_rating` | REAL | ✅ Exact match | Optional |
| `weight` | `weight` | REAL | ✅ Exact match | Optional |
| `age_min` | `age_min` | INTEGER | ✅ Exact match | Optional |
| `supports_cooperative` | `supports_cooperative` | BOOLEAN | ✅ Exact match | |
| `supports_competitive` | `supports_competitive` | BOOLEAN | ✅ Exact match | |
| `supports_campaign` | `supports_campaign` | BOOLEAN | ✅ Exact match | |
| `supports_hybrid` | `supports_hybrid` | BOOLEAN | ✅ Exact match | |
| `has_expansion` | `has_expansion` | BOOLEAN | ✅ Exact match | |
| `has_characters` | `has_characters` | BOOLEAN | ✅ Exact match | |
| `is_expansion` | `is_expansion` | INTEGER (0/1) | ✅ Exact match | |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Exact match | Auto-updated via trigger |
| `expansions` | 🔗 Relation | `game_expansions` | 🔗 JOIN relation | |
| `characters` | 🔗 Relation | `game_characters` | 🔗 JOIN relation | |

---

## 3. GAMEEXPANSION INTERFACE

### Frontend Interface
```typescript
interface GameExpansion {
  expansion_id?: number
  game_id?: number
  bgg_expansion_id?: number
  name: string
  year_published?: number
  description?: string
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `expansion_id` | `expansion_id` | INTEGER | ✅ Exact match | Optional on frontend (auto-gen) |
| `game_id` | `game_id` | INTEGER | ✅ Exact match | Optional on frontend (provided by parent) |
| `bgg_expansion_id` | `bgg_expansion_id` | INTEGER | ✅ Exact match | Optional |
| `name` | `name` | TEXT | ✅ Exact match | |
| `year_published` | `year_published` | INTEGER | ✅ Exact match | Optional |
| `description` | `description` | TEXT | ✅ Exact match | Optional |

---

## 4. GAMECHARACTER INTERFACE

### Frontend Interface
```typescript
interface GameCharacter {
  character_id?: number
  game_id?: number
  character_key: string
  name: string
  description?: string
  avatar?: string
  abilities?: string[]   // stored as JSON in DB
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `character_id` | `character_id` | INTEGER | ✅ Exact match | Optional on frontend (auto-gen) |
| `game_id` | `game_id` | INTEGER | ✅ Exact match | Optional on frontend (provided by parent) |
| `character_key` | `character_key` | TEXT | ✅ Exact match | |
| `name` | `name` | TEXT | ✅ Exact match | |
| `description` | `description` | TEXT | ✅ Exact match | Optional |
| `avatar` | `avatar` | TEXT | ✅ Exact match | Optional |
| `abilities` | `abilities` | TEXT (JSON) | ✅ Exact match | Array↔JSON serialization |

---

## 5. GAMEPLAY INTERFACE

Renamed from `GameSession` (migration 013). Table: `game_plays`.

### Frontend Interface
```typescript
interface GamePlay {
  play_id: number
  game_id: number
  play_date: Date
  duration_minutes?: number
  winner_player_id?: number
  play_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  created_at: Date
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `play_id` | `play_id` | INTEGER | ✅ Exact match | |
| `game_id` | `game_id` | INTEGER | ✅ Exact match | |
| `play_date` | `play_date` | TIMESTAMP | ✅ Exact match | |
| `duration_minutes` | `duration_minutes` | INTEGER | ✅ Exact match | Optional |
| `winner_player_id` | `winner_player_id` | INTEGER | ✅ Exact match | Optional |
| `play_type` | `play_type` | TEXT CHECK | ✅ Exact match | `competitive\|cooperative\|campaign\|hybrid` |
| `notes` | `notes` | TEXT | ✅ Exact match | Optional |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated |

---

## 6. PLAYPLAYER INTERFACE

Renamed from `SessionPlayer` (migration 013). Table: `players_play`.

### Frontend Interface
```typescript
interface PlayPlayer {
  players_play_id?: number
  play_id: number
  player_id: number
  character_id?: number
  score: number
  placement?: number
  is_winner: boolean
  notes?: string
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `players_play_id` | `players_play_id` | INTEGER | ✅ Exact match | Optional on frontend (auto-gen) |
| `play_id` | `play_id` | INTEGER | ✅ Exact match | |
| `player_id` | `player_id` | INTEGER | ✅ Exact match | |
| `character_id` | `character_id` | INTEGER | ✅ Exact match | Optional |
| `score` | `score` | INTEGER | ✅ Exact match | |
| `placement` | `placement` | INTEGER | ✅ Exact match | Optional |
| `is_winner` | `is_winner` | BOOLEAN | ✅ Exact match | |
| `notes` | `notes` | TEXT | ✅ Exact match | Optional |

---

## 7. CREATEPLAYREQUEST INTERFACE

Type dedicated to **creating** a play. Renamed from `CreateSessionPayload`. Never returned by the backend — decomposed into `game_plays` + `players_play` rows.

### Frontend Interface
```typescript
interface CreatePlayRequest {
  game_id: number
  play_date?: string
  duration_minutes?: number
  winner_player_id?: number
  play_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string
  players: Array<{
    player_id: number
    character_id?: number
    score: number
    placement?: number
    is_winner?: boolean
    notes?: string
  }>
}
```

Used exclusively in `ApiService.createPlay()` and play creation hooks.

---

## MAPPING SUMMARY

### 🟢 Overall Status
✅ **Players Table**: 100% mapped  
✅ **Games Table**: 100% mapped  
✅ **Game_Expansions Table**: 100% mapped  
✅ **Game_Characters Table**: 100% mapped  
✅ **Game_Plays Table**: 100% mapped  
✅ **Players_Play Table**: 100% mapped  
✅ **CreatePlayRequest**: Creation type documented (not directly persisted)

### 🔄 Computed Fields

| Field | Source | Display |
|-------|--------|---------|
| `PlayerStatistics.games_played` | `player_statistics` view | Count of distinct plays |
| `PlayerStatistics.wins` | `player_statistics` view | Count of winning plays |
| `PlayerStatistics.total_score` | `player_statistics` view | Sum of scores |
| `PlayerStatistics.average_score` | `player_statistics` view | Average score |
| `PlayerStatistics.win_percentage` | `player_statistics` view | `wins / games_played * 100` |

### 🔄 Automatic Fields (DB only)
- **`created_at`**: Auto-filled at creation via `CURRENT_TIMESTAMP` default
- **`updated_at`**: Auto-filled on modification via SQL triggers

---

## Business Rules

- **Automatic Fields (`created_at`, `updated_at`)**: Managed exclusively by the database. Must not be sent in `POST` or `PUT` requests from the frontend.
- **Data Relations**:
  - `Game.expansions`: Loaded from `game_expansions` if `Game.has_expansion` is `true`.
  - `Game.characters`: Loaded from `game_characters` if `Game.has_characters` is `true`.
- **Stats**: Always read from the `player_statistics` view — never from raw `players` columns.
- **Play type**: `play_type` in `game_plays` is a CHECK constraint — invalid values are rejected at the DB layer.
