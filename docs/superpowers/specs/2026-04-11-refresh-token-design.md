# Refresh Token Design

> **Status:** Approved  
> **Date:** 2026-04-11  
> **Context:** Dashboard exposed on internet. Access token TTL réduit à 15 min. Besoin d'un refresh token pour que l'expiration soit transparente pour l'utilisateur.

---

## Goal

Implémenter un système refresh token avec rotation et token families, pour qu'un access token à courte durée de vie (15 min) soit transparent pour l'utilisateur, tout en garantissant la révocation propre par session sans user table.

---

## Architecture

### Principe

- **Access token** : JWT signé, TTL 15 min, httpOnly cookie `auth_token`
- **Refresh token** : opaque (32 bytes hex random), TTL 24h, httpOnly cookie `refresh_token`, hashé SHA-256 en DB
- **Token family** : UUID généré au login, partagé par tous les refresh tokens d'une même session (chaîne de rotations). Permet d'isoler la révocation par session sans table users.

### Identité

Pas de table users. L'identité est le `role` (`admin` | `user`) dérivé du mot de passe env var. Plusieurs appareils/onglets avec le même mot de passe sont des familles indépendantes.

---

## Data Model

**Migration `012_refresh_tokens.sql` :**

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash  TEXT    NOT NULL UNIQUE,
  role        TEXT    NOT NULL CHECK (role IN ('admin', 'user')),
  family_id   TEXT    NOT NULL,
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash   ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
```

Le token brut n'est jamais stocké en DB. Seul le SHA-256 est persisté — une fuite de la DB ne compromet pas les sessions actives.

**Cleanup passif :**
- À chaque login : `DELETE WHERE role = ? AND expires_at < unixepoch()` (purge les expirés du rôle)
- À chaque refresh : rejet + suppression si `expires_at < unixepoch()`

---

## Backend

### Nouveaux fichiers

| Fichier | Responsabilité |
|---|---|
| `backend/repositories/RefreshTokenRepository.ts` | CRUD tokens en DB |
| Migration `012_refresh_tokens.sql` | Création table + index |

### Modifications

| Fichier | Changement |
|---|---|
| `backend/services/AuthService.ts` | `issueRefreshToken()`, `rotateRefreshToken()`, `revokeFamily()` |
| `backend/routes/auth.ts` | `POST /auth/refresh`, `POST /auth/logout` étendu, `POST /auth/login` étendu |
| `backend/server.ts` | Injection `RefreshTokenRepository` |
| `backend/__tests__/helpers/buildTestApp.ts` | Ajout repo dans le test app |

### RefreshTokenRepository — interface

```typescript
class RefreshTokenRepository {
  create(tokenHash: string, role: string, familyId: string, expiresAt: number): void
  findByHash(tokenHash: string): RefreshTokenRow | undefined
  deleteById(id: number): void
  deleteByFamily(familyId: string): void
  deleteByRole(role: string): void          // "logout all devices"
  deleteExpiredForRole(role: string): void  // cleanup passif au login
}
```

### AuthService — nouvelles méthodes

```typescript
// Génère un token brut + l'insère en DB (hash stocké). Retourne le token brut.
issueRefreshToken(role: 'admin' | 'user'): { raw: string; familyId: string }

// Vérifie l'ancien token, effectue la rotation, retourne le nouveau token brut.
// Lance une erreur si token introuvable (rejeu) ou expiré.
rotateRefreshToken(rawToken: string): { newRaw: string; role: 'admin' | 'user' }

// Révoque toute la famille (rejeu détecté ou logout).
revokeFamily(familyId: string): void
```

### Routes

#### `POST /auth/login` (modifié)

Après authentification réussie, en plus du cookie `auth_token` :
1. Purge les refresh tokens expirés du rôle (`deleteExpiredForRole`)
2. Génère un refresh token via `issueRefreshToken(role)`
3. Set cookie `refresh_token` (httpOnly, sameSite strict, secure en prod, `maxAge: 86400000` ms)

#### `POST /auth/refresh` (nouveau, public)

```
Cookie refresh_token requis (pas d'authenticate middleware)

1. Lire cookie refresh_token → manquant → 401
2. authService.rotateRefreshToken(raw)
   - hash = sha256(raw)
   - findByHash(hash)
     - introuvable → rejeu détecté → revokeFamily(family_id si connu) → 401 { error: 'Session invalidated' }
     - expiré → deleteById + 401 { error: 'Session expired' }
   - Générer nouveau access token (JWT 15min) + nouveau refresh token
   - deleteById(ancien) + create(nouveau, même family_id)
3. Set cookie auth_token (15min) + cookie refresh_token (24h)
4. 200 { role }
```

#### `POST /auth/logout` (modifié)

```
1. Lire cookie refresh_token
2. Si présent → findByHash → si trouvé → deleteByFamily(family_id)
3. clearCookie('auth_token') + clearCookie('refresh_token')
4. 200 { ok: true }
```

### Détection de rejeu

Si `rotateRefreshToken` reçoit un hash introuvable en DB (token déjà roté par une rotation précédente), c'est un signal de vol potentiel. Le `family_id` n'est alors pas connu depuis ce hash seul — mais la politique est :

- **Token expiré naturellement** : `expires_at < now` → supprimer, 401 propre
- **Token inconnu** (jamais existé ou déjà supprimé par rotation) → 401 `Session invalidated`

La révocation de famille sur rejeu strict nécessite que le hash soit encore en DB. Pour éviter la fenêtre entre rotation et suppression de l'ancien, la suppression de l'ancien est atomique avec l'insertion du nouveau (opération synchrone SQLite).

---

## Frontend

### Intercepteur 401 dans `ApiService.ts`

```typescript
// Singleton promise pour éviter N refresh en parallèle
let refreshPromise: Promise<boolean> | null = null

async function withRefresh(fn: () => Promise<Response>): Promise<Response> {
  const res = await fn()
  if (res.status !== 401) return res

  // Une seule tentative de refresh à la fois
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST', credentials: 'include'
    })
      .then(r => r.ok)
      .finally(() => { refreshPromise = null })
  }

  const refreshed = await refreshPromise
  if (!refreshed) {
    queryClient.clear()
    window.location.href = '/login'
    return res
  }
  return fn() // retry une seule fois
}
```

L'intercepteur est appliqué à toutes les requêtes dans `ApiService`. Le `queryClient` est passé via le contexte existant.

### Comportement utilisateur

| Situation | Ressenti |
|---|---|
| Access token expiré, refresh valide | Transparent — requête réussit après refresh silencieux |
| Refresh token expiré (> 24h d'inactivité) | Redirect vers /login |
| Rejeu détecté (vol potentiel) | Redirect vers /login |
| Logout explicite | Redirect vers /login, session révoquée en DB |

---

## Sécurité

| Point | Valeur |
|---|---|
| Token brut en DB | Jamais — SHA-256 uniquement |
| Cookie flags | httpOnly, sameSite strict, secure (prod) |
| Refresh TTL | 24h |
| Rotation | Stricte — chaque refresh invalide l'ancien |
| Rejeu | 401 immédiat, famille révoquée si identifiable |
| Concurrent refresh (2 onglets) | Second onglet reçoit 401 (token déjà roté) → re-login |
| "Logout all devices" | `DELETE WHERE role = ?` (admin only, optionnel) |

---

## Tests

### Backend

- `RefreshTokenRepository` : create, findByHash (existant/introuvable/expiré), deleteById, deleteByFamily, deleteExpiredForRole
- `AuthService` : issueRefreshToken (génère token brut + insère), rotateRefreshToken (rotation nominale, token expiré, token inconnu), revokeFamily
- Routes :
  - `POST /auth/login` → set cookie refresh_token
  - `POST /auth/refresh` → nominal (nouveaux cookies), token expiré → 401, token inconnu → 401
  - `POST /auth/logout` → cookies cleared, famille supprimée en DB

### Frontend

- Intercepteur : 401 → refresh OK → retry réussit
- Intercepteur : 401 → refresh 401 → redirect /login
- Concurrent : deux 401 simultanés → un seul appel refresh (singleton promise)
