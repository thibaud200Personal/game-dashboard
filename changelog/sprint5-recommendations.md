# Sprint 5 — Système de Recommandations

## Problème
L'historique des parties est disponible mais aucun algorithme de recommandation n'existe.

## État actuel

### Données disponibles pour l'algorithme
- Sessions avec `game_id`, `player_id`, `date`, `session_type`, `score`
- Jeux avec `categories[]`, `mechanics[]`, `weight`, `min/max_players`
- Statistiques joueurs (wins, avg_score, preferred game types)
- Vues SQL `player_statistics` et `game_statistics`

## Ce qui manque

### 1. Route backend
```typescript
GET /api/recommendations/:playerId
```
Retourne une liste de jeux recommandés avec raison (`{ game_id, name, reason, score }`)

### 2. Algorithme (content-based filtering)
Dans `backend/services/recommendationService.ts` :
- Analyser les catégories/mécaniques des jeux les plus joués/appréciés par le joueur
- Scorer les autres jeux selon la similarité (catégories communes, même poids BGG)
- Filtrer les jeux déjà souvent joués récemment

### 3. Frontend
- Section "Pour vous" sur le dashboard (`useDashboard.ts`)
- Cards de jeux recommandés avec raison affichée

## Estimation
2-3 semaines
