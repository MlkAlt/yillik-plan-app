import type { PlanEntry } from '../types/planEntry'

/**
 * Supabase'den gelen ham veriyi PlanEntry tipine karşı doğrular.
 * Geçersiz satırları filtreler ve konsola hata kaydeder.
 */
export function isPlanEntry(value: unknown): value is PlanEntry {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.sinif === 'string' && v.sinif.length > 0 &&
    typeof v.ders === 'string' &&
    typeof v.yil === 'string' &&
    (v.tip === 'meb' || v.tip === 'yukle')
  )
}

export function validatePlanRows(rows: unknown[]): PlanEntry[] {
  return rows.filter((row): row is PlanEntry => {
    const valid = isPlanEntry(row)
    if (!valid) console.error('[PlanValidator] Geçersiz plan satırı:', row)
    return valid
  })
}
