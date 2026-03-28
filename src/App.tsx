import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PlanOlusturPage } from './pages/PlanOlusturPage'
import { PlanPage } from './pages/PlanPage'
import { YuklemePage } from './pages/YuklemePage'
import { AppHomeScreen } from './pages/AppHomeScreen'
import { AppSettingsScreen } from './pages/AppSettingsScreen'
import { AppLayout } from './components/AppLayout'
import { HaftaDetayPage } from './pages/HaftaDetayPage'
import type { PlanEntry } from './types/planEntry'
import type { ParsedRow } from './lib/fileParser'
import { onAuthStateChange, type User } from './lib/auth'
import { syncPlansToSupabase, fetchPlansFromSupabase, deletePlanFromSupabase, fetchProgressFromSupabase } from './lib/planSync'
import { getYilSecenekleri } from './lib/dersSinifMap'

function App() {
  const [planlar, setPlanlar] = useState<PlanEntry[]>([])
  const [aktifSinif, setAktifSinif] = useState('')
  const [yuklendi, setYuklendi] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>(() => {
    try {
      const item = localStorage.getItem('tamamlanan-haftalar')
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
        // Login olunca Supabase'den planları çek, localStorage ile birleştir
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
                localStorage.setItem('aktif-sinif', yeniPlanlar[0].sinif)
              }
              localStorage.setItem('tum-planlar', JSON.stringify(yeniPlanlar))
              return yeniPlanlar
            })
          }
          // Progress (tamamlanan + notlar) sync
          const cloudProgress = await fetchProgressFromSupabase(newUser.id)
          if (cloudProgress) {
            try {
              const localTamamlananStr = localStorage.getItem('tamamlanan-haftalar')
              const localTamamlanan = localTamamlananStr ? JSON.parse(localTamamlananStr) : {}
              const mergedTamamlanan = { ...localTamamlanan, ...cloudProgress.tamamlanan }
              localStorage.setItem('tamamlanan-haftalar', JSON.stringify(mergedTamamlanan))
              setTamamlananlar(mergedTamamlanan)

              const localNotlarStr = localStorage.getItem('hafta-notlari')
              const localNotlar = localNotlarStr ? JSON.parse(localNotlarStr) : {}
              const mergedNotlar: Record<string, Record<string, string>> = { ...localNotlar }
              for (const sinif of Object.keys(cloudProgress.notlar)) {
                mergedNotlar[sinif] = { ...(localNotlar[sinif] || {}), ...cloudProgress.notlar[sinif] }
              }
              localStorage.setItem('hafta-notlari', JSON.stringify(mergedNotlar))
            } catch { /* merge başarısız */ }
          }
        } finally {
          setSyncing(false)
        }
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    try {
      // Eski 'aktif-plan' verisini yeni formata migrate et
      const eskiPlan = localStorage.getItem('aktif-plan')
      const yeniPlanlar = localStorage.getItem('tum-planlar')

      if (!yeniPlanlar && eskiPlan) {
        const parsed = JSON.parse(eskiPlan)
        const entry: PlanEntry = {
          sinif: parsed.sinif || '',
          ders: parsed.ders || '',
          yil: parsed.yil || '2025-2026',
          tip: parsed.tip || 'meb',
          plan: parsed.plan || null,
          rows: parsed.rows || null,
        }
        const liste = [entry]
        localStorage.setItem('tum-planlar', JSON.stringify(liste))
        setPlanlar(liste)
        setAktifSinif(entry.sinif)
        localStorage.setItem('aktif-sinif', entry.sinif)
      } else if (yeniPlanlar) {
        setPlanlar(JSON.parse(yeniPlanlar))
      }

      const savedSinif = localStorage.getItem('aktif-sinif')
      if (savedSinif) setAktifSinif(savedSinif)

    } catch {
      // localStorage okunamadı
    } finally {
      setYuklendi(true)
    }
  }, [])

  function handlePlanEkle(entries: PlanEntry[]) {
    setPlanlar(prev => {
      // Gelen sınıflar için mevcut planları değiştir, diğerlerini koru
      const gelenSiniflar = entries.map(e => e.sinif)
      const korunanlar = prev.filter(p => !gelenSiniflar.includes(p.sinif))
      const sonuc = [...korunanlar, ...entries]
      localStorage.setItem('tum-planlar', JSON.stringify(sonuc))
      // Kullanıcı login ise Supabase'e de kaydet
      if (user) {
        syncPlansToSupabase(user.id, entries).catch(() => { /* sessiz hata */ })
      }
      return sonuc
    })
    if (entries.length > 0) {
      setAktifSinif(entries[0].sinif)
      localStorage.setItem('aktif-sinif', entries[0].sinif)
    }
  }

  function handleSinifSec(sinif: string) {
    setAktifSinif(sinif)
    localStorage.setItem('aktif-sinif', sinif)
  }

  function handlePlanSil(sinif: string) {
    const sonuc = planlar.filter(p => p.sinif !== sinif)
    setPlanlar(sonuc)
    localStorage.setItem('tum-planlar', JSON.stringify(sonuc))
    if (aktifSinif === sinif) {
      const yeniAktif = sonuc[0]?.sinif || ''
      setAktifSinif(yeniAktif)
      localStorage.setItem('aktif-sinif', yeniAktif)
    }
    if (user) {
      deletePlanFromSupabase(user.id, sinif).catch(() => {})
    }
  }

  function handleYukleLegacy(rows: ParsedRow[], ders: string, sinif: string) {
    const entry: PlanEntry = { sinif, ders, yil: getYilSecenekleri()[0], tip: 'yukle', plan: null, rows }
    handlePlanEkle([entry])
  }

  if (!yuklendi) return null

  const aktifEntry = planlar.find(p => p.sinif === aktifSinif) || planlar[0] || null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/olustur" element={<PlanOlusturPage onPlanEkle={handlePlanEkle} />} />
        <Route path="/yukle" element={<YuklemePage onYukle={handleYukleLegacy} />} />
        <Route
          path="/plan"
          element={
            aktifEntry
              ? <PlanPage entry={aktifEntry} planlar={planlar} onSinifSec={handleSinifSec} />
              : <Navigate to="/olustur" replace />
          }
        />
        <Route
          path="/app"
          element={
            <AppLayout>
              <AppHomeScreen
                planlar={planlar}
                onPlanEkle={handlePlanEkle}
                onSinifSec={handleSinifSec}
                syncing={syncing}
                tamamlananlar={tamamlananlar}
              />
            </AppLayout>
          }
        />
        <Route
          path="/app/plan"
          element={
            aktifEntry
              ? <AppLayout><PlanPage entry={aktifEntry} planlar={planlar} onSinifSec={handleSinifSec} /></AppLayout>
              : <AppLayout>
                  <AppHomeScreen
                    planlar={planlar}
                    onPlanEkle={handlePlanEkle}
                    onSinifSec={handleSinifSec}
                    syncing={syncing}
                    tamamlananlar={tamamlananlar}
                  />
                </AppLayout>
          }
        />
        <Route path="/app/ayarlar" element={<AppLayout><AppSettingsScreen onPlanEkle={handlePlanEkle} onPlanSil={handlePlanSil} planlar={planlar} user={user} /></AppLayout>} />
        <Route path="/app/hafta/:haftaNo" element={<AppLayout><HaftaDetayPage entry={aktifEntry} /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
