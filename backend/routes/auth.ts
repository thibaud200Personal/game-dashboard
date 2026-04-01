import { Router } from 'express'
import type { AuthService } from '../services/AuthService'

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

    res.cookie('auth_token', result.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000,
    })
    res.json({ role: result.role })
  })

  router.post('/logout', (_req, res) => {
    res.clearCookie('auth_token')
    res.json({ ok: true })
  })

  return router
}
