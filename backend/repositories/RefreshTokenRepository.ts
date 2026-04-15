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
