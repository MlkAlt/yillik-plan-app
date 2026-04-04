import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { getSession } from '../lib/auth'
import { syncProgressToSupabase } from '../lib/planSync'
import { useToast } from '../lib/toast'
import { StorageKeys } from '../lib/storageKeys'
import { ChevronLeft, Check, NotebookPen, Sparkles } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { SectionHeader } from '../components/UI/SectionHeader'

function formatTarih(isoTarih: string): string {
  const aylar = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik']
  const d = new Date(isoTarih)
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`
}

interface HaftaDetayPageProps {
  entry: PlanEntry | null
  onTamamlaToggle?: () => void
}

interface GecisButonuProps {
  hedefNo: number
  yon: 'onceki' | 'sonraki'
  onClick: () => void
}

function GecisButonu({ hedefNo, yon, onClick }: GecisButonuProps) {
  const oncekiMi = yon === 'onceki'
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-bold transition-all active:scale-95"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text2)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <span style={{ color: 'var(--color-text3)' }}>{oncekiMi ? '<' : ''}</span>
      {hedefNo}. Hafta
      <span style={{ color: 'var(--color-text3)' }}>{oncekiMi ? '' : '>'}</span>
    </button>
  )
}

export function HaftaDetayPage({ entry, onTamamlaToggle }: HaftaDetayPageProps) {
  const { haftaNo } = useParams<{ haftaNo: string }>()
  const navigate = useNavigate()
  const no = Number(haftaNo)

  const [hafta, setHafta] = useState<Hafta | null>(null)
  const [uploadedRow, setUploadedRow] = useState<ParsedRow | null>(null)
  const [ders, setDers] = useState('')
  const [sinif, setSinif] = useState('')
  const [tumHaftaNolari, setTumHaftaNolari] = useState<number[]>([])
  const [tamamlandi, setTamamlandi] = useState(false)
  const [tamamlaAnimating, setTamamlaAnimating] = useState(false)
  const [not, setNot] = useState('')
  const [kaydedildi, setKaydedildi] = useState(false)
  const notTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { goster } = useToast()

  useEffect(() => {
    setHafta(null)
    setUploadedRow(null)
    if (entry) {
      setDers(entry.ders || '')
      setSinif(entry.sinifGercek || entry.sinif || '')
      if (entry.tip === 'meb' && entry.plan) {
        const bulunan = entry.plan.haftalar.find((h) => h.haftaNo === no)
        if (bulunan) setHafta(bulunan)
        setTumHaftaNolari(entry.plan.haftalar.map(h => h.haftaNo))
      } else if (entry.tip === 'yukle' && entry.rows) {
        const bulunan = entry.rows.find((r) => r.haftaNo === no)
        if (bulunan) setUploadedRow(bulunan)
        setTumHaftaNolari(entry.rows.filter(r => r.haftaNo != null).map(r => r.haftaNo!))
      }
    }

    try {
      const aktifSinifStr = localStorage.getItem(StorageKeys.AKTIF_SINIF) || ''
      const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (tamamlananItem) {
        const parsed = JSON.parse(tamamlananItem)
        const liste: number[] = Array.isArray(parsed) ? parsed : (parsed[aktifSinifStr] || [])
        setTamamlandi(liste.includes(no))
      }

      const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
      if (notlarItem) {
        const parsed = JSON.parse(notlarItem)
        const notlar = aktifSinifStr && parsed[aktifSinifStr] ? parsed[aktifSinifStr] : parsed
        setNot(notlar[String(no)] || '')
      } else {
        setNot('')
      }
    } catch { /* ignore */ }
  }, [no, entry])

  useEffect(() => {
    return () => {
      if (notTimerRef.current) clearTimeout(notTimerRef.current)
    }
  }, [])

  function handleTamamlaToggle() {
    try {
      const aktifSinifStr = localStorage.getItem(StorageKeys.AKTIF_SINIF) || sinif
      const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = tamamlananItem ? JSON.parse(tamamlananItem) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[aktifSinifStr] || [])
      const yeniListe = tamamlandi ? eskiListe.filter((n) => n !== no) : [...eskiListe, no]
      const yeniParsed = Array.isArray(parsed) ? { [aktifSinifStr]: yeniListe } : { ...parsed, [aktifSinifStr]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      if (!tamamlandi) setTamamlaAnimating(true)
      setTamamlandi(!tamamlandi)
      onTamamlaToggle?.()
      getSession().then(session => {
        if (!session) return
        const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
        const notlar = notlarItem ? JSON.parse(notlarItem) : {}
        syncProgressToSupabase(session.user.id, yeniParsed, notlar).catch(() => {})
      })
    } catch { /* ignore */ }
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
      if (notTimerRef.current) clearTimeout(notTimerRef.current)
      notTimerRef.current = setTimeout(() => {
        setKaydedildi(true)
        goster('Not kaydedildi', 'basari')
      }, 800)
      getSession().then(session => {
        if (!session) return
        const tamamlananItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
        const tamamlanan = tamamlananItem ? JSON.parse(tamamlananItem) : {}
        syncProgressToSupabase(session.user.id, tamamlanan, parsed).catch(() => {})
      })
    } catch { /* ignore */ }
  }

  const altBaslik = ders ? `${ders}${sinif ? ` · ${sinif}` : ''}` : 'Haftalik plan ayrintisi'
  const durumMetni = hafta?.tatilMi ? 'Tatil haftasi' : tamamlandi ? 'Tamamlandi' : 'Devam ediyor'

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="flex items-start gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Plan ekranina geri don"
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text2)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-1" style={{ color: 'var(--color-text3)' }}>Hafta Detayi</p>
            <h1 className="text-[24px] font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
              {no}. Hafta
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text2)' }}>{altBaslik}</p>
          </div>
          <div
            className="px-2.5 py-1.5 flex-shrink-0"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${hafta?.tatilMi ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)' : tamamlandi ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'color-mix(in srgb, var(--color-primary) 25%, transparent)'}`,
              backgroundColor: hafta?.tatilMi ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)' : tamamlandi ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            }}
          >
            <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: hafta?.tatilMi ? 'var(--color-warning)' : tamamlandi ? 'var(--color-success)' : 'var(--color-primary)' }}>
              {durumMetni}
            </span>
          </div>
        </div>
      </div>

      <div className="section-stack">
        {hafta?.tatilMi && (
          <div className="px-5 py-5 text-center" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid color-mix(in srgb, var(--color-warning) 28%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', boxShadow: 'var(--shadow-xs)' }}>
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--color-warning) 14%, transparent)', color: 'var(--color-warning)' }}>
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-warning)' }}>Tatil Haftasi</p>
            <p className="text-[18px] font-bold tracking-tight" style={{ color: 'var(--color-text1)', fontFamily: 'var(--font-display)' }}>{hafta.tatilAdi}</p>
          </div>
        )}

        {hafta && !hafta.tatilMi && (
          <Card style={{ borderRadius: 'var(--radius-xl)' }}>
            <SectionHeader title="Haftanin Icerigi" meta={`${hafta.donem}. donem`} />
            <div className="flex items-center justify-between gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-[11px] font-bold uppercase tracking-[.1em] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                {hafta.donem}. Donem
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>
                {formatTarih(hafta.baslangicTarihi)} - {formatTarih(hafta.bitisTarihi)}
              </span>
            </div>
            {hafta.uniteAdi && (
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-pop) 10%, transparent)', color: 'var(--color-pop)' }}>
                {hafta.uniteAdi}
              </span>
            )}
            <p className="text-[17px] font-bold leading-snug mb-2" style={{ color: 'var(--color-text1)' }}>{hafta.kazanim || 'Bu hafta icin kazanim girilmemis.'}</p>
            {hafta.kazanimDetay && <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text2)' }}>{hafta.kazanimDetay}</p>}
          </Card>
        )}

        {uploadedRow && (
          <Card style={{ borderRadius: 'var(--radius-xl)' }}>
            <SectionHeader title="Yuklenen Satir" meta={uploadedRow.donem || 'Ekstra'} />
            {uploadedRow.tarihAraligi && <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text3)' }}>{uploadedRow.tarihAraligi}</p>}
            <p className="text-[17px] font-bold leading-snug" style={{ color: 'var(--color-text1)' }}>{uploadedRow.kazanim}</p>
          </Card>
        )}

        <div className="sticky-action-bar">
          <button
            onClick={handleTamamlaToggle}
            onAnimationEnd={() => setTamamlaAnimating(false)}
            className={`w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 ${tamamlaAnimating ? 'animate-pop-in' : ''}`}
            style={{
              borderRadius: 'var(--radius-pill)',
              border: tamamlandi ? '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' : '1px solid color-mix(in srgb, var(--color-pop) 30%, transparent)',
              backgroundColor: tamamlandi ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'var(--color-pop)',
              color: tamamlandi ? 'var(--color-success)' : '#ffffff',
              boxShadow: tamamlandi ? 'none' : 'var(--shadow-sm)',
            }}
          >
            <Check size={16} strokeWidth={3} />
            {tamamlandi ? 'Tamamlandi - geri al' : 'Haftayi Tamamladim'}
          </button>
          {!tamamlandi && (
            <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text3)' }}>
              Once haftayi gozden gecir, sonra tamamlandi olarak isaretle.
            </p>
          )}
        </div>

        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Ogretmen Notu" meta={kaydedildi ? 'Kaydedildi' : 'Otomatik kayit'} />
          <div className="flex items-start gap-2 mb-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
              <NotebookPen size={15} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text2)' }}>
              Not alanini ikinci adim olarak kullan. Once haftayi tamamla, sonra gozlem veya hatirlatma notunu birak.
            </p>
          </div>
          <textarea
            value={not}
            onChange={(e) => handleNotChange(e.target.value)}
            rows={4}
            placeholder="Bu haftayla ilgili not ekle..."
            className="w-full p-3 text-sm transition-all resize-none"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text1)',
              outline: 'none',
            }}
          />
        </Card>

        {tumHaftaNolari.length > 1 && (() => {
          const sorted = [...tumHaftaNolari].sort((a, b) => a - b)
          const idx = sorted.indexOf(no)
          const prev = idx > 0 ? sorted[idx - 1] : null
          const next = idx < sorted.length - 1 ? sorted[idx + 1] : null
          return (
            <div>
              <SectionHeader title="Hafta Gecisi" meta="Ikincil gezinti" />
              <div className="flex gap-3">
                {prev !== null ? <GecisButonu hedefNo={prev} yon="onceki" onClick={() => navigate(`/app/hafta/${prev}`)} /> : <div className="flex-1" />}
                {next !== null ? <GecisButonu hedefNo={next} yon="sonraki" onClick={() => navigate(`/app/hafta/${next}`)} /> : <div className="flex-1" />}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
