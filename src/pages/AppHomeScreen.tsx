import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, Check, ChevronRight,
  Clock, FileText, Users, Sparkles,
} from 'lucide-react'
import type { PlanEntry } from '../types/planEntry'
import { StorageKeys } from '../lib/storageKeys'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { getEvrakSablonlari, tespitEksikAlanlar } from '../lib/evrakService'
import { useDersProgrami } from '../hooks/useDersProgrami'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'

interface AppHomeScreenProps {
  planlar: PlanEntry[]
  aktifEntry?: PlanEntry | null
  onPlanEkle: (entries: PlanEntry[]) => void
  onSinifSec: (sinif: string) => void
  syncing?: boolean
  tamamlananlar?: Record<string, number[]>
  onTamamlananGuncelle?: () => void
}

function sinifEtiket(sinif: string | null, sube?: string): string {
  if (!sinif) return '—'
  const no = sinif.match(/^(\d+)/)?.[1]
  if (no && sube) return `${no}${sube}`
  if (no) return `${no}.`
  return sinif
}

function selamMesaji(): string {
  const saat = new Date().getHours()
  if (saat >= 6 && saat < 12) return 'Günaydın'
  if (saat >= 12 && saat < 18) return 'İyi günler'
  if (saat >= 18 && saat < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

function bugunHaftaNoHesapla(entry: PlanEntry): number | null {
  const haftalar = entry.plan?.haftalar
  if (!haftalar) return null
  const bugunStr = new Date().toISOString().split('T')[0]
  return (
    haftalar.find(h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi)?.haftaNo ??
    haftalar.find(h => h.baslangicTarihi >= bugunStr)?.haftaNo ??
    null
  )
}

function formatBugunTurkce(): string {
  const now = new Date()
  const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  return `${gunler[now.getDay()]}, ${now.getDate()} ${aylar[now.getMonth()]} ${now.getFullYear()}`
}

const SINIF_RENKLERI = ['#4F6AF5', '#6D28D9', '#059669', '#D97706', '#DC2626', '#0EA5E9', '#7C3AED', '#10B981']

const HIZLI_ERISIM = [
  { label: 'Takvim', alt: 'Önemli tarihler', icon: CalendarDays, renk: '#059669', bg: '#ECFDF5', path: '/app/planla/takvim' },
  { label: 'Ders Programı', alt: 'Haftalık çizelge', icon: Clock, renk: '#D97706', bg: '#FFFBEB', path: '/app/planla/ders-programi' },
]

export function AppHomeScreen({
  planlar, aktifEntry, onPlanEkle, onSinifSec,
  tamamlananlar = {}, onTamamlananGuncelle: _onTamamlananGuncelle,
}: AppHomeScreenProps) {
  const navigate = useNavigate()
  const [ogretmenAd, setOgretmenAd] = useState('')
  const [, setUretimHakki] = useState(0)
  const [, setEksikAyarlar] = useState(false)
  const [localTamamlananlar, setLocalTamamlananlar] = useState<Record<string, number[]>>(tamamlananlar)

  const [onboardingAcik, setOnboardingAcik] = useState(false)

  const { program: dersProgrami, bugunDersleri } = useDersProgrami()
  const bugunStr = new Date().toISOString().split('T')[0]
  const [tamamlananBugun, setTamamlananBugun] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(`bugun_tamamlanan_${bugunStr}`) || '[]') } catch { return [] }
  })
  const freeBelgeler = getEvrakSablonlari().filter(s => !s.premium)
  const belgeSayisi = freeBelgeler.length

  useEffect(() => {
    setLocalTamamlananlar(tamamlananlar)
  }, [tamamlananlar])

  useEffect(() => {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      if (item) {
        const parsed: Partial<OgretmenAyarlari> = JSON.parse(item)
        if (parsed.adSoyad) setOgretmenAd(parsed.adSoyad.trim().split(' ')[0])
        const kritikSablon = freeBelgeler.find(s => !s.premium)
        if (kritikSablon) {
          setEksikAyarlar(tespitEksikAlanlar(kritikSablon, parsed).length > 0)
        }
      } else {
        setEksikAyarlar(true)
      }
    } catch { /* ignore */ }

    try {
      const jeton = localStorage.getItem(StorageKeys.JETON_DURUMU)
      if (jeton) {
        const parsed = JSON.parse(jeton)
        setUretimHakki(typeof parsed === 'number' ? parsed : (parsed.bakiye ?? 0))
      }
    } catch { /* ignore */ }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleBugunToggle(saat: number) {
    setTamamlananBugun(prev => {
      const next = prev.includes(saat) ? prev.filter(s => s !== saat) : [...prev, saat]
      localStorage.setItem(`bugun_tamamlanan_${bugunStr}`, JSON.stringify(next))
      return next
    })
  }

  if (planlar.length === 0) {
    const onboardingAtlandi = !onboardingAcik && localStorage.getItem(StorageKeys.ONBOARDING_TAMAMLANDI) === '1'
    if (!onboardingAtlandi) {
      return (
        <BosdurumuEkrani
          onTamamla={entries => {
            onPlanEkle(entries)
            if (entries.length > 0) onSinifSec(entries[0].sinif)
          }}
        />
      )
    }
    // Onboarding atlandı, henüz plan yok — başla kartı
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>📚</div>
        <h2 className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em', marginBottom: '8px', animation: 'stagger-up 0.45s 0.1s ease-out both' }}>
          Planınız hazır bekliyor
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text2)', lineHeight: '22px', marginBottom: '32px', maxWidth: '280px', animation: 'stagger-up 0.45s 0.18s ease-out both' }}>
          Branşınızı seçin, yıllık planınız saniyeler içinde hazırlansın.
        </p>
        <button
          onClick={() => setOnboardingAcik(true)}
          style={{ height: '52px', padding: '0 32px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,106,245,.35)', animation: 'stagger-up 0.45s 0.26s ease-out both' }}
        >
          Plan Oluştur →
        </button>
      </div>
    )
  }

  // Aktif plan verileri — aktifEntry prop'u öncelikli, fallback planlar[0]
  const activeEntry = aktifEntry ?? planlar[0]
  const brans = activeEntry?.ders ?? ''
  const siniflar = planlar.map(p => p.sinifGercek || p.sinif)
  const mevcutHafta = activeEntry ? bugunHaftaNoHesapla(activeEntry) : null
  const toplamHafta = activeEntry?.plan?.haftalar?.length ?? 36
  const ilerlemeYuzde = mevcutHafta ? Math.round(((mevcutHafta - 1) / toplamHafta) * 100) : 0

  const aktifUniteAdi = (() => {
    if (!activeEntry?.plan?.haftalar || activeEntry.tip !== 'meb') return null
    const hafta = activeEntry.plan.haftalar.find(h => h.haftaNo === mevcutHafta)
    return hafta?.uniteAdi ?? null
  })()

  const dersProgramiDolu = dersProgrami.saatler.some(s => s.sinif !== null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 24 }}>

      {/* ── GRADIENT WELCOME BANNER ──────────── */}
      <div
        style={{
          background: 'var(--gradient-banner, linear-gradient(135deg, #1B2E5E 0%, #4F6AF5 100%))',
          padding: '20px 20px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dekoratif daireler */}
        <div style={{ position: 'absolute', top: -40, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginBottom: 6, position: 'relative' }}>
          {formatBugunTurkce()}
        </p>
        <h1
          className="font-display"
          style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4, position: 'relative' }}
        >
          {selamMesaji()}{ogretmenAd ? `, ${ogretmenAd}!` : '!'} 👋
        </h1>
        {brans && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 16, position: 'relative' }}>
            {brans} branşı{siniflar.length > 0 ? ` • ${siniflar.join(', ')}` : ''}
          </p>
        )}
        {aktifUniteAdi && (
          <div style={{ position: 'relative' }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
              display: 'inline-block',
            }}>
              Şu an: {aktifUniteAdi}
            </span>
          </div>
        )}

        {/* Stat mini-kartlar — banner içinde */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 12px' }}>
            <CalendarDays size={16} color="rgba(255,255,255,0.8)" />
            <p className="font-display font-bold" style={{ fontSize: 18, color: '#fff', marginTop: 6, letterSpacing: '-0.02em' }}>
              {mevcutHafta ? `${mevcutHafta}.` : '—'}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Mevcut Hafta</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Circular progress ring */}
            <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
              {/* Track */}
              <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={4} />
              {/* Progress */}
              <circle
                cx={22} cy={22} r={18} fill="none"
                stroke="#fff" strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={2 * Math.PI * 18 * (1 - ilerlemeYuzde / 100)}
                transform="rotate(-90 22 22)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              {/* Percentage text */}
              <text x={22} y={22} textAnchor="middle" dominantBaseline="central"
                fill="#fff" fontSize={9} fontWeight={700} fontFamily="var(--font-display)">
                %{ilerlemeYuzde}
              </text>
            </svg>
            <div>
              <p className="font-display font-bold" style={{ fontSize: 13, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                {36 - (mevcutHafta ?? 0)} hafta kaldı
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>Yıllık İlerleme</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SINIF SWITCHER (çoklu plan varsa) ── */}
      {planlar.length > 1 && (
        <div style={{ padding: '10px 16px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {planlar.map(entry => {
            const sinifAd = entry.sinifGercek || entry.sinif
            const aktif = entry.sinif === activeEntry?.sinif
            const renk = SINIF_RENKLERI[planlar.indexOf(entry) % SINIF_RENKLERI.length]
            return (
              <button
                key={entry.sinif}
                onClick={() => onSinifSec(entry.sinif)}
                style={{
                  flexShrink: 0,
                  height: 32, padding: '0 14px', borderRadius: 100,
                  border: `1.5px solid ${aktif ? renk : 'var(--color-border)'}`,
                  background: aktif ? `${renk}18` : 'var(--color-surface)',
                  color: aktif ? renk : 'var(--color-text2)',
                  fontSize: 12, fontWeight: aktif ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                  fontFamily: 'inherit',
                }}
              >
                {sinifAd}
              </button>
            )
          })}
        </div>
      )}

      {/* ── BUGÜNÜN DERSLERİ ─────────────────── */}
      {dersProgramiDolu && (() => {
        const liste = bugunDersleri().map(ders => {
          const entry = planlar.find(p => p.sinif === ders.sinif)
          const haftaNo = entry ? bugunHaftaNoHesapla(entry) : null
          const hafta = entry && haftaNo ? entry.plan?.haftalar.find(h => h.haftaNo === haftaNo) : null
          const renk = SINIF_RENKLERI[planlar.indexOf(entry!) % SINIF_RENKLERI.length] || '#4F6AF5'
          return { ders, entry, hafta, renk }
        })
        if (liste.length === 0) return null
        return (
          <div style={{ padding: '16px 16px 0' }}>
            <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>📋</span>
                  <div>
                    <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Bugünün Dersleri</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>{liste.length} ders • İşaretleyerek ilerle</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/planla/ders-programi')}
                  className="flex items-center gap-1 font-sans font-semibold"
                  style={{ fontSize: 12, color: 'var(--color-primary)' }}
                >
                  Program <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex flex-col">
                {liste.map(({ ders, entry, hafta, renk }, i) => {
                  const tamamlandi = tamamlananBugun.includes(ders.saat)
                  return (
                    <div
                      key={`${ders.gun}-${ders.saat}`}
                      className="flex items-center gap-3"
                      style={{ padding: '9px 0', borderBottom: i < liste.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    >
                      {/* Saat numarası */}
                      <span className="font-display font-bold flex-shrink-0" style={{ fontSize: 12, color: 'var(--color-text3)', width: 18, textAlign: 'center' }}>
                        {ders.saat}.
                      </span>
                      {/* Sınıf badge */}
                      <span className="font-sans font-bold flex-shrink-0" style={{
                        fontSize: 11, color: renk,
                        background: `${renk}18`,
                        padding: '2px 8px', borderRadius: 100,
                      }}>
                        {sinifEtiket(ders.sinif, ders.sube)}
                      </span>
                      {/* Kazanım */}
                      <p style={{
                        fontSize: 13, flex: 1,
                        color: tamamlandi ? 'var(--color-text3)' : 'var(--color-text1)',
                        textDecoration: tamamlandi ? 'line-through' : 'none',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {hafta?.kazanim || entry?.plan?.haftalar[0]?.uniteAdi || ders.ders || '—'}
                      </p>
                      {/* Checkbox */}
                      <button
                        onClick={() => handleBugunToggle(ders.saat)}
                        className="flex items-center justify-center flex-shrink-0 rounded-full"
                        style={{
                          width: 22, height: 22,
                          border: `2px solid ${tamamlandi ? 'var(--color-success)' : 'var(--color-border2)'}`,
                          background: tamamlandi ? 'var(--color-success)' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {tamamlandi && <Check size={11} strokeWidth={3} color="#fff" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── SIRADAKİ KAZANIMLAR (ders programı yokken) ─────────── */}
      {!dersProgramiDolu && (() => {
        const baslangicHafta = mevcutHafta ?? 1
        const siradaki = planlar
          .flatMap(entry => {
            const renkIdx = planlar.indexOf(entry)
            return (entry.plan?.haftalar ?? [])
              .filter(h => h.haftaNo >= baslangicHafta)
              .map(h => ({ entry, hafta: h, renkIdx }))
          })
          .sort((a, b) => a.hafta.haftaNo - b.hafta.haftaNo)
          .slice(0, 6)

        if (siradaki.length === 0) return null

        return (
          <div style={{ padding: '16px 16px 0' }}>
            <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>📋</span>
                  <div>
                    <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Sıradaki Kazanımlar</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>Yıllık plana göre</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/planla')}
                  className="flex items-center gap-1 font-sans font-semibold"
                  style={{ fontSize: 12, color: 'var(--color-primary)' }}
                >
                  Tüm Plan <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex flex-col">
                {siradaki.map(({ entry, hafta, renkIdx }, i) => {
                  const renk = SINIF_RENKLERI[renkIdx % SINIF_RENKLERI.length] || '#4F6AF5'
                  const sinifTamamlananlar = localTamamlananlar[entry.sinif] || []
                  const isTamamlandi = sinifTamamlananlar.includes(hafta.haftaNo)
                  return (
                    <div
                      key={`${entry.sinif}-${hafta.haftaNo}`}
                      className="flex items-center gap-3"
                      style={{ padding: '9px 0', borderBottom: i < siradaki.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    >
                      {/* Hafta numarası */}
                      <span className="font-display font-bold flex-shrink-0" style={{ fontSize: 11, color: 'var(--color-text3)', width: 24, textAlign: 'center' }}>
                        {hafta.haftaNo}.
                      </span>
                      {/* Sınıf badge */}
                      <span className="font-sans font-bold flex-shrink-0" style={{ fontSize: 11, color: renk, background: `${renk}18`, padding: '2px 8px', borderRadius: 100 }}>
                        {entry.sinifGercek || entry.sinif}
                      </span>
                      {/* Kazanım */}
                      <p style={{ fontSize: 13, flex: 1, color: isTamamlandi ? 'var(--color-text3)' : 'var(--color-text1)', textDecoration: isTamamlandi ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hafta.kazanim || (hafta as { uniteAdi?: string }).uniteAdi || 'Kazanım girilmemiş'}
                      </p>
                      {/* Navigate */}
                      <button
                        onClick={() => { onSinifSec(entry.sinif); navigate(`/app/hafta/${hafta.haftaNo}`) }}
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text3)' }}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── ARAÇLARIM — EVRAK & ÜRET ─────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <p className="font-sans font-bold" style={{ fontSize: 11, color: 'var(--color-text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Araçlarım
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

          {/* Evrak Oluştur */}
          <button
            onClick={() => navigate('/app/dosyam')}
            style={{
              background: 'linear-gradient(135deg, #4F6AF5 0%, #6D28D9 100%)',
              borderRadius: 18, padding: '16px 14px', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              minHeight: 110, overflow: 'hidden',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} color="#fff" />
            </div>
            <div style={{ marginTop: 'auto', textAlign: 'left' }}>
              <p className="font-display font-bold" style={{ fontSize: 14, color: '#fff', letterSpacing: '-0.02em' }}>Evrak Oluştur</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Tek tıkla hazırla</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: 100 }}>
              {belgeSayisi} şablon
            </span>
          </button>

          {/* Üret */}
          <button
            onClick={() => navigate('/app/uret')}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #0EA5E9 100%)',
              borderRadius: 18, padding: '16px 14px', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              minHeight: 110, overflow: 'hidden',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div style={{ marginTop: 'auto', textAlign: 'left' }}>
              <p className="font-display font-bold" style={{ fontSize: 14, color: '#fff', letterSpacing: '-0.02em' }}>Üret</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>AI ile içerik oluştur</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: 100 }}>
              AI Destekli
            </span>
          </button>
        </div>
      </div>

      {/* ── HIZLI ERİŞİM ─────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <p className="font-sans font-bold" style={{ fontSize: 13, color: 'var(--color-text1)', marginBottom: 10 }}>
          Hızlı Erişim
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {HIZLI_ERISIM.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
                style={{ background: item.bg, border: '1px solid transparent', padding: '18px 12px', transition: 'transform 0.15s' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 44, height: 44, background: item.renk }}
                >
                  <Icon size={22} color="#fff" />
                </div>
                <div>
                  <p className="font-sans font-bold" style={{ fontSize: 13, color: 'var(--color-text1)' }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>{item.alt}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── SINIFLARIM ─────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} style={{ color: 'var(--color-accent)' }} />
            <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Sınıflarım</p>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            {planlar.map((entry, i) => {
              const sinifAd = entry.sinifGercek || entry.sinif
              const sinifNo = parseInt(sinifAd) || (i + 1)
              const renk = SINIF_RENKLERI[i % SINIF_RENKLERI.length]
              return (
                <div
                  key={entry.sinif}
                  className="flex items-center gap-3"
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="flex items-center justify-center font-display font-bold flex-shrink-0 rounded-lg"
                    style={{ width: 32, height: 32, background: renk, color: '#fff', fontSize: 14 }}
                  >
                    {sinifNo}
                  </div>
                  <p className="font-sans font-semibold flex-1" style={{ fontSize: 14, color: 'var(--color-text1)' }}>
                    {sinifAd}
                  </p>
                  <span
                    className="font-sans font-semibold"
                    style={{ fontSize: 12, color: 'var(--color-primary)', background: 'var(--color-primary-s)', padding: '2px 10px', borderRadius: 'var(--radius-pill)' }}
                  >
                    Aktif
                  </span>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => navigate('/app/planla')}
            className="flex items-center gap-1 font-sans font-semibold w-full justify-center"
            style={{ fontSize: 13, color: 'var(--color-primary)', padding: '8px 0', borderTop: '1px solid var(--color-border)' }}
          >
            Planları Gör <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── EVRAK DURUMU ───────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--color-navy)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} color="rgba(255,255,255,0.7)" />
            <p className="font-sans font-semibold" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Evrak Durumu</p>
          </div>
          <p className="font-display font-bold" style={{ fontSize: 26, color: '#fff', letterSpacing: '-0.03em', marginBottom: 2 }}>
            {belgeSayisi} Evrak
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>Bu dönem oluşturuldu</p>
          <button
            onClick={() => navigate('/app/dosyam')}
            className="w-full flex items-center justify-center gap-2 font-sans font-bold"
            style={{ height: 42, borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, cursor: 'pointer' }}
          >
            <FileText size={15} /> Evrak Merkezi
          </button>
        </div>
      </div>

      {/* Ders programı promptu */}
      {!dersProgramiDolu && (
        <div style={{ padding: '16px 16px 0' }}>
          <button
            onClick={() => navigate('/app/planla/ders-programi')}
            className="w-full flex items-center gap-3 rounded-xl px-4"
            style={{ height: 52, background: 'var(--color-primary-s)', border: '1px solid var(--color-primary-b)', cursor: 'pointer' }}
          >
            <Clock size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div className="flex-1 text-left">
              <p className="font-sans font-bold" style={{ fontSize: 13, color: 'var(--color-text1)' }}>Ders programını ekle</p>
              <p style={{ fontSize: 11, color: 'var(--color-text2)' }}>Yıllık plan otomatik hazırlanır</p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          </button>
        </div>
      )}
    </div>
  )
}
