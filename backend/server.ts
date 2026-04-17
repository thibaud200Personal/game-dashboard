import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import pinoHttp from 'pino-http'
import path from 'path'

import { getDb } from './database/DatabaseConnection'
import { PlayerRepository } from './repositories/PlayerRepository'
import { GameRepository } from './repositories/GameRepository'
import { PlayRepository } from './repositories/PlayRepository'
import { StatsRepository } from './repositories/StatsRepository'
import { BGGRepository } from './repositories/BGGRepository'
import { PlayerService } from './services/PlayerService'
import { GameService } from './services/GameService'
import { PlayService } from './services/PlayService'
import { StatsService } from './services/StatsService'
import { createAuthService } from './services/AuthService'
import { createAuthMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { createAuthRouter } from './routes/auth'
import { createPlayerRouter } from './routes/players'
import { createGameRouter } from './routes/games'
import { createPlayRouter } from './routes/plays'
import { createStatsRouter } from './routes/stats'
import { createBggRouter } from './routes/bgg'
import { createLogsRouter } from './routes/logs'
import { createDataRouter } from './routes/data'
import { LabelsRepository } from './repositories/LabelsRepository'
import { LabelsService } from './services/LabelsService'
import { createLabelsRouter } from './routes/labels'
import { RefreshTokenRepository } from './repositories/RefreshTokenRepository'

// ── Logger ──────────────────────────────────────────────────────────────────
export { logger } from './logger'
import { logger } from './logger'

// ── Dependency wiring ────────────────────────────────────────────────────────
const dbConn = getDb()

const playerRepo  = new PlayerRepository(dbConn.db)
const gameRepo    = new GameRepository(dbConn.db)
const playRepo    = new PlayRepository(dbConn.db)
const statsRepo   = new StatsRepository(dbConn.db)
const bggRepo     = new BGGRepository(dbConn.db)
const labelsRepo  = new LabelsRepository(dbConn.db)
const refreshTokenRepo = new RefreshTokenRepository(dbConn.db)

const playerService  = new PlayerService(playerRepo)
const gameService    = new GameService(gameRepo)
const playService    = new PlayService(dbConn.db, playRepo)
const statsService   = new StatsService(statsRepo)
const labelsService  = new LabelsService(labelsRepo)
const authService    = createAuthService(refreshTokenRepo)

const authenticate = createAuthMiddleware(authService)

// ── Express app ──────────────────────────────────────────────────────────────
const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://cf.geekdo-images.com', 'https://images.unsplash.com'],
    },
  },
}))

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.url}`)
      return
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    next()
  })
}

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(o => o.trim())
app.use(cors({ origin: allowedOrigins, credentials: true }))

// Body + cookies
app.use(express.json())
app.use(cookieParser())

// Request logging
app.use(pinoHttp({ logger }))

// Rate limiting
const loginLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 5,   standardHeaders: true, legacyHeaders: false })
const globalLimiter = rateLimit({ windowMs:       60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', globalLimiter)
app.use('/api/v1/auth/login', loginLimiter)
app.use('/api/v1/auth',    createAuthRouter(authService))
app.use('/api/v1/labels',  createLabelsRouter(labelsService))
app.use('/api/v1/logs',    authenticate, createLogsRouter(logger))

// Protected routes
app.use('/api/v1/players',  authenticate, createPlayerRouter(playerService))
app.use('/api/v1/games',    authenticate, createGameRouter(gameService))
app.use('/api/v1/plays',    authenticate, createPlayRouter(playService))
app.use('/api/v1/stats',    authenticate, createStatsRouter(statsService))
app.use('/api/v1/bgg',      authenticate, createBggRouter(bggRepo))
app.use('/api/v1/data',     authenticate, createDataRouter(dbConn.db))

// Health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }))

// Frontend static (production)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../public')
  app.use(express.static(distPath))
  app.get('*splat', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`))

export default app
