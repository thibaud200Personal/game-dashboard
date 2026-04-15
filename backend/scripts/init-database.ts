import { DatabaseConnection } from '../database/DatabaseConnection';
import * as path from 'path';
import winston from 'winston';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'backend/app-backend.log' })
  ]
});

function initializeDatabase() {
  logger.info('Initializing database...');

  try {
    const dbPath = process.env.DB_PATH ?? path.join(__dirname, '../database/board_game_score.db');
    const db = new DatabaseConnection(dbPath);
    logger.info('Database initialized successfully!');

    // Verify initialization by checking schema_version
    const migrations = db.db.prepare('SELECT COUNT(*) as count FROM schema_version').get() as { count: number };
    const labels = db.db.prepare('SELECT COUNT(*) as count FROM labels').get() as { count: number };

    logger.info('Database contents:');
    logger.info(`- Migrations applied: ${migrations.count}`);
    logger.info(`- Labels seeded: ${labels.count}`);

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