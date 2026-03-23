# Sprint 2 — Tests BGG Backend

## Problème
`backend/bggService.ts`, `backend/database/DatabaseManager.ts` et les routes `/api/bgg/*` dans `server.ts` n'ont **aucun test**. Les appels à `api.geekdo.com` ne sont pas mockés dans la suite de tests existante.

## État actuel
- `src/__tests__/services/bggApi.test.ts` : teste le frontend proxy, mais les appels réels à `geekdo.com` ne sont pas interceptés par MSW → tests fragiles
- `src/__tests__/mocks/server.ts` : handlers pour `/api/bgg/search` et `/api/bgg/game/:id` (backend proxy) uniquement — pas de mock de `api.geekdo.com`
- Aucun fichier de test dans `backend/`

## Ce qui manque

### 1. MSW handlers pour `api.geekdo.com`
Dans `src/__tests__/mocks/server.ts`, ajouter :
```typescript
http.get('https://api.geekdo.com/api/geekdo/items/geekitem/page', ({ request }) => {
  // retourner une réponse GeekdoItem mockée
}),
http.get('https://api.geekdo.com/search/boardgame', ({ request }) => {
  // retourner résultats de recherche mockés
}),
```

### 2. `src/__tests__/unit/technical/bggService.test.ts`
Tests à écrire :
- `parseGeekdoItem()` : transformation correcte des champs (categories, mechanics, is_expansion, characters: [])
- Cache : hit sur 2ème appel identique, expiration après TTL
- Rate limiting : délai appliqué entre 2 appels rapides
- `searchGames('wingspan')` : retourne `BGGSearchResult[]`
- `getGameDetails(266192)` : retourne `BGGGame` complet avec tous les champs
- `getGameDetails(999999)` : throw pour ID inexistant

### 3. `src/__tests__/integration/bggRoutes.test.ts`
Tests à écrire :
- `GET /api/bgg/search?q=wingspan` → 200 + array
- `GET /api/bgg/search?q=` → 400 (validation)
- `GET /api/bgg/game/266192` → 200 + objet BGGGame
- `GET /api/bgg/game/abc` → 400 (ID non numérique)
- `GET /api/bgg/game/999999999` → 404 ou erreur BGG propagée

## Fichiers à créer/modifier
- `src/__tests__/mocks/server.ts` — ajouter handlers geekdo.com
- `src/__tests__/unit/technical/bggService.test.ts` — nouveau
- `src/__tests__/integration/bggRoutes.test.ts` — nouveau

## Estimation
3-4 jours
