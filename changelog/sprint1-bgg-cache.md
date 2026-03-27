# Sprint 1 — Cache BGG Local

## Problème
Le backend a un cache in-memory qui disparaît au redémarrage du serveur. Le frontend n'a aucun cache : chaque recherche BGG refait un appel réseau complet.

## État actuel

### Backend (`backend/bggService.ts`)
- Cache in-memory : `Map<string, CacheEntry>` (ligne ~111)
- TTL : 24 heures (ligne ~112 : `CACHE_DURATION = 24 * 60 * 60 * 1000`)
- Rate limiting : 1 seconde entre requêtes (ligne ~114 : `RATE_LIMIT_DELAY = 1000`)
- Nettoyage horaire via `setInterval` (ligne ~281)
- **Pas de persistance** : cache perdu au restart serveur

### Frontend (`src/services/bggApi.ts`)
- **Aucun cache**
- Chaque appel à `searchGames()` ou `getGameDetails()` → fetch direct vers `/api/bgg/*`

## Ce qui manque

### Option 1 — Cache localStorage frontend (prioritaire)
Dans `src/services/bggApi.ts` :
```typescript
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function getCached<T>(key: string): T | null {
  const item = localStorage.getItem(`bgg_cache_${key}`);
  if (!item) return null;
  const { data, expires } = JSON.parse(item);
  if (Date.now() > expires) { localStorage.removeItem(`bgg_cache_${key}`); return null; }
  return data as T;
}

function setCached<T>(key: string, data: T): void {
  localStorage.setItem(`bgg_cache_${key}`, JSON.stringify({ data, expires: Date.now() + CACHE_TTL }));
}
```
- Wrapper `searchGames()` : clé `search_${query}`
- Wrapper `getGameDetails()` : clé `game_${bggId}`

### Option 2 — Persistance cache backend (optionnel)
Dans `backend/database/schema.sql` : table `bgg_cache (key TEXT PRIMARY KEY, data TEXT, expires_at INTEGER)`
Dans `backend/bggService.ts` : lire/écrire SQLite avant/après appel BGG

## Fichiers à modifier
- `src/services/bggApi.ts` — ajouter helpers cache localStorage

## Décision

- **Option 2 (cache SQLite backend) : annulée** — double BDD non justifiée, le backend n'a pas vocation à redémarrer souvent.
- **Option 1 (cache localStorage frontend) : à faire quand le besoin se fait sentir** — ~30 lignes dans `bggApi.ts`, utile si le backend redémarre ou pour éviter des appels redondants entre sessions.

## Estimation
~30 min (localStorage uniquement)

