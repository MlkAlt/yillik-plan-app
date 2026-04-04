import { useState, useCallback } from 'react'
import type { DersProgrami, Gun } from '../types/dersProgrami'
import {
  getDersProgrami,
  saveDersProgrami,
  checkCakisma,
  hucreGuncelle,
  bosProgram,
} from '../lib/dersProgramiService'

export function useDersProgrami() {
  const [program, setProgram] = useState<DersProgrami>(() => getDersProgrami() ?? bosProgram())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const yukle = useCallback(() => {
    const mevcut = getDersProgrami()
    if (mevcut) setProgram(mevcut)
  }, [])

  const guncelle = useCallback((gun: Gun, saat: number, sinif: string | null, ders?: string) => {
    setError(null)
    setProgram(prev => {
      // Çakışma kontrolü: farklı bir sınıf atanmaya çalışılıyorsa
      if (sinif !== null && checkCakisma(prev, gun, saat)) {
        const mevcutSaat = prev.saatler.find(s => s.gun === gun && s.saat === saat)
        if (mevcutSaat?.sinif !== sinif) {
          setError(`${gun} ${saat}. saat dolu. Önce mevcut sınıfı kaldırın.`)
          return prev
        }
      }
      return hucreGuncelle(prev, gun, saat, sinif, ders)
    })
  }, [])

  const kaydet = useCallback(() => {
    setLoading(true)
    try {
      saveDersProgrami(program)
    } finally {
      setLoading(false)
    }
  }, [program])

  // Bugünün derslerini saat sırasına göre döndür
  const bugunDersleri = useCallback(() => {
    const gunler: Gun[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
    const bugunIndex = new Date().getDay() - 1 // 0=Pzt
    if (bugunIndex < 0 || bugunIndex > 4) return []
    const bugunGun = gunler[bugunIndex]
    return program.saatler
      .filter(s => s.gun === bugunGun && s.sinif !== null)
      .sort((a, b) => a.saat - b.saat)
  }, [program])

  return { program, loading, error, yukle, guncelle, kaydet, bugunDersleri }
}
