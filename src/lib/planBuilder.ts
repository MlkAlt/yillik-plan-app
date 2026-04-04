import { planOlustur, mufredatliPlanOlustur } from './takvimUtils'
import type { OlusturulmusPlan } from '../types/takvim'
import { getMufredat } from './mufredatRegistry'

export async function buildPlan(
  ders: string,
  sinif: string,
  yil: string,
): Promise<{ plan: OlusturulmusPlan; hasMufredat: boolean }> {
  const mufredat = await getMufredat(ders, sinif)
  if (mufredat) return { plan: mufredatliPlanOlustur(yil, mufredat), hasMufredat: true }
  return { plan: planOlustur(yil), hasMufredat: false }
}
