import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Calendar, Check, ChevronRight, Settings } from 'lucide-react'
import type { PlanEntry } from '../types/planEntry'
import { StorageKeys } from '../lib/storageKeys'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { getEvrakSablonlari, tespitEksikAlanlar } from '../lib/evrakService'
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

export function AppHomeScreen({
  planlar, onPlanEkle, onSinifSec,
  tamamlananlar = {}, onTamamlananGuncelle,
}: AppHomeScreenProps) {
  const navigate = useNavigate()
  const [ogretmenAd, setOgretmenAd] = useState('')
  const [uretimHakki, setUretimHakki] = useState(0)
  const [eksikAyarlar, setEksikAyarlar] = useState(false)
  // Optimistik UI: tamamlananlar yerel kopyası
  const [localTamamlananlar, setLocalTamamlananlar] = useState<Record<string, number[]>>(tamamlananlar)

  const freeBelgeler = getEvrakSablonlari().filter(s => !s.premium)
  const belgeSayisi = freeBelgeler.length
  const tasarrufSaat = Math.round((planlar.length * 1.5 + belgeSayisi * 0.5) * 10) / 10

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
      const yeniListe = isTamamlandi
        ? eskiListe.filter(n => n !== haftaNo)
        : [...eskiListe, haftaNo]
      const yeniParsed = Array.isArray(parsed)
        ? { [sinif]: yeniListe }
        : { ...parsed, [sinif]: yeniListe }
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

  // Aktif planlardan bu haftanın listesini oluştur
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

  const tumTamamlandi = buHaftaListesi.length > 0 && buHaftaListesi.every(i => i.isTamamlandi)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* ── TOPBAR ──────────────────────────────── */}
      <div
        style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ fontSize: '12px', color: '#9B9B97', fontWeight: 500, marginBottom: '2px' }}>
            {selamMesaji()}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-text1)',
              letterSpacing: '-0.04em',
            }}
          >
            {ogretmenAd ? `${selamMesaji()}, ${ogretmenAd}` : selamMesaji()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/app/ayarlar')}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(12px)',
              boxShadow: '0 1px 2px rgba(0,0,0,.04)',
              transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
              position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Bell size={18} style={{ color: '#52524F' }} />
            {eksikAyarlar && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#DC2626', border: '2px solid #F4F3F0',
                animation: 'ndot-pulse 2s ease-in-out infinite',
              }} />
            )}
          </button>

          <button
            onClick={() => navigate('/app/ayarlar')}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(12px)',
              boxShadow: '0 1px 2px rgba(0,0,0,.04)',
              transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Settings size={18} style={{ color: '#52524F' }} />
          </button>
        </div>
      </div>

      {/* ── BU HAFTA ────────────────────────────── */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)' }}>
            Bu Hafta
          </p>
          {tumTamamlandi && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Check size={10} strokeWidth={3} /> Hepsi tamamlandı
            </span>
          )}
        </div>

        {buHaftaListesi.length === 0 ? (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '16px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text3)' }}>Bu hafta ders dışı</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {buHaftaListesi.map(({ entry, hafta, isTamamlandi }) => (
              <div
                key={`${entry.sinif}-${hafta.haftaNo}`}
                style={{
                  background: isTamamlandi
                    ? 'color-mix(in srgb, #059669 6%, var(--color-surface))'
                    : 'var(--color-surface)',
                  border: `1px solid ${isTamamlandi ? 'color-mix(in srgb, #059669 25%, transparent)' : 'var(--color-border)'}`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {/* Tamamla butonu */}
                <button
                  onClick={() => handleTamamlaToggle(entry.sinif, hafta.haftaNo)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isTamamlandi ? '#059669' : 'var(--color-border)'}`,
                    background: isTamamlandi ? '#059669' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', marginTop: '1px',
                    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {isTamamlandi && <Check size={12} strokeWidth={3} color="#fff" />}
                </button>

                {/* İçerik */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {entry.label || entry.ders}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text3)', fontWeight: 600 }}>
                      {entry.sinifGercek || entry.sinif}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: '10px', fontWeight: 700,
                      color: 'var(--color-text3)', flexShrink: 0,
                    }}>
                      {hafta.haftaNo}. Hafta
                    </span>
                  </div>
                  <p style={{
                    fontSize: '13px', fontWeight: 500, color: isTamamlandi ? 'var(--color-text3)' : 'var(--color-text1)',
                    textDecoration: isTamamlandi ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: hafta.uniteAdi ? '2px' : 0,
                  }}>
                    {hafta.kazanim || 'Kazanım girilmemiş'}
                  </p>
                  {hafta.uniteAdi && (
                    <p style={{ fontSize: '11px', color: 'var(--color-text3)' }}>
                      {hafta.uniteAdi}
                    </p>
                  )}
                </div>

                {/* Detay ok */}
                <button
                  onClick={() => { onSinifSec(entry.sinif); navigate(`/app/hafta/${hafta.haftaNo}`) }}
                  style={{
                    flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                    padding: '2px', color: 'var(--color-text3)',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BENTO GRID ──────────────────────────── */}
      <div
        style={{
          padding: '8px 16px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}
      >
        {/* Eksik ayarlar uyarısı */}
        {eksikAyarlar && (
          <div
            onClick={() => navigate('/app/ayarlar')}
            style={{
              gridColumn: '1 / -1',
              background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: '16px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>Ayarlarınızı tamamlayın</p>
              <p style={{ fontSize: '11px', color: '#B45309' }}>Belge üretimi için profil bilgileri gerekli</p>
            </div>
            <ChevronRight size={14} style={{ color: '#B45309', flexShrink: 0 }} />
          </div>
        )}

        {/* Tasarruf Card */}
        <div
          style={{
            gridColumn: '1 / -1', padding: '20px',
            position: 'relative', overflow: 'hidden',
            borderRadius: '20px', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 1px 2px rgba(0,0,0,.04)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #4F6AF5, #818cf8, #4F6AF5)',
            backgroundSize: '200%', borderRadius: '20px 20px 0 0',
            animation: 'shimmer 3s linear infinite',
          }} />
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text3)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Bu ay tasarruf
          </p>
          <p style={{
            fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
            fontSize: '48px', fontWeight: 800, color: 'var(--color-text1)',
            letterSpacing: '-0.06em', lineHeight: '52px',
          }}>
            {tasarrufSaat}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text2)', fontWeight: 500, marginBottom: '14px' }}>
            saat geri aldınız
          </p>
          <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
            {[
              { label: 'Plan', deger: `${planlar.length > 0 ? Math.round(planlar.length * 1.5 * 10) / 10 : 0}s` },
              { label: 'Evrak', deger: `${Math.round(belgeSayisi * 0.5 * 10) / 10}s` },
              { label: 'Yazılı', deger: '0s' },
            ].map(({ label, deger }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <p style={{
                  fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
                  fontSize: '18px', fontWeight: 700, color: 'var(--color-text1)', letterSpacing: '-0.03em',
                }}>
                  {deger}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--color-text3)', fontWeight: 600, marginTop: '2px' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dosyam küçük kart */}
        <div
          onClick={() => navigate('/app/dosyam')}
          style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '18px', padding: '16px', cursor: 'pointer',
            minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text2)' }}>Dosyam</p>
          <p style={{
            fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
            fontSize: '24px', fontWeight: 800, color: 'var(--color-text1)',
          }}>
            {belgeSayisi}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--color-text3)', fontWeight: 600 }}>belge hazır</p>
        </div>

        {/* Üretim Hakkı küçük kart */}
        <div
          onClick={() => navigate('/app/uret')}
          style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '18px', padding: '16px', cursor: 'pointer',
            minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text2)' }}>Üretim Hakkı</p>
          <p style={{
            fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
            fontSize: '24px', fontWeight: 800, color: 'var(--color-text1)',
          }}>
            {uretimHakki}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--color-text3)', fontWeight: 600 }}>kalan hak</p>
        </div>

        {/* Ders Programı Prompt */}
        <div
          onClick={() => navigate('/app/planla/ders-programi')}
          style={{
            gridColumn: '1 / -1',
            background: '#EEF1FE', border: '1px solid #C7D2FD',
            borderRadius: '16px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            cursor: 'pointer',
          }}
        >
          <Calendar size={18} style={{ color: '#4F6AF5', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0C0C0B' }}>Ders programını ekle</p>
            <p style={{ fontSize: '11px', color: '#52524F' }}>Yıllık plan otomatik hazırlanır</p>
          </div>
          <ChevronRight size={14} style={{ color: '#4F6AF5', flexShrink: 0 }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes ndot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
        }
      `}</style>
    </div>
  )
}
