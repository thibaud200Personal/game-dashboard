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
    const past = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    repo.create('expired', ROLE, FAMILY, past)
    repo.create('valid',   ROLE, 'fam2', EXPIRES)
    repo.deleteExpiredForRole(ROLE)
    expect(repo.findByHash('expired')).toBeUndefined()
    expect(repo.findByHash('valid')).toBeDefined()
  })
})
