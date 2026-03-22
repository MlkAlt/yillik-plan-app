import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'

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
  const [notKaydedildi, setNotKaydedildi] = useState(false)
  const notTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      // Aktif sınıfı oku
      const aktifSinifStr = localStorage.getItem('aktif-sinif') || ''

      // Plan verisini tum-planlar'dan oku
      const planlarItem = localStorage.getItem('tum-planlar')
      if (planlarItem) {
        const planlar = JSON.parse(planlarItem) as PlanEntry[]
        const entry = planlar.find(p => p.sinif === aktifSinifStr) || planlar[0]
        if (entry) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDers(entry.ders || '')
          setSinif(entry.sinifGercek || entry.sinif || '')
          if (entry.tip === 'meb' && entry.plan) {
            const bulunan = entry.plan.haftalar.find((h) => h.haftaNo === no)
            if (bulunan) setHafta(bulunan)
          } else if (entry.tip === 'yukle' && entry.rows) {
            const bulunan = entry.rows.find((r) => r.haftaNo === no)
            if (bulunan) setUploadedRow(bulunan)
          }
        }
      }

      // Tamamlanma durumunu sınıf bazlı oku
      const tamamlananItem = localStorage.getItem('tamamlanan-haftalar')
      if (tamamlananItem) {
        const parsed = JSON.parse(tamamlananItem)
        const liste: number[] = Array.isArray(parsed)
          ? parsed
          : (parsed[aktifSinifStr] || [])
        setTamamlandi(liste.includes(no))
      }

      // Notu sınıf bazlı oku
      const notlarItem = localStorage.getItem('hafta-notlari')
      if (notlarItem) {
        const parsed = JSON.parse(notlarItem)
        // Yeni format: { "6. Sınıf": { "1": "not" } } veya eski format { "1": "not" }
        const notlar = aktifSinifStr && parsed[aktifSinifStr]
          ? parsed[aktifSinifStr]
          : parsed
        setNot(notlar[String(no)] || '')
      }
    } catch {
      // localStorage okunamadı
    }
  }, [no])

  function handleTamamlaToggle() {
    try {
      const aktifSinifStr = localStorage.getItem('aktif-sinif') || sinif
      const tamamlananItem = localStorage.getItem('tamamlanan-haftalar')
      const parsed = tamamlananItem ? JSON.parse(tamamlananItem) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[aktifSinifStr] || [])
      const yeniListe = tamamlandi
        ? eskiListe.filter((n) => n !== no)
        : [...eskiListe, no]
      const yeniParsed = Array.isArray(parsed)
        ? { [aktifSinifStr]: yeniListe }
        : { ...parsed, [aktifSinifStr]: yeniListe }
      localStorage.setItem('tamamlanan-haftalar', JSON.stringify(yeniParsed))
      setTamamlandi(!tamamlandi)
    } catch {
      // kayıt başarısız
    }
  }

  function handleNotChange(deger: string) {
    setNot(deger)
    try {
      const aktifSinifStr = localStorage.getItem('aktif-sinif') || sinif
      const notlarItem = localStorage.getItem('hafta-notlari')
      const parsed = notlarItem ? JSON.parse(notlarItem) : {}
      const sinifNotlar = parsed[aktifSinifStr] || {}
      sinifNotlar[String(no)] = deger
      parsed[aktifSinifStr] = sinifNotlar
      localStorage.setItem('hafta-notlari', JSON.stringify(parsed))
      // Kaydedildi göstergesi — debounced
      if (notTimerRef.current) clearTimeout(notTimerRef.current)
      setNotKaydedildi(true)
      notTimerRef.current = setTimeout(() => setNotKaydedildi(false), 1500)
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
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-1 rounded-lg hover:bg-gray-100 active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.5 15L7.5 10L12.5 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2D5BE3]">{no}. Hafta</h1>
          {ders && <p className="text-sm text-gray-400 font-medium mt-0.5">{ders} · {sinif}</p>}
        </div>
        {tamamlandi && (
          <span className="ml-auto bg-[#059669]/10 text-[#059669] text-xs font-bold px-3 py-1.5 rounded-full border border-[#059669]/30">
            ✅ Tamamlandı
          </span>
        )}
      </div>

      {/* Tatil haftası */}
      {hafta?.tatilMi && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-amber-700 font-bold text-lg">{hafta.tatilAdi}</p>
          <p className="text-amber-500 text-sm mt-1">Tatil Haftası</p>
        </div>
      )}

      {/* Kazanım kartı — MEB planı */}
      {hafta && !hafta.tatilMi && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
              {hafta.donem}. Dönem
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {formatTarih(hafta.baslangicTarihi)} – {formatTarih(hafta.bitisTarihi)}
            </span>
          </div>

          {hafta.uniteAdi && (
            <span className="inline-block bg-[#2D5BE3]/10 text-[#2D5BE3] text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
              {hafta.uniteAdi}
            </span>
          )}

          {hafta.kazanim ? (
            <>
              <p className="font-bold text-[#2D5BE3] text-base leading-snug mb-2">
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
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4">
          {uploadedRow.donem && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full mb-3">
              {uploadedRow.donem}
            </span>
          )}
          {uploadedRow.tarihAraligi && (
            <p className="text-xs text-gray-400 font-medium mb-3">{uploadedRow.tarihAraligi}</p>
          )}
          <p className="font-bold text-[#2D5BE3] text-base leading-snug">
            {uploadedRow.kazanim}
          </p>
        </div>
      )}

      {/* Plan yoksa */}
      {!hafta && !uploadedRow && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4 text-center">
          <p className="text-gray-400 text-sm">Bu hafta için plan bilgisi bulunamadı.</p>
        </div>
      )}

      {/* Tamamlandı butonu */}
      <button
        onClick={handleTamamlaToggle}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 mb-4 flex items-center justify-center gap-2 ${
          tamamlandi
            ? 'bg-[#059669]/10 text-[#059669] border-2 border-[#059669]/30 hover:bg-[#059669]/20'
            : 'bg-[#F59E0B] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:opacity-90'
        }`}
      >
        {tamamlandi ? <>✅ Tamamlandı — geri al</> : <>Haftayı Tamamladım ✓</>}
      </button>

      {/* Öğretmen notu */}
      <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Notlarım
          </label>
          {notKaydedildi && (
            <span className="text-xs font-bold text-[#059669] transition-opacity">✓ Kaydedildi</span>
          )}
        </div>
        <textarea
          value={not}
          onChange={(e) => handleNotChange(e.target.value)}
          rows={4}
          placeholder="Bu haftayla ilgili not ekle..."
          className="w-full border border-[#E7E5E4] rounded-xl p-3 text-sm text-[#1C1917] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all resize-none"
        />
      </div>
    </div>
  )
}
