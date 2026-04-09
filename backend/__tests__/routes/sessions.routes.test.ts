// backend/__tests__/routes/sessions.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp, authHeader } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection
let headers: Record<string, string>
let playerId: number
let gameId: number

beforeEach(async () => {
  const built = buildTestApp()
  app = built.app; conn = built.conn
  headers = authHeader(built.authService)

  const p = await request(app).post('/api/v1/players').set(headers).send({ player_name: 'Alice', pseudo: 'alice' })
  const g = await request(app).post('/api/v1/games').set(headers).send({
    name: 'Catan', min_players: 3, max_players: 4,
    supports_cooperative: false, supports_competitive: true,
    supports_campaign: false, supports_hybrid: false,
    has_expansion: false, has_characters: false, is_expansion: false,
  })
  playerId = p.body.player_id
  gameId   = g.body.game_id
})
afterEach(() => conn.close())

describe('GET /api/v1/sessions', () => {
  it('retourne [] sur DB vide', async () => {
    const res = await request(app).get('/api/v1/sessions').set(headers)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/v1/sessions', () => {
  it('crée une session → 201', async () => {
    const res = await request(app).post('/api/v1/sessions').set(headers).send({
      game_id: gameId,
      session_type: 'competitive',
      players: [{ player_id: playerId, score: 42, is_winner: true }],
    })
    expect(res.status).toBe(201)
    expect(res.body.session_id).toBeTruthy()
  })

  it('player_id inexistant → rollback + 500', async () => {
    const res = await request(app).post('/api/v1/sessions').set(headers).send({
      game_id: gameId,
      session_type: 'competitive',
      players: [{ player_id: 9999, score: 0, is_winner: false }],
    })
    expect(res.status).toBe(500)
    // La session ne doit pas avoir été créée
    const list = await request(app).get('/api/v1/sessions').set(headers)
    expect(list.body).toHaveLength(0)
  })
})

describe('DELETE /api/v1/sessions/:id', () => {
  it('supprime la session → 204', async () => {
    const created = await request(app).post('/api/v1/sessions').set(headers).send({
      game_id: gameId,
      session_type: 'competitive',
      players: [{ player_id: playerId, score: 10, is_winner: true }],
    })
    expect((await request(app).delete(`/api/v1/sessions/${created.body.session_id}`).set(headers)).status).toBe(204)
  })
})
