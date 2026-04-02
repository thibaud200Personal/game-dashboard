import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

// Express 5 error handler — 4-parameter signature is required (error: any is the Express convention)
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const isDev = process.env.NODE_ENV !== 'production'

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  const message = err instanceof Error ? err.message : 'Unknown error'
  res.status(500).json({
    error: isDev ? message : 'Internal server error',
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  })
}
