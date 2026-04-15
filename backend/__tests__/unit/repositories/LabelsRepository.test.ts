import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { LabelsRepository } from '../../../repositories/LabelsRepository'

let conn: DatabaseConnection
let repo: LabelsRepository

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  repo = new LabelsRepository(conn.db)
})

afterEach(() => conn.close())

describe('LabelsRepository', () => {
  it('getByLocale returns a flat key→value map for the given locale', () => {
    const labels = repo.getByLocale('en')
    expect(typeof labels).toBe('object')
    expect(labels['common.buttons.save']).toBe('Save')
    expect(labels['games.page.title']).toBe('Games')
    expect(labels['errors.generic']).toBe('An error occurred')
  })

  it('getByLocale returns FR values when locale is fr', () => {
    const labels = repo.getByLocale('fr')
    expect(labels['common.buttons.save']).toBe('Enregistrer')
    expect(labels['games.page.title']).toBe('Jeux')
  })

  it('getByLocale returns empty object for unknown locale', () => {
    const labels = repo.getByLocale('de')
    expect(Object.keys(labels)).toHaveLength(0)
  })

  it('getAvailableLocales returns en and fr', () => {
    const locales = repo.getAvailableLocales()
    expect(locales).toHaveLength(2)
    const codes = locales.map(l => l.locale)
    expect(codes).toContain('en')
    expect(codes).toContain('fr')
  })

  it('getAvailableLocales each entry has locale and name', () => {
    const locales = repo.getAvailableLocales()
    const en = locales.find(l => l.locale === 'en')
    expect(en?.name).toBe('English')
    const fr = locales.find(l => l.locale === 'fr')
    expect(fr?.name).toBe('Français')
  })
})
