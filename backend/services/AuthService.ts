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

    this.refreshRepo.deleteById(row.id)
    this.refreshRepo.create(newHash, row.role, row.family_id, expiresAt)

    return { newRaw, role: row.role }
  }

  revokeFamily(familyId: string): void {
    this.refreshRepo.deleteByFamily(familyId)
  }

  revokeByRaw(rawToken: string): void {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const row  = this.refreshRepo.findByHash(hash)
    if (row) this.refreshRepo.deleteByFamily(row.family_id)
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
