import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { planOlustur, mevcutYillar, mufredatliPlanOlustur } from '../lib/takvimUtils'
import { getMufredat } from '../lib/mufredatRegistry'
import type { OlusturulmusPlan } from '../types/takvim'
import { SINIF_SEVIYELERI, DERS_SINIF_MAP } from '../lib/dersSinifMap'

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
        return (DERS_SINIF_MAP['Fen Bilimleri'] ?? SINIF_SEVIYELERI)[0]
    })
    const [hata, setHata] = useState('')

    function handleSubmit() {
        if (!ders.trim()) {
            setHata('Lütfen ders adını girin.')
            return
        }
        setHata('')

        try {
            const mufredat = getMufredat(ders.trim(), sinif)
            const plan = mufredat
                ? mufredatliPlanOlustur(seciliYil, mufredat)
                : planOlustur(seciliYil)
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
                            const yeniSiniflar = DERS_SINIF_MAP[yDers] ?? SINIF_SEVIYELERI;
                            setSinif(yeniSiniflar[0]);
                        }}
                        className="w-full border border-[#E7E5E4] rounded-lg px-3 py-2.5 text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/40"
                    >
                        {Object.keys(DERS_SINIF_MAP).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
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
                        {(DERS_SINIF_MAP[ders] ?? SINIF_SEVIYELERI).map((s) => (
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
