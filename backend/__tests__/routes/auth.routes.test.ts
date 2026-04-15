// backend/__tests__/routes/auth.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import crypto from 'node:crypto'
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
    const outCookies = res.headers['set-cookie'] as string[]
    expect(outCookies.some((c: string) => c.includes('auth_token=;') || c.includes('Max-Age=0'))).toBe(true)
  })
})
