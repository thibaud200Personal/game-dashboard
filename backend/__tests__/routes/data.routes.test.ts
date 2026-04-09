// backend/__tests__/routes/data.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp, authHeader } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection
let adminHeaders: Record<string, string>
let userHeaders: Record<string, string>

beforeEach(async () => {
  const built = buildTestApp()
  app = built.app; conn = built.conn
  adminHeaders = authHeader(built.authService, 'admin')
  userHeaders  = authHeader(built.authService, 'user')

  // Seed a player
  await request(app).post('/api/v1/players').set(adminHeaders).send({ player_name: 'Alice', pseudo: 'alice' })
})
afterEach(() => conn.close())

describe('GET /api/v1/data/export', () => {
  it('admin → 200 avec les tables', async () => {
    const res = await request(app).get('/api/v1/data/export').set(adminHeaders)
    expect(res.status).toBe(200)
    expect(res.body.version).toBe(1)
    expect(Array.isArray(res.body.players)).toBe(true)
    expect(res.body.players).toHaveLength(1)
  })

  it('user → 403', async () => {
    const res = await request(app).get('/api/v1/data/export').set(userHeaders)
    expect(res.status).toBe(403)
  })
})

describe('POST /api/v1/data/reset', () => {
  it('admin → 200, toutes les tables vidées', async () => {
    const res = await request(app).post('/api/v1/data/reset').set(adminHeaders)
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    const players = await request(app).get('/api/v1/players').set(adminHeaders)
    expect(players.body).toHaveLength(0)
  })

  it('user → 403', async () => {
    expect((await request(app).post('/api/v1/data/reset').set(userHeaders)).status).toBe(403)
  })
})

describe('POST /api/v1/data/import', () => {
  it('importe des données valides', async () => {
    const exportRes = await request(app).get('/api/v1/data/export').set(adminHeaders)
    await request(app).post('/api/v1/data/reset').set(adminHeaders)
    const importRes = await request(app)
      .post('/api/v1/data/import')
      .set(adminHeaders)
      .send(exportRes.body)
    expect(importRes.status).toBe(200)
    expect(importRes.body.ok).toBe(true)
    const players = await request(app).get('/api/v1/players').set(adminHeaders)
    expect(players.body).toHaveLength(1)
  })

  it('format invalide → 400', async () => {
    const res = await request(app)
      .post('/api/v1/data/import')
      .set(adminHeaders)
      .send({ version: 99 })
    expect(res.status).toBe(400)
  })
})

describe('sans token → 401', () => {
  it('GET /export sans token → 401', async () => {
    expect((await request(app).get('/api/v1/data/export')).status).toBe(401)
  })
})
