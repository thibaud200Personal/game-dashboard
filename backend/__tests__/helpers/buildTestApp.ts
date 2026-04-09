// backend/__tests__/helpers/buildTestApp.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import { DatabaseConnection } from '../../database/DatabaseConnection'
import { AuthService } from '../../services/AuthService'
import { createAuthMiddleware } from '../../middleware/auth'
import { errorHandler } from '../../middleware/errorHandler'
import { PlayerRepository } from '../../repositories/PlayerRepository'
import { GameRepository } from '../../repositories/GameRepository'
import { SessionRepository } from '../../repositories/SessionRepository'
import { StatsRepository } from '../../repositories/StatsRepository'
import { BGGRepository } from '../../repositories/BGGRepository'
import { PlayerService } from '../../services/PlayerService'
import { GameService } from '../../services/GameService'
import { SessionService } from '../../services/SessionService'
import { StatsService } from '../../services/StatsService'
import { createAuthRouter } from '../../routes/auth'
import { createPlayerRouter } from '../../routes/players'
import { createGameRouter } from '../../routes/games'
import { createSessionRouter } from '../../routes/sessions'
import { createStatsRouter } from '../../routes/stats'
import { createDataRouter } from '../../routes/data'
import { createBggRouter } from '../../routes/bgg'

export const TEST_JWT_SECRET = 'test-secret-at-least-32-chars-long!!'
export const TEST_ADMIN_PASS = 'adminpass'
export const TEST_USER_PASS  = 'userpass'

export function buildTestApp() {
  const conn        = new DatabaseConnection(':memory:')
  const authService = new AuthService(TEST_JWT_SECRET, TEST_ADMIN_PASS, TEST_USER_PASS)
  const authenticate = createAuthMiddleware(authService)

  const playerRepo  = new PlayerRepository(conn.db)
  const gameRepo    = new GameRepository(conn.db)
  const sessionRepo = new SessionRepository(conn.db)
  const statsRepo   = new StatsRepository(conn.db)
  const bggRepo     = new BGGRepository(conn.db)

  const playerService  = new PlayerService(playerRepo)
  const gameService    = new GameService(gameRepo)
  const sessionService = new SessionService(conn.db, sessionRepo)
  const statsService   = new StatsService(statsRepo)

  const app = express()
  app.use(express.json())
  app.use(cookieParser())

  app.use('/api/v1/auth',    createAuthRouter(authService))
  app.use('/api/v1/players', authenticate, createPlayerRouter(playerService))
  app.use('/api/v1/games',   authenticate, createGameRouter(gameService))
  app.use('/api/v1/sessions',authenticate, createSessionRouter(sessionService))
  app.use('/api/v1/stats',   authenticate, createStatsRouter(statsService))
  app.use('/api/v1/data',    authenticate, createDataRouter(conn.db))
  app.use('/api/v1/bgg',     authenticate, createBggRouter(bggRepo))
  app.use(errorHandler)

  return { app, conn, authService, bggRepo }
}

/** Returns an admin token in Authorization: Bearer <token> header format */
export function authHeader(authService: AuthService, role: 'admin' | 'user' = 'admin') {
  const pass = role === 'admin' ? TEST_ADMIN_PASS : TEST_USER_PASS
  const token = authService.login(pass)!.token
  return { Authorization: `Bearer ${token}` }
}
