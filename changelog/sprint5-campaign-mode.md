# Sprint 5 — Mode Campagne Multi-Scénarios

## Problème
Le type `campaign` est supporté en base de données et dans les types TypeScript, mais il n'y a aucune interface pour gérer une campagne multi-sessions liée (progression, scénarios, continuité des personnages).

## État actuel

### Infrastructure disponible
- `backend/database/schema.sql` : `session_type` supporte `'campaign'`
- `src/types/index.ts` : `GameSession.session_type: 'competitive' | 'cooperative' | 'campaign' | 'hybrid'`
- Les sessions de type `campaign` peuvent déjà être créées et sauvegardées

### Ce qui manque
- Aucune relation entre les sessions d'une même campagne
- Aucun concept de "scénario" numéroté ou nommé
- Aucune gestion de progression des personnages entre sessions
- Aucune UI dédiée campagne

## Ce qui manque

### 1. Schéma BDD
```sql
CREATE TABLE campaigns (
  campaign_id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(game_id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active | completed | abandoned
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (game_id) REFERENCES games(game_id)
);

ALTER TABLE game_sessions ADD COLUMN campaign_id INTEGER REFERENCES campaigns(campaign_id);
ALTER TABLE game_sessions ADD COLUMN scenario_number INTEGER;
ALTER TABLE game_sessions ADD COLUMN scenario_name TEXT;
```

### 2. Types TypeScript
- `Campaign` interface dans `src/types/index.ts`
- `GameSession.campaign_id?: number`
- `GameSession.scenario_number?: number`

### 3. Backend
- CRUD `/api/campaigns` (GET, POST, PUT, DELETE)
- `GET /api/campaigns/:id/sessions` — toutes les sessions d'une campagne
- `DatabaseManager.ts` — méthodes campaign

### 4. Frontend
- Page `CampaignPage` : liste des scénarios, progression, résumé
- Dans `NewGamePage` : option "Ajouter à une campagne existante" si session type = campaign
- Vue timeline des sessions d'une campagne

## Inspiration
`board-game-scorekeep` a un système campagne complet à étudier.

## Estimation
3-4 semaines
