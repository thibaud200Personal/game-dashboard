// backend/__tests__/routes/stats.routes.test.ts
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
  await request(app).post('/api/v1/sessions').set(headers).send({
    game_id: gameId, session_type: 'competitive',
    players: [{ player_id: playerId, score: 10, is_winner: true }],
  })
})
afterEach(() => conn.close())

describe('GET /api/v1/stats/dashboard', () => {
  it('retourne les totaux', async () => {
    const res = await request(app).get('/api/v1/stats/dashboard').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total_players).toBe(1)
    expect(res.body.total_sessions).toBe(1)
  })
})

describe('GET /api/v1/stats/players', () => {
  it('retourne la liste des stats joueurs', async () => {
    const res = await request(app).get('/api/v1/stats/players').set(headers)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('GET /api/v1/stats/players/:id', () => {
  it('retourne les stats du joueur', async () => {
    const res = await request(app).get(`/api/v1/stats/players/${playerId}`).set(headers)
    expect(res.status).toBe(200)
    expect(res.body.player_id).toBe(playerId)
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).get('/api/v1/stats/players/9999').set(headers)).status).toBe(404)
  })
})

describe('GET /api/v1/stats/games', () => {
  it('retourne la liste des stats jeux', async () => {
    const res = await request(app).get('/api/v1/stats/games').set(headers)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('GET /api/v1/stats/games/:id', () => {
  it('retourne les stats du jeu', async () => {
    const res = await request(app).get(`/api/v1/stats/games/${gameId}`).set(headers)
    expect(res.status).toBe(200)
    expect(res.body.game_id).toBe(gameId)
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).get('/api/v1/stats/games/9999').set(headers)).status).toBe(404)
  })
})
