import { useState, useEffect } from 'react'
import type { PlanEntry } from '../types/planEntry'
import { onAuthStateChange, type User } from '../lib/auth'
import { fetchPlansFromSupabase, fetchProgressFromSupabase } from '../lib/planSync'
import { StorageKeys } from '../lib/storageKeys'

export function useAuthSync(
  setPlanlar: React.Dispatch<React.SetStateAction<PlanEntry[]>>,
  setAktifSinif: React.Dispatch<React.SetStateAction<string>>,
) {
  const [user, setUser] = useState<User | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>(() => {
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (item) {
        const parsed = JSON.parse(item)
        return Array.isArray(parsed) ? {} : parsed
      }
    } catch { /* okunamadı */ }
    return {}
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (newUser) => {
      setUser(newUser)
      if (newUser) {
        setSyncing(true)
        try {
          const bulutPlanlar = await fetchPlansFromSupabase(newUser.id)
          if (bulutPlanlar.length > 0) {
            setPlanlar(prev => {
              const yereldeSiniflar = prev.map(p => p.sinif)
              const yeniPlanlar = [
                ...prev.filter(p => !bulutPlanlar.find(b => b.sinif === p.sinif)),
                ...bulutPlanlar,
              ]
              const aktifGecerli = yeniPlanlar.find(p => p.sinif === yereldeSiniflar[0])
              if (!aktifGecerli && yeniPlanlar.length > 0) {
                setAktifSinif(yeniPlanlar[0].sinif)
                localStorage.setItem(StorageKeys.AKTIF_SINIF, yeniPlanlar[0].sinif)
              }
              localStorage.setItem(StorageKeys.TUM_PLANLAR, JSON.stringify(yeniPlanlar))
              return yeniPlanlar
            })
          }

          const cloudProgress = await fetchProgressFromSupabase(newUser.id)
          if (cloudProgress) {
            try {
              const localTamamlananStr = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
              const localTamamlanan = localTamamlananStr ? JSON.parse(localTamamlananStr) : {}
              const mergedTamamlanan = { ...localTamamlanan, ...cloudProgress.tamamlanan }
              localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(mergedTamamlanan))
              setTamamlananlar(mergedTamamlanan)

              const localNotlarStr = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
              const localNotlar = localNotlarStr ? JSON.parse(localNotlarStr) : {}
              const mergedNotlar: Record<string, Record<string, string>> = { ...localNotlar }
              for (const sinif of Object.keys(cloudProgress.notlar)) {
                mergedNotlar[sinif] = { ...(localNotlar[sinif] || {}), ...cloudProgress.notlar[sinif] }
              }
              localStorage.setItem(StorageKeys.HAFTA_NOTLARI, JSON.stringify(mergedNotlar))
            } catch { /* merge başarısız */ }
          }
        } finally {
          setSyncing(false)
        }
      }
    })
    return unsubscribe
  }, [setPlanlar, setAktifSinif])
  return { user, syncing, tamamlananlar }
}
