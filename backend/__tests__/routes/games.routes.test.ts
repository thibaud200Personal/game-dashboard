// backend/__tests__/routes/games.routes.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp, authHeader } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection
let headers: Record<string, string>

const gameBody = {
  name: 'Catan', min_players: 3, max_players: 4,
  supports_cooperative: false, supports_competitive: true,
  supports_campaign: false, supports_hybrid: false,
  has_expansion: false, has_characters: false, is_expansion: false,
}

beforeEach(() => {
  const built = buildTestApp()
  app = built.app; conn = built.conn
  headers = authHeader(built.authService)
})
afterEach(() => conn.close())

describe('GET /api/v1/games', () => {
  it('retourne un tableau vide', async () => {
    const res = await request(app).get('/api/v1/games').set(headers)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('sans token → 401', async () => {
    expect((await request(app).get('/api/v1/games')).status).toBe(401)
  })
})

describe('POST /api/v1/games', () => {
  it('crée un jeu → 201', async () => {
    const res = await request(app).post('/api/v1/games').set(headers).send(gameBody)
    expect(res.status).toBe(201)
    expect(res.body.game_id).toBeTruthy()
    expect(res.body.name).toBe('Catan')
  })

  it('bgg_id dupliqué → 409', async () => {
    await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, bgg_id: 174430 })
    const res = await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, name: 'Clone', bgg_id: 174430 })
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('duplicate_game')
  })

  it('champs obligatoires manquants → 400', async () => {
    const res = await request(app).post('/api/v1/games').set(headers).send({ name: 'Missing' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/games/:id', () => {
  it('retourne le jeu existant', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send(gameBody)
    const res = await request(app).get(`/api/v1/games/${created.body.game_id}`).set(headers)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Catan')
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).get('/api/v1/games/9999').set(headers)).status).toBe(404)
  })
})

describe('PUT /api/v1/games/:id', () => {
  it('met à jour le jeu', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send(gameBody)
    const res = await request(app)
      .put(`/api/v1/games/${created.body.game_id}`)
      .set(headers)
      .send({ name: 'Catan Updated' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Catan Updated')
  })

  it('id inexistant → 404', async () => {
    expect((await request(app).put('/api/v1/games/9999').set(headers).send({ name: 'Ghost' })).status).toBe(404)
  })
})

describe('DELETE /api/v1/games/:id', () => {
  it('supprime le jeu → 204', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send(gameBody)
    const res = await request(app).delete(`/api/v1/games/${created.body.game_id}`).set(headers)
    expect(res.status).toBe(204)
  })
})

describe('POST /api/v1/games/:id/expansions', () => {
  it('ajoute une expansion → 201', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, has_expansion: true })
    const res = await request(app)
      .post(`/api/v1/games/${created.body.game_id}/expansions`)
      .set(headers)
      .send({ name: 'Seafarers', bgg_expansion_id: 999 })
    expect(res.status).toBe(201)
    expect(res.body.expansion_id).toBeTruthy()
  })
})

describe('DELETE /api/v1/games/:id/expansions/:expId', () => {
  it('supprime une expansion → 204', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, has_expansion: true })
    const exp = await request(app)
      .post(`/api/v1/games/${created.body.game_id}/expansions`)
      .set(headers)
      .send({ name: 'Seafarers' })
    const res = await request(app)
      .delete(`/api/v1/games/${created.body.game_id}/expansions/${exp.body.expansion_id}`)
      .set(headers)
    expect(res.status).toBe(204)
  })
})

describe('POST /api/v1/games/:id/characters', () => {
  it('ajoute un character → 201', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, has_characters: true })
    const res = await request(app)
      .post(`/api/v1/games/${created.body.game_id}/characters`)
      .set(headers)
      .send({ character_key: 'brute', name: 'Brute', abilities: [] })
    expect(res.status).toBe(201)
    expect(res.body.character_id).toBeTruthy()
  })
})

describe('DELETE /api/v1/games/:id/characters/:charId', () => {
  it('supprime un character → 204', async () => {
    const created = await request(app).post('/api/v1/games').set(headers).send({ ...gameBody, has_characters: true })
    const ch = await request(app)
      .post(`/api/v1/games/${created.body.game_id}/characters`)
      .set(headers)
      .send({ character_key: 'brute', name: 'Brute', abilities: [] })
    const res = await request(app)
      .delete(`/api/v1/games/${created.body.game_id}/characters/${ch.body.character_id}`)
      .set(headers)
    expect(res.status).toBe(204)
  })
})
