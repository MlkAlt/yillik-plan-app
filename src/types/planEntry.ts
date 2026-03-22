import type { OlusturulmusPlan } from './takvim'
import type { ParsedRow } from '../lib/fileParser'

export interface PlanEntry {
  sinif: string              // unique key — ilkokul: "3. Sınıf—Türkçe"
  ders: string
  yil: string
  tip: 'meb' | 'yukle'
  plan: OlusturulmusPlan | null
  rows: ParsedRow[] | null
  label?: string             // tab display override (e.g. "Türkçe")
  sinifGercek?: string       // actual grade display (e.g. "3. Sınıf")
}
