import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DatabaseConnection } from '../../../database/DatabaseConnection'
import { LabelsRepository } from '../../../repositories/LabelsRepository'
import { LabelsService } from '../../../services/LabelsService'

let conn: DatabaseConnection
let service: LabelsService

beforeEach(() => {
  conn = new DatabaseConnection(':memory:')
  service = new LabelsService(new LabelsRepository(conn.db))
})

afterEach(() => conn.close())

describe('LabelsService', () => {
  it('getLabels returns labels for a valid locale', () => {
    const labels = service.getLabels('en')
    expect(labels['games.page.title']).toBe('Games')
  })

  it('getLabels returns empty object for unknown locale', () => {
    const labels = service.getLabels('de')
    expect(Object.keys(labels).length).toBe(0)
  })

  it('getLocales returns available locales list', () => {
    const locales = service.getLocales()
    expect(locales.length).toBeGreaterThanOrEqual(2)
    expect(locales.find(l => l.locale === 'en')).toBeDefined()
    expect(locales.find(l => l.locale === 'fr')).toBeDefined()
  })
})
