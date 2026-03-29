import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import winston from 'winston';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'backend/app-backend.log' })
  ]
});

/**
 * Middleware de validation Zod pour les corps de requête
 * @param schema - Schéma Zod pour valider le corps de la requête
 * @returns Middleware Express
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Validation error in request body:', errorMessages);
        res.status(400).json({ error: 'Données de requête invalides', details: errorMessages });
        return;
      }
      logger.error('Unexpected validation error:', error);
      res.status(500).json({ error: 'Erreur de validation inattendue' });
    }
  };
};

/**
 * Middleware de validation Zod pour les paramètres de requête
 * @param schema - Schéma Zod pour valider les paramètres
 * @returns Middleware Express
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams as Record<string, string>;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Validation error in request params:', errorMessages);
        res.status(400).json({ error: 'Paramètres de requête invalides', details: errorMessages });
        return;
      }
      logger.error('Unexpected validation error:', error);
      res.status(500).json({ error: 'Erreur de validation inattendue' });
    }
  };
};

/**
 * Middleware de validation Zod pour les query parameters
 * @param schema - Schéma Zod pour valider les query parameters
 * @returns Middleware Express
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery as Record<string, string>;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        logger.warn('Validation error in query parameters:', errorMessages);
        res.status(400).json({ error: 'Paramètres de requête invalides', details: errorMessages });
        return;
      }
      logger.error('Unexpected validation error:', error);
      res.status(500).json({ error: 'Erreur de validation inattendue' });
    }
  };
};

/**
 * Fonction utilitaire pour valider des données sans middleware
 * @param schema - Schéma Zod
 * @param data - Données à valider
 * @returns Données validées ou throw une erreur
 */
export const validateData = <T>(schema: ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * Fonction utilitaire pour valider des données avec gestion d'erreur safe
 * @param schema - Schéma Zod
 * @param data - Données à valider
 * @returns { success: boolean, data?: T, error?: ZodError }
 */
export const safeValidateData = <T>(schema: ZodSchema<T>, data: unknown): 
  { success: true; data: T } | { success: false; error: ZodError } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};