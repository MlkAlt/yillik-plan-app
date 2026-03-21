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
import type { OlusturulmusPlan } from './types/takvim'
import type { ParsedRow } from './lib/fileParser'

function App() {
  const [planlar, setPlanlar] = useState<PlanEntry[]>([])
  const [aktifSinif, setAktifSinif] = useState('')
  const [yuklendi, setYuklendi] = useState(false)

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

    } catch (err) {
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

  // /olustur ve /yukle sayfaları için eski interface'i koru
  function handlePlanOlusturLegacy(plan: OlusturulmusPlan, ders: string, sinif: string) {
    const entry: PlanEntry = { sinif, ders, yil: '2025-2026', tip: 'meb', plan, rows: null }
    handlePlanEkle([entry])
  }

  function handleYukleLegacy(rows: ParsedRow[], ders: string, sinif: string) {
    const entry: PlanEntry = { sinif, ders, yil: '2025-2026', tip: 'yukle', plan: null, rows }
    handlePlanEkle([entry])
  }

  if (!yuklendi) return null

  const aktifEntry = planlar.find(p => p.sinif === aktifSinif) || planlar[0] || null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/olustur" element={<PlanOlusturPage onPlanOlustur={handlePlanOlusturLegacy} />} />
        <Route path="/yukle" element={<YuklemePage onYukle={handleYukleLegacy} />} />
        <Route
          path="/plan"
          element={
            aktifEntry
              ? <PlanPage entry={aktifEntry} />
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
              />
            </AppLayout>
          }
        />
        <Route
          path="/app/plan"
          element={
            aktifEntry
              ? <AppLayout><PlanPage entry={aktifEntry} /></AppLayout>
              : <AppLayout>
                  <AppHomeScreen
                    planlar={planlar}
                    onPlanEkle={handlePlanEkle}
                    onSinifSec={handleSinifSec}
                  />
                </AppLayout>
          }
        />
        <Route path="/app/ayarlar" element={<AppLayout><AppSettingsScreen onPlanEkle={handlePlanEkle} /></AppLayout>} />
        <Route path="/app/hafta/:haftaNo" element={<AppLayout><HaftaDetayPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
