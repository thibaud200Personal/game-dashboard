# Sprint 1 — Migration Schema BGG Étendu

## Problème
Les colonnes `thumbnail`, `playing_time`, `min_playtime`, `max_playtime`, `categories`, `mechanics`, `families` **existent** dans `schema.sql` mais ne sont **jamais insérées** dans le code. Les colonnes `designers`, `publishers`, `is_expansion`, `base_game_id` sont **absentes du schéma ET du code**, alors que `bggService.ts` les retourne.

## État actuel

### Ce que `bggService.ts` retourne (disponible)
- `thumbnail`, `playing_time`, `min_playtime`, `max_playtime`
- `categories[]`, `mechanics[]`, `families[]`
- `designers[]`, `publishers[]`
- `is_expansion`, `base_game_id`

### Ce que `DatabaseManager.ts` INSERT (22 colonnes seulement)
`bgg_id, name, description, image, min_players, max_players, duration, difficulty, category, year_published, publisher, designer, bgg_rating, weight, age_min, game_type, supports_cooperative, supports_competitive, supports_campaign, supports_hybrid, has_expansion, has_characters`

→ **thumbnail, playing_time, min_playtime, max_playtime, categories, mechanics, families, designers, publishers, is_expansion, base_game_id ne sont pas persistés.**

## Fichiers à modifier

### 1. `backend/database/schema.sql`
Ajouter 4 colonnes manquantes à la table `games` :
```sql
ALTER TABLE games ADD COLUMN designers TEXT;       -- JSON array ["Bruno Cathala", ...]
ALTER TABLE games ADD COLUMN publishers TEXT;      -- JSON array ["Space Cowboys", ...]
ALTER TABLE games ADD COLUMN is_expansion BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN base_game_id INTEGER; -- FK optionnelle vers games(game_id)
```
Les colonnes `thumbnail`, `playing_time`, `min_playtime`, `max_playtime`, `categories`, `mechanics`, `families` existent déjà dans le schéma.

### 2. `backend/database/DatabaseManager.ts`
**Méthode `addGame` :** étendre INSERT de ~22 à ~32 colonnes :
- Ajouter dans la liste des colonnes : `thumbnail`, `playing_time`, `min_playtime`, `max_playtime`, `categories`, `mechanics`, `families`, `designers`, `publishers`, `is_expansion`, `base_game_id`
- Dans les valeurs : `JSON.stringify(categories)`, `JSON.stringify(mechanics)`, `JSON.stringify(families)`, `JSON.stringify(designers)`, `JSON.stringify(publishers)`, is_expansion, base_game_id

**Méthode `updateGame` :** même extension pour l'UPDATE.

**Méthode `getGameById` / `getAllGames` :** ajouter parsing `JSON.parse()` sur les colonnes JSON au retour.

### 3. `backend/validation/` (schémas Zod)
Mettre à jour `CreateGameRequest` et `UpdateGameRequest` pour inclure les nouveaux champs optionnels :
- `thumbnail?: string`
- `playing_time?: number`
- `min_playtime?: number`
- `max_playtime?: number`
- `categories?: string[]`
- `mechanics?: string[]`
- `families?: string[]`
- `designers?: string[]`
- `publishers?: string[]`
- `is_expansion?: boolean`
- `base_game_id?: number`

## Estimation
2-3 jours
