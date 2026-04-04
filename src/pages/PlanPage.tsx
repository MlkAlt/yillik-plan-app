import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { AdBanner } from '../components/AdBanner'
import { Button } from '../components/Button'
import { Check, CalendarDays, ChevronDown } from 'lucide-react'
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
  const [visibleYuzde, setVisibleYuzde] = useState(0)
  const [donemAcik, setDonemAcik] = useState<Record<number, boolean>>({ 1: true, 2: false })
  const bugunRef = useRef<HTMLDivElement>(null)

  const bugunStr = new Date().toISOString().split('T')[0]
  const bugunHaftaNo = entry?.plan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? entry?.plan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

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

  // Bu haftanın günleri
  const bugunHafta = entry?.plan?.haftalar.find(h => h.haftaNo === bugunHaftaNo)
  const gunler = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt']
  const buHaftaGunler = bugunHafta ? [0,1,2].map(i => {
    const d = new Date(bugunHafta.baslangicTarihi)
    d.setDate(d.getDate() + i)
    const dStr = d.toISOString().split('T')[0]
    const durum = dStr < bugunStr ? 'hazir' : dStr === bugunStr ? 'eksik' : 'gelecek'
    return { gun: gunler[d.getDay()], gunNo: d.getDate(), ders, sinif: sinifGercek || sinif, kazanim: bugunHafta.kazanim || '', durum }
  }) : []

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Planlama
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>Yıllık · Haftalık · Ders Programı</p>
      </div>

      {/* Navy hero card — v8 */}
      <div style={{ margin: '0 16px 12px', borderRadius: '20px', background: 'linear-gradient(145deg,#1B2E5E,#243A78)', padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'radial-gradient(circle,rgba(79,106,245,.22),transparent 70%)', borderRadius: '50%' }} />
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '6px' }}>
          Yıllık Plan · {entry.yil}
        </p>
        <p style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '4px' }}>{ders}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', marginBottom: '12px' }}>
          {sinifGercek || sinif} · {dataLength} hafta · Haftada 4 saat
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {bugunHaftaNo && (
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' }}>
              {bugunHaftaNo}. Hafta
            </span>
          )}
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' }}>
            %{yuzde} tamamlandı
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,.2)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${visibleYuzde}%`, background: 'rgba(255,255,255,.75)', borderRadius: '100px', transition: 'width 0.7s ease-out' }} />
        </div>
      </div>

      {/* Sınıf seçici */}
      {planlar && planlar.length > 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {planlar.map(p => (
            <button key={p.sinif} onClick={() => onSinifSec?.(p.sinif)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '100px', border: `1.5px solid ${p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-border)'}`, background: p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-bg)', color: p.sinif === entry.sinif ? '#fff' : 'var(--color-text2)', cursor: 'pointer' }}>
              {p.label || p.sinif}
            </button>
          ))}
        </div>
      )}

      {/* Bu Hafta */}
      {buHaftaGunler.length > 0 && (
        <div style={{ margin: '0 16px 12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: '8px' }}>Bu Hafta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {buHaftaGunler.map((g, i) => (
              <div key={i} onClick={() => navigate(`/app/hafta/${bugunHaftaNo}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '12px 14px', cursor: 'pointer' }}>
                <p style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '22px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em', minWidth: '28px' }}>{g.gunNo}</p>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '2px' }}>{g.ders} · {g.sinif}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text2)', lineHeight: '15px' }}>{g.kazanim || 'Kazanım yok'}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: g.durum === 'hazir' ? '#ECFDF5' : g.durum === 'eksik' ? '#FFFBEB' : 'var(--color-bg)', color: g.durum === 'hazir' ? '#059669' : g.durum === 'eksik' ? '#D97706' : 'var(--color-text3)', border: `1px solid ${g.durum === 'hazir' ? '#A7F3D0' : g.durum === 'eksik' ? '#FDE68A' : 'var(--color-border)'}` }}>
                  {g.durum === 'hazir' ? 'Hazır' : g.durum === 'eksik' ? 'Eksik' : 'Gelecek'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Haftalık Program grid */}
      <div style={{ margin: '0 16px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)' }}>Haftalık Program</p>
          <button style={{ fontSize: '13px', fontWeight: 700, color: '#4F6AF5', background: 'none', border: 'none', cursor: 'pointer' }}>Düzenle</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px' }}>
          {['Pzt','Sal','Çar','Per','Cum'].map(g => (
            <div key={g} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--color-text3)', paddingBottom: '4px' }}>{g}</div>
          ))}
          {Array.from({ length: 15 }, (_, i) => {
            const col = i % 5
            const dolu = col === 0 || col === 1 || col === 2 || col === 4
            return (
              <div key={i} style={{ minHeight: '32px', borderRadius: '6px', background: dolu ? 'color-mix(in srgb,#4F6AF5 10%,transparent)' : 'var(--color-bg)', border: dolu ? '1px solid color-mix(in srgb,#4F6AF5 25%,transparent)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: dolu ? '#4F6AF5' : 'transparent', padding: '2px', lineHeight: '1.2', textAlign: 'center' }}>
                {dolu ? ders.split(' ')[0].slice(0,4) : ''}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dönem grupları ve export araçları */}
      <div className="section-stack" style={{ padding: '0 16px 16px' }}>
        <AdBanner className="rounded-lg" />

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
