import { useState, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { PlanEntry } from '../types/planEntry'
import type { ParsedRow } from '../lib/fileParser'
import type { User } from '../lib/auth'
import { syncPlansToSupabase, deletePlanFromSupabase } from '../lib/planSync'
import { StorageKeys } from '../lib/storageKeys'
import { getYilSecenekleri } from '../lib/dersSinifMap'

export function usePlanYonetimi(userRef?: RefObject<User | null>) {
  const internalUserRef = useRef<User | null>(null)
  const activeUserRef = userRef ?? internalUserRef
  const [planlar, setPlanlar] = useState<PlanEntry[]>([])
  const [aktifSinif, setAktifSinif] = useState('')
  const [yuklendi, setYuklendi] = useState(false)
  const [authPromptAcik, setAuthPromptAcik] = useState(false)

  useEffect(() => {
    try {
      const eskiPlan = localStorage.getItem(StorageKeys.ESKI_AKTIF_PLAN)
      const yeniPlanlar = localStorage.getItem(StorageKeys.TUM_PLANLAR)
      if (!yeniPlanlar && eskiPlan) {
        const parsed = JSON.parse(eskiPlan)
        const entry: PlanEntry = {
          sinif: parsed.sinif || '', ders: parsed.ders || '',
          yil: parsed.yil || '2025-2026', tip: parsed.tip || 'meb',
          plan: parsed.plan || null, rows: parsed.rows || null,
        }
        const liste = [entry]
        localStorage.setItem(StorageKeys.TUM_PLANLAR, JSON.stringify(liste))
        setPlanlar(liste)
        setAktifSinif(entry.sinif)
        localStorage.setItem(StorageKeys.AKTIF_SINIF, entry.sinif)
      } else if (yeniPlanlar) {
        setPlanlar(JSON.parse(yeniPlanlar))
      }
      const savedSinif = localStorage.getItem(StorageKeys.AKTIF_SINIF)
      if (savedSinif) setAktifSinif(savedSinif)
    } catch { /* localStorage okunamadı */ }
    finally { setYuklendi(true) }
  }, [])

  function handlePlanEkle(entries: PlanEntry[]) {
    setPlanlar(prev => {
      const gelenSiniflar = entries.map(e => e.sinif)
      const sonuc = [...prev.filter(p => !gelenSiniflar.includes(p.sinif)), ...entries]
      localStorage.setItem(StorageKeys.TUM_PLANLAR, JSON.stringify(sonuc))
      if (activeUserRef.current) syncPlansToSupabase(activeUserRef.current.id, entries).catch(() => {})
      return sonuc
    })
    if (entries.length > 0) {
      setAktifSinif(entries[0].sinif)
      localStorage.setItem(StorageKeys.AKTIF_SINIF, entries[0].sinif)
    }
  }

  function triggerAuthPromptIfNeeded() {
    if (!activeUserRef.current && localStorage.getItem(StorageKeys.AUTH_PROMPT_GOSTERILDI) !== '1') {
      setAuthPromptAcik(true)
    }
  }

  function handleSinifSec(sinif: string) {
    setAktifSinif(sinif)
    localStorage.setItem(StorageKeys.AKTIF_SINIF, sinif)
  }

  function handlePlanSil(sinif: string) {
    const sonuc = planlar.filter(p => p.sinif !== sinif)
    setPlanlar(sonuc)
    localStorage.setItem(StorageKeys.TUM_PLANLAR, JSON.stringify(sonuc))
    if (aktifSinif === sinif) {
      const yeniAktif = sonuc[0]?.sinif || ''
      setAktifSinif(yeniAktif)
      localStorage.setItem(StorageKeys.AKTIF_SINIF, yeniAktif)
    }
    if (activeUserRef.current) deletePlanFromSupabase(activeUserRef.current.id, sinif).catch(() => {})
  }

  function handleYukleLegacy(rows: ParsedRow[], ders: string, sinif: string) {
    handlePlanEkle([{ sinif, ders, yil: getYilSecenekleri()[0], tip: 'yukle', plan: null, rows }])
  }

  const aktifEntry = planlar.find(p => p.sinif === aktifSinif) || planlar[0] || null

  return {
    planlar, setPlanlar, aktifSinif, setAktifSinif,
    yuklendi, authPromptAcik, setAuthPromptAcik,
    aktifEntry,
    handlePlanEkle, handlePlanSil, handleSinifSec, handleYukleLegacy,
    triggerAuthPromptIfNeeded,
  }
}
