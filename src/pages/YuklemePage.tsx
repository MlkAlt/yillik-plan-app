import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseFile } from '../lib/fileParser'
import type { ParsedRow } from '../lib/fileParser'

interface YuklemePageProps {
    onYukle: (rows: ParsedRow[], ders: string, sinif: string) => void
}

const SINIF_SEVIYELERI = [
    '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf',
    '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf',
    '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
]

export function YuklemePage({ onYukle }: YuklemePageProps) {
    const navigate = useNavigate()
    const [ders, setDers] = useState('')
    const [sinif, setSinif] = useState(SINIF_SEVIYELERI[0])
    const [dosya, setDosya] = useState<File | null>(null)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [hata, setHata] = useState('')

    async function handleSubmit() {
        if (!ders.trim()) { setHata('Lütfen ders adını girin.'); return }
        if (!dosya) { setHata('Lütfen bir dosya seçin.'); return }
        setHata('')
        setYukleniyor(true)
        try {
            const rows = await parseFile(dosya)
            if (rows.length === 0) {
                setHata('Dosyadan veri okunamadı. Dosya formatını kontrol edin.')
                setYukleniyor(false)
                return
            }
            onYukle(rows, ders.trim(), sinif)
            navigate('/app/plan')
        } catch (err) {
            setHata(err instanceof Error ? err.message : 'Dosya okunamadı.')
        } finally {
            setYukleniyor(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Plan Yükle</h1>
                <p className="text-gray-500 text-sm mb-8">
                    Excel (.xlsx) veya Word (.docx) dosyanızı yükleyin.
                </p>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ders Adı</label>
                    <input
                        type="text"
                        placeholder="örn. Matematik"
                        value={ders}
                        onChange={(e) => setDers(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sınıf Seviyesi</label>
                    <select
                        value={sinif}
                        onChange={(e) => setSinif(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {SINIF_SEVIYELERI.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosya Seç</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.docx"
                        onChange={(e) => setDosya(e.target.files?.[0] ?? null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    {dosya && (
                        <p className="text-xs text-gray-400 mt-1">{dosya.name}</p>
                    )}
                </div>

                {hata && <p className="text-red-500 text-sm mb-4">{hata}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={yukleniyor}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    {yukleniyor ? 'Yükleniyor...' : 'Planı Yükle →'}
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