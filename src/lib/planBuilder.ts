import { planOlustur, mufredatliPlanOlustur } from './takvimUtils'
import type { OlusturulmusPlan } from '../types/takvim'
import { getMufredat } from './mufredatRegistry'

export function buildPlan(
  ders: string,
  sinif: string,
  yil: string,
): { plan: OlusturulmusPlan; hasMufredat: boolean } {
  const mufredat = getMufredat(ders, sinif)
  if (mufredat) return { plan: mufredatliPlanOlustur(yil, mufredat), hasMufredat: true }
  return { plan: planOlustur(yil), hasMufredat: false }
}
