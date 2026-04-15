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
    expect(refreshRepo.findByHash(oldHash)).toBeUndefined()
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
    const raw = 'a'.repeat(64)
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
    const past = Math.floor(Date.now() / 1000) - 1
    refreshRepo.create(hash, 'admin', 'family-x', past)
    expect(() => svc.rotateRefreshToken(raw)).toThrow('SESSION_EXPIRED')
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

describe('AuthService.revokeByRaw', () => {
  it('révoque la famille du token donné', () => {
    const crypto = require('node:crypto')
    const { raw, familyId } = svc.issueRefreshToken('admin')
    svc.revokeByRaw(raw)
    const hash = crypto.createHash('sha256').update(raw).digest('hex')
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
