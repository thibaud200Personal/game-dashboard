// backend/__tests__/routes/players.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp, authHeader } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection
let headers: Record<string, string>

const playerBody = { player_name: 'Alice', pseudo: 'alice' }

beforeEach(() => {
  const built = buildTestApp()
  app = built.app; conn = built.conn
  headers = authHeader(built.authService)
})
afterEach(() => conn.close())

describe('GET /api/v1/players', () => {
  it('retourne [] sur DB vide', async () => {
    const res = await request(app).get('/api/v1/players').set(headers)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('POST /api/v1/players', () => {
  it('crée un joueur → 201', async () => {
    const res = await request(app).post('/api/v1/players').set(headers).send(playerBody)
    expect(res.status).toBe(201)
    expect(res.body.player_id).toBeTruthy()
    expect(res.body.player_name).toBe('Alice')
  })

  it('pseudo dupliqué → 409', async () => {
    await request(app).post('/api/v1/players').set(headers).send(playerBody)
    const res = await request(app).post('/api/v1/players').set(headers).send({ player_name: 'Alice2', pseudo: 'alice' })
    expect(res.status).toBe(409)
  })
})

describe('GET /api/v1/players/:id', () => {
  it('retourne le joueur', async () => {
    const created = await request(app).post('/api/v1/players').set(headers).send(playerBody)
    const res = await request(app).get(`/api/v1/players/${created.body.player_id}`).set(headers)
    expect(res.status).toBe(200)
    expect(res.body.player_name).toBe('Alice')
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).get('/api/v1/players/9999').set(headers)).status).toBe(404)
  })
})

describe('PUT /api/v1/players/:id', () => {
  it('met à jour le joueur', async () => {
    const created = await request(app).post('/api/v1/players').set(headers).send(playerBody)
    const res = await request(app)
      .put(`/api/v1/players/${created.body.player_id}`)
      .set(headers)
      .send({ player_name: 'Alicia', pseudo: 'alicia' })
    expect(res.status).toBe(200)
    expect(res.body.player_name).toBe('Alicia')
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).put('/api/v1/players/9999').set(headers).send({ player_name: 'Ghost' })).status).toBe(404)
  })
})

describe('DELETE /api/v1/players/:id', () => {
  it('supprime le joueur → 204', async () => {
    const created = await request(app).post('/api/v1/players').set(headers).send(playerBody)
    expect((await request(app).delete(`/api/v1/players/${created.body.player_id}`).set(headers)).status).toBe(204)
  })
})
