// backend/__tests__/routes/bgg.routes.test.ts
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// MUST be before other imports — Vitest hoists vi.mock calls
vi.mock('../../server', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

import request from 'supertest'
import { buildTestApp, authHeader } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection
let headers: Record<string, string>

beforeEach(() => {
  const built = buildTestApp()
  app = built.app; conn = built.conn
  headers = authHeader(built.authService)
})
afterEach(() => conn.close())

describe('GET /api/v1/bgg/search', () => {
  it('sans q → 400', async () => {
    const res = await request(app).get('/api/v1/bgg/search').set(headers)
    expect(res.status).toBe(400)
  })

  it('q sans résultat → []', async () => {
    const res = await request(app).get('/api/v1/bgg/search?q=zzznomatch').set(headers)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('q avec résultat → tableau de BGGSearchResult', async () => {
    const built = buildTestApp()
    built.bggRepo.upsertCatalogBatch([{
      bgg_id: 266192, name: 'Wingspan', year_published: 2019, is_expansion: 0,
      rank: 5, bgg_rating: 8.1, users_rated: 80000,
      abstracts_rank: null, cgs_rank: null, childrensgames_rank: null,
      familygames_rank: null, partygames_rank: null, strategygames_rank: null,
      thematic_rank: null, wargames_rank: null,
    }])
    const res = await request(built.app).get('/api/v1/bgg/search?q=Wingspan').set(authHeader(built.authService))
    expect(res.status).toBe(200)
    expect(res.body[0].bgg_id).toBe(266192)
    built.conn.close()
  })
})

describe('GET /api/v1/bgg/import-status', () => {
  it('retourne count=0 initialement', async () => {
    const res = await request(app).get('/api/v1/bgg/import-status').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(0)
  })
})

describe('POST /api/v1/bgg/import-catalog', () => {
  it('user → 403', async () => {
    const built2 = buildTestApp()
    const userHeaders = authHeader(built2.authService, 'user')
    built2.conn.close()
    const res = await request(app)
      .post('/api/v1/bgg/import-catalog')
      .set(userHeaders)
      .set('Content-Type', 'text/plain')
      .send('id,name,yearpublished,rank,bayesaverage,average,usersrated,is_expansion\n266192,Wingspan,2019,5,8.0,8.2,80000,0')
    expect(res.status).toBe(403)
  })

  it('admin + CSV valide → 200 + count', async () => {
    const csv = [
      'id,name,yearpublished,rank,bayesaverage,average,usersrated,is_expansion,numowned',
      '266192,Wingspan,2019,5,8.0,8.2,80000,0,35000',
    ].join('\n')
    const res = await request(app)
      .post('/api/v1/bgg/import-catalog')
      .set(headers)
      .set('Content-Type', 'text/plain')
      .send(csv)
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(1)
  })
})
