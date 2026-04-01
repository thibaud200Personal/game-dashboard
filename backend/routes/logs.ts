import { Router } from 'express'
import type { Logger } from 'pino'

export function createLogsRouter(logger: Logger): Router {
  const router = Router()

  router.post('/client', (req, res) => {
    const { level = 'error', message, stack, url } = req.body as {
      level?: string; message?: string; stack?: string; url?: string
    }
    const logFn = level === 'warn' ? logger.warn.bind(logger) : logger.error.bind(logger)
    logFn({ clientError: true, url, stack }, message ?? 'Client error')
    res.status(204).send()
  })

  return router
}
