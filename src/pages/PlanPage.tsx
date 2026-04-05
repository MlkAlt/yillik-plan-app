import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import type { ParsedRow } from '../lib/fileParser'
import type { PlanEntry } from '../types/planEntry'
import { AdBanner } from '../components/AdBanner'
import { Button } from '../components/Button'
import { Check, ChevronDown, CheckCircle2, Clock, BookOpen, Sparkles } from 'lucide-react'
import { StorageKeys } from '../lib/storageKeys'
import { SectionHeader } from '../components/UI/SectionHeader'
import { PlanAltSekmeler } from '../components/Plan/PlanAltSekmeler'
import type { Sekme } from '../components/Plan/PlanAltSekmeler'
import { DersProgramiGrid } from '../components/DersProgrami/DersProgramiGrid'
import { useDersProgrami } from '../hooks/useDersProgrami'
import { OnemliTarihlerListesi } from '../components/Takvim/OnemliTarihlerListesi'
import { TarihEkleForm } from '../components/Takvim/TarihEkleForm'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'
import type { OnemliTarih } from '../types/onemliTarih'

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
  const [visibleYuzde, setVisibleYuzde] = useState(0)
  const [grupAcik, setGrupAcik] = useState<Record<number, boolean>>({ 0: true })
  const [expandedHaftalar, setExpandedHaftalar] = useState<Set<number>>(new Set())
  const [aktifSekme, setAktifSekme] = useState<Sekme>('yillik')
  const [tarihFormAcik, setTarihFormAcik] = useState(false)
  const bugunRef = useRef<HTMLDivElement>(null)
  const { program, guncelle: dersProgramiGuncelle } = useDersProgrami()
  const { tarihler, ekle: tarihEkle, sil: tarihSil, mebTakviminiYukle } = useOnemliTarihler()

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
    if (bugunHaftaNo) setExpandedHaftalar(new Set([bugunHaftaNo]))
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

  useEffect(() => {
    if (entry?.yil) mebTakviminiYukle(entry.yil)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.yil])

  function handleTarihEkle(tarih: OnemliTarih) {
    tarihEkle(tarih)
    setTarihFormAcik(false)
  }

  function toggleHafta(haftaNo: number) {
    setExpandedHaftalar(prev => {
      const next = new Set(prev)
      if (next.has(haftaNo)) next.delete(haftaNo)
      else next.add(haftaNo)
      return next
    })
  }

  // ─── BOŞ STATE ───────────────────────────────────────────────────────────────
  if (!entry) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
            Planlama
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text2)' }}>Yıllık plan takibi</p>
        </div>

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
  const tamamlananSayi = tamamlananlar.length
  const toplamDers = isMeb ? plan!.haftalar.filter(h => !h.tatilMi).length : dataLength
  const yuzde = toplamDers > 0 ? Math.round((tamamlananSayi / toplamDers) * 100) : 0

  // Bu haftanın günleri
  const bugunHafta = entry?.plan?.haftalar.find(h => h.haftaNo === bugunHaftaNo)
  const gunler = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
  const buHaftaGunler = bugunHafta ? [0, 1, 2].map(i => {
    const d = new Date(bugunHafta.baslangicTarihi)
    d.setDate(d.getDate() + i)
    const dStr = d.toISOString().split('T')[0]
    const durum = dStr < bugunStr ? 'hazir' : dStr === bugunStr ? 'eksik' : 'gelecek'
    return { gun: gunler[d.getDay()], gunNo: d.getDate(), ders, sinif: sinifGercek || sinif, kazanim: bugunHafta.kazanim || '', durum }
  }) : []

  // Ünite grupları (MEB planı için)
  const uniteGruplari = isMeb ? groupByUnite(plan!.haftalar) : []

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Planlama
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>Yıllık · Haftalık · Ders Programı</p>
      </div>

      {/* Navy hero card */}
      <div style={{ margin: '0 16px 12px', borderRadius: 20, background: 'linear-gradient(145deg,#1B2E5E,#243A78)', padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: 100, height: 100, background: 'radial-gradient(circle,rgba(79,106,245,.22),transparent 70%)', borderRadius: '50%' }} />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>
          Yıllık Plan · {entry.yil}
        </p>
        <p style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>{ders}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>
          {sinifGercek || sinif} · {dataLength} hafta · Haftada 4 saat
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {bugunHaftaNo && (
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' }}>
              {bugunHaftaNo}. Hafta
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' }}>
            %{yuzde} tamamlandı
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,.2)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${visibleYuzde}%`, background: 'rgba(255,255,255,.75)', borderRadius: 100, transition: 'width 0.7s ease-out' }} />
        </div>
      </div>

      {/* Sınıf seçici */}
      {planlar && planlar.length > 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {planlar.map(p => (
            <button key={p.sinif} onClick={() => onSinifSec?.(p.sinif)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-border)'}`, background: p.sinif === entry.sinif ? '#4F6AF5' : 'var(--color-bg)', color: p.sinif === entry.sinif ? '#fff' : 'var(--color-text2)', cursor: 'pointer' }}>
              {p.label || p.sinif}
            </button>
          ))}
        </div>
      )}

      {/* Bu Hafta */}
      {buHaftaGunler.length > 0 && (
        <div style={{ margin: '0 16px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: 8 }}>Bu Hafta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {buHaftaGunler.map((g, i) => (
              <div key={i} onClick={() => navigate(`/app/hafta/${bugunHaftaNo}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer' }}>
                <p style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em', minWidth: 28 }}>{g.gunNo}</p>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 2 }}>{g.ders} · {g.sinif}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text2)', lineHeight: '15px' }}>{g.kazanim || 'Kazanım yok'}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: g.durum === 'hazir' ? '#ECFDF5' : g.durum === 'eksik' ? '#FFFBEB' : 'var(--color-bg)', color: g.durum === 'hazir' ? '#059669' : g.durum === 'eksik' ? '#D97706' : 'var(--color-text3)', border: `1px solid ${g.durum === 'hazir' ? '#A7F3D0' : g.durum === 'eksik' ? '#FDE68A' : 'var(--color-border)'}` }}>
                  {g.durum === 'hazir' ? 'Hazır' : g.durum === 'eksik' ? 'Eksik' : 'Gelecek'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Haftalık Program grid */}
      {(() => {
        const gunSirasi = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'] as const
        const gunKisa = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum']
        const maxSaat = Math.max(1, ...program.saatler.map(s => s.saat))
        const satirSayisi = Math.min(maxSaat, 8)
        return (
          <div style={{ margin: '0 16px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)' }}>Haftalık Program</p>
              <button onClick={() => navigate('/app/planla/ders-programi')} style={{ fontSize: 13, fontWeight: 700, color: '#4F6AF5', background: 'none', border: 'none', cursor: 'pointer' }}>Düzenle</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
              {gunKisa.map(g => (
                <div key={g} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text3)', paddingBottom: 4 }}>{g}</div>
              ))}
              {Array.from({ length: satirSayisi * 5 }, (_, i) => {
                const col = i % 5
                const row = Math.floor(i / 5)
                const saatNo = row + 1
                const gun = gunSirasi[col]
                const hucre = program.saatler.find(s => s.gun === gun && s.saat === saatNo)
                const dolu = hucre?.sinif != null
                const label = dolu ? (hucre!.ders?.split(' ')[0].slice(0, 4) ?? hucre!.sinif!.slice(0, 4)) : ''
                return (
                  <div key={i} style={{ minHeight: 32, borderRadius: 6, background: dolu ? 'color-mix(in srgb,#4F6AF5 10%,transparent)' : 'var(--color-bg)', border: dolu ? '1px solid color-mix(in srgb,#4F6AF5 25%,transparent)' : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: dolu ? '#4F6AF5' : 'transparent', padding: 2, lineHeight: '1.2', textAlign: 'center' }}>
                    {label}
                  </div>
                )
              })}
            </div>
            {!program.saatler.some(s => s.sinif !== null) && (
              <p style={{ fontSize: 11, color: 'var(--color-text3)', textAlign: 'center', marginTop: 8 }}>Henüz ders programı eklenmemiş</p>
            )}
          </div>
        )
      })()}

      {/* Alt Sekmeler */}
      <PlanAltSekmeler aktif={aktifSekme} onChange={setAktifSekme} />

      {/* Sekme içerikleri */}
      {aktifSekme === 'ders-programi' && (
        <div style={{ padding: '0 16px 24px' }}>
          <DersProgramiGrid
            program={program}
            onHucreGuncelle={(gun, saat, sinifVal) => {
              const ders2 = planlar?.find(p => p.sinif === sinifVal)?.ders
              dersProgramiGuncelle(gun, saat, sinifVal, ders2)
            }}
          />
        </div>
      )}

      {aktifSekme === 'takvim' && (
        <div style={{ padding: '0 16px 24px' }}>
          <OnemliTarihlerListesi
            tarihler={tarihler}
            onEkle={() => setTarihFormAcik(true)}
            onSil={tarihSil}
          />
          {tarihFormAcik && (
            <TarihEkleForm
              onKaydet={handleTarihEkle}
              onKapat={() => setTarihFormAcik(false)}
            />
          )}
        </div>
      )}

      {aktifSekme === 'yillik' && (
        <div className="section-stack" style={{ padding: '0 16px 16px' }}>
          <AdBanner className="rounded-lg" />

          {/* ─── B2: 3 Stat Kartı ─────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 4 }}>
            {[
              { label: 'Toplam', value: `${dataLength}`, alt: 'Hafta', renk: '#4F6AF5', Icon: Clock },
              { label: 'Tamamlanan', value: `${tamamlananSayi}`, alt: 'Hafta', renk: '#059669', Icon: CheckCircle2 },
              { label: 'Kalan', value: `${Math.max(0, toplamDers - tamamlananSayi)}`, alt: 'Hafta', renk: '#D97706', Icon: BookOpen },
            ].map(stat => (
              <div key={stat.label} style={{
                background: `linear-gradient(135deg, ${stat.renk}, ${stat.renk}cc)`,
                borderRadius: 16, padding: '14px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
                overflow: 'hidden', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: -10, right: -10, width: 50, height: 50, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{stat.label}</p>
                  <stat.Icon size={14} color="rgba(255,255,255,0.5)" />
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{stat.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{stat.alt}</p>
              </div>
            ))}
          </div>

          {/* ─── C2: MEB — Ünite Grupları ─────────────────────────────── */}
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
                          const isExpanded = expandedHaftalar.has(h.haftaNo)

                          return (
                            <div
                              key={`hafta-${h.haftaNo}`}
                              ref={isBuHafta ? bugunRef : undefined}
                              style={{ borderTop: hIdx > 0 ? `1px solid color-mix(in srgb, var(--color-border) 60%, transparent)` : 'none' }}
                            >
                              {/* Satır başlığı */}
                              <button
                                onClick={() => {
                                  if (isTatil) return
                                  toggleHafta(h.haftaNo)
                                }}
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
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
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
                                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)} · 4 ders saati
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
                                    <ChevronDown
                                      size={14}
                                      color="var(--color-text3)"
                                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                    />
                                  )}
                                </div>
                              </button>

                              {/* Genişletilmiş detay */}
                              {isExpanded && !isTatil && (
                                <div style={{ padding: '0 16px 14px 60px' }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text3)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Kazanım</p>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: h.kazanimDetay ? 10 : 0 }}>
                                    <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ fontSize: 13, color: 'var(--color-text2)', lineHeight: 1.6 }}>
                                      {h.kazanim || 'Kazanım girilmemiş'}
                                    </p>
                                  </div>
                                  {h.kazanimDetay && (
                                    <p style={{ fontSize: 12, color: 'var(--color-text3)', marginTop: 6, lineHeight: 1.5 }}>{h.kazanimDetay}</p>
                                  )}
                                  <button
                                    onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
                                    style={{
                                      marginTop: 12, fontSize: 12, fontWeight: 700,
                                      color: renk, background: `color-mix(in srgb, ${renk} 10%, transparent)`,
                                      border: `1px solid color-mix(in srgb, ${renk} 25%, transparent)`,
                                      borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                                    }}
                                  >
                                    Haftayı Görüntüle →
                                  </button>
                                </div>
                              )}
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

          {/* İndir banner — Figma style */}
          {(isMeb || isUploaded) && (
            <div style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4F6AF5, #6D28D9)',
              padding: '20px 20px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Planı İndir</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Okul bilgileri otomatik eklenir (Ayarlar'dan yapılandırın)</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, height: 40, borderRadius: 10, background: '#fff', color: '#4F6AF5', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Word İndir
                </button>
                <button style={{ flex: 1, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}>
                  Excel İndir
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
