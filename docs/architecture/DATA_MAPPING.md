# Field Mapping Documentation: Frontend

## Overview

This document presents the mappings between frontend interfaces and the database for the Board Game Dashboard project.

## Audit Methodology

✅ **Exact match** - Field exists with the same name and type  
🔄 **Computed field** - Virtual field generated on the frontend  
🔗 **Relation** - Field linked to another table

---

## 1. PLAYER INTERFACE

### Frontend Interface
```typescript
interface Player {
  player_id: number
  player_name: string
  pseudo: string         // unique alias/pseudo (added via migration runMigrations())
  avatar?: string        // optional (aligned with DB)
  stats?: string         // frontend-only virtual field
  games_played: number
  wins: number
  total_score: number
  average_score: number
  favorite_game: string
  created_at: Date
  updated_at?: Date
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `player_id` | `player_id` | INTEGER | ✅ Exact match | |
| `player_name` | `player_name` | VARCHAR(100) | ✅ Exact match | |
| `pseudo` | `pseudo` | TEXT UNIQUE | ✅ Exact match | Added via `runMigrations()` in DatabaseManager |
| `avatar` | `avatar` | TEXT | ✅ Exact match | Optional on both sides |
| `games_played` | `games_played` | INTEGER | ⚠️ Duplicated — see note | Column in table AND in `player_statistics` view |
| `wins` | `wins` | INTEGER | ⚠️ Duplicated — see note | Column in table AND in `player_statistics` view |
| `total_score` | `total_score` | INTEGER | ⚠️ Duplicated — see note | Column in table AND in `player_statistics` view |
| `average_score` | `average_score` | DECIMAL(5,2) | ⚠️ Duplicated — see note | Column in table AND in `player_statistics` view |
| `favorite_game` | `favorite_game` | VARCHAR(255) | ✅ Exact match | Optional on both sides |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated in DB |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Exact match | Auto-generated in DB |
| `stats` | 🔄 Frontend computed | Virtual field | 🔄 Virtual field for display | Format: "2,100 pts" |

> ⚠️ **Technical Debt — denormalized stats in `players`**
>
> `games_played`, `wins`, `total_score`, `average_score` exist both as columns in the `players` table **and** as computed columns in the SQL view `player_statistics` (calculated from `session_players`).
> The backend **always** reads via the view — the stored columns in `players` remain at `0` permanently because no trigger or application code updates them.
> **To resolve:** drop these 4 columns from the `players` table (Option A, recommended) or sync them via trigger (Option B). See `database-structure.md` for details.

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
  categories?: string    // JSON array
  mechanics?: string     // JSON array
  families?: string      // JSON array
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
  // Related data
  expansions: GameExpansion[]
  characters: GameCharacter[]
  // Calculated field for display
  players?: string
}
```

> **Note:** `game_type TEXT CHECK('competitive'|'cooperative'|'campaign'|'hybrid') DEFAULT 'competitive'` is present in `schema.sql` but absent from the TypeScript `Game` interface. The DB default value (`'competitive'`) ensures consistency. This field will be added to the interface in a future iteration (see ROADMAP).

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `game_id` | `game_id` | INTEGER | ✅ Exact match | |
| `bgg_id` | `bgg_id` | INTEGER | ✅ Exact match | Optional, UNIQUE |
| `thumbnail` | `thumbnail` | TEXT | ✅ Exact match | Optional — BGG thumbnail URL |
| `playing_time` | `playing_time` | INTEGER | ✅ Exact match | Optional — typical duration (minutes) |
| `min_playtime` | `min_playtime` | INTEGER | ✅ Exact match | Optional |
| `max_playtime` | `max_playtime` | INTEGER | ✅ Exact match | Optional |
| `categories` | `categories` | TEXT (JSON) | ✅ Exact match | Optional — JSON array |
| `mechanics` | `mechanics` | TEXT (JSON) | ✅ Exact match | Optional — JSON array |
| `families` | `families` | TEXT (JSON) | ✅ Exact match | Optional — JSON array |
| `name` | `name` | VARCHAR(255) | ✅ Exact match | |
| `description` | `description` | TEXT | ✅ Exact match | Optional on both sides |
| `image` | `image` | TEXT | ✅ Exact match | Optional on both sides |
| `min_players` | `min_players` | INTEGER | ✅ Exact match | |
| `max_players` | `max_players` | INTEGER | ✅ Exact match | |
| `duration` | `duration` | VARCHAR(50) | ✅ Exact match | Optional on both sides |
| `difficulty` | `difficulty` | VARCHAR(50) | ✅ Exact match | Optional on both sides |
| `category` | `category` | VARCHAR(100) | ✅ Exact match | Optional on both sides |
| `year_published` | `year_published` | INTEGER | ✅ Exact match | Optional on both sides |
| `publisher` | `publisher` | VARCHAR(255) | ✅ Exact match | Optional on both sides |
| `designer` | `designer` | VARCHAR(255) | ✅ Exact match | Optional on both sides |
| `bgg_rating` | `bgg_rating` | DECIMAL(3,1) | ✅ Exact match | Optional on both sides |
| `weight` | `weight` | DECIMAL(3,1) | ✅ Exact match | Optional on both sides |
| `age_min` | `age_min` | INTEGER | ✅ Exact match | Optional on both sides |
| `supports_cooperative` | `supports_cooperative` | BOOLEAN | ✅ Exact match | |
| `supports_competitive` | `supports_competitive` | BOOLEAN | ✅ Exact match | |
| `supports_campaign` | `supports_campaign` | BOOLEAN | ✅ Exact match | |
| `supports_hybrid` | `supports_hybrid` | BOOLEAN | ✅ Exact match | |
| `has_expansion` | `has_expansion` | BOOLEAN | ✅ Exact match | |
| `has_characters` | `has_characters` | BOOLEAN | ✅ Exact match | |
| `is_expansion` | `is_expansion` | INTEGER (0/1) | ✅ Exact match | True if this game is itself an expansion |
| — | `game_type` | TEXT CHECK | ⚠️ Absent from TS type | Present in DB (DEFAULT 'competitive') — see note above |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated in DB |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Exact match | Auto-generated in DB |
| `expansions` | 🔗 Relation | Separate table | 🔗 JOIN relation | `game_expansions` table |
| `characters` | 🔗 Relation | Separate table | 🔗 JOIN relation | `game_characters` table |
| `players` | 🔄 Frontend computed | Virtual field | 🔄 Virtual field for display | Format: "2-4" |

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
| `bgg_expansion_id` | `bgg_expansion_id` | INTEGER | ✅ Exact match | Optional on both sides |
| `name` | `name` | VARCHAR(255) | ✅ Exact match | |
| `year_published` | `year_published` | INTEGER | ✅ Exact match | Optional on both sides |
| `description` | `description` | TEXT | ✅ Exact match | Optional on both sides |

---

## 4. GAMECHARACTER INTERFACE

### Frontend Interface
```typescript
interface GameCharacter {
  character_id?: number
  game_id?: number
  character_key: string
  name: string
  description?: string  // optional (aligned with DB)
  avatar?: string
  abilities: string[]   // required, stored as JSON in DB
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `character_id` | `character_id` | INTEGER | ✅ Exact match | Optional on frontend (auto-gen) |
| `game_id` | `game_id` | INTEGER | ✅ Exact match | Optional on frontend (provided by parent) |
| `character_key` | `character_key` | VARCHAR(100) | ✅ Exact match | |
| `name` | `name` | VARCHAR(255) | ✅ Exact match | |
| `description` | `description` | TEXT | ✅ Exact match | Optional on both sides |
| `avatar` | `avatar` | TEXT | ✅ Exact match | Optional on both sides |
| `abilities` | `abilities` | TEXT (JSON) | ✅ Exact match | Array→JSON conversion |

---

## 5. GAMESESSION INTERFACE

### Frontend Interface
```typescript
interface GameSession {
  session_id?: number
  game_id: number
  session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  session_date: Date
  duration_minutes?: number
  notes?: string
  created_at: Date
  updated_at?: Date
}
```

### Database Mappings

| **Frontend Field** | **DB Field** | **DB Type** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `session_id` | `session_id` | INTEGER | ✅ Exact match | |
| `game_id` | `game_id` | INTEGER | ✅ Exact match | |
| `session_date` | `session_date` | TIMESTAMP | ✅ Exact match | |
| `duration_minutes` | `duration_minutes` | INTEGER | ✅ Exact match | Optional on both sides |
| `winner_player_id` | `winner_player_id` | INTEGER | ✅ Exact match | Optional on both sides |
| `session_type` | `session_type` | VARCHAR(20) | ✅ Exact match | `competitive\|cooperative\|campaign\|hybrid` |
| `notes` | `notes` | TEXT | ✅ Exact match | Optional on both sides |
| `created_at` | `created_at` | TIMESTAMP | ✅ Exact match | Auto-generated in DB |

---

## 6. SESSIONPLAYER INTERFACE

### Frontend Interface
```typescript
interface SessionPlayer {
  session_player_id?: number
  session_id: number
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
| `session_player_id` | `session_player_id` | INTEGER | ✅ Exact match | Optional on frontend (auto-gen) |
| `session_id` | `session_id` | INTEGER | ✅ Exact match | |
| `player_id` | `player_id` | INTEGER | ✅ Exact match | |
| `character_id` | `character_id` | INTEGER | ✅ Exact match | Optional on both sides |
| `score` | `score` | INTEGER | ✅ Exact match | |
| `placement` | `placement` | INTEGER | ✅ Exact match | Optional on both sides |
| `is_winner` | `is_winner` | BOOLEAN | ✅ Exact match | |
| `notes` | `notes` | TEXT | ✅ Exact match | Optional on both sides |

---

## 7. CREATESESSIONPAYLOAD INTERFACE

Type dedicated to **creating** a session. Distinct from `GameSession` because it includes players and fields specific to cooperative/campaign modes. Never returned by the backend.

### Frontend Interface
```typescript
interface CreateSessionPayload {
  game_id: number
  session_date?: Date
  duration_minutes?: number | null
  winner_player_id?: number | null
  session_type?: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'
  notes?: string | null
  players: Array<{
    player_id: number
    score: number
    is_winner: boolean
  }>
  // Cooperative/campaign fields
  team_score?: number
  team_success?: boolean
  difficulty_level?: string
  objectives?: Array<{ description: string; completed: boolean; points: number }>
}
```

This type is used exclusively in `ApiService.createSession()` and session creation hooks. It does not map to a single DB table — the backend decomposes it into `game_sessions` + `session_players`.

---

## MAPPING SUMMARY

### 🟢 Overall Status
✅ **Players Table**: 100% mapped (including `pseudo` via migration)
✅ **Games Table**: 100% mapped (including extended BGG, `is_expansion`) — see `game_type` note
✅ **Game_Expansions Table**: 100% mapped
✅ **Game_Characters Table**: 100% mapped
✅ **Game_Sessions Table**: 100% mapped
✅ **Session_Players Table**: 100% mapped
✅ **CreateSessionPayload**: Creation type documented (not directly persisted)

**Note:** The `game_type` field (DB) does not yet have an equivalent in the TypeScript `Game` interface. This is a documented, intentional gap — the DB default value ensures data consistency.

### 🔄 Computed Fields (Frontend only)
- **`stats`** (Players): Computed = `${total_score} pts`
- **`players`** (Games): Computed = `${min_players}-${max_players}`

### 🔄 Automatic Fields (DB only)
- **`created_at`**: Auto-filled at creation with CURRENT_TIMESTAMP
- **`updated_at`**: Auto-filled on modification via triggers

---

## 7. Business Rules and Status

### Key Rules
-   **Automatic Fields (`created_at`, `updated_at`)**: These fields are managed exclusively by the database via defaults (`CURRENT_TIMESTAMP`) and triggers. They must not be sent in `POST` or `PUT` requests from the frontend.
-   **Computed Fields (Frontend)**:
    -   `Player.stats`: Generated client-side for display (e.g. `"2,100 pts"`).
    -   `Game.players`: Generated client-side from `min_players` and `max_players` (e.g. `"2-4"`).
-   **Data Relations**:
    -   `Game.expansions`: Loaded from the `game_expansions` table if `Game.has_expansion` is `true`.
    -   `Game.characters`: Loaded from the `game_characters` table if `Game.has_characters` is `true`.

### Final Status
🎯 **Near-complete alignment**: All frontend interfaces are aligned with the DB schema, except for `game_type` (documented, intentional gap). Zero `any` in interfaces. The structure is strictly typed end-to-end (DB schema → `src/types/index.ts` → backend → frontend).
