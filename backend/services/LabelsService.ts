import type { LocaleInfo } from '@shared/types'
import type { LabelsRepository } from '../repositories/LabelsRepository'

export class LabelsService {
  constructor(private labelsRepo: LabelsRepository) {}

  getLabels(locale: string): Record<string, string> {
    return this.labelsRepo.getByLocale(locale)
  }

  getLocales(): LocaleInfo[] {
    return this.labelsRepo.getAvailableLocales()
  }
}
