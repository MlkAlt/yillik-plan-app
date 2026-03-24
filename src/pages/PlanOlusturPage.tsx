import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planOlustur, mevcutYillar, mufredatliPlanOlustur } from '../lib/takvimUtils'
import { getMufredat } from '../lib/mufredatRegistry'
import type { OlusturulmusPlan } from '../types/takvim'
import {
  SINIF_SEVIYELERI, DERS_SINIF_MAP, DERS_GRUPLARI,
  SINIF_OGRETMENI_SINIFLAR, SINIF_OGRETMENI_DERSLER,
} from '../lib/dersSinifMap'

const SINIF_OGR_GRUP = 'Sınıf Öğretmenliği'

interface PlanOlusturPageProps {
  onPlanOlustur: (plan: OlusturulmusPlan, ders: string, sinif: string) => void
}

function getDersler(brans: string): string[] {
  if (brans === SINIF_OGR_GRUP) return SINIF_OGRETMENI_DERSLER
  return DERS_GRUPLARI.find(g => g.grup === brans)?.dersler ?? []
}

function getSiniflar(brans: string, ders: string): string[] {
  if (brans === SINIF_OGR_GRUP) return SINIF_OGRETMENI_SINIFLAR
  return DERS_SINIF_MAP[ders] ?? SINIF_SEVIYELERI
}

export function PlanOlusturPage({ onPlanOlustur }: PlanOlusturPageProps) {
  const navigate = useNavigate()
  const yillar = mevcutYillar()

  const ilkGrup = DERS_GRUPLARI[0]
  const ilkDers = getDersler(ilkGrup.grup)[0]

  const [seciliYil, setSeciliYil] = useState(() => {
    try {
      const k = localStorage.getItem('ogretmen-ayarlari')
      if (k) {
        const a = JSON.parse(k) as { yil?: string }
        if (a.yil) return a.yil
      }
    } catch { /* okunamadı */ }
    return yillar[yillar.length - 1]
  })

  const [brans, setBrans] = useState(ilkGrup.grup)
  const [ders, setDers] = useState(ilkDers)
  const [sinif, setSinif] = useState(getSiniflar(ilkGrup.grup, ilkDers)[0])
  const [hata, setHata] = useState('')

  const guncelDersler = getDersler(brans)
  const guncelSiniflar = getSiniflar(brans, ders)

  function handleBransChange(yeniBrans: string) {
    setBrans(yeniBrans)
    const dersler = getDersler(yeniBrans)
    const yeniDers = dersler[0] ?? ''
    setDers(yeniDers)
    setSinif(getSiniflar(yeniBrans, yeniDers)[0])
  }

  function handleDersChange(yeniDers: string) {
    setDers(yeniDers)
    setSinif(getSiniflar(brans, yeniDers)[0])
  }

  function handleSubmit() {
    if (!ders.trim()) {
      setHata('Lütfen ders seçin.')
      return
    }
    setHata('')
    try {
      const mufredat = getMufredat(ders.trim(), sinif)
      const plan = mufredat
        ? mufredatliPlanOlustur(seciliYil, mufredat)
        : planOlustur(seciliYil)
      onPlanOlustur(plan, ders.trim(), sinif)
      navigate('/plan')
    } catch {
      setHata('Plan oluşturulamadı. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] w-full max-w-md p-8">

        <h1 className="text-2xl font-bold text-[#1C1917] mb-2">
          Yıllık Plan Oluştur
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Bilgileri doldurun, MEB takvimine göre planınız otomatik oluşsun.
        </p>

        {/* Akademik Yıl */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1C1917] mb-1">
            Akademik Yıl
          </label>
          <select
            value={seciliYil}
            onChange={(e) => setSeciliYil(e.target.value)}
            className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
          >
            {yillar.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Branş */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1C1917] mb-1">
            Branş
          </label>
          <select
            value={brans}
            onChange={(e) => handleBransChange(e.target.value)}
            className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
          >
            {DERS_GRUPLARI.map((g) => (
              <option key={g.grup} value={g.grup}>{g.grup}</option>
            ))}
          </select>
        </div>

        {/* Ders */}
        {guncelDersler.length > 1 && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1C1917] mb-1">
              Ders
            </label>
            <select
              value={ders}
              onChange={(e) => handleDersChange(e.target.value)}
              className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
            >
              {guncelDersler.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sınıf Seviyesi */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#1C1917] mb-1">
            Sınıf Seviyesi
          </label>
          <select
            value={sinif}
            onChange={(e) => setSinif(e.target.value)}
            className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
          >
            {guncelSiniflar.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {hata && (
          <p className="text-red-500 text-sm mb-4">{hata}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-[#2D5BE3] hover:bg-[#2D5BE3]/90 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Plan Oluştur →
        </button>

        <button
          onClick={() => navigate('/app')}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
        >
          ← Ana sayfaya dön
        </button>

      </div>
    </div>
  )
}
