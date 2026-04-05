import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, CalendarDays, Check, ChevronRight,
  Clock, FileText, TrendingUp, Users, Sparkles, Bell,
} from 'lucide-react'
import type { PlanEntry } from '../types/planEntry'
import { StorageKeys } from '../lib/storageKeys'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { getEvrakSablonlari, tespitEksikAlanlar } from '../lib/evrakService'
import { useDersProgrami } from '../hooks/useDersProgrami'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'

interface AppHomeScreenProps {
  planlar: PlanEntry[]
  onPlanEkle: (entries: PlanEntry[]) => void
  onSinifSec: (sinif: string) => void
  syncing?: boolean
  tamamlananlar?: Record<string, number[]>
  onTamamlananGuncelle?: () => void
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
  planlar, onPlanEkle, onSinifSec,
  tamamlananlar = {}, onTamamlananGuncelle,
}: AppHomeScreenProps) {
  const navigate = useNavigate()
  const [ogretmenAd, setOgretmenAd] = useState('')
  const [, setUretimHakki] = useState(0)
  const [, setEksikAyarlar] = useState(false)
  const [localTamamlananlar, setLocalTamamlananlar] = useState<Record<string, number[]>>(tamamlananlar)

  const { program: dersProgrami } = useDersProgrami()
  const { tarihler } = useOnemliTarihler()

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

  function handleTamamlaToggle(sinif: string, haftaNo: number) {
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = item ? JSON.parse(item) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[sinif] || [])
      const isTamamlandi = eskiListe.includes(haftaNo)
      const yeniListe = isTamamlandi ? eskiListe.filter(n => n !== haftaNo) : [...eskiListe, haftaNo]
      const yeniParsed = Array.isArray(parsed) ? { [sinif]: yeniListe } : { ...parsed, [sinif]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      setLocalTamamlananlar(yeniParsed)
      onTamamlananGuncelle?.()
    } catch { /* ignore */ }
  }

  if (planlar.length === 0) {
    return (
      <BosdurumuEkrani
        onTamamla={entries => {
          localStorage.setItem(StorageKeys.ONBOARDING_TAMAMLANDI, '1')
          onPlanEkle(entries)
          onSinifSec(entries[0].sinif)
        }}
      />
    )
  }

  // Aktif plan verileri
  const activeEntry = planlar[0]
  const brans = planlar[0]?.ders ?? ''
  const siniflar = planlar.map(p => p.sinifGercek || p.sinif)
  const mevcutHafta = activeEntry ? bugunHaftaNoHesapla(activeEntry) : null
  const toplamHafta = activeEntry?.plan?.haftalar?.length ?? 36
  const ilerlemeYuzde = mevcutHafta ? Math.round(((mevcutHafta - 1) / toplamHafta) * 100) : 0

  // Bu hafta listesi
  const buHaftaListesi = planlar
    .map(entry => {
      const haftaNo = bugunHaftaNoHesapla(entry)
      if (!haftaNo) return null
      const hafta = entry.plan?.haftalar.find(h => h.haftaNo === haftaNo)
      if (!hafta) return null
      const sinifTamamlananlar = localTamamlananlar[entry.sinif] || []
      return { entry, hafta, isTamamlandi: sinifTamamlananlar.includes(haftaNo) }
    })
    .filter(Boolean) as { entry: PlanEntry; hafta: NonNullable<PlanEntry['plan']>['haftalar'][number]; isTamamlandi: boolean }[]

  // Yaklaşan tarihler (önümüzdeki 30 gün)
  const bugun = new Date()
  const yaklasanTarihler = tarihler
    .filter(t => {
      const d = new Date(t.tarih)
      const diff = (d.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 30
    })
    .slice(0, 3)

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
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          <button
            onClick={() => navigate('/app/planla')}
            className="flex items-center gap-2 font-sans font-semibold"
            style={{ height: 38, padding: '0 16px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 13, cursor: 'pointer' }}
          >
            <Sparkles size={14} /> Plan Oluştur
          </button>
          <button
            onClick={() => navigate('/app/dosyam')}
            className="flex items-center gap-2 font-sans font-semibold"
            style={{ height: 38, padding: '0 16px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 13, cursor: 'pointer' }}
          >
            <FileText size={14} /> Evrak İndir
          </button>
        </div>

        {/* Stat mini-kartlar — banner içinde */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, position: 'relative' }}>
          {([
            { icon: BookOpen,     label: 'Branş',    value: brans || '—' },
            { icon: Users,        label: 'Sınıf',    value: `${planlar.length} Sınıf` },
            { icon: CalendarDays, label: 'Hafta',    value: mevcutHafta ? `${mevcutHafta}. Hafta` : '—' },
            { icon: TrendingUp,   label: 'İlerleme', value: `%${ilerlemeYuzde}` },
          ] as const).map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 14,
              padding: '10px 12px',
            }}>
              <Icon size={14} color="rgba(255,255,255,0.65)" />
              <p className="font-display font-bold" style={{ fontSize: 15, color: '#fff', marginTop: 6, letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BU HAFTANIN KAZANIMLARI ─────────── */}
      {buHaftaListesi.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 16 }}>⭐</span>
                <div>
                  <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>
                    Bu Haftanın Kazanımları
                  </p>
                  {buHaftaListesi[0] && (
                    <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>
                      {buHaftaListesi[0].hafta.haftaNo}. Hafta • {buHaftaListesi[0].entry.ders}
                    </p>
                  )}
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

            <div className="flex flex-col gap-2">
              {buHaftaListesi.map(({ entry, hafta, isTamamlandi }) => (
                <div
                  key={`${entry.sinif}-${hafta.haftaNo}`}
                  className="flex items-center gap-3"
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => handleTamamlaToggle(entry.sinif, hafta.haftaNo)}
                    className="flex items-center justify-center flex-shrink-0 rounded-full"
                    style={{
                      width: 22, height: 22,
                      border: `2px solid ${isTamamlandi ? 'var(--color-success)' : 'var(--color-border2)'}`,
                      background: isTamamlandi ? 'var(--color-success)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {isTamamlandi && <Check size={11} strokeWidth={3} color="#fff" />}
                  </button>
                  <p
                    style={{
                      fontSize: 13, color: isTamamlandi ? 'var(--color-text3)' : 'var(--color-text1)',
                      textDecoration: isTamamlandi ? 'line-through' : 'none',
                      flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {hafta.kazanim || 'Kazanım girilmemiş'}
                  </p>
                  <button
                    onClick={() => { onSinifSec(entry.sinif); navigate(`/app/hafta/${hafta.haftaNo}`) }}
                    style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text3)' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
              {/* Son satırın border'ını kaldır */}
              <style>{`.kazanim-row:last-child { border-bottom: none; }`}</style>
            </div>
          </div>
        </div>
      )}

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

      {/* ── YAKLAŞAN TARİHLER ──────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={16} style={{ color: 'var(--color-warning)' }} />
              <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Yaklaşan Tarihler</p>
            </div>
            <button
              onClick={() => navigate('/app/planla/takvim')}
              className="font-sans font-semibold"
              style={{ fontSize: 12, color: 'var(--color-primary)' }}
            >
              Hepsi
            </button>
          </div>

          {yaklasanTarihler.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <CalendarDays size={28} style={{ color: 'var(--color-text3)' }} />
              <p style={{ fontSize: 13, color: 'var(--color-text3)' }}>Yaklaşan tarih yok</p>
              <button
                onClick={() => navigate('/app/planla/takvim')}
                className="font-sans font-semibold"
                style={{ fontSize: 13, color: 'var(--color-primary)' }}
              >
                Tarih Ekle
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {yaklasanTarihler.map(tarih => (
                <div
                  key={tarih.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <div
                    className="flex-shrink-0 rounded-lg flex flex-col items-center justify-center"
                    style={{ width: 36, height: 36, background: 'var(--color-primary-s)' }}
                  >
                    <p className="font-display font-bold" style={{ fontSize: 14, color: 'var(--color-primary)', lineHeight: 1 }}>
                      {new Date(tarih.tarih).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold truncate" style={{ fontSize: 13, color: 'var(--color-text1)' }}>{tarih.baslik}</p>
                    {tarih.aciklama && (
                      <p className="truncate" style={{ fontSize: 11, color: 'var(--color-text3)' }}>{tarih.aciklama}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
