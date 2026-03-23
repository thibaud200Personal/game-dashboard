# Sprint 4 — Service UltraBoardGames

## Problème
Aucune trace d'UltraBoardGames dans le codebase. Le service doit être copié depuis le projet `boardGameScore` où il est complet et fonctionnel.

## État actuel
- **Aucun fichier** `externalGameDataService.ts` ou similaire dans ce projet
- `backend/server.ts` : uniquement les routes BGG (`/api/bgg/*`), aucune route externe
- Le projet `boardGameScore` (`C:\git\boardGameScore`) a le service complet

## Source à copier

### `C:\git\boardGameScore\backend\src\services\externalGameDataService.ts`
- Mapping BGG ID → slug UltraBoardGames déjà fait :
  - Citadels: `478` → `'citadels'`
  - Dark Souls: `197831` → `'dark-souls'`
  - Zombicide: `113924` → `'zombicide'`
  - Arkham Horror: `15987` → `'arkham-horror'`
  - This War of Mine: `188920` → `'this-war-of-mine'`
- Structure HTML scraping avec URLs testées
- Architecture prête avec mock data

## Ce qui manque dans ce projet

### 1. `backend/services/externalGameDataService.ts`
Copier depuis `boardGameScore` et adapter :
- Vérifier les imports (paths, types)
- Adapter les interfaces au `src/types/index.ts` du projet actuel

### 2. Route dans `backend/server.ts`
```typescript
app.get('/api/external/game/:bggId', async (req, res) => {
  const { bggId } = req.params;
  const data = await externalGameDataService.getGameData(parseInt(bggId));
  res.json(data);
});
```

### 3. `src/services/ApiService.ts`
Ajouter méthode :
```typescript
getExternalGameData(bggId: number): Promise<ExternalGameData>
```

### 4. Interface `ExternalGameData` dans `src/types/index.ts`
Définir le type retourné par UltraBoardGames (personnages, images, etc.)

## Note
Voir `project_character_api.md` en mémoire : un projet Java séparé (`C:\git\boardGameCharacterApi`) est aussi planifié pour les personnages. Décider si UltraBoardGames ou le Java API est la source privilégiée.

## Fichiers à créer/modifier
- `backend/services/externalGameDataService.ts` (copier + adapter)
- `backend/server.ts` — ajouter route
- `src/services/ApiService.ts` — ajouter méthode
- `src/types/index.ts` — ajouter interface `ExternalGameData`

## Estimation
1-2 jours (copie + adaptation)
