# Sprint 4 — Sélection Personnages en Session

## Problème
La colonne `session_players.character_id` existe en base de données, mais aucune UI ne permet d'assigner un personnage à un joueur lors de la création d'une session.

## État actuel

### Infrastructure disponible
- **`src/types/index.ts` (ligne 88)** : `SessionPlayer.character_id?: number` — champ existe
- **`backend/database/schema.sql`** : colonne `character_id INTEGER` dans `session_players`
- **`src/types/index.ts`** : `GameCharacter` interface complète (character_id, name, avatar, abilities[])
- **API disponible** : `GET /api/games/:id/characters` — endpoint existant

### Ce qui n'existe pas
- **`src/hooks/useNewGamePage.ts` (lignes 1–194)** : aucune gestion de `character_id` ni de personnages
- **`src/types/index.ts` (lignes 208–224)** : `CreateSessionPayload` ne contient pas de `character_id` par joueur
- **`NewGamePage` / `NewGameView`** : aucun sélecteur de personnage dans le formulaire de création

## Ce qui manque

### 1. Détection dans `NewGamePage`
Quand un jeu est sélectionné, vérifier `game.has_characters === true`.

### 2. `useNewGamePage.ts`
- Ajouter fetch des personnages du jeu sélectionné : `GET /api/games/:id/characters`
- Ajouter état `characterAssignments: Map<playerId, characterId | null>`
- Ajouter handlers `assignCharacter(playerId, characterId)` / `clearCharacter(playerId)`

### 3. UI dans `NewGameView`
- Si `game.has_characters`, afficher pour chaque joueur sélectionné un select ou des chips de personnage
- Chaque joueur peut choisir 1 personnage parmi ceux disponibles
- Personnage optionnel (champ nullable)

### 4. `CreateSessionPayload`
Étendre le type :
```typescript
interface SessionPlayerPayload {
  player_id: number;
  character_id?: number; // AJOUTER
  score?: number;
  placement?: number;
  is_winner: boolean;
}
```

### 5. Backend `DatabaseManager.ts`
Vérifier que `character_id` est bien inclus dans l'INSERT de `session_players` (probablement déjà présent dans le schéma mais à confirmer dans le code).

## Fichiers à modifier
- `src/hooks/useNewGamePage.ts`
- `src/types/index.ts` (CreateSessionPayload / SessionPlayerPayload)
- `src/views/NewGameView.tsx` (ou composant équivalent)
- `backend/database/DatabaseManager.ts` — vérifier INSERT session_players

## Estimation
1-2 jours
