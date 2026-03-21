import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']

export function HaftaDetayPage() {
    const { haftaNo } = useParams<{ haftaNo: string }>()
    const navigate = useNavigate()
    const [kazanimlar, setKazanimlar] = useState<Record<string, string>>({})

    useEffect(() => {
        try {
            const kayitli = localStorage.getItem('kazanimlar')
            if (kayitli) {
                setKazanimlar(JSON.parse(kayitli) as Record<string, string>)
            } else {
                setKazanimlar({})
            }
        } catch (error) {
            console.error('Kazanımlar okunamadı:', error)
            setKazanimlar({})
        }
    }, [])

    const handleChange = (gun: string, deger: string) => {
        const key = `${haftaNo}_${gun}`
        const yeniKazanimlar = { ...kazanimlar, [key]: deger }
        setKazanimlar(yeniKazanimlar)
        localStorage.setItem('kazanimlar', JSON.stringify(yeniKazanimlar))
    }

    return (
        <div className="p-4 pb-24 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                    ← 
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                    {haftaNo}. Hafta
                </h1>
            </div>

            {/* Content */}
            <div>
                {GUNLER.map(gun => {
                    const key = `${haftaNo}_${gun}`
                    const deger = kazanimlar[key] || ''
                    return (
                        <div key={gun} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                            <h2 className="font-bold mb-2 text-[#1e3a5f]">{gun}</h2>
                            <textarea
                                value={deger}
                                onChange={(e) => handleChange(gun, e.target.value)}
                                rows={2}
                                placeholder="Kazanım ekle..."
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
