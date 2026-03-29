# Database Structure for Board Game Score Tracker

## Overview
This document outlines the database schema for the Board Game Score Tracker application, designed to store comprehensive information about players, games, game sessions, and scoring data.

## Tables

### 1. Players Table
Stores information about individual players in the system.

```sql
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    pseudo TEXT, -- alias unique (ajouté via runMigrations(), UNIQUE INDEX idx_players_pseudo COLLATE NOCASE)
    avatar TEXT, -- URL to avatar image
    games_played INTEGER DEFAULT 0,  -- ⚠️ voir note dette technique ci-dessous
    wins INTEGER DEFAULT 0,           -- ⚠️ voir note dette technique ci-dessous
    total_score INTEGER DEFAULT 0,    -- ⚠️ voir note dette technique ci-dessous
    average_score REAL DEFAULT 0.0,   -- ⚠️ voir note dette technique ci-dessous
    favorite_game TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> ⚠️ **Dette technique — colonnes stats dénormalisées**
>
> Les colonnes `games_played`, `wins`, `total_score`, `average_score` sont **dupliquées** : elles existent dans la table `players` **et** sont recalculées dynamiquement dans la vue `player_statistics` à partir des données réelles de `session_players`.
>
> **Situation actuelle :** le backend lit toujours via la vue (`player_statistics`), jamais depuis les colonnes stockées. Les colonnes de la table restent donc à leur valeur par défaut (`0`) — elles ne sont jamais mises à jour par le système de sessions. Il n'y a aucun trigger ni logique applicative qui les synchronise.
>
> **Conséquence :** ces colonnes sont mortes en lecture. Toute valeur affichée provient de la vue.
>
> **Décision à prendre :**
> - **Option A (recommandée) — supprimer les colonnes de `players`**, utiliser uniquement la vue. Source de vérité unique, pas de risque de désynchronisation.
> - **Option B — conserver et synchroniser** : mettre à jour les colonnes à chaque création/modification de session (via trigger SQL ou code applicatif). Redondant mais parfois utile pour les perfs sur très gros volume.
>
> **Statut :** non tranché. Conserver pour l'instant (rétrocompatibilité de l'API), à nettoyer lors d'un sprint dédié.

### 2. Games Table
Stores comprehensive information about board games.

```sql
CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bgg_id INTEGER UNIQUE, -- BoardGameGeek ID
    thumbnail TEXT, -- URL miniature BGG
    playing_time INTEGER, -- durée typique en minutes
    min_playtime INTEGER,
    max_playtime INTEGER,
    categories TEXT, -- JSON array
    mechanics TEXT, -- JSON array
    families TEXT, -- JSON array
    name TEXT NOT NULL,
    description TEXT,
    image TEXT, -- URL to game image
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    duration TEXT, -- e.g., "60-90 min"
    difficulty TEXT, -- Beginner, Intermediate, Expert
    category TEXT,
    year_published INTEGER,
    publisher TEXT,
    designer TEXT,
    bgg_rating REAL, -- BGG rating (0.0-10.0)
    weight REAL, -- BGG complexity weight (1.0-5.0)
    age_min INTEGER,
    game_type TEXT CHECK (game_type IN ('competitive', 'cooperative', 'campaign', 'hybrid')),
    supports_cooperative BOOLEAN DEFAULT FALSE,
    supports_competitive BOOLEAN DEFAULT FALSE,
    supports_campaign BOOLEAN DEFAULT FALSE,
    supports_hybrid BOOLEAN DEFAULT FALSE,
    has_expansion BOOLEAN DEFAULT FALSE,
    has_characters BOOLEAN DEFAULT FALSE,
    is_expansion INTEGER DEFAULT 0, -- 1 si ce jeu est lui-même une extension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Game Expansions Table
Stores information about game expansions.

```sql
CREATE TABLE game_expansions (
    expansion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    bgg_expansion_id INTEGER,
    name TEXT NOT NULL,
    year_published INTEGER,
    description TEXT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);
```

### 4. Game Characters Table
Stores information about character roles/classes available in games.

```sql
CREATE TABLE game_characters (
    character_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    character_key TEXT NOT NULL, -- unique identifier for the character
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT, -- URL to character avatar image
    abilities TEXT, -- JSON array of abilities
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);
```

### 5. Game Sessions Table
Stores information about individual game sessions/matches.

```sql
CREATE TABLE game_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    winner_player_id INTEGER,
    session_type TEXT CHECK (session_type IN ('competitive', 'cooperative', 'campaign')) DEFAULT 'competitive',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_player_id) REFERENCES players(player_id) ON DELETE SET NULL
);
```

### 6. Session Players Table
Links players to game sessions with their scores and performance.

```sql
CREATE TABLE session_players (
    session_player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    character_id INTEGER, -- Character/role played (if applicable)
    score INTEGER DEFAULT 0,
    placement INTEGER, -- Final ranking/placement in the game
    is_winner BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES game_characters(character_id) ON DELETE SET NULL
);
```

### 7. Player Statistics View
A view that calculates player statistics dynamically.

```sql
CREATE VIEW player_statistics AS
SELECT 
    p.player_id,
    p.player_name,
    p.avatar,
    COUNT(DISTINCT sp.session_id) as games_played,
    COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) as wins,
    COALESCE(SUM(sp.score), 0) as total_score,
    COALESCE(AVG(sp.score), 0) as average_score,
    (COUNT(CASE WHEN sp.is_winner = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT sp.session_id), 0)) as win_percentage,
    p.favorite_game,
    p.created_at
FROM players p
LEFT JOIN session_players sp ON p.player_id = sp.player_id
GROUP BY p.player_id, p.player_name, p.avatar, p.favorite_game, p.created_at;
```

### 8. Game Statistics View
A view that calculates game statistics dynamically.

```sql
CREATE VIEW game_statistics AS
SELECT 
    g.game_id,
    g.name,
    g.image,
    g.min_players,
    g.max_players,
    g.difficulty,
    g.category,
    g.year_published,
    g.bgg_rating,
    COUNT(DISTINCT gs.session_id) as times_played,
    (SELECT COUNT(DISTINCT sp.player_id) FROM session_players sp WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) as unique_players,
    (SELECT AVG(sp.score) FROM session_players sp WHERE sp.session_id IN (SELECT session_id FROM game_sessions WHERE game_id = g.game_id)) as average_score,
    (SELECT AVG(gs_inner.duration_minutes) FROM game_sessions gs_inner WHERE gs_inner.game_id = g.game_id) as average_duration,
    g.created_at
FROM games g
LEFT JOIN game_sessions gs ON g.game_id = gs.game_id
GROUP BY g.game_id, g.name, g.image, g.min_players, g.max_players, 
         g.difficulty, g.category, g.year_published, g.bgg_rating, g.created_at;
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(session_date);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_session_players_session_id ON session_players(session_id);
CREATE INDEX idx_session_players_player_id ON session_players(player_id);
CREATE INDEX idx_game_expansions_game_id ON game_expansions(game_id);
CREATE INDEX idx_game_characters_game_id ON game_characters(game_id);
```

## Sample Data Relationships

### Example Player Record
```json
{
  "player_id": 1,
  "player_name": "Jane",
  "avatar": "https://example.com/avatar.jpg",
  "games_played": 45,
  "wins": 28,
  "total_score": 2100,
  "average_score": 46.7,
  "favorite_game": "Strategy Pro"
}
```

### Example Game Record
```json
{
  "game_id": 1,
  "bgg_id": 12345,
  "name": "Strategy Pro",
  "min_players": 2,
  "max_players": 4,
  "game_type": "competitive",
  "has_characters": true,
  "has_expansion": false
}
```

### Example Session Record
```json
{
  "session_id": 1,
  "game_id": 1,
  "session_date": "2024-03-15 19:30:00",
  "duration_minutes": 75,
  "winner_player_id": 1,
  "session_type": "competitive"
}
```

## BGG Catalog Table

Table catalogue locale contenant l'ensemble des jeux BGG, importée depuis le dump CSV mensuel de BoardGameGeek. Permet une recherche full-text et un filtre par année/extension sans dépendre de l'API geekdo en temps réel.

```sql
CREATE TABLE IF NOT EXISTS bgg_catalog (
    bgg_id         INTEGER PRIMARY KEY,  -- BGG ID (source: CSV dump)
    name           TEXT NOT NULL,         -- Nom du jeu
    year_published INTEGER,               -- Année de publication (nullable)
    is_expansion   INTEGER NOT NULL DEFAULT 0  -- 0 = jeu de base, 1 = extension
);
CREATE INDEX IF NOT EXISTS idx_bgg_catalog_name ON bgg_catalog(name);
```

**Usage :** La table est peuplée par un script d'import one-shot (`npm run import-bgg-catalog`, à implémenter). Elle est interrogée pour la recherche dans `BGGSearch` à la place de l'API geekdo. Au clic sur un résultat, `getGameDetails(bgg_id)` appelle toujours l'API geekdo pour les métadonnées complètes (image, mécaniques, etc.).

**Source :** `boardgames_ranks.csv` — dump mensuel BGG (~175k lignes, colonnes : id, name, yearpublished, rank, bayesaverage, is_expansion).

## Import / Export Log Table

Table à ligne unique (toujours `id = 1`) servant de journal des dernières opérations de data management. Mise à jour automatiquement lors de chaque opération.

```sql
CREATE TABLE IF NOT EXISTS log_import (
    id                      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bgg_catalog_imported_at TIMESTAMP,  -- dernière import catalogue BGG
    data_exported_at        TIMESTAMP,  -- dernier export des données
    data_imported_at        TIMESTAMP   -- dernier import des données
);
```

**Colonnes :**
- `bgg_catalog_imported_at` : mis à jour par `importBggCatalog()` dans `DatabaseManager`
- `data_exported_at` : mis à jour lors de l'implémentation future de l'export données
- `data_imported_at` : mis à jour lors de l'implémentation future de l'import données

**Méthodes DatabaseManager :** `getImportLog()`, `updateImportLog(field)`

## Migration Notes

- The current in-memory data structure can be migrated to this database schema
- Player statistics should be calculated dynamically using views rather than stored
- Game expansions and characters are normalized into separate tables for better data integrity
- Session tracking allows for comprehensive game history and analytics