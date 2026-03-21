import type { OlusturulmusPlan } from './takvim'
import type { ParsedRow } from '../lib/fileParser'

export interface PlanEntry {
  sinif: string
  ders: string
  yil: string
  tip: 'meb' | 'yukle'
  plan: OlusturulmusPlan | null
  rows: ParsedRow[] | null
}
