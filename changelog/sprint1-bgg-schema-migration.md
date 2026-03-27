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

## ⚠️ base_game_id — Différé (nécessite analyse)

`base_game_id` retourné par BGG est le **BGG ID** du jeu de base (ex: Wingspan European Expansion → `base_game_id = 266192`), **pas** notre `game_id` local.

Pour être exploitable, il faudrait :
- Stocker la colonne comme `base_game_bgg_id INTEGER` (nom non ambigu)
- Résoudre la FK locale via `JOIN games ON bgg_id = base_game_bgg_id` — ne fonctionne que si le jeu de base est aussi dans notre BDD
- Gérer le cas où le jeu de base n'est pas encore importé (NULL FK côté local)

Ce n'est pas une simple colonne à brancher. La décision sur le nommage et la stratégie FK est à prendre avant implémentation.

**`families` : non stocké** — données trop verbeuses, peu exploitables.

## ⚠️ has_expansion vs is_expansion — Clarification architecture

Les deux flags ont des sémantiques distinctes et la stratégie choisie est :

- **`has_expansion`** : ce jeu *possède* des extensions → liste dans `game_expansions` (importée depuis BGG via `boardgameexpansion` links)
- **`is_expansion`** : ce jeu *est lui-même* une extension d'un autre jeu → flag sur `games`

Une extension peut donc exister à deux endroits simultanément :
1. Dans `game_expansions` (référencée par le jeu de base, sans être importée)
2. Dans `games` avec `is_expansion = 1` (si importée comme jeu à part entière)

**C'est intentionnel** — `game_expansions` permet de lister les extensions connues sans les importer. Si on importe l'extension, elle rejoint `games`. Le lien entre les deux se fait via `games.bgg_id = game_expansions.bgg_expansion_id` — même problème que `base_game_bgg_id`, même chantier.

**Incohérence `year_published` :** BGG ne fournit pas l'année dans les liens `boardgameexpansion` (juste `objectid` + `name`). `bggService.ts` hardcode `year_published: 0` → stocké `NULL` en base. Pas bloquant mais les années d'extensions sont toujours nulles après import BGG.

**Pas de changement pour le moment** — à traiter avec `base_game_bgg_id` dans le même chantier.

## 💡 Idée future — Filtre extensions

Une extension (`is_expansion = 1`) ne peut pas être jouée sans son jeu de base. À terme, envisager :
- Masquer les extensions dans la liste de sélection de session (ou les griser)
- Ou les regrouper sous leur jeu de base dans la vue Jeux

**Pas de filtre pour le moment** — noté pour y revenir quand `base_game_bgg_id` sera implémenté.

## Estimation
2-3 jours
