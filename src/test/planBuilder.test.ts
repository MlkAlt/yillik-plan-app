import { describe, it, expect } from 'vitest'
import { buildPlan } from '../lib/planBuilder'

const YIL = '2025-2026'

describe('buildPlan()', () => {
  it('müfredat var → hasMufredat: true ve haftalar dolu', () => {
    const { plan, hasMufredat } = buildPlan('Biyoloji', '9. Sınıf', YIL)
    expect(hasMufredat).toBe(true)
    expect(plan.haftalar.length).toBeGreaterThan(0)
  })

  it('müfredat yok → hasMufredat: false ama plan yine de geçerli', () => {
    const { plan, hasMufredat } = buildPlan('BilinmeyenDers', 'BilinmeyenSınıf', YIL)
    expect(hasMufredat).toBe(false)
    // Plan hâlâ oluşturulmalı (MEB takvimi bazlı)
    expect(plan).toBeDefined()
    expect(plan.haftalar).toBeDefined()
  })

  it('müfredat var → plan haftaları kazanım içerir', () => {
    const { plan } = buildPlan('Matematik', '9. Sınıf', YIL)
    const kazanimliHaftalar = plan.haftalar.filter(h => !h.tatilMi && h.kazanim)
    expect(kazanimliHaftalar.length).toBeGreaterThan(0)
  })

  it('müfredat yok → plan haftaları tatil bilgisi içerir', () => {
    const { plan } = buildPlan('BilinmeyenDers', 'BilinmeyenSınıf', YIL)
    const tatilHaftalar = plan.haftalar.filter(h => h.tatilMi)
    expect(tatilHaftalar.length).toBeGreaterThan(0)
  })

  it('farklı sınıflar için farklı müfredat döner', () => {
    const { plan: plan9 } = buildPlan('Fizik', '9. Sınıf', YIL)
    const { plan: plan10 } = buildPlan('Fizik', '10. Sınıf', YIL)
    // İki planın kazanımları aynı olmamalı
    const kazanim9 = plan9.haftalar.find(h => h.kazanim)?.kazanim
    const kazanim10 = plan10.haftalar.find(h => h.kazanim)?.kazanim
    expect(kazanim9).not.toBe(kazanim10)
  })
})
