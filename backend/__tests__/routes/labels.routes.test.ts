import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { buildTestApp } from '../helpers/buildTestApp'
import type { DatabaseConnection } from '../../database/DatabaseConnection'
import type { Application } from 'express'

let app: Application
let conn: DatabaseConnection

beforeEach(() => {
  const built = buildTestApp()
  app = built.app
  conn = built.conn
})
afterEach(() => conn.close())

describe('GET /api/v1/labels', () => {
  it('retourne les labels EN sans auth', async () => {
    const res = await request(app).get('/api/v1/labels?locale=en')
    expect(res.status).toBe(200)
    expect(res.body['games.page.title']).toBe('Games')
    expect(res.body['common.buttons.save']).toBe('Save')
  })

  it('retourne les labels FR', async () => {
    const res = await request(app).get('/api/v1/labels?locale=fr')
    expect(res.status).toBe(200)
    expect(res.body['games.page.title']).toBe('Jeux')
    expect(res.body['common.buttons.save']).toBe('Enregistrer')
  })

  it('locale absente → locale en par défaut', async () => {
    const res = await request(app).get('/api/v1/labels')
    expect(res.status).toBe(200)
    expect(res.body['games.page.title']).toBe('Games')
  })

  it('locale invalide (trop courte) → 400', async () => {
    const res = await request(app).get('/api/v1/labels?locale=x')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/labels/locales', () => {
  it('retourne la liste des locales sans auth', async () => {
    const res = await request(app).get('/api/v1/labels/locales')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const codes = res.body.map((l: { locale: string }) => l.locale)
    expect(codes).toContain('en')
    expect(codes).toContain('fr')
  })

  it('chaque locale a un champ name', async () => {
    const res = await request(app).get('/api/v1/labels/locales')
    expect(res.body[0]).toHaveProperty('locale')
    expect(res.body[0]).toHaveProperty('name')
  })
})
