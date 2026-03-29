# Documentation des Mappages de Champs : Frontend

## Vue d'ensemble

Ce document présente les correspondances entre les interfaces frontend et la base de données pour le projet Board Game Dashboard.

## Méthodologie d'Audit

✅ **Correspondance exacte** - Le champ existe avec le même nom et type  
🔄 **Champ calculé** - Champ virtuel généré côté frontend  
🔗 **Relation** - Champ relié à une autre table

---

## 1. INTERFACE PLAYER

### Interface Frontend
```typescript
interface Player {
  player_id: number
  player_name: string
  pseudo: string         // alias/pseudo unique (ajouté via migration runMigrations())
  avatar?: string        // optionnel (aligné BDD)
  stats?: string         // champ virtuel frontend uniquement
  games_played: number
  wins: number
  total_score: number
  average_score: number
  favorite_game: string
  created_at: Date
  updated_at?: Date
}
```

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `player_id` | `player_id` | INTEGER | ✅ Correspondance exacte | |
| `player_name` | `player_name` | VARCHAR(100) | ✅ Correspondance exacte | |
| `pseudo` | `pseudo` | TEXT UNIQUE | ✅ Correspondance exacte | Ajouté via `runMigrations()` dans DatabaseManager |
| `avatar` | `avatar` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `games_played` | `games_played` | INTEGER | ⚠️ Dupliqué — voir note | Colonne en table ET vue `player_statistics` |
| `wins` | `wins` | INTEGER | ⚠️ Dupliqué — voir note | Colonne en table ET vue `player_statistics` |
| `total_score` | `total_score` | INTEGER | ⚠️ Dupliqué — voir note | Colonne en table ET vue `player_statistics` |
| `average_score` | `average_score` | DECIMAL(5,2) | ⚠️ Dupliqué — voir note | Colonne en table ET vue `player_statistics` |
| `favorite_game` | `favorite_game` | VARCHAR(255) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `created_at` | `created_at` | TIMESTAMP | ✅ Correspondance exacte | Auto-généré en BDD |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Correspondance exacte | Auto-généré en BDD |
| `stats` | 🔄 Calculé frontend | Champ virtuel | 🔄 Champ virtuel pour affichage | Format: "2,100 pts" |

> ⚠️ **Dette technique — stats dénormalisées dans `players`**
>
> `games_played`, `wins`, `total_score`, `average_score` sont présents à la fois comme colonnes dans la table `players` **et** comme colonnes calculées dans la vue SQL `player_statistics` (calculées depuis `session_players`).
> Le backend lit **toujours** via la vue — les colonnes stockées dans `players` restent à `0` en permanence car aucun trigger ni code applicatif ne les met à jour.
> **À résoudre :** supprimer ces 4 colonnes de la table `players` (Option A, recommandée) ou les synchroniser via trigger (Option B). Voir `database-structure.md` pour le détail.

---

## 2. INTERFACE GAME

### Interface Frontend
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

> **Note :** `game_type TEXT CHECK('competitive'|'cooperative'|'campaign'|'hybrid') DEFAULT 'competitive'` est présent dans `schema.sql` mais absent de l'interface TypeScript `Game`. La valeur par défaut BDD (`'competitive'`) garantit la cohérence. Ce champ sera ajouté à l'interface dans une future itération (voir ROADMAP).

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `game_id` | `game_id` | INTEGER | ✅ Correspondance exacte | |
| `bgg_id` | `bgg_id` | INTEGER | ✅ Correspondance exacte | Optionnel, UNIQUE |
| `thumbnail` | `thumbnail` | TEXT | ✅ Correspondance exacte | Optionnel — URL miniature BGG |
| `playing_time` | `playing_time` | INTEGER | ✅ Correspondance exacte | Optionnel — durée typique (minutes) |
| `min_playtime` | `min_playtime` | INTEGER | ✅ Correspondance exacte | Optionnel |
| `max_playtime` | `max_playtime` | INTEGER | ✅ Correspondance exacte | Optionnel |
| `categories` | `categories` | TEXT (JSON) | ✅ Correspondance exacte | Optionnel — tableau JSON |
| `mechanics` | `mechanics` | TEXT (JSON) | ✅ Correspondance exacte | Optionnel — tableau JSON |
| `families` | `families` | TEXT (JSON) | ✅ Correspondance exacte | Optionnel — tableau JSON |
| `name` | `name` | VARCHAR(255) | ✅ Correspondance exacte | |
| `description` | `description` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `image` | `image` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `min_players` | `min_players` | INTEGER | ✅ Correspondance exacte | |
| `max_players` | `max_players` | INTEGER | ✅ Correspondance exacte | |
| `duration` | `duration` | VARCHAR(50) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `difficulty` | `difficulty` | VARCHAR(50) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `category` | `category` | VARCHAR(100) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `year_published` | `year_published` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `publisher` | `publisher` | VARCHAR(255) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `designer` | `designer` | VARCHAR(255) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `bgg_rating` | `bgg_rating` | DECIMAL(3,1) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `weight` | `weight` | DECIMAL(3,1) | ✅ Correspondance exacte | Optionnel des deux côtés |
| `age_min` | `age_min` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `supports_cooperative` | `supports_cooperative` | BOOLEAN | ✅ Correspondance exacte | |
| `supports_competitive` | `supports_competitive` | BOOLEAN | ✅ Correspondance exacte | |
| `supports_campaign` | `supports_campaign` | BOOLEAN | ✅ Correspondance exacte | |
| `supports_hybrid` | `supports_hybrid` | BOOLEAN | ✅ Correspondance exacte | |
| `has_expansion` | `has_expansion` | BOOLEAN | ✅ Correspondance exacte | |
| `has_characters` | `has_characters` | BOOLEAN | ✅ Correspondance exacte | |
| `is_expansion` | `is_expansion` | INTEGER (0/1) | ✅ Correspondance exacte | Vrai si ce jeu est lui-même une extension |
| — | `game_type` | TEXT CHECK | ⚠️ Absent du type TS | Présent en BDD (DEFAULT 'competitive') — voir note ci-dessus |
| `created_at` | `created_at` | TIMESTAMP | ✅ Correspondance exacte | Auto-généré en BDD |
| `updated_at` | `updated_at` | TIMESTAMP | ✅ Correspondance exacte | Auto-généré en BDD |
| `expansions` | 🔗 Relation | Table séparée | 🔗 Relation JOIN | Table `game_expansions` |
| `characters` | 🔗 Relation | Table séparée | 🔗 Relation JOIN | Table `game_characters` |
| `players` | 🔄 Calculé frontend | Champ virtuel | 🔄 Champ virtuel pour affichage | Format: "2-4" |

---

## 3. INTERFACE GAMEEXPANSION

### Interface Frontend
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

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `expansion_id` | `expansion_id` | INTEGER | ✅ Correspondance exacte | Optionnel en frontend (auto-gen) |
| `game_id` | `game_id` | INTEGER | ✅ Correspondance exacte | Optionnel en frontend (fourni par parent) |
| `bgg_expansion_id` | `bgg_expansion_id` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `name` | `name` | VARCHAR(255) | ✅ Correspondance exacte | |
| `year_published` | `year_published` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `description` | `description` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |

---

## 4. INTERFACE GAMECHARACTER

### Interface Frontend
```typescript
interface GameCharacter {
  character_id?: number
  game_id?: number
  character_key: string
  name: string
  description?: string  // optionnel (aligné BDD)
  avatar?: string
  abilities: string[]   // requis, stocké en JSON en BDD
}
```

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `character_id` | `character_id` | INTEGER | ✅ Correspondance exacte | Optionnel en frontend (auto-gen) |
| `game_id` | `game_id` | INTEGER | ✅ Correspondance exacte | Optionnel en frontend (fourni par parent) |
| `character_key` | `character_key` | VARCHAR(100) | ✅ Correspondance exacte | |
| `name` | `name` | VARCHAR(255) | ✅ Correspondance exacte | |
| `description` | `description` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `avatar` | `avatar` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `abilities` | `abilities` | TEXT (JSON) | ✅ Correspondance exacte | Array→JSON conversion |

---

## 5. INTERFACE GAMESESSION

### Interface Frontend
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

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `session_id` | `session_id` | INTEGER | ✅ Correspondance exacte | |
| `game_id` | `game_id` | INTEGER | ✅ Correspondance exacte | |
| `session_date` | `session_date` | TIMESTAMP | ✅ Correspondance exacte | |
| `duration_minutes` | `duration_minutes` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `winner_player_id` | `winner_player_id` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `session_type` | `session_type` | VARCHAR(20) | ✅ Correspondance exacte | `competitive\|cooperative\|campaign\|hybrid` |
| `notes` | `notes` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |
| `created_at` | `created_at` | TIMESTAMP | ✅ Correspondance exacte | Auto-généré en BDD |

---

## 6. INTERFACE SESSIONPLAYER

### Interface Frontend
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

### Correspondances Base de Données

| **Champ Frontend** | **Champ BDD** | **Type BDD** | **Status** | **Notes** |
|-------------------|---------------|--------------|------------|-----------|
| `session_player_id` | `session_player_id` | INTEGER | ✅ Correspondance exacte | Optionnel en frontend (auto-gen) |
| `session_id` | `session_id` | INTEGER | ✅ Correspondance exacte | |
| `player_id` | `player_id` | INTEGER | ✅ Correspondance exacte | |
| `character_id` | `character_id` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `score` | `score` | INTEGER | ✅ Correspondance exacte | |
| `placement` | `placement` | INTEGER | ✅ Correspondance exacte | Optionnel des deux côtés |
| `is_winner` | `is_winner` | BOOLEAN | ✅ Correspondance exacte | |
| `notes` | `notes` | TEXT | ✅ Correspondance exacte | Optionnel des deux côtés |

---

## 7. INTERFACE CREATESESSIONPAYLOAD

Type dédié à la **création** d'une session. Distinct de `GameSession` car il inclut les joueurs et les champs spécifiques aux modes coopératif/campagne. N'est jamais retourné par le backend.

### Interface Frontend
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
  // Champs coopératif/campagne
  team_score?: number
  team_success?: boolean
  difficulty_level?: string
  objectives?: Array<{ description: string; completed: boolean; points: number }>
}
```

Ce type est utilisé exclusivement dans `ApiService.createSession()` et les hooks de création de session. Il ne correspond pas à une table BDD unique — le backend le décompose en `game_sessions` + `session_players`.

---

## RÉSUMÉ DES CORRESPONDANCES

### 🟢 Statut Global
✅ **Table Players** : 100% mappée (inclus `pseudo` via migration)
✅ **Table Games** : 100% mappée (inclus BGG étendu, `is_expansion`) — voir note `game_type`
✅ **Table Game_Expansions** : 100% mappée
✅ **Table Game_Characters** : 100% mappée
✅ **Table Game_Sessions** : 100% mappée
✅ **Table Session_Players** : 100% mappée
✅ **CreateSessionPayload** : Type de création documenté (non persisté directement)

**Note :** Le champ `game_type` (BDD) n'a pas encore d'équivalent dans l'interface TypeScript `Game`. C'est un écart documenté et intentionnel — la valeur par défaut BDD garantit la cohérence des données.

### 🔄 Champs Calculés (Frontend uniquement)
- **`stats`** (Players) : Calculé = `${total_score} pts`
- **`players`** (Games) : Calculé = `${min_players}-${max_players}`

### 🔄 Champs Automatiques (BDD uniquement)
- **`created_at`** : Auto-rempli à la création avec CURRENT_TIMESTAMP
- **`updated_at`** : Auto-rempli à la modification via triggers

---

## 7. Règles de Gestion et Statut

### Règles Clés
-   **Champs Automatiques (`created_at`, `updated_at`)**: Ces champs sont gérés exclusivement par la base de données via des valeurs par défaut (`CURRENT_TIMESTAMP`) et des triggers. Ils ne doivent pas être envoyés dans les requêtes `POST` ou `PUT` depuis le frontend.
-   **Champs Calculés (Frontend)**:
    -   `Player.stats`: Généré côté client pour l'affichage (ex: `"2,100 pts"`).
    -   `Game.players`: Généré côté client à partir de `min_players` et `max_players` (ex: `"2-4"`).
-   **Relations de Données**:
    -   `Game.expansions`: Chargées depuis la table `game_expansions` si `Game.has_expansion` est `true`.
    -   `Game.characters`: Chargées depuis la table `game_characters` si `Game.has_characters` est `true`.

### Statut Final
🎯 **Alignement quasi-complet** : Toutes les interfaces frontend sont alignées avec le schéma BDD, à l'exception de `game_type` (écart documenté, intentionnel). Zéro `any` dans les interfaces. La structure est strictement typée de bout en bout (DB schema → `src/types/index.ts` → backend → frontend).
