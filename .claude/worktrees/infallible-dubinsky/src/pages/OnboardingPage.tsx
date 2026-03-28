import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planOlustur, mufredatliPlanOlustur, type MufredatJson } from '../lib/takvimUtils'
import type { OlusturulmusPlan } from '../types/takvim'
import fen5Mufredat from '../data/mufredat/fen-bilimleri-5.json'
import fen6Mufredat from '../data/mufredat/fen-bilimleri-6.json'
import fen7Mufredat from '../data/mufredat/fen-bilimleri-7.json'
import fen8Mufredat from '../data/mufredat/fen-bilimleri-8.json'

const DERS_SECENEKLERI = [
  'Fen Bilimleri', 'Matematik', 'Türkçe', 'Sosyal Bilgiler',
  'İngilizce', 'Din Kültürü ve Ahlak Bilgisi', 'Almanca', 'Fransızca',
  'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar', 'Tarih', 'Coğrafya',
  'Fizik', 'Kimya', 'Biyoloji', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Türk Dili ve Edebiyatı', 'Matematik Uygulamaları',
  'Bilişim Teknolojileri', 'Trafik ve İlk Yardım', 'Sağlık Bilgisi',
  'DKAB', 'Meslek Dersi', 'Diğer',
]

const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

const DERS_SINIF_MAP: Record<string, string[]> = {
  'Fen Bilimleri': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Matematik': SINIF_SEVIYELERI,
  'Beden Eğitimi': SINIF_SEVIYELERI,
  'Müzik': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Görsel Sanatlar': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'İngilizce': SINIF_SEVIYELERI,
  'Din Kültürü ve Ahlak Bilgisi': SINIF_SEVIYELERI,
  'Tarih': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Coğrafya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Fizik': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Kimya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Biyoloji': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
}

const YIL_SECENEKLERI = ['2024-2025', '2025-2026']

interface OnboardingPageProps {
  onPlanOlustur: (plan: OlusturulmusPlan, ders: string, sinif: string) => void
}

export function OnboardingPage({ onPlanOlustur }: OnboardingPageProps) {
  const navigate = useNavigate()

  const [ders, setDers] = useState('Fen Bilimleri')
  const [sinif, setSinif] = useState('5. Sınıf')
  const [yil, setYil] = useState('2025-2026')
  const [olusturuluyor, setOlusturuluyor] = useState(false)
  const [hata, setHata] = useState('')

  function handleDersChange(secilenDers: string) {
    setDers(secilenDers)
    const siniflar = DERS_SINIF_MAP[secilenDers] || SINIF_SEVIYELERI
    setSinif(siniflar[0])
  }

  function handleTamamla() {
    if (!ders || !sinif) {
      setHata('Lütfen tüm alanları doldurun.')
      return
    }
    setHata('')
    setOlusturuluyor(true)

    try {
      localStorage.setItem('ogretmen-ayarlari', JSON.stringify({ ders, sinif, yil }))
      localStorage.setItem('onboarding-tamamlandi', '1')

      let plan: OlusturulmusPlan
      if (ders === 'Fen Bilimleri') {
        let mufredatData: MufredatJson | null = null
        if (sinif === '5. Sınıf') mufredatData = fen5Mufredat as MufredatJson
        else if (sinif === '6. Sınıf') mufredatData = fen6Mufredat as MufredatJson
        else if (sinif === '7. Sınıf') mufredatData = fen7Mufredat as MufredatJson
        else if (sinif === '8. Sınıf') mufredatData = fen8Mufredat as MufredatJson
        plan = mufredatData ? mufredatliPlanOlustur(yil, mufredatData) : planOlustur(yil)
      } else {
        plan = planOlustur(yil)
      }

      onPlanOlustur(plan, ders, sinif)
      navigate('/app/plan', { replace: true })
    } catch {
      setHata('Plan oluşturulamadı. Lütfen tekrar deneyin.')
      setOlusturuluyor(false)
    }
  }

  const aktifSiniflar = DERS_SINIF_MAP[ders] || SINIF_SEVIYELERI
  const fenMufredatVar =
    ders === 'Fen Bilimleri' && ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].includes(sinif)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm mx-auto">

        {/* Başlık */}
        <div className="mb-8">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-black text-[#1e3a5f] tracking-tight">Hoş geldin!</h1>
          <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
            Sana özel yıllık planını oluşturmak için birkaç bilgiye ihtiyacımız var.
          </p>
        </div>

        {/* Ders Seçimi */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Branş / Ders
          </label>
          <select
            value={ders}
            onChange={(e) => handleDersChange(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all text-sm"
          >
            {DERS_SECENEKLERI.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Sınıf Seçimi */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Sınıf Seviyesi
          </label>
          <select
            value={sinif}
            onChange={(e) => setSinif(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all text-sm"
          >
            {aktifSiniflar.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Akademik Yıl */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Akademik Yıl
          </label>
          <select
            value={yil}
            onChange={(e) => setYil(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all text-sm"
          >
            {YIL_SECENEKLERI.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Müfredat rozeti */}
        {fenMufredatVar && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2.5 mb-4">
            <span className="text-base">📚</span>
            <p className="text-orange-700 text-xs font-semibold">
              Bu sınıf için kazanım müfredatı mevcut — plan daha detaylı olacak!
            </p>
          </div>
        )}

        {/* Hata */}
        {hata && (
          <p className="text-red-500 text-sm mb-3">{hata}</p>
        )}

        {/* Buton */}
        <button
          onClick={handleTamamla}
          disabled={olusturuluyor}
          className="w-full bg-[#f97316] text-white py-3.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 text-base"
        >
          {olusturuluyor ? (
            <span className="animate-pulse">Planın oluşturuluyor...</span>
          ) : (
            <>Planımı Oluştur <span>→</span></>
          )}
        </button>

        <p className="text-center text-gray-400 text-xs mt-5">
          Ayarlardan daha sonra değiştirebilirsin.
        </p>

      </div>
    </div>
  )
}
