import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, Calendar, Folder, Sparkles } from 'lucide-react'
import type { PlanEntry } from '../types/planEntry'
import { StorageKeys } from '../lib/storageKeys'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { BugunDersleri } from '../components/Home/BugunDersleri'
import { useDersProgrami } from '../hooks/useDersProgrami'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'

interface AppHomeScreenProps {
  planlar: PlanEntry[]
  onPlanEkle: (entries: PlanEntry[]) => void
  onSinifSec: (sinif: string) => void
  syncing?: boolean
  tamamlananlar?: Record<string, number[]>
}

function selamMesaji(): string {
  const saat = new Date().getHours()
  if (saat >= 6 && saat < 12) return 'GÃ¼naydÄ±n'
  if (saat >= 12 && saat < 18) return 'Ä°yi gÃ¼nler'
  if (saat >= 18 && saat < 22) return 'Ä°yi akÅŸamlar'
  return 'Ä°yi geceler'
}

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec }: AppHomeScreenProps) {
  const navigate = useNavigate()
  const [ogretmenAd, setOgretmenAd] = useState('')

  useEffect(() => {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      if (item) {
        const parsed = JSON.parse(item)
        if (parsed.adSoyad) setOgretmenAd(parsed.adSoyad.trim().split(' ')[0])
      }
    } catch { /* ignore */ }
  }, [])

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* â”€â”€ TOPBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        style={{
          padding: '12px 20px 12px 20px',
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
              color: '#0C0C0B',
              letterSpacing: '-0.04em',
            }}
          >
            {ogretmenAd ? `${selamMesaji()}, ${ogretmenAd}` : selamMesaji()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {}}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(0, 0, 0, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 1px 2px rgba(0,0,0,.04)',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            <Bell size={18} style={{ color: '#52524F' }} />
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#DC2626',
                border: '2px solid #F4F3F0',
                animation: 'ndot-pulse 2s ease-in-out infinite',
              }}
            />
          </button>

          <button
            onClick={() => navigate('/app/ayarlar')}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(0, 0, 0, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 1px 2px rgba(0,0,0,.04)',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            <Settings size={18} style={{ color: '#52524F' }} />
          </button>
        </div>
      </div>

      {/* â”€â”€ BENTO GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        style={{
          padding: '0 16px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}
      >
        {/* Acil Card (full width) */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '24px',
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
          }}
        >
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', color: '#D97706', marginBottom: '4px' }}>
            âš  ACÄ°L
          </p>
          <p
            style={{
              fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#0C0C0B',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}
          >
            Not giriÅŸi son gÃ¼nÃ¼
          </p>
          <p style={{ fontSize: '13px', color: '#52524F', marginBottom: '12px' }}>
            10-B sÄ±nÄ±fÄ± tamamlanmadÄ±
          </p>
        </div>

        {/* Tasarruf Card (full width with shimmer) */}
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 1px 2px rgba(0,0,0,.04)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #4F6AF5, #818cf8, #4F6AF5)',
              backgroundSize: '200%',
              borderRadius: '24px 24px 0 0',
              animation: 'shimmer 3s linear infinite',
            }}
          />

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#9B9B97', marginBottom: '8px', textTransform: 'uppercase' }}>
            Bu ay tasarruf
          </p>

          <p
            style={{
              fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
              fontSize: '52px',
              fontWeight: 800,
              color: '#0C0C0B',
              letterSpacing: '-0.06em',
              lineHeight: '56px',
            }}
          >
            6.5
          </p>

          <p style={{ fontSize: '14px', color: '#52524F', fontWeight: 500, marginBottom: '16px' }}>
            saat geri aldÄ±nÄ±z
          </p>

          <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '16px' }}>
            {['YazÄ±lÄ±', 'Evrak', 'Plan'].map((label, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#0C0C0B',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {['3.2s', '2.1s', '1.2s'][idx]}
                </p>
                <p style={{ fontSize: '10px', color: '#9B9B97', fontWeight: 600, marginTop: '2px' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Small Cards (2 col) */}
        <div
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '18px',
            padding: '16px',
            cursor: 'pointer',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#52524F' }}>Dosyam</p>
          <p
            style={{
              fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#0C0C0B',
            }}
          >
            14
          </p>
          <p style={{ fontSize: '10px', color: '#9B9B97', fontWeight: 600 }}>belge hazÄ±r</p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '18px',
            padding: '16px',
            cursor: 'pointer',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#52524F' }}>Jeton</p>
          <p
            style={{
              fontFamily: "var(--font-display), 'Bricolage Grotesque', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#0C0C0B',
            }}
          >
            7
          </p>
          <p style={{ fontSize: '10px', color: '#9B9B97', fontWeight: 600 }}>Ã¼retim hakkÄ±</p>
        </div>

        {/* Ders ProgramÄ± Prompt (full width) */}
        <div
          style={{
            gridColumn: '1 / -1',
            background: '#EEF1FE',
            border: '1px solid #C7D2FD',
            borderRadius: '18px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          <Calendar size={18} style={{ color: '#4F6AF5', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0C0C0B' }}>Ders programÄ±nÄ± ekle</p>
            <p style={{ fontSize: '11px', color: '#52524F' }}>YÄ±llÄ±k plan otomatik hazÄ±rlanÄ±r</p>
          </div>
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
