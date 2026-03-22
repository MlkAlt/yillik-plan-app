import { supabase } from './supabase'
import type { PlanEntry } from '../types/planEntry'

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
    .upsert(rows, { onConflict: 'user_id,sinif' })
}

export async function fetchPlansFromSupabase(userId: string): Promise<PlanEntry[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)

  if (error || !data) return []

  return data.map(row => ({
    sinif: row.sinif,
    ders: row.ders,
    yil: row.yil,
    tip: row.tip as 'meb' | 'yukle',
    plan: row.plan_json ?? null,
    rows: row.rows_json ?? null,
    label: row.label ?? undefined,
    sinifGercek: row.sinif_gercek ?? undefined,
  }))
}

export async function deletePlanFromSupabase(userId: string, sinif: string) {
  await supabase
    .from('plans')
    .delete()
    .eq('user_id', userId)
    .eq('sinif', sinif)
}
