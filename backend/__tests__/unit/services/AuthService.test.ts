import { describe, it, expect } from 'vitest'
import { AuthService } from '../../../services/AuthService'

const service = new AuthService('test-secret-at-least-32-chars-long!!', 'adminpass', 'userpass')

describe('AuthService', () => {
  it('returns token with role=admin when admin password matches', () => {
    const result = service.login('adminpass')
    expect(result).not.toBeNull()
    expect(result?.role).toBe('admin')
    expect(result?.token).toBeTruthy()
  })

  it('returns token with role=user when user password matches', () => {
    const result = service.login('userpass')
    expect(result?.role).toBe('user')
  })

  it('returns null for wrong password', () => {
    expect(service.login('wrong')).toBeNull()
  })

  it('verifyToken returns payload for valid token', () => {
    const result = service.login('adminpass')!
    const payload = service.verifyToken(result.token)
    expect(payload?.role).toBe('admin')
    expect(payload?.sub).toBe('admin')
  })

  it('verifyToken returns null for invalid token', () => {
    expect(service.verifyToken('not.a.valid.token')).toBeNull()
  })

  it('verifyToken returns null for token signed with different secret', () => {
    const otherService = new AuthService('other-secret-at-least-32-chars-ok!', 'adminpass', 'userpass')
    const { token } = otherService.login('adminpass')!
    expect(service.verifyToken(token)).toBeNull()
  })
})
