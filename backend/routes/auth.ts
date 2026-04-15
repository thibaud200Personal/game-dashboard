import { Router } from 'express'
import type { AuthService } from '../services/AuthService'

const COOKIE_OPTS_BASE = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
}

export function createAuthRouter(authService: AuthService): Router {
  const router = Router()

  router.post('/login', (req, res) => {
    const { password } = req.body as { password?: string }
    if (!password) {
      res.status(400).json({ error: 'Password required' })
      return
    }

    const result = authService.login(password)
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const { raw } = authService.issueRefreshToken(result.role)

    res.cookie('auth_token', result.token, {
      ...COOKIE_OPTS_BASE,
      maxAge: 15 * 60 * 1000,
    })
    res.cookie('refresh_token', raw, {
      ...COOKIE_OPTS_BASE,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    })
    res.json({ role: result.role })
  })

  router.post('/refresh', (req, res) => {
    const rawToken = req.cookies['refresh_token'] as string | undefined
    if (!rawToken) {
      res.status(401).json({ error: 'No refresh token' })
      return
    }

    try {
      const { newRaw, role } = authService.rotateRefreshToken(rawToken)
      const accessToken = authService.createAccessToken(role)

      res.cookie('auth_token', accessToken, {
        ...COOKIE_OPTS_BASE,
        maxAge: 15 * 60 * 1000,
      })
      res.cookie('refresh_token', newRaw, {
        ...COOKIE_OPTS_BASE,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/api/v1/auth',
      })
      res.json({ role })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'SESSION_EXPIRED') {
        res.status(401).json({ error: 'Session expired' })
      } else {
        res.status(401).json({ error: 'Session invalidated' })
      }
    }
  })

  router.get('/me', (req, res) => {
    const token = (req.cookies['auth_token'] as string | undefined)
      ?? req.headers.authorization?.replace('Bearer ', '')
    if (!token) { res.status(401).json({ error: 'Not authenticated' }); return }
    const payload = authService.verifyToken(token)
    if (!payload) { res.status(401).json({ error: 'Invalid or expired token' }); return }
    res.json({ role: payload.role })
  })

  router.post('/logout', (req, res) => {
    const rawToken = req.cookies['refresh_token'] as string | undefined
    if (rawToken) authService.revokeByRaw(rawToken)
    res.clearCookie('auth_token')
    res.clearCookie('refresh_token', { path: '/api/v1/auth' })
    res.json({ ok: true })
  })

  return router
}
