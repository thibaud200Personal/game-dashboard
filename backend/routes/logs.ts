import { Router } from 'express'
import { z } from 'zod'
import type { Logger } from 'pino'
import { validateBody } from '../validation/middleware'

const ClientLogSchema = z.object({
  level: z.enum(['warn', 'error']).default('error'),
  message: z.string().max(500).optional(),
  stack: z.string().max(2000).optional(),
  url: z.string().max(500).optional(),
})

export function createLogsRouter(logger: Logger): Router {
  const router = Router()

  router.post('/client', validateBody(ClientLogSchema), (req, res) => {
    const { level, message, stack, url } = req.body as z.infer<typeof ClientLogSchema>
    const logFn = level === 'warn' ? logger.warn.bind(logger) : logger.error.bind(logger)
    logFn({ clientError: true, url, stack }, message ?? 'Client error')
    res.status(204).send()
  })

  return router
}
