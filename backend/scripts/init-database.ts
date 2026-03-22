import DatabaseManager from '../database/DatabaseManager';
import winston from 'winston';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'backend/app-backend.log' })
  ]
});

async function initializeDatabase() {
  logger.info('Initializing database...');

  try {
    const db = new DatabaseManager();
    logger.info('Database initialized successfully!');

    // Verify initialization by getting counts
    const playerStats = db.getPlayerStats() as { total_players: number };
    const gameStats = db.getGameStats() as { total_games: number };

    logger.info('Database contents:');
    logger.info(`- Players: ${playerStats.total_players}`);
    logger.info(`- Games: ${gameStats.total_games}`);

    db.close();
    logger.info('Database connection closed.');

  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  initializeDatabase();
}