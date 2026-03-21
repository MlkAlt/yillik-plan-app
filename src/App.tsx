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
import type { OlusturulmusPlan } from './types/takvim'
import type { ParsedRow } from './lib/fileParser'

function App() {
  const [aktifPlan, setAktifPlan] = useState<OlusturulmusPlan | null>(null)
  const [yuklenenRows, setYuklenenRows] = useState<ParsedRow[] | null>(null)
  const [aktifDers, setAktifDers] = useState('')
  const [aktifSinif, setAktifSinif] = useState('')
  const [yuklendi, setYuklendi] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aktif-plan')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.tip === 'meb') {
          setAktifPlan(parsed.plan)
          setYuklenenRows(null)
        } else if (parsed.tip === 'yukle') {
          setAktifPlan(null)
          setYuklenenRows(parsed.rows)
        }
        setAktifDers(parsed.ders || '')
        setAktifSinif(parsed.sinif || '')
      }
    } catch (err) {
      // localStorage okunamadı
    } finally {
      setYuklendi(true)
    }
  }, [])

  function handlePlanOlustur(plan: OlusturulmusPlan, ders: string, sinif: string) {
    setAktifPlan(plan)
    setYuklenenRows(null)
    setAktifDers(ders)
    setAktifSinif(sinif)
    try {
      localStorage.setItem('aktif-plan', JSON.stringify({ tip: 'meb', plan, rows: null, ders, sinif }))
    } catch (err) { }
  }

  function handleYukle(rows: ParsedRow[], ders: string, sinif: string) {
    setYuklenenRows(rows)
    setAktifPlan(null)
    setAktifDers(ders)
    setAktifSinif(sinif)
    try {
      localStorage.setItem('aktif-plan', JSON.stringify({ tip: 'yukle', plan: null, rows, ders, sinif }))
    } catch (err) { }
  }

  // localStorage yüklenene kadar bekle
  if (!yuklendi) return null

  const planHazir = aktifPlan !== null || yuklenenRows !== null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/olustur" element={<PlanOlusturPage onPlanOlustur={handlePlanOlustur} />} />
        <Route path="/yukle" element={<YuklemePage onYukle={handleYukle} />} />
        <Route
          path="/plan"
          element={
            planHazir
              ? <PlanPage plan={aktifPlan} rows={yuklenenRows} ders={aktifDers} sinif={aktifSinif} />
              : <Navigate to="/olustur" replace />
          }
        />
        <Route path="/app" element={<AppLayout><AppHomeScreen onPlanOlustur={handlePlanOlustur} /></AppLayout>} />
        <Route
          path="/app/plan"
          element={
            planHazir
              ? <AppLayout><PlanPage plan={aktifPlan} rows={yuklenenRows} ders={aktifDers} sinif={aktifSinif} /></AppLayout>
              : <AppLayout><AppHomeScreen onPlanOlustur={handlePlanOlustur} /></AppLayout>
          }
        />
        <Route path="/app/ayarlar" element={<AppLayout><AppSettingsScreen /></AppLayout>} />
        <Route path="/app/hafta/:haftaNo" element={<AppLayout><HaftaDetayPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
