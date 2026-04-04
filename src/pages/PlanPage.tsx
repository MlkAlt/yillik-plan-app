import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { exportPlanToExcel, exportPlanToWord, exportPlanToPrint } from '../lib/exportUtils'
import { AdBanner } from '../components/AdBanner'
import { Button } from '../components/Button'
import { Download, FileSpreadsheet, FileText, Printer, MapPin, Check, CalendarDays, ChevronDown } from 'lucide-react'
import { StorageKeys } from '../lib/storageKeys'
import { SectionHeader } from '../components/UI/SectionHeader'
import { EmptyState } from '../components/UI/EmptyState'

function DonemGrubu({
  donemNo, haftalar, tamamlananlar, bugunHaftaNo, bugunRef,
  tamamlananSayisi, toplamSayisi, acik, onToggle, navigate,
}: {
  donemNo: number
  haftalar: Hafta[]
  tamamlananlar: number[]
  bugunHaftaNo: number | null
  bugunRef: React.RefObject<HTMLDivElement | null>
  tamamlananSayisi: number
  toplamSayisi: number
  acik: boolean
  onToggle: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const yuzde = toplamSayisi > 0 ? Math.round((tamamlananSayisi / toplamSayisi) * 100) : 0
  const tamamlandi = tamamlananSayisi >= toplamSayisi && toplamSayisi > 0

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={acik}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors active:opacity-70"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>{donemNo}. Donem</span>
          {tamamlandi && (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}
            >
              <Check size={10} strokeWidth={3} /> Tamamlandi
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${yuzde}%`,
                  backgroundColor: tamamlandi ? 'var(--color-success)' : 'var(--color-primary)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>{tamamlananSayisi}/{toplamSayisi}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${acik ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text3)' }}
          />
        </div>
      </button>

      {acik && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {haftalar.map((h, i) => {
            const isTatil = h.tatilMi
            const isTamamlandi = tamamlananlar.includes(h.haftaNo)
            const isBuHafta = h.haftaNo === bugunHaftaNo

            const cardStyle: React.CSSProperties = isBuHafta
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  border: '1px solid var(--color-primary)',
                  boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }
              : isTamamlandi
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
                }
              : isTatil
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
                }
              : {
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }

            return (
              <div
                key={`meb-${h.haftaNo}-${i}`}
                ref={isBuHafta ? bugunRef : undefined}
                onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
                className="p-3.5 transition-all cursor-pointer active:scale-[0.99]"
                style={{ borderRadius: 'var(--radius-lg)', ...cardStyle }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: isBuHafta ? 'var(--color-primary)'
                          : isTamamlandi ? 'var(--color-success)'
                          : isTatil ? 'var(--color-warning)'
                          : 'var(--color-text1)',
                      }}
                    >
                      {h.haftaNo}. Hafta
                    </span>
                    {isBuHafta && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                      >
                        Bu Hafta
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>
                    {formatTarih(h.baslangicTarihi)} - {formatTarih(h.bitisTarihi)}
                  </span>
                </div>

                {isTatil ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>{h.tatilAdi}</p>
                ) : h.kazanim ? (
                  <div>
                    {h.uniteAdi && (
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {h.uniteAdi}
                      </span>
                    )}
                    <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text1)' }}>
                      {h.kazanim}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface PlanPageProps {
  entry: PlanEntry | null
  planlar?: PlanEntry[]
  onSinifSec?: (sinif: string) => void
}

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${aylar[d.getMonth()]}`
}

export function PlanPage({ entry, planlar, onSinifSec }: PlanPageProps) {
  const navigate = useNavigate()
  const [tamamlananlar, setTamamlananlar] = useState<number[]>([])
  const [exportMenuAcik, setExportMenuAcik] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'word' | null>(null)
  const [visibleYuzde, setVisibleYuzde] = useState(0)
  const [donemAcik, setDonemAcik] = useState<Record<number, boolean>>({ 1: true, 2: false })
  const bugunRef = useRef<HTMLDivElement>(null)

  const bugunStr = new Date().toISOString().split('T')[0]
  const bugunHaftaNo = entry?.plan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? entry?.plan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

  function scrollToBugunHafta() {
    if (!entry?.plan || !bugunHaftaNo) return
    const bugunDonem = entry.plan.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
    setDonemAcik(prev => ({ ...prev, [bugunDonem]: true }))
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bugunRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
  }

  async function handleExcelIndir() {
    if (!entry) return
    setExporting('excel')
    setExportMenuAcik(false)
    try {
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      const meta = ayarlar ? JSON.parse(ayarlar) : {}
      await exportPlanToExcel(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
    } finally {
      setExporting(null)
    }
  }

  function handleWordIndir() {
    if (!entry) return
    setExporting('word')
    setExportMenuAcik(false)
    try {
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      const meta = ayarlar ? JSON.parse(ayarlar) : {}
      exportPlanToWord(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
    } finally {
      setExporting(null)
    }
  }

  function handleYazdir() {
    if (!entry) return
    setExportMenuAcik(false)
    const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    const meta = ayarlar ? JSON.parse(ayarlar) : {}
    exportPlanToPrint(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
  }

  useEffect(() => {
    if (!entry?.plan) return
    const aktifDonem = entry.plan.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
    setDonemAcik({ 1: aktifDonem === 1, 2: aktifDonem === 2 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.sinif])

  useEffect(() => {
    if (!entry) return
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (item) {
        const parsed = JSON.parse(item)
        if (Array.isArray(parsed)) {
          setTamamlananlar(parsed)
        } else {
          setTamamlananlar(parsed[entry.sinif] || [])
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.sinif])

  useEffect(() => {
    if (!entry) { setVisibleYuzde(0); return }
    const isMebCalc = entry.tip === 'meb' && entry.plan && entry.plan.haftalar.length > 0
    const toplamCalc = isMebCalc
      ? entry.plan!.haftalar.filter(h => !h.tatilMi).length
      : (entry.tip === 'yukle' && entry.rows ? entry.rows.length : 0)
    const calc = toplamCalc > 0 ? Math.round((tamamlananlar.length / toplamCalc) * 100) : 0
    const t = setTimeout(() => setVisibleYuzde(calc), 80)
    return () => clearTimeout(t)
  }, [tamamlananlar, entry])

  if (!entry) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
            Planlama
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
            Yillik plan takibi
          </p>
        </div>
        <EmptyState
          icon={<CalendarDays size={28} />}
          title="Henuz plan yok"
          body="Ana ekrandan planini olustur ve tum haftalari burada takip et."
        />
        <div className="mt-4">
          <Button onClick={() => navigate('/app')} variant="primary" className="w-full">
            Plan Olustur
          </Button>
        </div>
      </div>
    )
  }

  const { plan, rows, ders, sinif, sinifGercek, tip } = entry
  const isMeb = tip === 'meb' && plan && plan.haftalar.length > 0
  const isUploaded = tip === 'yukle' && rows && rows.length > 0
  const dataLength = isMeb ? plan!.haftalar.length : (isUploaded ? rows!.length : 0)
  const tamamlananSayi = tamamlananlar.length
  const toplamDers = isMeb ? plan!.haftalar.filter(h => !h.tatilMi).length : dataLength
  const yuzde = toplamDers > 0 ? Math.round((tamamlananSayi / toplamDers) * 100) : 0

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1
          className="text-[22px] font-bold tracking-tight mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
        >
          Planlama
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          Yillik plan · Haftalik takip · {ders}
        </p>
      </div>

      <div
        className="page-hero relative overflow-hidden"
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-primary)',
          padding: '18px',
        }}
      >
        <div
          className="absolute"
          style={{
            top: '-30px', right: '-30px',
            width: '100px', height: '100px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
          }}
        />
        <p className="text-[10px] font-bold uppercase tracking-[.12em] mb-1.5 relative z-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Ana Ozet
        </p>
        <p className="text-[19px] font-bold mb-1 relative z-10 tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#ffffff' }}>
          {ders}
        </p>
        <p className="text-xs mb-3 relative z-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {sinifGercek || sinif}
        </p>
        <div className="flex gap-2 relative z-10 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            {dataLength} hafta
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            %{yuzde} tamamlandi
          </span>
        </div>
        <div className="relative z-10 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${visibleYuzde}%`, backgroundColor: 'rgba(255,255,255,0.75)' }} />
        </div>
      </div>

      {planlar && planlar.length > 1 && (
        <div className="page-hero">
          <SectionHeader title="Aktif Plan" meta="Sinif secimi" />
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {planlar.map(p => (
              <button
                key={p.sinif}
                onClick={() => onSinifSec?.(p.sinif)}
                className="whitespace-nowrap flex-shrink-0 text-sm font-bold transition-all active:scale-95"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1.5px solid ${p.sinif === entry.sinif ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: p.sinif === entry.sinif ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: p.sinif === entry.sinif ? '#ffffff' : 'var(--color-text2)',
                }}
              >
                {p.label || p.sinif}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sticky-action-bar mb-4">
        <div className="glass-surface px-3 py-3" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <SectionHeader title="Araclar" meta="Ikincil aksiyonlar" />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setExportMenuAcik(p => !p)}
                disabled={!!exporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                }}
              >
                {exporting ? <span className="animate-pulse text-xs">Hazirlaniyor...</span> : <><Download size={16} /> Indir</>}
              </button>
              {exportMenuAcik && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportMenuAcik(false)} />
                  <div
                    className="absolute top-full left-0 right-0 mt-1 z-20 overflow-hidden"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <button onClick={handleExcelIndir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70" style={{ color: 'var(--color-text1)', borderBottom: '1px solid var(--color-border)' }}>
                      <FileSpreadsheet size={16} style={{ color: 'var(--color-success)' }} /> Excel (.xlsx)
                    </button>
                    <button onClick={handleWordIndir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70" style={{ color: 'var(--color-text1)', borderBottom: '1px solid var(--color-border)' }}>
                      <FileText size={16} style={{ color: 'var(--color-primary)' }} /> Word (.doc)
                    </button>
                    <button onClick={handleYazdir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70" style={{ color: 'var(--color-text1)' }}>
                      <Printer size={16} style={{ color: 'var(--color-text2)' }} /> Yazdir / PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleYazdir}
              className="flex items-center gap-1.5 text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
              style={{
                padding: '0 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text2)',
              }}
            >
              <Printer size={16} /> Yazdir
            </button>

            {bugunHaftaNo && (
              <button
                onClick={scrollToBugunHafta}
                className="flex items-center gap-1.5 text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                style={{
                  padding: '0 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                <MapPin size={15} /> Bu Hafta
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="section-stack">
        <AdBanner className="rounded-lg" />

        <div>
          <SectionHeader title="Haftalik Program" meta="Bilgi gorunumu" />
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
              padding: '14px',
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>Ders dagilimi</span>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text3)' }}>Salt okunur</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {['Pzt', 'Sal', 'Car', 'Per', 'Cum'].map(gun => (
                <div key={gun} className="text-center text-[9px] font-bold uppercase tracking-[.04em] py-1" style={{ color: 'var(--color-text3)' }}>
                  {gun}
                </div>
              ))}
              {Array.from({ length: 15 }, (_, i) => {
                const gunIndex = i % 5
                const doluMu = gunIndex === 0 || gunIndex === 2 || gunIndex === 4
                return (
                  <div
                    key={i}
                    className="text-center text-[9px] font-semibold min-h-[32px] flex items-center justify-center rounded-[4px]"
                    style={doluMu ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                      color: 'var(--color-primary)',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                      fontWeight: 700,
                      lineHeight: '1.3',
                      padding: '4px',
                    } : {
                      backgroundColor: 'var(--color-bg2)',
                      color: 'var(--color-border2)',
                    }}
                  >
                    {doluMu ? ders.split(' ')[0].slice(0, 5) : '-'}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {isMeb && (
          <div>
            <SectionHeader title="Donem Gruplari" meta="Ana takip alani" />
            <div className="flex flex-col gap-4">
              {[1, 2].map(donemNo => {
                const donemHaftalar = plan!.haftalar.filter(h => h.donem === donemNo)
                if (donemHaftalar.length === 0) return null
                const tamamlananSayisi = donemHaftalar.filter(h => !h.tatilMi && tamamlananlar.includes(h.haftaNo)).length
                const toplamSayisi = donemHaftalar.filter(h => !h.tatilMi).length
                const aktifDonem = plan!.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
                const isAcik = donemAcik[donemNo] !== undefined ? donemAcik[donemNo] : donemNo === aktifDonem

                return (
                  <DonemGrubu
                    key={donemNo}
                    donemNo={donemNo}
                    haftalar={donemHaftalar}
                    tamamlananlar={tamamlananlar}
                    bugunHaftaNo={bugunHaftaNo}
                    bugunRef={bugunRef}
                    tamamlananSayisi={tamamlananSayisi}
                    toplamSayisi={toplamSayisi}
                    acik={isAcik}
                    onToggle={() => setDonemAcik(prev => ({ ...prev, [donemNo]: !prev[donemNo] }))}
                    navigate={navigate}
                  />
                )
              })}
            </div>
          </div>
        )}

        {isUploaded && (
          <div>
            <SectionHeader title="Yuklenen Plan" meta={`${rows!.length} satir`} />
            <div className="flex flex-col gap-3">
              {rows!.map((r: ParsedRow, i: number) => {
                const isTamamlandi = r.haftaNo ? tamamlananlar.includes(r.haftaNo) : false
                return (
                  <div
                    key={`row-${i}`}
                    onClick={() => navigate(`/app/hafta/${r.haftaNo}`)}
                    className="p-4 cursor-pointer transition-all active:scale-[0.99]"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      border: `1px solid ${isTamamlandi ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'var(--color-border)'}`,
                      backgroundColor: isTamamlandi ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'var(--color-surface)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-lg" style={{ color: isTamamlandi ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {r.haftaNo ? `${r.haftaNo}. Hafta` : 'Ekstra'}
                      </span>
                      {r.tarihAraligi && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ color: 'var(--color-text3)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                          {r.tarihAraligi}
                        </span>
                      )}
                    </div>
                    {r.donem && (
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-3" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text3)' }}>
                        {r.donem}
                      </span>
                    )}
                    <div className="mt-3 text-[13px] pt-3 leading-relaxed font-medium" style={{ color: 'var(--color-text2)', borderTop: '1px solid var(--color-border)' }}>
                      {r.kazanim}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
