import * as dotenv from 'dotenv';
dotenv.config();

import express = require('express');
import cors = require('cors');
import path = require('path');
import * as crypto from 'crypto';
import DatabaseManager from './database/DatabaseManager';
import { bggService } from './bggService';
import { CreatePlayerSchema, UpdatePlayerSchema, CreateGameSchema, UpdateGameSchema, CreateSessionSchema } from './validation/schemas';
import { ZodSchema } from 'zod';

const app = express();
const db = new DatabaseManager();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Auth — startup guard + in-memory token
if (!process.env.AUTH_PASSWORD) {
  console.error('[FATAL] AUTH_PASSWORD environment variable is not set. Refusing to start.');
  process.exit(1);
}
const AUTH_PASSWORD: string = process.env.AUTH_PASSWORD;
const AUTH_TOKEN: string = crypto.randomBytes(32).toString('hex');

// Middleware
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5000,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// HTTPS enforcement + HSTS in production (app is exposed to the internet)
if (process.env.NODE_ENV === 'production') {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return next();
  });
}

// Error handler middleware
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Zod validation middleware
const validateBody = (schema: ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors.map(e => e.message).join(', ') });
  }
  req.body = result.data;
  return next();
};

// Auth middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (authHeader.slice(7) !== AUTH_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// Login route — public
app.post('/api/auth/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { password } = req.body as { password?: unknown };
  if (typeof password !== 'string' || password !== AUTH_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  return res.json({ token: AUTH_TOKEN });
}));

// Protect all /api/* routes except /api/health and /api/auth/login
app.use('/api', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path === '/health' || req.path === '/auth/login') return next();
  return requireAuth(req, res, next);
});

// Parses a BGG CSV dump (boardgames_ranks.csv) into importable rows.
// Handles quoted names with commas (e.g. "Brass: Birmingham").
function parseBggCsv(csv: string): { bgg_id: number; name: string; year_published: number | null; is_expansion: number }[] {
  const lines = csv.split('\n')
  const results: { bgg_id: number; name: string; year_published: number | null; is_expansion: number }[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    // Regex: id, name (optional quotes), year, skip 4 cols, is_expansion
    const m = line.match(/^(\d+),"?([^",]*(?:"[^"]*"[^",]*)*)"?,(\d*),(?:[^,]*,){4}(\d)/)
    if (!m) continue
    const bgg_id = parseInt(m[1])
    if (isNaN(bgg_id) || bgg_id <= 0) continue
    const name = m[2].trim()
    if (!name) continue
    const year = parseInt(m[3])
    results.push({
      bgg_id,
      name,
      year_published: isNaN(year) ? null : year,
      is_expansion: parseInt(m[4]) === 1 ? 1 : 0,
    })
  }
  return results
}

// BGG routes — proxy geekdo.com JSON API côté backend, retourne JSON
app.get('/api/bgg/search', asyncHandler(async (req: express.Request, res: express.Response) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Query parameter q is required' });
  if (db.getBggCatalogCount() > 0) {
    const rows = db.searchBggCatalog(query);
    return res.json(rows.map(r => ({
      id: r.bgg_id,
      name: r.name,
      year_published: r.year_published ?? 0,
      type: r.is_expansion ? 'boardgameexpansion' : 'boardgame',
      thumbnail: '',
    })));
  }
  const results = await bggService.searchGames(query);
  return res.json(results);
}));

app.get('/api/bgg/game/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const bggId = parseInt(req.params.id);
  if (isNaN(bggId) || bggId <= 0) return res.status(400).json({ error: 'Invalid BGG game ID' });
  const game = await bggService.getGameDetails(bggId);
  if (!game) return res.status(404).json({ error: 'Game not found on BGG' });
  return res.json(game);
}));

// Settings routes
app.get('/api/settings/import-log', asyncHandler(async (req: express.Request, res: express.Response) => {
  return res.json(db.getImportLog())
}))

// BGG Catalog routes
app.get('/api/bgg/catalog/status', asyncHandler(async (req: express.Request, res: express.Response) => {
  const count = db.getBggCatalogCount()
  return res.json({ count })
}))

app.post('/api/bgg/catalog/import',
  express.text({ limit: '20mb' }),
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const csvText = req.body as string
    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ error: 'CSV text body required' })
    }
    const rows = parseBggCsv(csvText)
    if (rows.length === 0) return res.status(400).json({ error: 'No valid rows parsed from CSV' })
    const count = db.importBggCatalog(rows)
    return res.json({ count })
  })
)

// Player routes
app.get('/api/players', asyncHandler(async (req: express.Request, res: express.Response) => {
  // 🚀 OPTIMIZED: Use player_statistics view instead of manual calculation
  const players = db.getAllPlayersOptimized();
  res.json(players);
}));

app.get('/api/players/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const playerId = parseInt(req.params.id);
  // 🚀 OPTIMIZED: Use player_statistics view instead of manual calculation
  const player = db.getPlayerByIdOptimized(playerId);
  
  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  return res.json(player);
}));

app.post('/api/players', validateBody(CreatePlayerSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const newPlayer = db.createPlayer(req.body);
    return res.status(201).json(newPlayer);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'duplicate_pseudo', message: 'Ce pseudo est déjà utilisé par un autre joueur' });
    }
    throw error;
  }
}));

app.put('/api/players/:id', validateBody(UpdatePlayerSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  const playerId = parseInt(req.params.id);
  try {
    const updatedPlayer = db.updatePlayer(playerId, req.body);
    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json(updatedPlayer);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'duplicate_pseudo', message: 'Ce pseudo est déjà utilisé par un autre joueur' });
    }
    throw error;
  }
}));

app.delete('/api/players/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const playerId = parseInt(req.params.id);
  const result = db.deletePlayer(playerId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  return res.status(204).send();
}));

// Game routes
app.get('/api/games', asyncHandler(async (req: express.Request, res: express.Response) => {
  // 🚀 OPTIMIZED: Use game_statistics view instead of manual calculation
  const games = db.getAllGamesOptimized();
  res.json(games);
}));

app.get('/api/games/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameId = parseInt(req.params.id);
  // 🚀 OPTIMIZED: Use game_statistics view instead of manual calculation
  const game = db.getGameByIdOptimized(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  return res.json(game);
}));

app.post('/api/games', validateBody(CreateGameSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const newGame = db.createGame(req.body);
    return res.status(201).json(newGame);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'duplicate_game', message: 'Ce jeu est déjà dans votre collection' });
    }
    throw error;
  }
}));

app.put('/api/games/:id', validateBody(UpdateGameSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameId = parseInt(req.params.id);
  const updatedGame = db.updateGame(gameId, req.body);
  if (!updatedGame) {
    return res.status(404).json({ error: 'Game not found' });
  }
  return res.json(updatedGame);
}));

app.delete('/api/games/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameId = parseInt(req.params.id);
  const result = db.deleteGame(gameId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  return res.status(204).send();
}));

// Session routes
app.get('/api/sessions', asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameId = req.query.game_id ? parseInt(req.query.game_id as string) : undefined;
  const sessions = db.getGameSessions(gameId);
  return res.json(sessions);
}));

app.post('/api/sessions', validateBody(CreateSessionSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  const sessionData = req.body;
  const newSession = db.createGameSession(sessionData);

  for (const playerData of sessionData.players) {
    db.addSessionPlayer({
      session_id: newSession.session_id,
      ...playerData
    });
  }

  return res.status(201).json(newSession);
}));

// Statistics routes
app.get('/api/stats/players', asyncHandler(async (req: express.Request, res: express.Response) => {
  // 🚀 OPTIMIZED: Use enhanced player statistics with player_statistics view
  const stats = db.getPlayerStatsOptimized();
  return res.json(stats);
}));

app.get('/api/stats/games', asyncHandler(async (req: express.Request, res: express.Response) => {
  // 🚀 OPTIMIZED: Use enhanced game statistics with game_statistics view
  const stats = db.getGameStatsOptimized();
  return res.json(stats);
}));

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', req.method, req.path, error);

  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Database constraint violation',
      details: error.message 
    });
  }
  
  return res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../public');
  app.use(express.static(staticPath));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // 404 handler (dev only — in production the SPA fallback handles unknown routes)
  app.use((req: express.Request, res: express.Response) => {
    return res.status(404).json({ error: 'Endpoint not found' });
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  // Graceful shutdown logging would be handled by proper logging system
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  // Graceful shutdown logging would be handled by proper logging system
  db.close();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API health check: http://localhost:${PORT}/api/health`);
});

export default app;