# Sprint 5 — Mode Tournoi

## Problème
Non implémenté. Nécessite un nouveau module complet (schéma, backend, frontend).

## État actuel
Aucune référence à des tournois dans le codebase.

## Ce qui manque

### 1. Schéma BDD
```sql
CREATE TABLE tournaments (
  tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(game_id),
  name TEXT NOT NULL,
  format TEXT NOT NULL,  -- 'single_elimination' | 'round_robin'
  status TEXT DEFAULT 'pending', -- pending | in_progress | completed
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tournament_participants (
  tournament_id INTEGER NOT NULL REFERENCES tournaments(tournament_id),
  player_id INTEGER NOT NULL REFERENCES players(player_id),
  PRIMARY KEY (tournament_id, player_id)
);

CREATE TABLE tournament_rounds (
  round_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(tournament_id),
  round_number INTEGER NOT NULL,
  session_id INTEGER REFERENCES game_sessions(session_id)
);
```

### 2. Backend
- CRUD `/api/tournaments`
- `POST /api/tournaments/:id/start` — générer les matchs du premier tour
- `GET /api/tournaments/:id/bracket` — état actuel du bracket

### 3. Frontend
- Page `TournamentPage` : liste des tournois
- Vue bracket (affichage arbre élimination directe ou tableau round-robin)
- Intégration avec `NewGamePage` pour lier une session à un match de tournoi

## Estimation
2-3 semaines
