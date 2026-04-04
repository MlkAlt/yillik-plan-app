import { supabase } from './supabase'
import type { PlanEntry } from '../types/planEntry'
import { validatePlanRows } from './planValidator'

// Supabase erişilemezse fallback değeri döner — sessiz hata
export async function withSupabaseFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

interface SupabasePlan {
  user_id: string
  sinif: string
  ders: string
  yil: string
  tip: string
  plan_json: object | null
  rows_json: object | null
  label: string | null
  sinif_gercek: string | null
}

export async function syncPlansToSupabase(userId: string, planlar: PlanEntry[]) {
  if (!userId || planlar.length === 0) return

  const rows: SupabasePlan[] = planlar.map(p => ({
    user_id: userId,
    sinif: p.sinif,
    ders: p.ders,
    yil: p.yil,
    tip: p.tip,
    plan_json: p.plan ? (p.plan as unknown as object) : null,
    rows_json: p.rows ? (p.rows as unknown as object) : null,
    label: p.label ?? null,
    sinif_gercek: p.sinifGercek ?? null,
  }))
  await supabase
    .from('plans')
    .upsert(rows, { onConflict: 'user_id,sinif,ders' })
}

export async function fetchPlansFromSupabase(userId: string): Promise<PlanEntry[]> {
  return withSupabaseFallback(async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)

    if (error || !data) return []

    const mapped = data.map(row => ({
      sinif: row.sinif,
      ders: row.ders,
      yil: row.yil,
      tip: row.tip as 'meb' | 'yukle',
      plan: row.plan_json ?? null,
      rows: row.rows_json ?? null,
      label: row.label ?? undefined,
      sinifGercek: row.sinif_gercek ?? undefined,
    }))
    return validatePlanRows(mapped)
  }, [])
}

export async function deletePlanFromSupabase(userId: string, sinif: string) {
  await supabase
    .from('plans')
    .delete()
    .eq('user_id', userId)
    .eq('sinif', sinif)
}

export async function syncProgressToSupabase(
  userId: string,
  tamamlanan: Record<string, number[]>,
  notlar: Record<string, Record<string, string>>,
) {
  if (!userId) return
  await supabase
    .from('user_progress')
    .upsert({ user_id: userId, tamamlanan_json: tamamlanan, notlar_json: notlar, updated_at: new Date().toISOString() })
}

export async function fetchProgressFromSupabase(userId: string): Promise<{
  tamamlanan: Record<string, number[]>
  notlar: Record<string, Record<string, string>>
} | null> {
  return withSupabaseFallback(async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('tamamlanan_json, notlar_json')
      .eq('user_id', userId)
      .single()
    if (error || !data) return null
    return {
      tamamlanan: (data.tamamlanan_json as Record<string, number[]>) || {},
      notlar: (data.notlar_json as Record<string, Record<string, string>>) || {},
    }
  }, null)
}
