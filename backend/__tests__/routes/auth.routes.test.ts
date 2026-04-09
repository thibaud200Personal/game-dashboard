// backend/__tests__/routes/auth.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp, TEST_ADMIN_PASS, TEST_USER_PASS } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection

beforeEach(() => ({ app, conn } = buildTestApp()))
afterEach(() => conn.close())

describe('POST /api/v1/auth/login', () => {
  it('admin password → 200 + role=admin + cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_ADMIN_PASS })
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('admin')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('user password → 200 + role=user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_USER_PASS })
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('user')
  })

  it('mauvais password → 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('pas de password → 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({})
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/auth/me', () => {
  it('token valide → 200 + role', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: TEST_ADMIN_PASS })
    const cookie = login.headers['set-cookie'][0]
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('admin')
  })

  it('pas de token → 401', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })
})
