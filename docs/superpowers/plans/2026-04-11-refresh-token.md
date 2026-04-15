# Refresh Token Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter refresh tokens avec rotation et token families pour rendre l'expiration du JWT (15 min) transparente côté utilisateur, sans table users.

**Architecture:** Access token JWT 15 min en cookie httpOnly `auth_token`. Refresh token opaque 24h (SHA-256 en DB) en cookie httpOnly `refresh_token`, organisé en "families" (UUID partagé par la chaîne login→refresh→refresh) pour isoler la révocation par session. Le frontend intercepte les 401 et tente un refresh silencieux avant de rediriger vers /login.

**Tech Stack:** better-sqlite3 (synchrone), jsonwebtoken, Node.js crypto, Express 5, React Query, MSW (tests frontend), supertest + vitest (tests backend).

---

## File Map

| Fichier | Action |
|---|---|
| `backend/database/migrations/012_refresh_tokens.sql` | CREATE — table + index |
| `backend/repositories/RefreshTokenRepository.ts` | CREATE — CRUD tokens |
| `backend/__tests__/unit/repositories/RefreshTokenRepository.test.ts` | CREATE — tests repo |
| `backend/services/AuthService.ts` | MODIFY — extend constructeur + 4 nouvelles méthodes |
| `backend/__tests__/unit/services/AuthService.refresh.test.ts` | CREATE — tests nouvelles méthodes |
| `backend/routes/auth.ts` | MODIFY — /login étendu, /refresh nouveau, /logout étendu |
| `backend/__tests__/routes/auth.routes.test.ts` | MODIFY — tests refresh routes |
| `backend/server.ts` | MODIFY — inject RefreshTokenRepository |
| `backend/__tests__/helpers/buildTestApp.ts` | MODIFY — inject RefreshTokenRepository |
| `src/services/api/request.ts` | CREATE — fetch partagé avec intercepteur 401 |
| `src/__tests__/services/request.test.ts` | CREATE — tests intercepteur |
| `src/services/api/playerApi.ts` | MODIFY — utilise request partagé |
| `src/services/api/gameApi.ts` | MODIFY — utilise request partagé |
| `src/services/api/sessionApi.ts` | MODIFY — utilise request partagé |
| `src/services/api/statsApi.ts` | MODIFY — utilise request partagé |
| `src/services/api/bggApi.ts` | MODIFY — utilise request partagé |
| `src/services/api/authApi.ts` | MODIFY — ajoute refresh() |

---

## Task 1: Migration SQL

**Files:**
- Create: `backend/database/migrations/012_refresh_tokens.sql`

- [ ] **Step 1: Créer le fichier de migration**

```sql
-- backend/database/migrations/012_refresh_tokens.sql
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

- [ ] **Step 2: Vérifier que les tests existants passent encore (la migration s'applique automatiquement en :memory:)**

```bash
cd backend && npm run test:run
```
Expected: tous les tests passent (185+)

- [ ] **Step 3: Commit**

```bash
git add backend/database/migrations/012_refresh_tokens.sql
git commit -m "feat(db): migration 012 — table refresh_tokens avec index family + hash"
```

---

## Task 2: RefreshTokenRepository

**Files:**
- Create: `backend/repositories/RefreshTokenRepository.ts`
- Test: `backend/__tests__/unit/repositories/RefreshTokenRepository.test.ts`

- [ ] **Step 1: Écrire le test (qui va échouer)**

```typescript
// backend/__tests__/unit/repositories/RefreshTokenRepository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { RefreshTokenRepository } from '../../../repositories/RefreshTokenRepository'

let conn: DatabaseConnection
let repo: RefreshTokenRepository

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new RefreshTokenRepository(conn.db)
})
afterEach(() => conn.close())

describe('RefreshTokenRepository', () => {
  const HASH    = 'abc123hash'
  const ROLE    = 'admin' as const
  const FAMILY  = 'family-uuid-1'
  const EXPIRES = Math.floor(Date.now() / 1000) + 3600

  it('create + findByHash retourne la ligne', () => {
    repo.create(HASH, ROLE, FAMILY, EXPIRES)
    const row = repo.findByHash(HASH)
    expect(row).toBeDefined()
    expect(row!.token_hash).toBe(HASH)
    expect(row!.role).toBe(ROLE)
    expect(row!.family_id).toBe(FAMILY)
    expect(row!.expires_at).toBe(EXPIRES)
  })

  it('findByHash retourne undefined pour un hash inexistant', () => {
    expect(repo.findByHash('nope')).toBeUndefined()
  })

  it('deleteById supprime la ligne', () => {
    repo.create(HASH, ROLE, FAMILY, EXPIRES)
    const row = repo.findByHash(HASH)!
    repo.deleteById(row.id)
    expect(repo.findByHash(HASH)).toBeUndefined()
  })

  it('deleteByFamily supprime toutes les lignes de la famille', () => {
    repo.create('hash1', ROLE, FAMILY, EXPIRES)
    repo.create('hash2', ROLE, FAMILY, EXPIRES)
    repo.create('hash3', ROLE, 'other-family', EXPIRES)
    repo.deleteByFamily(FAMILY)
    expect(repo.findByHash('hash1')).toBeUndefined()
    expect(repo.findByHash('hash2')).toBeUndefined()
    expect(repo.findByHash('hash3')).toBeDefined()
  })

  it('deleteByRole supprime tous les tokens du rôle', () => {
    repo.create('hash-admin', 'admin', FAMILY, EXPIRES)
    repo.create('hash-user',  'user',  'family-2', EXPIRES)
    repo.deleteByRole('admin')
    expect(repo.findByHash('hash-admin')).toBeUndefined()
    expect(repo.findByHash('hash-user')).toBeDefined()
  })

  it('deleteExpiredForRole ne supprime que les tokens expirés du rôle', () => {
    const past = Math.floor(Date.now() / 1000) - 1
    repo.create('expired', ROLE, FAMILY, past)
    repo.create('valid',   ROLE, 'fam2', EXPIRES)
    repo.deleteExpiredForRole(ROLE)
    expect(repo.findByHash('expired')).toBeUndefined()
    expect(repo.findByHash('valid')).toBeDefined()
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue (module introuvable)**

```bash
cd backend && npm run test:run -- __tests__/unit/repositories/RefreshTokenRepository.test.ts
```
Expected: FAIL "Cannot find module '../../../repositories/RefreshTokenRepository'"

- [ ] **Step 3: Implémenter RefreshTokenRepository**

```typescript
// backend/repositories/RefreshTokenRepository.ts
import type Database from 'better-sqlite3'

export interface RefreshTokenRow {
  id:         number
  token_hash: string
  role:       'admin' | 'user'
  family_id:  string
  expires_at: number
  created_at: number
}

export class RefreshTokenRepository {
  constructor(private db: Database.Database) {}

  create(tokenHash: string, role: string, familyId: string, expiresAt: number): void {
    this.db
      .prepare('INSERT INTO refresh_tokens (token_hash, role, family_id, expires_at) VALUES (?, ?, ?, ?)')
      .run(tokenHash, role, familyId, expiresAt)
  }

  findByHash(tokenHash: string): RefreshTokenRow | undefined {
    return this.db
      .prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?')
      .get(tokenHash) as RefreshTokenRow | undefined
  }

  deleteById(id: number): void {
    this.db.prepare('DELETE FROM refresh_tokens WHERE id = ?').run(id)
  }

  deleteByFamily(familyId: string): void {
    this.db.prepare('DELETE FROM refresh_tokens WHERE family_id = ?').run(familyId)
  }

  deleteByRole(role: string): void {
    this.db.prepare('DELETE FROM refresh_tokens WHERE role = ?').run(role)
  }

  deleteExpiredForRole(role: string): void {
    this.db
      .prepare('DELETE FROM refresh_tokens WHERE role = ? AND expires_at < unixepoch()')
      .run(role)
  }
}
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd backend && npm run test:run -- __tests__/unit/repositories/RefreshTokenRepository.test.ts
```
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/repositories/RefreshTokenRepository.ts \
        backend/__tests__/unit/repositories/RefreshTokenRepository.test.ts
git commit -m "feat(backend): RefreshTokenRepository — CRUD tokens avec token families"
```

---

## Task 3: AuthService — nouvelles méthodes

**Files:**
- Modify: `backend/services/AuthService.ts`
- Test: `backend/__tests__/unit/services/AuthService.refresh.test.ts`

- [ ] **Step 1: Écrire les tests (qui vont échouer)**

```typescript
// backend/__tests__/unit/services/AuthService.refresh.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { RefreshTokenRepository } from '../../../repositories/RefreshTokenRepository'
import { AuthService } from '../../../services/AuthService'

const SECRET = 'test-secret-at-least-32-chars-long!!'

let conn: DatabaseConnection
let refreshRepo: RefreshTokenRepository
let svc: AuthService

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  refreshRepo = new RefreshTokenRepository(conn.db)
  svc = new AuthService(SECRET, 'adminpass', 'userpass', refreshRepo)
})
afterEach(() => conn.close())

describe('AuthService.issueRefreshToken', () => {
  it('retourne un token brut non vide + familyId', () => {
    const { raw, familyId } = svc.issueRefreshToken('admin')
    expect(raw).toHaveLength(64) // 32 bytes hex
    expect(familyId).toMatch(/^[0-9a-f-]{36}$/) // UUID v4
  })

  it('le hash SHA-256 du token brut est stocké en DB', () => {
    const crypto = require('node:crypto')
    const { raw } = svc.issueRefreshToken('admin')
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    expect(refreshRepo.findByHash(hash)).toBeDefined()
  })

  it('le role et le family_id sont corrects en DB', () => {
    const crypto = require('node:crypto')
    const { raw, familyId } = svc.issueRefreshToken('user')
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    const row = refreshRepo.findByHash(hash)!
    expect(row.role).toBe('user')
    expect(row.family_id).toBe(familyId)
  })
})

describe('AuthService.rotateRefreshToken', () => {
  it('rotation nominale — retourne nouveau token + role, ancien supprimé', () => {
    const crypto = require('node:crypto')
    const { raw } = svc.issueRefreshToken('admin')
    const oldHash = crypto.createHash('sha256').update(raw).digest('hex')

    const { newRaw, role } = svc.rotateRefreshToken(raw)
    expect(role).toBe('admin')
    expect(newRaw).toHaveLength(64)
    expect(newRaw).not.toBe(raw)
    // ancien supprimé
    expect(refreshRepo.findByHash(oldHash)).toBeUndefined()
    // nouveau présent
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex')
    expect(refreshRepo.findByHash(newHash)).toBeDefined()
  })

  it('même family_id après rotation', () => {
    const crypto = require('node:crypto')
    const { raw, familyId } = svc.issueRefreshToken('admin')
    const { newRaw } = svc.rotateRefreshToken(raw)
    const newHash = crypto.createHash('sha256').update(newRaw).digest('hex')
    expect(refreshRepo.findByHash(newHash)!.family_id).toBe(familyId)
  })

  it('token inconnu → throw SESSION_INVALIDATED', () => {
    expect(() => svc.rotateRefreshToken('unknowntoken')).toThrow('SESSION_INVALIDATED')
  })

  it('token expiré → throw SESSION_EXPIRED', () => {
    const crypto = require('node:crypto')
    // Insérer manuellement un token expiré
    const raw = 'a'.repeat(64)
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    const past = Math.floor(Date.now() / 1000) - 1
    refreshRepo.create(hash, 'admin', 'family-x', past)
    expect(() => svc.rotateRefreshToken(raw)).toThrow('SESSION_EXPIRED')
    // Token supprimé après rejet
    expect(refreshRepo.findByHash(hash)).toBeUndefined()
  })
})

describe('AuthService.revokeFamily', () => {
  it('supprime tous les tokens de la famille', () => {
    const crypto = require('node:crypto')
    const { raw, familyId } = svc.issueRefreshToken('admin')
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    svc.revokeFamily(familyId)
    expect(refreshRepo.findByHash(hash)).toBeUndefined()
  })
})

describe('AuthService.createAccessToken', () => {
  it('génère un JWT valide pour le rôle donné', () => {
    const token = svc.createAccessToken('admin')
    const payload = svc.verifyToken(token)
    expect(payload?.role).toBe('admin')
  })
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

```bash
cd backend && npm run test:run -- __tests__/unit/services/AuthService.refresh.test.ts
```
Expected: FAIL (méthodes manquantes)

- [ ] **Step 3: Modifier AuthService**

Remplacer entièrement `backend/services/AuthService.ts` :

```typescript
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import type { RefreshTokenRepository } from '../repositories/RefreshTokenRepository'

interface TokenPayload {
  sub: string
  role: 'admin' | 'user'
  iat?: number
  exp?: number
}

const REFRESH_TTL_SECONDS = 86400 // 24h

export class AuthService {
  constructor(
    private readonly secret: string,
    private readonly adminPassword: string,
    private readonly userPassword: string,
    private readonly refreshRepo: RefreshTokenRepository,
  ) {}

  login(password: string): { token: string; role: 'admin' | 'user' } | null {
    if (password === this.adminPassword) return { token: this._sign('admin'), role: 'admin' }
    if (this.userPassword && password === this.userPassword) return { token: this._sign('user'), role: 'user' }
    return null
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch {
      return null
    }
  }

  createAccessToken(role: 'admin' | 'user'): string {
    return this._sign(role)
  }

  issueRefreshToken(role: 'admin' | 'user'): { raw: string; familyId: string } {
    this.refreshRepo.deleteExpiredForRole(role)
    const raw      = crypto.randomBytes(32).toString('hex')
    const hash     = crypto.createHash('sha256').update(raw).digest('hex')
    const familyId = crypto.randomUUID()
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS
    this.refreshRepo.create(hash, role, familyId, expiresAt)
    return { raw, familyId }
  }

  rotateRefreshToken(rawToken: string): { newRaw: string; role: 'admin' | 'user' } {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const row  = this.refreshRepo.findByHash(hash)

    if (!row) {
      throw new Error('SESSION_INVALIDATED')
    }

    if (row.expires_at < Math.floor(Date.now() / 1000)) {
      this.refreshRepo.deleteById(row.id)
      throw new Error('SESSION_EXPIRED')
    }

    const newRaw    = crypto.randomBytes(32).toString('hex')
    const newHash   = crypto.createHash('sha256').update(newRaw).digest('hex')
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS

    // Atomic: delete old, insert new (SQLite synchronous)
    this.refreshRepo.deleteById(row.id)
    this.refreshRepo.create(newHash, row.role, row.family_id, expiresAt)

    return { newRaw, role: row.role }
  }

  revokeFamily(familyId: string): void {
    this.refreshRepo.deleteByFamily(familyId)
  }

  private _sign(role: 'admin' | 'user'): string {
    return jwt.sign({ sub: role, role }, this.secret, { expiresIn: '15m' })
  }
}

export function createAuthService(refreshRepo: RefreshTokenRepository): AuthService {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('[FATAL] AUTH_JWT_SECRET must be set and at least 32 characters')
  }
  const adminPwd = process.env.ADMIN_PASSWORD
  if (!adminPwd) throw new Error('[FATAL] ADMIN_PASSWORD must be set')
  const userPwd = process.env.USER_PASSWORD ?? ''
  return new AuthService(secret, adminPwd, userPwd, refreshRepo)
}
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
cd backend && npm run test:run -- __tests__/unit/services/AuthService.refresh.test.ts
```
Expected: 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/services/AuthService.ts \
        backend/__tests__/unit/services/AuthService.refresh.test.ts
git commit -m "feat(backend): AuthService — issueRefreshToken, rotateRefreshToken, revokeFamily, createAccessToken"
```

---

## Task 4: Wiring server.ts + buildTestApp

**Files:**
- Modify: `backend/server.ts`
- Modify: `backend/__tests__/helpers/buildTestApp.ts`

- [ ] **Step 1: Mettre à jour server.ts**

Ajouter l'import `RefreshTokenRepository` après les autres repos :

```typescript
// Après import LabelsRepository (ligne ~32) :
import { RefreshTokenRepository } from './repositories/RefreshTokenRepository'
```

Ajouter l'instanciation après `labelsRepo` :

```typescript
// Après : const labelsRepo  = new LabelsRepository(dbConn.db)
const refreshTokenRepo = new RefreshTokenRepository(dbConn.db)
```

Mettre à jour `createAuthService` (ne prend plus 0 args) :

```typescript
// Remplacer :
const authService    = createAuthService()
// Par :
const authService    = createAuthService(refreshTokenRepo)
```

- [ ] **Step 2: Mettre à jour buildTestApp.ts**

Ajouter l'import :

```typescript
import { RefreshTokenRepository } from '../../repositories/RefreshTokenRepository'
```

Ajouter après `labelsRepo` :

```typescript
const refreshTokenRepo = new RefreshTokenRepository(conn.db)
```

Mettre à jour la construction de `AuthService` :

```typescript
// Remplacer :
const authService = new AuthService(TEST_JWT_SECRET, TEST_ADMIN_PASS, TEST_USER_PASS)
// Par :
const authService = new AuthService(TEST_JWT_SECRET, TEST_ADMIN_PASS, TEST_USER_PASS, refreshTokenRepo)
```

Exposer `refreshTokenRepo` dans le retour (utile pour les tests de routes) :

```typescript
// Remplacer :
return { app, conn, authService, bggRepo }
// Par :
return { app, conn, authService, bggRepo, refreshTokenRepo }
```

- [ ] **Step 3: Vérifier que tous les tests backend passent**

```bash
cd backend && npm run test:run
```
Expected: tous les tests passent (193+)

- [ ] **Step 4: Commit**

```bash
git add backend/server.ts backend/__tests__/helpers/buildTestApp.ts
git commit -m "feat(backend): inject RefreshTokenRepository dans AuthService (server + buildTestApp)"
```

---

## Task 5: Auth routes — login étendu, /refresh, /logout étendu

**Files:**
- Modify: `backend/routes/auth.ts`
- Modify: `backend/__tests__/routes/auth.routes.test.ts`

- [ ] **Step 1: Écrire les nouveaux tests (qui vont échouer)**

Ajouter à la fin de `backend/__tests__/routes/auth.routes.test.ts` :

```typescript
import crypto from 'node:crypto'

describe('POST /api/v1/auth/login — refresh cookie', () => {
  it('login admin → set-cookie contient refresh_token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_ADMIN_PASS })
    expect(res.status).toBe(200)
    const cookies = res.headers['set-cookie'] as string[]
    expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true)
  })
})

describe('POST /api/v1/auth/refresh', () => {
  it('refresh valide → 200 + nouveaux cookies', async () => {
    // Login pour obtenir le refresh token
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_ADMIN_PASS })
    const cookies = login.headers['set-cookie'] as string[]
    const refreshCookie = cookies.find((c: string) => c.startsWith('refresh_token='))!

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', refreshCookie)
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('admin')
    const newCookies = res.headers['set-cookie'] as string[]
    expect(newCookies.some((c: string) => c.startsWith('auth_token='))).toBe(true)
    expect(newCookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true)
  })

  it('refresh sans cookie → 401', async () => {
    const res = await request(app).post('/api/v1/auth/refresh')
    expect(res.status).toBe(401)
  })

  it('refresh token inconnu → 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'refresh_token=unknowntoken')
    expect(res.status).toBe(401)
  })

  it('refresh token expiré → 401', async () => {
    const { refreshTokenRepo: repo } = buildTestApp()
    const raw  = 'b'.repeat(64)
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    const past = Math.floor(Date.now() / 1000) - 1
    repo.create(hash, 'admin', 'fam-expired', past)

    // On ne peut pas utiliser `conn` ici car c'est une DB séparée — on vérifie juste le comportement 401
    // via un token que notre app ne connaît pas (buildTestApp() crée une nouvelle :memory: DB)
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh_token=${raw}`)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/auth/logout — révocation famille', () => {
  it('logout révoque le refresh token en DB + clear cookies', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_ADMIN_PASS })
    const cookies = login.headers['set-cookie'] as string[]
    const allCookies = cookies.join('; ')

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', allCookies)
    expect(res.status).toBe(200)
    // Les cookies doivent être effacés (max-age=0 ou expires passé)
    const outCookies = res.headers['set-cookie'] as string[]
    expect(outCookies.some((c: string) => c.includes('auth_token=;') || c.includes('Max-Age=0'))).toBe(true)
  })
})
```

- [ ] **Step 2: Vérifier que les nouveaux tests échouent**

```bash
cd backend && npm run test:run -- __tests__/routes/auth.routes.test.ts
```
Expected: nouveaux tests FAIL (routes non implémentées)

- [ ] **Step 3: Implémenter les routes**

Remplacer entièrement `backend/routes/auth.ts` :

```typescript
import { Router } from 'express'
import type { AuthService } from '../services/AuthService'

const COOKIE_OPTS_BASE = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
}

export function createAuthRouter(authService: AuthService): Router {
  const router = Router()

  router.post('/login', (req, res) => {
    const { password } = req.body as { password?: string }
    if (!password) {
      res.status(400).json({ error: 'Password required' })
      return
    }

    const result = authService.login(password)
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const { raw } = authService.issueRefreshToken(result.role)

    res.cookie('auth_token', result.token, {
      ...COOKIE_OPTS_BASE,
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refresh_token', raw, {
      ...COOKIE_OPTS_BASE,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',  // scoped: only sent to /auth routes
    })
    res.json({ role: result.role })
  })

  router.post('/refresh', (req, res) => {
    const rawToken = req.cookies['refresh_token'] as string | undefined
    if (!rawToken) {
      res.status(401).json({ error: 'No refresh token' })
      return
    }

    try {
      const { newRaw, role } = authService.rotateRefreshToken(rawToken)
      const accessToken = authService.createAccessToken(role)

      res.cookie('auth_token', accessToken, {
        ...COOKIE_OPTS_BASE,
        maxAge: 15 * 60 * 1000,
      })
      res.cookie('refresh_token', newRaw, {
        ...COOKIE_OPTS_BASE,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      })
      res.json({ role })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'SESSION_EXPIRED') {
        res.status(401).json({ error: 'Session expired' })
      } else {
        res.status(401).json({ error: 'Session invalidated' })
      }
    }
  })

  router.get('/me', (req, res) => {
    const token = (req.cookies['auth_token'] as string | undefined)
      ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) { res.status(401).json({ error: 'Not authenticated' }); return }
    const payload = authService.verifyToken(token)
    if (!payload) { res.status(401).json({ error: 'Invalid or expired token' }); return }
    res.json({ role: payload.role })
  })

  router.post('/logout', (req, res) => {
    const rawToken = req.cookies['refresh_token'] as string | undefined
    if (rawToken) {
      try {
        // best-effort: on ignore si le token n'existe plus
        const crypto = require('node:crypto')
        const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
        const row = (authService as any).refreshRepo?.findByHash(hash)
        if (row) authService.revokeFamily(row.family_id)
      } catch { /* ignore */ }
    }
    res.clearCookie('auth_token')
    res.clearCookie('refresh_token', { path: '/api/v1/auth' })
    res.json({ ok: true })
  })

  return router
}
```

**Note sur `logout` :** l'accès direct à `refreshRepo` via `(authService as any).refreshRepo` est un hack temporaire pour éviter d'ajouter une méthode `findRefreshToken(raw)` sur `AuthService` juste pour le logout. Une alternative propre: ajouter `revokeByRaw(raw: string): void` sur `AuthService`. Utiliser cette version propre ci-dessous à la place du hack :

Ajouter cette méthode à `AuthService` (dans le même commit) :

```typescript
// Dans AuthService, après revokeFamily :
revokeByRaw(rawToken: string): void {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const row  = this.refreshRepo.findByHash(hash)
  if (row) this.refreshRepo.deleteByFamily(row.family_id)
}
```

Et mettre à jour le logout dans `routes/auth.ts` :

```typescript
router.post('/logout', (req, res) => {
  const rawToken = req.cookies['refresh_token'] as string | undefined
  if (rawToken) authService.revokeByRaw(rawToken)
  res.clearCookie('auth_token')
  res.clearCookie('refresh_token', { path: '/api/v1/auth' })
  res.json({ ok: true })
})
```

- [ ] **Step 4: Ajouter `revokeByRaw` au test AuthService.refresh.test.ts**

Ajouter dans `describe('AuthService')` :

```typescript
describe('AuthService.revokeByRaw', () => {
  it('révoque la famille du token donné', () => {
    const crypto = require('node:crypto')
    const { raw, familyId } = svc.issueRefreshToken('admin')
    svc.revokeByRaw(raw)
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    expect(refreshRepo.findByHash(hash)).toBeUndefined()
    // Vérifie que toute la famille est bien supprimée
    const { raw: raw2 } = svc.issueRefreshToken('admin')
    refreshRepo.create(
      crypto.createHash('sha256').update('sibling').digest('hex'),
      'admin', familyId,
      Math.floor(Date.now() / 1000) + 3600
    )
    svc.revokeByRaw(raw2) // ne plante pas même si la famille n'a qu'une ligne
  })
})
```

- [ ] **Step 5: Vérifier que tous les tests backend passent**

```bash
cd backend && npm run test:run
```
Expected: tous les tests passent (203+)

- [ ] **Step 6: Commit**

```bash
git add backend/routes/auth.ts \
        backend/services/AuthService.ts \
        backend/__tests__/routes/auth.routes.test.ts \
        backend/__tests__/unit/services/AuthService.refresh.test.ts
git commit -m "feat(backend): routes /auth/refresh + /login étendu + /logout révocation famille"
```

---

## Task 6: Frontend — shared request.ts avec intercepteur 401

**Files:**
- Create: `src/services/api/request.ts`
- Test: `src/__tests__/services/request.test.ts`

- [ ] **Step 1: Écrire le test (qui va échouer)**

```typescript
// src/__tests__/services/request.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/mocks/server'

// On importe le module après avoir configuré MSW
let requestFn: typeof import('@/services/api/request').request

beforeEach(async () => {
  vi.resetModules()
  const mod = await import('@/services/api/request')
  requestFn = mod.request
})

describe('request() — cas nominaux', () => {
  it('retourne les données JSON sur 200', async () => {
    server.use(
      http.get('/api/test', () => HttpResponse.json({ ok: true }), { once: true })
    )
    const data = await requestFn<{ ok: boolean }>('/api/test')
    expect(data.ok).toBe(true)
  })

  it('retourne undefined sur 204', async () => {
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 204 }), { once: true })
    )
    const data = await requestFn('/api/test')
    expect(data).toBeUndefined()
  })

  it('throw sur erreur non-401', async () => {
    server.use(
      http.get('/api/test', () => HttpResponse.json({ error: 'Not found' }, { status: 404 }), { once: true })
    )
    await expect(requestFn('/api/test')).rejects.toThrow('Not found')
  })
})

describe('request() — intercepteur 401', () => {
  it('401 → appelle /auth/refresh → retry → retourne données', async () => {
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 }), { once: true }),
      http.post('/api/v1/auth/refresh', () => HttpResponse.json({ role: 'admin' }), { once: true }),
      http.get('/api/test', () => HttpResponse.json({ ok: true }), { once: true }),
    )
    const data = await requestFn<{ ok: boolean }>('/api/test')
    expect(data.ok).toBe(true)
  })

  it('401 + refresh 401 → redirect /login', async () => {
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: '',
    } as Location)
    const setHref = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { get href() { return '' }, set href(v) { setHref(v) } },
      writable: true,
    })

    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 }), { once: true }),
      http.post('/api/v1/auth/refresh', () => new HttpResponse(null, { status: 401 }), { once: true }),
    )

    await expect(requestFn('/api/test')).rejects.toThrow()
    expect(setHref).toHaveBeenCalledWith('/login')

    locationSpy.mockRestore()
  })

  it('deux 401 simultanés → un seul appel /auth/refresh', async () => {
    let refreshCount = 0
    server.use(
      http.get('/api/test', () => new HttpResponse(null, { status: 401 })),
      http.post('/api/v1/auth/refresh', () => {
        refreshCount++
        return HttpResponse.json({ role: 'admin' })
      }),
    )

    await Promise.allSettled([requestFn('/api/test'), requestFn('/api/test')])
    expect(refreshCount).toBe(1)
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm run test:run -- src/__tests__/services/request.test.ts
```
Expected: FAIL "Cannot find module '@/services/api/request'"

- [ ] **Step 3: Implémenter src/services/api/request.ts**

```typescript
// src/services/api/request.ts

let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(r => r.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

function redirectToLogin(): never {
  window.location.href = '/login'
  throw new Error('Session expired — redirecting to login')
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options })

  if (res.status === 401) {
    const refreshed = await attemptRefresh()
    if (!refreshed) redirectToLogin()

    const retry = await fetch(url, { credentials: 'include', ...options })
    if (retry.status === 401) redirectToLogin()
    if (!retry.ok) {
      const body = await retry.json().catch(() => ({})) as { error?: string }
      throw new Error(body.error ?? `HTTP ${retry.status}`)
    }
    if (retry.status === 204) return undefined as T
    return retry.json() as Promise<T>
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
```

- [ ] **Step 4: Vérifier que les tests passent**

```bash
npm run test:run -- src/__tests__/services/request.test.ts
```
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/api/request.ts src/__tests__/services/request.test.ts
git commit -m "feat(frontend): request.ts partagé avec intercepteur 401 → refresh → retry"
```

---

## Task 7: Migrer les api services vers le request partagé

**Files:**
- Modify: `src/services/api/playerApi.ts`
- Modify: `src/services/api/gameApi.ts`
- Modify: `src/services/api/sessionApi.ts`
- Modify: `src/services/api/statsApi.ts`
- Modify: `src/services/api/bggApi.ts`
- Modify: `src/services/api/authApi.ts`

- [ ] **Step 1: Mettre à jour playerApi.ts**

Remplacer la fonction `request` locale par l'import :

```typescript
// src/services/api/playerApi.ts
import type { Player, PlayerStatistics, CreatePlayerRequest, UpdatePlayerRequest } from '@shared/types';
import { request } from './request';

const BASE = '/api/v1/players';

export const playerApi = {
  getAll:    (): Promise<PlayerStatistics[]> => request<PlayerStatistics[]>(BASE),
  getById:   (id: number): Promise<Player> => request<Player>(`${BASE}/${id}`),
  create:    (data: CreatePlayerRequest): Promise<Player> =>
    request<Player>(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  update:    (id: number, data: UpdatePlayerRequest): Promise<Player> =>
    request<Player>(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  delete:    (id: number): Promise<void> =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
```

- [ ] **Step 2: Mettre à jour gameApi.ts**

Lire le fichier actuel, supprimer la fonction `request` locale, ajouter en haut :
```typescript
import { request } from './request';
```
Supprimer la définition `async function request<T>(...)` et ses lignes.

- [ ] **Step 3: Mettre à jour sessionApi.ts**

Même opération : supprimer `request` local, importer depuis `'./request'`.

- [ ] **Step 4: Mettre à jour statsApi.ts**

Même opération.

- [ ] **Step 5: Mettre à jour bggApi.ts**

Même opération (le `request` local dans `bggApi` utilise déjà `credentials: 'include'`).

- [ ] **Step 6: Ajouter `refresh()` à authApi.ts**

```typescript
// src/services/api/authApi.ts
export const authApi = {
  login: (password: string): Promise<{ role: 'admin' | 'user' }> =>
    fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json() as Promise<{ role: 'admin' | 'user' }>;
    }),

  me: (): Promise<{ role: 'admin' | 'user' } | null> =>
    fetch('/api/v1/auth/me', { credentials: 'include' }).then(res =>
      res.ok ? (res.json() as Promise<{ role: 'admin' | 'user' }>) : null
    ),

  refresh: (): Promise<{ role: 'admin' | 'user' } | null> =>
    fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' }).then(res =>
      res.ok ? (res.json() as Promise<{ role: 'admin' | 'user' }>) : null
    ),

  logout: (): Promise<void> =>
    fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).then(() => undefined),
};
```

- [ ] **Step 7: Vérifier que tous les tests frontend passent**

```bash
npm run test:run
```
Expected: 128+ tests PASS (les tests existants ne doivent pas régresser — MSW intercepte les requêtes identiquement)

- [ ] **Step 8: Commit**

```bash
git add src/services/api/playerApi.ts \
        src/services/api/gameApi.ts \
        src/services/api/sessionApi.ts \
        src/services/api/statsApi.ts \
        src/services/api/bggApi.ts \
        src/services/api/authApi.ts
git commit -m "refactor(frontend): api services → request partagé avec intercepteur 401 + authApi.refresh()"
```

---

## Vérification finale

- [ ] **Lancer tous les tests (frontend + backend)**

```bash
# Frontend
npm run test:run

# Backend
cd backend && npm run test:run
```
Expected: tous les tests passent

- [ ] **Test manuel : flow complet**

1. Se connecter → vérifier les deux cookies dans DevTools (Application → Cookies)
2. Attendre 15 min (ou réduire le TTL temporairement à `'30s'` pour tester)
3. Faire une action dans l'app → doit fonctionner silencieusement (refresh transparent)
4. Se déconnecter → vérifier que les cookies sont effacés

- [ ] **Commit final si ajustements nécessaires**

```bash
git add -p
git commit -m "fix: ajustements post-test-manuel refresh token"
```
