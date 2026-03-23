# Sprint 5 — Système d'Achievements

## Problème
Aucune implémentation de gamification/badges. À créer entièrement.

## État actuel
Aucun fichier lié aux achievements dans le projet.

## Ce qui manque

### 1. Schéma BDD
```sql
CREATE TABLE achievements (
  achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,       -- ex: 'first_win', 'play_10_games'
  name TEXT NOT NULL,             -- ex: 'Première Victoire'
  description TEXT,
  icon TEXT,                      -- emoji ou nom d'icône phosphor
  condition_type TEXT NOT NULL,   -- 'win_count' | 'play_count' | 'game_variety' | ...
  condition_value INTEGER         -- seuil numérique
);

CREATE TABLE player_achievements (
  player_id INTEGER NOT NULL REFERENCES players(player_id),
  achievement_id INTEGER NOT NULL REFERENCES achievements(achievement_id),
  earned_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (player_id, achievement_id)
);
```

### 2. Achievements initiaux (données seed)
- `first_win` — Première victoire
- `play_10_games` — 10 parties jouées
- `play_5_different_games` — 5 jeux différents
- `win_streak_3` — 3 victoires consécutives
- `play_cooperative` — Première partie coopérative

### 3. Backend
- `GET /api/players/:id/achievements` — achievements d'un joueur
- Service `achievementEngine.ts` : évaluer les conditions après chaque session POST
- Appelé dans le handler `POST /api/sessions` après création

### 4. Frontend
- Section "Badges" dans `PlayerStatsPage`
- Toast Sonner lors du débloquage : `toast.success('🏆 Achievement débloqué : Première Victoire !')`

## Estimation
1 semaine
