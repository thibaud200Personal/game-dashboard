import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth'

export function requireRole(role: 'admin' | 'user') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    if (role === 'admin' && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Admin role required' })
      return
    }
    next()
  }
}
