import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { Button } from '../components/Button'
import { Check, ChevronDown, CheckCircle2, Clock, CalendarDays, Bell, Sparkles } from 'lucide-react'
import { StorageKeys } from '../lib/storageKeys'
import { SectionHeader } from '../components/UI/SectionHeader'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'

// Ünitelere göre grupla
function groupByUnite(haftalar: Hafta[]) {
  const groups: { uniteAdi: string; haftalar: Hafta[] }[] = []
  for (const h of haftalar) {
    const key = h.uniteAdi || 'Genel Konular'
    const last = groups[groups.length - 1]
    if (last && last.uniteAdi === key) {
      last.haftalar.push(h)
    } else {
      groups.push({ uniteAdi: key, haftalar: [h] })
    }
  }
  return groups
}

const UNITE_RENKLERI = ['#4F6AF5', '#6D28D9', '#059669', '#D97706', '#DC2626', '#0EA5E9']

interface PlanPageProps {
  entry: PlanEntry | null
  planlar?: PlanEntry[]
  onSinifSec?: (sinif: string) => void
}

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${aylar[d.getMonth()]}`
}

export function PlanPage({ entry, planlar, onSinifSec }: PlanPageProps) {
  const navigate = useNavigate()
  const [tamamlananlar, setTamamlananlar] = useState<number[]>([])
  const [grupAcik, setGrupAcik] = useState<Record<number, boolean>>({ 0: true })
  const bugunRef = useRef<HTMLDivElement>(null)
  const { tarihler } = useOnemliTarihler()

  const bugunStr = new Date().toISOString().split('T')[0]
  const bugunHaftaNo = entry?.plan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? entry?.plan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

  useEffect(() => {
    if (!entry?.plan) return
    const unites = groupByUnite(entry.plan.haftalar)
    const aktifGrupIdx = unites.findIndex(g => g.haftalar.some(h => h.haftaNo === bugunHaftaNo))
    const initial: Record<number, boolean> = {}
    unites.forEach((_, i) => { initial[i] = i === (aktifGrupIdx >= 0 ? aktifGrupIdx : 0) })
    setGrupAcik(initial)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.sinif])

  useEffect(() => {
    const timer = setTimeout(() => {
      bugunRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 400)
    return () => clearTimeout(timer)
  }, [])

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

  // ─── BOŞ STATE ───────────────────────────────────────────────────────────────
  if (!entry) {
    return (
      <div className="page-shell">
        {/* Figma boş state — dashed border card, büyük gradient ikon */}
        <div style={{
          margin: '16px',
          border: '2px dashed var(--color-border)',
          borderRadius: 20,
          padding: '48px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          background: 'color-mix(in srgb, #4F6AF5 4%, var(--color-bg))',
        }}>
          <div style={{
            width: 96, height: 96,
            background: 'linear-gradient(135deg, #4F6AF5, #6D28D9)',
            borderRadius: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 16px 32px rgba(79,106,245,0.25)',
          }}>
            <Sparkles size={48} color="#fff" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
            Yıllık Planınızı Oluşturun
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text2)', marginBottom: 6, maxWidth: 320, lineHeight: 1.6 }}>
            Branşınız için 36 haftalık yıllık plan otomatik olarak oluşturulacak.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text3)', marginBottom: 32 }}>
            Kazanımlar, yöntemler ve değerlendirme planlanmış şekilde hazırlanır.
          </p>
          <Button onClick={() => navigate('/app')} variant="primary" style={{ height: 48, padding: '0 32px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} />
            Plan Oluştur
          </Button>
        </div>
      </div>
    )
  }

  const { plan, rows, ders, sinif, sinifGercek, tip } = entry
  const isMeb = tip === 'meb' && plan && plan.haftalar.length > 0
  const isUploaded = tip === 'yukle' && rows && rows.length > 0
  const dataLength = isMeb ? plan!.haftalar.length : (isUploaded ? rows!.length : 0)
  // Ünite grupları (MEB planı için)
  const uniteGruplari = isMeb ? groupByUnite(plan!.haftalar) : []

  return (
    <div className="page-shell">
      {/* ─── BAŞLIK + INLINE QUICK ACTIONS (Tasarım Mimarı: D seçeneği) ─── */}
      <div style={{ padding: '20px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif",
            fontSize: 28, fontWeight: 800, color: 'var(--color-text1)',
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15,
          }}>
            {ders}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
              background: 'color-mix(in srgb, #4F6AF5 12%, var(--color-surface))',
              color: '#4F6AF5',
              border: '1px solid color-mix(in srgb, #4F6AF5 25%, transparent)',
            }}>
              {sinifGercek || sinif}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text3)', fontWeight: 500 }}>
              {dataLength} hafta · {entry.yil}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, paddingTop: 2 }}>
          <button
            onClick={() => navigate('/app/planla/ders-programi')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 100, background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', fontSize: 12, fontWeight: 600, color: 'var(--color-text1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Clock size={13} color="#4F6AF5" /> Ders Programı
          </button>
          <button
            onClick={() => navigate('/app/planla/takvim')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 100, background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', fontSize: 12, fontWeight: 600, color: 'var(--color-text1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <CalendarDays size={13} color="#059669" /> Takvim
          </button>
        </div>
      </div>

      {/* Sınıf seçici */}
      {planlar && planlar.length > 1 && (
        <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {planlar.map(p => (
            <button key={p.sinif} onClick={() => onSinifSec?.(p.sinif)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-border)'}`, background: p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-bg)', color: p.sinif === entry.sinif ? '#fff' : 'var(--color-text2)', cursor: 'pointer' }}>
              {p.label || p.sinif}
            </button>
          ))}
        </div>
      )}

      <div className="section-stack" style={{ padding: '0 16px 16px' }}>
          {/* ─── Yaklaşan Tarihler ───────────────────────────── */}
          {(() => {
            const bugun = new Date()
            const yaklasanlar = tarihler
              .filter(t => {
                const d = new Date(t.tarih)
                const diff = (d.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24)
                return diff >= 0 && diff <= 30
              })
              .slice(0, 3)
            if (yaklasanlar.length === 0) return null
            return (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={15} style={{ color: 'var(--color-warning)' }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)' }}>Yaklaşan Tarihler</p>
                  </div>
                  <button onClick={() => navigate('/app/planla/takvim')} style={{ fontSize: 12, fontWeight: 600, color: '#4F6AF5', background: 'none', border: 'none', cursor: 'pointer' }}>Hepsi</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {yaklasanlar.map(tarih => (
                    <div key={tarih.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'color-mix(in srgb, #4F6AF5 12%, var(--color-surface))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#4F6AF5', lineHeight: 1 }}>
                          {new Date(tarih.tarih).getDate()}
                        </p>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text1)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tarih.baslik}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ─── Ünite Grupları ─────────────────────────────── */}
          {isMeb && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {uniteGruplari.map((grup, gIdx) => {
                const renk = UNITE_RENKLERI[gIdx % UNITE_RENKLERI.length]
                const isAcik = grupAcik[gIdx] ?? gIdx === 0
                const acikHaftaSayisi = grup.haftalar.filter(h => !h.tatilMi).length
                const tamamlananGrup = grup.haftalar.filter(h => !h.tatilMi && tamamlananlar.includes(h.haftaNo)).length

                return (
                  <div key={`unite-${gIdx}`} style={{
                    borderRadius: 16,
                    border: `1px solid color-mix(in srgb, ${renk} 25%, transparent)`,
                    overflow: 'hidden',
                  }}>
                    {/* Ünite Başlığı */}
                    <button
                      onClick={() => setGrupAcik(prev => ({ ...prev, [gIdx]: !prev[gIdx] }))}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 16px',
                        background: `color-mix(in srgb, ${renk} 10%, var(--color-surface))`,
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                          background: renk, color: '#fff', flexShrink: 0,
                        }}>
                          Ünite {gIdx + 1}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)' }}>
                          {grup.uniteAdi}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                          background: 'var(--color-bg)', color: 'var(--color-text3)',
                          border: '1px solid var(--color-border)',
                        }}>
                          {grup.haftalar.length} Hafta
                        </span>
                        {tamamlananGrup === acikHaftaSayisi && acikHaftaSayisi > 0 && (
                          <Check size={14} color="#059669" />
                        )}
                        <ChevronDown
                          size={16}
                          color="var(--color-text3)"
                          style={{ transform: isAcik ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        />
                      </div>
                    </button>

                    {/* Hafta Satırları */}
                    {isAcik && (
                      <div style={{ background: `color-mix(in srgb, ${renk} 3%, var(--color-bg))` }}>
                        {grup.haftalar.map((h, hIdx) => {
                          const isTatil = h.tatilMi
                          const isTamamlandi = tamamlananlar.includes(h.haftaNo)
                          const isBuHafta = h.haftaNo === bugunHaftaNo

                          return (
                            <div
                              key={`hafta-${h.haftaNo}`}
                              ref={isBuHafta ? bugunRef : undefined}
                              style={{ borderTop: hIdx > 0 ? `1px solid color-mix(in srgb, var(--color-border) 60%, transparent)` : 'none' }}
                            >
                              <button
                                onClick={() => { if (!isTatil) navigate(`/app/hafta/${h.haftaNo}`) }}
                                style={{
                                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                                  padding: '11px 16px', background: 'none', border: 'none',
                                  cursor: isTatil ? 'default' : 'pointer', textAlign: 'left',
                                }}
                              >
                                {/* Hafta numarası badge */}
                                <div style={{
                                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                  background: isBuHafta ? renk : 'var(--color-surface)',
                                  border: `1px solid ${isBuHafta ? renk : 'var(--color-border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: isBuHafta ? '#fff' : 'var(--color-text2)' }}>
                                    {h.haftaNo}
                                  </span>
                                </div>

                                {/* İçerik */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    fontSize: 13, fontWeight: 600, lineHeight: '18px',
                                    color: isTatil ? 'var(--color-warning)' : 'var(--color-text1)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  }}>
                                    {isTatil ? (h.tatilAdi || 'Tatil') : (h.kazanim || 'Kazanım yok')}
                                  </p>
                                  <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>
                                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                                  </p>
                                </div>

                                {/* Sağ taraf */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  {isBuHafta && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: renk, color: '#fff' }}>
                                      Bu Hafta
                                    </span>
                                  )}
                                  {isTamamlandi && !isBuHafta && (
                                    <CheckCircle2 size={16} color="#059669" />
                                  )}
                                  {!isTatil && (
                                    <ChevronDown size={14} color="var(--color-text3)" style={{ transform: 'rotate(-90deg)' }} />
                                  )}
                                </div>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Yüklenen Plan (mevcut stil korundu) */}
          {isUploaded && (
            <div>
              <SectionHeader title="Yüklenen Plan" meta={`${rows!.length} satır`} />
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
