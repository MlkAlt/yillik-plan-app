import type { JetonDurumu } from '../types/evrak'
import { StorageKeys } from './storageKeys'

const FREE_AYLIK_HAK = 3

export function getJetonDurumu(): JetonDurumu {
  try {
    const item = localStorage.getItem(StorageKeys.JETON_DURUMU)
    if (item) {
      const durum = JSON.parse(item) as JetonDurumu
      // Ay değiştiyse kullanılan jeton sayısını sıfırla
      const buAy = new Date().toISOString().slice(0, 7) // "2025-04"
      const sonYenilemeAy = durum.sonYenileme.slice(0, 7)
      if (buAy !== sonYenilemeAy) {
        const yeni: JetonDurumu = {
          ...durum,
          kullanilanBuAy: 0,
          sonYenileme: new Date().toISOString(),
        }
        localStorage.setItem(StorageKeys.JETON_DURUMU, JSON.stringify(yeni))
        return yeni
      }
      return durum
    }
  } catch { /* ignore */ }

  // Varsayılan: free tier, 3 jeton
  const varsayilan: JetonDurumu = {
    bakiye: FREE_AYLIK_HAK,
    aylikHak: FREE_AYLIK_HAK,
    kullanilanBuAy: 0,
    sonYenileme: new Date().toISOString(),
    isPremium: false,
  }
  localStorage.setItem(StorageKeys.JETON_DURUMU, JSON.stringify(varsayilan))
  return varsayilan
}

export function harcaJeton(miktar = 1): { basarili: boolean; yeniDurum: JetonDurumu } {
  const durum = getJetonDurumu()

  if (!durum.isPremium && durum.kullanilanBuAy + miktar > durum.aylikHak) {
    return { basarili: false, yeniDurum: durum }
  }

  const yeni: JetonDurumu = {
    ...durum,
    bakiye: Math.max(0, durum.bakiye - miktar),
    kullanilanBuAy: durum.kullanilanBuAy + miktar,
  }
  localStorage.setItem(StorageKeys.JETON_DURUMU, JSON.stringify(yeni))
  return { basarili: true, yeniDurum: yeni }
}

export function checkPremiumErisim(_ozellik: string, isPremium: boolean): boolean {
  return isPremium
}
