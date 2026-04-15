import { Router, Request, Response } from 'express'
import { z } from 'zod'
import type { LabelsService } from '../services/LabelsService'

const LocaleQuery = z.object({
  locale: z.string().min(2).max(5).default('en'),
})

export function createLabelsRouter(labelsService: LabelsService): Router {
  const router = Router()

  router.get('/locales', (_req, res) => {
    try {
      res.json(labelsService.getLocales())
    } catch {
      res.status(500).json({ error: 'Server error' })
    }
  })

  router.get('/', (req: Request, res: Response) => {
    try {
      const validatedQuery = LocaleQuery.parse(req.query)
      const { locale } = validatedQuery
      res.json(labelsService.getLabels(locale))
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        res.status(400).json({ error: 'Invalid query parameters', details: errorMessages })
        return
      }
      res.status(500).json({ error: 'Server error' })
    }
  })

  return router
}
