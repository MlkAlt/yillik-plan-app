import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planOlustur, mevcutYillar, mufredatliPlanOlustur, type MufredatJson } from '../lib/takvimUtils'
import type { OlusturulmusPlan } from '../types/takvim'
import fen5Mufredat from '../data/mufredat/fen-bilimleri-5.json'
import fen6Mufredat from '../data/mufredat/fen-bilimleri-6.json'
import fen7Mufredat from '../data/mufredat/fen-bilimleri-7.json'
import fen8Mufredat from '../data/mufredat/fen-bilimleri-8.json'

const SINIF_SEVIYELERI = [
    '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf',
    '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf',
    '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
]

const DERS_SINIF_MAP: Record<string, string[]> = {
    'Fen Bilimleri': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
}

interface PlanOlusturPageProps {
    onPlanOlustur: (plan: OlusturulmusPlan, ders: string, sinif: string) => void
}

export function PlanOlusturPage({ onPlanOlustur }: PlanOlusturPageProps) {
    const navigate = useNavigate()
    const yillar = mevcutYillar()

    const [seciliYil, setSeciliYil] = useState(() => {
        try {
            const kayitli = localStorage.getItem('ogretmen-ayarlari')
            if (kayitli) {
                const ayarlar = JSON.parse(kayitli) as { ders?: string; sinif?: string; yil?: string }
                if (ayarlar.yil) return ayarlar.yil
            }
        } catch { /* okunamadı */ }
        return yillar[yillar.length - 1]
    })
    const [ders, setDers] = useState(() => {
        try {
            const kayitli = localStorage.getItem('ogretmen-ayarlari')
            if (kayitli) {
                const ayarlar = JSON.parse(kayitli) as { ders?: string }
                if (ayarlar.ders) return ayarlar.ders
            }
        } catch { /* okunamadı */ }
        return 'Fen Bilimleri'
    })
    const [sinif, setSinif] = useState(() => {
        try {
            const kayitli = localStorage.getItem('ogretmen-ayarlari')
            if (kayitli) {
                const ayarlar = JSON.parse(kayitli) as { sinif?: string }
                if (ayarlar.sinif) return ayarlar.sinif
            }
        } catch { /* okunamadı */ }
        return DERS_SINIF_MAP['Fen Bilimleri'][0]
    })
    const [hata, setHata] = useState('')

    function handleSubmit() {
        if (!ders.trim()) {
            setHata('Lütfen ders adını girin.')
            return
        }
        setHata('')

        try {
            let plan: OlusturulmusPlan;
            if (ders.trim() === 'Fen Bilimleri') {
                let mufredatData = null;
                if (sinif === '5. Sınıf') mufredatData = fen5Mufredat;
                else if (sinif === '6. Sınıf') mufredatData = fen6Mufredat;
                else if (sinif === '7. Sınıf') mufredatData = fen7Mufredat;
                else if (sinif === '8. Sınıf') mufredatData = fen8Mufredat;

                if (mufredatData) {
                    plan = mufredatliPlanOlustur(seciliYil, mufredatData as MufredatJson);
                } else {
                    plan = planOlustur(seciliYil);
                }
            } else {
                plan = planOlustur(seciliYil)
            }
            onPlanOlustur(plan, ders.trim(), sinif)
            navigate('/app/plan')
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

                {/* Ders Adı */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">
                        Ders Adı
                    </label>
                    <select
                        value={ders}
                        onChange={(e) => {
                            const yDers = e.target.value;
                            setDers(yDers);
                            const yeniSiniflar = DERS_SINIF_MAP[yDers] || SINIF_SEVIYELERI;
                            setSinif(yeniSiniflar[0]);
                        }}
                        className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
                    >
                        <option value="Fen Bilimleri">Fen Bilimleri</option>
                    </select>
                </div>

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
                        {(DERS_SINIF_MAP[ders] || SINIF_SEVIYELERI).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Hata mesajı */}
                {hata && (
                    <p className="text-red-500 text-sm mb-4">{hata}</p>
                )}

                {/* Buton */}
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
