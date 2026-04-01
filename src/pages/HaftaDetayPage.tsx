import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { getSession } from '../lib/auth'
import { syncProgressToSupabase } from '../lib/planSync'
import { useToast } from '../lib/toast'
import { StorageKeys } from '../lib/storageKeys'
import { ChevronLeft, Check } from 'lucide-react'
import { Card } from '../components/UI/Card'

function formatTarih(isoTarih: string): string {
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const d = new Date(isoTarih)
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`
}

interface HaftaDetayPageProps {
  entry: PlanEntry | null
  onTamamlaToggle?: () => void
}

export function HaftaDetayPage({ entry, onTamamlaToggle }: HaftaDetayPageProps) {
  const { haftaNo } = useParams<{ haftaNo: string }>()
  const navigate = useNavigate()
  const no = Number(haftaNo)

  const [hafta, setHafta] = useState<Hafta | null>(null)
  const [uploadedRow, setUploadedRow] = useState<ParsedRow | null>(null)
  const [ders, setDers] = useState('')
  const [sinif, setSinif] = useState('')
  const [tumHaftaNoları, setTumHaftaNoları] = useState<number[]>([])
  const [tamamlandi, setTamamlandi] = useState(false)
  const [tamamlaAnimating, setTamamlaAnimating] = useState(false)
  const [not, setNot] = useState('')
  const [kaydedildi, setKaydedildi] = useState(false)
  const notTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { goster } = useToast()

  useEffect(() => {
    // Plan verisini prop'tan oku
    if (entry) {
      setDers(entry.ders || '')
      setSinif(entry.sinifGercek || entry.sinif || '')
      if (entry.tip === 'meb' && entry.plan) {
        const bulunan = entry.plan.haftalar.find((h) => h.haftaNo === no)
        if (bulunan) setHafta(bulunan)
        setTumHaftaNoları(entry.plan.haftalar.map(h => h.haftaNo))
      } else if (entry.tip === 'yukle' && entry.rows) {
        const bulunan = entry.rows.find((r) => r.haftaNo === no)
        if (bulunan) setUploadedRow(bulunan)
        setTumHaftaNoları(entry.rows.filter(r => r.haftaNo != null).map(r => r.haftaNo!))
      }
    }

    // Progress verisi localStorage'dan okunmaya devam eder (global)
    try {
      const aktifSinifStr = localStorage.getItem(StorageKeys.AKTIF_SINIF) || ''

      const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (tamamlananItem) {
        const parsed = JSON.parse(tamamlananItem)
        const liste: number[] = Array.isArray(parsed)
          ? parsed
          : (parsed[aktifSinifStr] || [])
        setTamamlandi(liste.includes(no))
      }

      const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
      if (notlarItem) {
        const parsed = JSON.parse(notlarItem)
        const notlar = aktifSinifStr && parsed[aktifSinifStr]
          ? parsed[aktifSinifStr]
          : parsed
        setNot(notlar[String(no)] || '')
      }
    } catch {
      // localStorage okunamadı
    }
  }, [no, entry])

  function handleTamamlaToggle() {
    try {
      const aktifSinifStr = localStorage.getItem(StorageKeys.AKTIF_SINIF) || sinif
      const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = tamamlananItem ? JSON.parse(tamamlananItem) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[aktifSinifStr] || [])
      const yeniListe = tamamlandi
        ? eskiListe.filter((n) => n !== no)
        : [...eskiListe, no]
      const yeniParsed = Array.isArray(parsed)
        ? { [aktifSinifStr]: yeniListe }
        : { ...parsed, [aktifSinifStr]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      if (!tamamlandi) setTamamlaAnimating(true)
      setTamamlandi(!tamamlandi)
      onTamamlaToggle?.() // App.tsx'teki state'i güncelle
      // Arka planda Supabase'e sync
      getSession().then(session => {
        if (!session) return
        const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
        const notlar = notlarItem ? JSON.parse(notlarItem) : {}
        syncProgressToSupabase(session.user.id, yeniParsed, notlar).catch(() => {})
      })
    } catch {
      // kayıt başarısız
    }
  }

  function handleNotChange(deger: string) {
    setNot(deger)
    setKaydedildi(false)
    try {
      const aktifSinifStr = localStorage.getItem(StorageKeys.AKTIF_SINIF) || sinif
      const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
      const parsed = notlarItem ? JSON.parse(notlarItem) : {}
      const sinifNotlar = parsed[aktifSinifStr] || {}
      sinifNotlar[String(no)] = deger
      parsed[aktifSinifStr] = sinifNotlar
      localStorage.setItem(StorageKeys.HAFTA_NOTLARI, JSON.stringify(parsed))
      // Kaydedildi göstergesi — debounced
      if (notTimerRef.current) clearTimeout(notTimerRef.current)
      notTimerRef.current = setTimeout(() => {
        setKaydedildi(true)
        goster('Not kaydedildi', 'basari')
      }, 800)
      // Arka planda Supabase'e sync (debounced ile aynı süre)
      getSession().then(session => {
        if (!session) return
        const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
        const tamamlanan = tamamlananItem ? JSON.parse(tamamlananItem) : {}
        syncProgressToSupabase(session.user.id, tamamlanan, parsed).catch(() => {})
      })
    } catch {
      // kayıt başarısız
    }
  }

  return (
    <div className="p-4 pb-20 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-1 rounded-lg hover:bg-gray-100 active:scale-95"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1917]">{no}. Hafta</h1>
          {ders && <p className="text-sm text-gray-400 font-medium mt-0.5">{ders} · {sinif}</p>}
        </div>
        {tamamlandi && (
          <span className="ml-auto flex items-center gap-1 bg-[#059669]/10 text-[#059669] text-xs font-bold px-3 py-1.5 rounded-full border border-[#059669]/30 animate-slide-up">
            <Check size={12} strokeWidth={3} /> Tamamlandı
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
        <Card className="mb-4">
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
        </Card>
      )}

      {/* Kazanım kartı — yüklenen plan */}
      {uploadedRow && (
        <Card className="mb-4">
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
        </Card>
      )}

      {/* Plan yoksa */}
      {!hafta && !uploadedRow && (
        <Card className="mb-4 text-center">
          <p className="text-gray-400 text-sm">Bu hafta için plan bilgisi bulunamadı.</p>
        </Card>
      )}

      {/* Tamamlandı butonu */}
      <button
        onClick={handleTamamlaToggle}
        onAnimationEnd={() => setTamamlaAnimating(false)}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 mb-4 flex items-center justify-center gap-2 ${
          tamamlandi
            ? 'bg-[#059669]/10 text-[#059669] border-2 border-[#059669]/30 hover:bg-[#059669]/20'
            : 'bg-[#F59E0B] text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:opacity-90'
        } ${tamamlaAnimating ? 'animate-pop-in' : ''}`}
      >
        {tamamlandi
          ? <><Check size={16} strokeWidth={3} /> Tamamlandı — geri al</>
          : <>Haftayı Tamamladım <Check size={16} strokeWidth={3} /></>
        }
      </button>
      {!tamamlandi && (
        <p className="text-center text-[11px] text-gray-400 -mt-3 mb-4">Haftayı tamamlayınca işaretle</p>
      )}
      {/* Önceki / Sonraki hafta navigasyonu */}
      {tumHaftaNoları.length > 1 && (() => {
        const sorted = [...tumHaftaNoları].sort((a, b) => a - b)
        const idx = sorted.indexOf(no)
        const prev = idx > 0 ? sorted[idx - 1] : null
        const next = idx < sorted.length - 1 ? sorted[idx + 1] : null
        return (
          <div className="flex gap-3 mb-4">
            {prev !== null ? (
              <button
                onClick={() => navigate(`/app/hafta/${prev}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm font-bold text-gray-500 hover:border-gray-300 active:scale-95 transition-all"
              >
                ← {prev}. Hafta
              </button>
            ) : <div className="flex-1" />}
            {next !== null ? (
              <button
                onClick={() => navigate(`/app/hafta/${next}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm font-bold text-gray-500 hover:border-gray-300 active:scale-95 transition-all"
              >
                {next}. Hafta →
              </button>
            ) : <div className="flex-1" />}
          </div>
        )
      })()}

      {/* Öğretmen notu */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            Notlarım
          </label>
        </div>
        <textarea
          value={not}
          onChange={(e) => handleNotChange(e.target.value)}
          rows={4}
          placeholder="Bu haftayla ilgili not ekle..."
          className="w-full border border-[#E7E5E4] rounded-xl p-3 text-sm text-[#1C1917] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all resize-none"
        />
        <div className="flex justify-end mt-1.5 h-4">
          {kaydedildi && (
            <span className="text-[11px] text-green-600 font-medium">✓ Kaydedildi</span>
          )}
        </div>
      </Card>
    </div>
  )
}
