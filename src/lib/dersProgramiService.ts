import type { DersProgrami, DersSaati, Gun } from '../types/dersProgrami'
import { StorageKeys } from './storageKeys'

export function getDersProgrami(): DersProgrami | null {
  try {
    const item = localStorage.getItem(StorageKeys.DERS_PROGRAMI)
    if (!item) return null
    return JSON.parse(item) as DersProgrami
  } catch {
    return null
  }
}

export function saveDersProgrami(program: DersProgrami): void {
  const updated = { ...program, guncellemeTarihi: new Date().toISOString() }
  localStorage.setItem(StorageKeys.DERS_PROGRAMI, JSON.stringify(updated))
}

export function checkCakisma(program: DersProgrami, gun: Gun, saat: number): boolean {
  return program.saatler.some(s => s.gun === gun && s.saat === saat && s.sinif !== null)
}

export function hucreGuncelle(program: DersProgrami, gun: Gun, saat: number, sinif: string | null, ders?: string): DersProgrami {
  const mevcutIndex = program.saatler.findIndex(s => s.gun === gun && s.saat === saat)
  const yeniSaat: DersSaati = { gun, saat, sinif, ders }

  let yeniSaatler: DersSaati[]
  if (mevcutIndex >= 0) {
    yeniSaatler = program.saatler.map((s, i) => i === mevcutIndex ? yeniSaat : s)
  } else {
    yeniSaatler = [...program.saatler, yeniSaat]
  }

  return { ...program, saatler: yeniSaatler }
}

export function bosProgram(ogretmenId = 'local'): DersProgrami {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    ogretmenId,
    haftaBaslangic: new Date().toISOString().split('T')[0],
    saatler: [],
    olusturmaTarihi: now,
    guncellemeTarihi: now,
  }
}
