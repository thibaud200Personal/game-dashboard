import * as dotenv from 'dotenv';
dotenv.config();

import express = require('express');
import cors = require('cors');
import path = require('path');
import DatabaseManager from './database/DatabaseManager';
import { bggService } from './bggService';

const app = express();
const db = new DatabaseManager();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5000,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173').split(',');
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Error handler middleware
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// BGG routes — fetch + parsing XML côté backend, retourne JSON
app.get('/api/bgg/search', asyncHandler(async (req: express.Request, res: express.Response) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Query parameter q is required' });
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

app.post('/api/players', asyncHandler(async (req: express.Request, res: express.Response) => {
  const playerData = req.body;
  
  // Validation
  if (!playerData.player_name) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  try {
    const newPlayer = db.createPlayer(playerData);
    return res.status(201).json(newPlayer);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    throw error;
  }
}));

app.put('/api/players/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const playerId = parseInt(req.params.id);
  const playerData = req.body;
  
  if (!playerData.player_name) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  try {
    const updatedPlayer = db.updatePlayer(playerId, playerData);
    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json(updatedPlayer);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
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

app.post('/api/games', asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameData = req.body;
  
  // Validation
  if (!gameData.name || !gameData.min_players || !gameData.max_players) {
    return res.status(400).json({ 
      error: 'Game name, min_players, and max_players are required' 
    });
  }
  
  if (gameData.min_players < 1 || gameData.max_players < gameData.min_players) {
    return res.status(400).json({ 
      error: 'Invalid player count configuration' 
    });
  }
  
  const newGame = db.createGame(gameData);
  return res.status(201).json(newGame);
}));

app.put('/api/games/:id', asyncHandler(async (req: express.Request, res: express.Response) => {
  const gameId = parseInt(req.params.id);
  const gameData = req.body;
  
  // Validation
  if (!gameData.name || !gameData.min_players || !gameData.max_players) {
    return res.status(400).json({ 
      error: 'Game name, min_players, and max_players are required' 
    });
  }
  
  if (gameData.min_players < 1 || gameData.max_players < gameData.min_players) {
    return res.status(400).json({ 
      error: 'Invalid player count configuration' 
    });
  }
  
  const updatedGame = db.updateGame(gameId, gameData);
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

app.post('/api/sessions', asyncHandler(async (req: express.Request, res: express.Response) => {
  const sessionData = req.body;
  
  // Validation
  if (!sessionData.game_id) {
    return res.status(400).json({ error: 'Game ID is required' });
  }
  
  const newSession = db.createGameSession(sessionData);
  
  // Add players to session if provided
  if (sessionData.players && Array.isArray(sessionData.players)) {
    for (const playerData of sessionData.players) {
      db.addSessionPlayer({
        session_id: newSession.session_id,
        ...playerData
      });
    }
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