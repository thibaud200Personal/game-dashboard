import type { Request, Response, NextFunction } from 'express'
import type { AuthService } from '../services/AuthService'

export interface AuthRequest extends Request {
  user?: { role: 'admin' | 'user' }
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Cookie-based auth (web)
    const cookieHeader = req.headers.cookie ?? ''
    const match = /auth_token=([^;]+)/.exec(cookieHeader)
    const cookieToken = match?.[1]

    // Bearer header auth (future Android client)
    const bearerToken = req.headers.authorization?.replace('Bearer ', '')

    const token = cookieToken ?? bearerToken

    if (!token) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const payload = authService.verifyToken(token)
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    req.user = { role: payload.role }
    next()
  }
}
