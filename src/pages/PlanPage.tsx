import type { OlusturulmusPlan } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'

interface PlanPageProps {
    plan: OlusturulmusPlan | null
    rows: ParsedRow[] | null
    ders: string
    sinif: string
}

export function PlanPage({ plan, rows, ders, sinif }: PlanPageProps) {
    // Yüklenen dosyadan gelen satırlar
    if (rows && rows.length > 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{ders} — {sinif}</h1>
                    <p className="text-gray-500 text-sm mb-6">Yüklenen plan • {rows.length} kazanım</p>
                    <div className="space-y-3">
                        {rows.map((row, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-400">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{row.haftaNo}. Hafta</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{row.kazanim}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // MEB takviminden otomatik oluşturulan plan
    if (plan) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{ders} — {sinif}</h1>
                    <p className="text-gray-500 text-sm mb-6">{plan.yil} • {plan.haftalar.length} hafta</p>
                    <div className="space-y-3">
                        {plan.haftalar.map((hafta) => (
                            <div
                                key={hafta.haftaNo}
                                className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${hafta.tatilMi ? 'border-orange-400' : 'border-indigo-400'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">
                                        {hafta.haftaNo}. Hafta
                                        {hafta.tatilMi && (
                                            <span className="ml-2 text-xs text-orange-500 font-normal">🎉 {hafta.tatilAdi}</span>
                                        )}
                                    </span>
                                    <span className="text-xs text-gray-400">{hafta.baslangicTarihi} – {hafta.bitisTarihi}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{hafta.donem}. Dönem</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return null
}