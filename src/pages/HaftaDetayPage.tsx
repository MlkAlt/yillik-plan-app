import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { OlusturulmusPlan, Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'

function formatTarih(isoTarih: string): string {
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const d = new Date(isoTarih)
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`
}

export function HaftaDetayPage() {
  const { haftaNo } = useParams<{ haftaNo: string }>()
  const navigate = useNavigate()
  const no = Number(haftaNo)

  const [hafta, setHafta] = useState<Hafta | null>(null)
  const [uploadedRow, setUploadedRow] = useState<ParsedRow | null>(null)
  const [ders, setDers] = useState('')
  const [sinif, setSinif] = useState('')
  const [tamamlandi, setTamamlandi] = useState(false)
  const [not, setNot] = useState('')

  useEffect(() => {
    try {
      // Plan verisini oku
      const planItem = localStorage.getItem('aktif-plan')
      if (planItem) {
        const parsed = JSON.parse(planItem) as {
          tip: 'meb' | 'yukle'
          plan: OlusturulmusPlan | null
          rows: ParsedRow[] | null
          ders: string
          sinif: string
        }
        setDers(parsed.ders || '')
        setSinif(parsed.sinif || '')

        if (parsed.tip === 'meb' && parsed.plan) {
          const bulunan = parsed.plan.haftalar.find((h) => h.haftaNo === no)
          if (bulunan) setHafta(bulunan)
        } else if (parsed.tip === 'yukle' && parsed.rows) {
          const bulunan = parsed.rows.find((r) => r.haftaNo === no)
          if (bulunan) setUploadedRow(bulunan)
        }
      }

      // Tamamlanma durumunu oku
      const tamamlananItem = localStorage.getItem('tamamlanan-haftalar')
      if (tamamlananItem) {
        const liste: number[] = JSON.parse(tamamlananItem)
        setTamamlandi(liste.includes(no))
      }

      // Notu oku
      const notlarItem = localStorage.getItem('hafta-notlari')
      if (notlarItem) {
        const notlar: Record<number, string> = JSON.parse(notlarItem)
        setNot(notlar[no] || '')
      }
    } catch {
      // localStorage okunamadı
    }
  }, [no])

  function handleTamamlaToggle() {
    try {
      const tamamlananItem = localStorage.getItem('tamamlanan-haftalar')
      const liste: number[] = tamamlananItem ? JSON.parse(tamamlananItem) : []
      let yeniListe: number[]
      if (tamamlandi) {
        yeniListe = liste.filter((n) => n !== no)
      } else {
        yeniListe = [...liste, no]
      }
      localStorage.setItem('tamamlanan-haftalar', JSON.stringify(yeniListe))
      setTamamlandi(!tamamlandi)
    } catch {
      // kayıt başarısız
    }
  }

  function handleNotChange(deger: string) {
    setNot(deger)
    try {
      const notlarItem = localStorage.getItem('hafta-notlari')
      const notlar: Record<number, string> = notlarItem ? JSON.parse(notlarItem) : {}
      notlar[no] = deger
      localStorage.setItem('hafta-notlari', JSON.stringify(notlar))
    } catch {
      // kayıt başarısız
    }
  }

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#1e3a5f]">{no}. Hafta</h1>
          {ders && <p className="text-sm text-gray-400 font-medium">{ders} · {sinif}</p>}
        </div>
        {tamamlandi && (
          <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
            ✅ Tamamlandı
          </span>
        )}
      </div>

      {/* Tatil haftası */}
      {hafta?.tatilMi && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-orange-700 font-bold text-lg">{hafta.tatilAdi}</p>
          <p className="text-orange-500 text-sm mt-1">Tatil Haftası</p>
        </div>
      )}

      {/* Kazanım kartı — MEB planı */}
      {hafta && !hafta.tatilMi && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
              {hafta.donem}. Dönem
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {formatTarih(hafta.baslangicTarihi)} – {formatTarih(hafta.bitisTarihi)}
            </span>
          </div>

          {hafta.uniteAdi && (
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              {hafta.uniteAdi}
            </span>
          )}

          {hafta.kazanim ? (
            <>
              <p className="font-bold text-[#1e3a5f] text-base leading-snug mb-2">
                {hafta.kazanim}
              </p>
              {hafta.kazanimDetay && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  {hafta.kazanimDetay}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm italic">Bu hafta için kazanım girilmemiş.</p>
          )}
        </div>
      )}

      {/* Kazanım kartı — yüklenen plan */}
      {uploadedRow && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {uploadedRow.donem && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full mb-3">
              {uploadedRow.donem}
            </span>
          )}
          {uploadedRow.tarihAraligi && (
            <p className="text-xs text-gray-400 font-medium mb-3">{uploadedRow.tarihAraligi}</p>
          )}
          <p className="font-bold text-[#1e3a5f] text-base leading-snug">
            {uploadedRow.kazanim}
          </p>
        </div>
      )}

      {/* Plan yoksa */}
      {!hafta && !uploadedRow && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 text-center">
          <p className="text-gray-400 text-sm">Bu hafta için plan bilgisi bulunamadı.</p>
        </div>
      )}

      {/* Tamamlandı butonu */}
      <button
        onClick={handleTamamlaToggle}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 mb-4 flex items-center justify-center gap-2 ${
          tamamlandi
            ? 'bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-100'
            : 'bg-[#f97316] text-white shadow-sm hover:opacity-90'
        }`}
      >
        {tamamlandi ? <>✅ Tamamlandı — geri al</> : <>Haftayı Tamamladım ✓</>}
      </button>

      {/* Öğretmen notu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Notlarım
        </label>
        <textarea
          value={not}
          onChange={(e) => handleNotChange(e.target.value)}
          rows={4}
          placeholder="Bu haftayla ilgili not ekle..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all resize-none"
        />
      </div>
    </div>
  )
}
