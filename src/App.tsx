import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PlanOlusturPage } from './pages/PlanOlusturPage'
import { PlanPage } from './pages/PlanPage'
import { YuklemePage } from './pages/YuklemePage'
import type { OlusturulmusPlan } from './types/takvim'
import type { ParsedRow } from './lib/fileParser'

function App() {
  const [aktifPlan, setAktifPlan] = useState<OlusturulmusPlan | null>(null)
  const [yuklenenRows, setYuklenenRows] = useState<ParsedRow[] | null>(null)
  const [aktifDers, setAktifDers] = useState('')
  const [aktifSinif, setAktifSinif] = useState('')

  function handlePlanOlustur(plan: OlusturulmusPlan, ders: string, sinif: string) {
    setAktifPlan(plan)
    setYuklenenRows(null)
    setAktifDers(ders)
    setAktifSinif(sinif)
  }

  function handleYukle(rows: ParsedRow[], ders: string, sinif: string) {
    setYuklenenRows(rows)
    setAktifPlan(null)
    setAktifDers(ders)
    setAktifSinif(sinif)
  }

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App