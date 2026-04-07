import { useState, useRef } from 'react'
import { Search, ArrowLeft, School } from 'lucide-react'
import { BRANCHES, type Branch } from '../../lib/branchConfig'
import { buildPlan } from '../../lib/planBuilder'
import { getYilSecenekleri } from '../../lib/dersSinifMap'
import { StorageKeys } from '../../lib/storageKeys'
import type { PlanEntry } from '../../types/planEntry'
import type { OgretmenAyarlari } from '../../types/ogretmenAyarlari'

interface OnboardingModalProps {
  onTamamla: (entries: PlanEntry[]) => void
}

// Adım: 0 = branş/sınıf, 1 = okul bilgisi, 2 = tebrik
type Adim = 0 | 1 | 2

export function OnboardingModal({ onTamamla }: OnboardingModalProps) {
  const [query, setQuery]                   = useState('')
  const [seciliBransId, setSeciliBransId]   = useState<string | null>(null)
  const [seciliSiniflar, setSeciliSiniflar] = useState<string[]>([])
  const [loading, setLoading]               = useState(false)
  const [adim, setAdim]                     = useState<Adim>(0)
  const [tebrikData, setTebrikData]         = useState<{ ders: string; siniflar: string[] } | null>(null)
  const [tamamlananEntries, setTamamlananEntries] = useState<PlanEntry[]>([])
  const [okulAdi, setOkulAdi]               = useState('')
  const [mudurAdi, setMudurAdi]             = useState('')
  const yil = getYilSecenekleri()[0]
  const sinifSecRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? BRANCHES.filter(b => b.label.toLowerCase().includes(query.toLowerCase()))
    : BRANCHES

  const popular = filtered.filter(b => b.popular)
  const rest    = filtered.filter(b => !b.popular)
  const seciliBrans = BRANCHES.find(b => b.id === seciliBransId) ?? null

  function handleBransToggle(branch: Branch) {
    if (seciliBransId === branch.id) {
      setSeciliBransId(null)
      setSeciliSiniflar([])
    } else {
      setSeciliBransId(branch.id)
      setSeciliSiniflar([branch.classes[0]])
      setTimeout(() => {
        sinifSecRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }

  function handleSinifToggle(sinif: string) {
    setSeciliSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    )
  }

  function handleDevamSinif() {
    if (!seciliBrans || seciliSiniflar.length === 0) return
    setAdim(1)
  }

  function kaydetOkulBilgisi() {
    try {
      const mevcut = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      const obj: Partial<OgretmenAyarlari> = mevcut ? JSON.parse(mevcut) : {}
      obj.okulAdi = okulAdi.trim()
      if (mudurAdi.trim()) obj.mudurAdi = mudurAdi.trim()
      localStorage.setItem(StorageKeys.OGRETMEN_AYARLARI, JSON.stringify(obj))
    } catch {
      // sessizce geç — kritik değil
    }
  }

  async function handleOkulDevam() {
    if (!seciliBrans || seciliSiniflar.length === 0) return
    if (!okulAdi.trim()) return
    kaydetOkulBilgisi()
    setLoading(true)
    try {
      const entries: PlanEntry[] = await Promise.all(
        seciliSiniflar.map(async sinif => {
          const { plan } = await buildPlan(seciliBrans.lessonId, sinif, yil)
          return { sinif, ders: seciliBrans.lessonId, yil, tip: 'meb' as const, plan, rows: null }
        })
      )
      setTamamlananEntries(entries)
      setTebrikData({ ders: seciliBrans.label, siniflar: seciliSiniflar })
      setLoading(false)
      setAdim(2)
    } catch {
      setLoading(false)
    }
  }

  // ── Adım 1: Okul bilgisi ──────────────────────────────────────────────────
  if (adim === 1) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'var(--color-bg)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        {/* Header — geri + progress dots + Atla */}
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => setAdim(0)}
            disabled={loading}
            aria-label="Geri"
            style={{
              background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px', color: 'var(--color-text2)', display: 'flex', alignItems: 'center',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ height: '3px', borderRadius: '100px', background: 'rgba(79,106,245,.35)', width: '20px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
            <div style={{ height: '3px', borderRadius: '100px', background: '#4F6AF5', width: '40px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
            <div style={{ height: '3px', borderRadius: '100px', background: 'var(--color-border)', width: '20px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
          <button
            onClick={async () => {
              // Atla = okul bilgisi olmadan plan oluştur
              if (!seciliBrans || seciliSiniflar.length === 0 || loading) return
              setLoading(true)
              try {
                const entries: PlanEntry[] = await Promise.all(
                  seciliSiniflar.map(async sinif => {
                    const { plan } = await buildPlan(seciliBrans.lessonId, sinif, yil)
                    return { sinif, ders: seciliBrans.lessonId, yil, tip: 'meb' as const, plan, rows: null }
                  })
                )
                setTamamlananEntries(entries)
                setTebrikData({ ders: seciliBrans.label, siniflar: seciliSiniflar })
                setLoading(false)
                setAdim(2)
              } catch { setLoading(false) }
            }}
            disabled={loading}
            style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--color-text3)',
              background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', padding: '4px 8px',
            }}
          >
            Atla
          </button>
        </div>

        {/* Başlık */}
        <div style={{ padding: '24px 20px 8px', flexShrink: 0, animation: 'stagger-up 0.45s 0.05s ease-out both' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#EEF1FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <School size={26} style={{ color: '#4F6AF5' }} />
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: '26px', fontWeight: 800, color: 'var(--color-text1)',
              letterSpacing: '-0.04em', lineHeight: '32px', marginBottom: '6px',
            }}
          >
            Okulunu tanıyalım
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text2)', lineHeight: '20px' }}>
            Evrak ve belgelerinde bu bilgiler otomatik kullanılacak.
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 16, animation: 'stagger-up 0.45s 0.12s ease-out both' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Okul Adı *
            </label>
            <input
              type="text"
              placeholder="Atatürk İlkokulu"
              value={okulAdi}
              onChange={e => setOkulAdi(e.target.value)}
              autoFocus
              style={{
                width: '100%', height: 52, padding: '0 18px',
                borderRadius: 16, border: '1.5px solid var(--color-border)',
                background: 'var(--color-surface)', fontSize: 15, fontWeight: 500,
                color: 'var(--color-text1)', outline: 'none', boxShadow: 'var(--shadow-xs)',
                fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4F6AF5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,106,245,.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Müdür Adı <span style={{ color: 'var(--color-text3)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(opsiyonel)</span>
            </label>
            <input
              type="text"
              placeholder="Sonra eklenebilir"
              value={mudurAdi}
              onChange={e => setMudurAdi(e.target.value)}
              style={{
                width: '100%', height: 52, padding: '0 18px',
                borderRadius: 16, border: '1.5px solid var(--color-border)',
                background: 'var(--color-surface)', fontSize: 15, fontWeight: 500,
                color: 'var(--color-text1)', outline: 'none', boxShadow: 'var(--shadow-xs)',
                fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4F6AF5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,106,245,.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
            />
          </div>
        </div>

        {/* Devam butonu */}
        <div style={{
          marginTop: 'auto', position: 'sticky', bottom: 0, padding: '16px 20px 32px',
          background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
        }}>
          <button
            onClick={handleOkulDevam}
            disabled={loading || !okulAdi.trim()}
            style={{
              width: '100%', height: '52px', borderRadius: '100px',
              background: (loading || !okulAdi.trim()) ? 'rgba(79,106,245,.4)' : '#4F6AF5',
              color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700,
              cursor: (loading || !okulAdi.trim()) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(79,106,245,.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Plan hazırlanıyor…
              </>
            ) : (
              'Devam Et →'
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Tebrik ekranı ─────────────────────────────────────────────────────────
  if (adim === 2 && tebrikData) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'var(--color-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', textAlign: 'center',
      }}>
        {/* Progress dots — adım 2 (son) */}
        <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ height: '3px', borderRadius: '100px', background: 'rgba(79,106,245,.35)', width: '20px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
          <div style={{ height: '3px', borderRadius: '100px', background: 'rgba(79,106,245,.35)', width: '20px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
          <div style={{ height: '3px', borderRadius: '100px', background: '#4F6AF5', width: '40px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>

        {/* İçerik */}
        <div style={{ fontSize: '72px', marginBottom: '20px', animation: 'celebrate 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          🎉
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: '28px', fontWeight: 800, color: 'var(--color-text1)',
            letterSpacing: '-0.04em', marginBottom: '12px',
            animation: 'stagger-up 0.5s 0.15s ease-out both',
          }}
        >
          Planınız hazır!
        </h2>

        <p style={{
          fontSize: '15px', color: 'var(--color-text2)', lineHeight: '24px',
          marginBottom: '8px', animation: 'stagger-up 0.5s 0.25s ease-out both',
        }}>
          {tebrikData.ders} branşı
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center',
          marginBottom: '36px', animation: 'stagger-up 0.5s 0.32s ease-out both',
        }}>
          {tebrikData.siniflar.map(s => (
            <span
              key={s}
              style={{
                fontSize: '13px', fontWeight: 700, color: '#4F6AF5',
                background: 'rgba(79,106,245,.1)', padding: '4px 12px',
                borderRadius: '100px',
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <div style={{
          width: '100%', maxWidth: '320px',
          animation: 'stagger-up 0.5s 0.4s ease-out both',
        }}>
          <button
            onClick={() => onTamamla(tamamlananEntries)}
            style={{
              width: '100%', height: '54px', borderRadius: '100px',
              background: '#4F6AF5', color: '#fff', border: 'none',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(79,106,245,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            Hadi Başlayalım! →
          </button>
        </div>

        <p style={{
          fontSize: '12px', color: 'var(--color-text3)', marginTop: '16px', lineHeight: '18px',
          animation: 'stagger-up 0.5s 0.5s ease-out both',
        }}>
          Ders programını daha sonra ekleyebilirsiniz.
        </p>
      </div>
    )
  }

  // ── Ana onboarding ekranı (adım 0) ─────────────────────────────────────
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>

      {/* Header — progress dots + Atla */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {([0, 1, 2] as const).map(i => (
            <div
              key={i}
              style={{
                height: '3px', borderRadius: '100px',
                background: i === 0 ? '#4F6AF5' : 'var(--color-border)',
                width: i === 0 ? '40px' : '20px',
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          ))}
        </div>
        <button
          onClick={() => onTamamla([])}
          style={{
            fontSize: '14px', fontWeight: 600, color: 'var(--color-text3)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
          }}
        >
          Atla
        </button>
      </div>

      {/* Başlık */}
      <div style={{ padding: '24px 20px 16px', flexShrink: 0, animation: 'stagger-up 0.45s 0.05s ease-out both' }}>
        <h1
          className="font-display"
          style={{
            fontSize: '26px', fontWeight: 800, color: 'var(--color-text1)',
            letterSpacing: '-0.04em', lineHeight: '32px', marginBottom: '6px',
          }}
        >
          Merhaba! Branşınızı seçelim
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text2)', lineHeight: '20px' }}>
          Yıllık planınız saniyeler içinde hazırlanacak.
        </p>
      </div>

      {/* Arama */}
      <div style={{ padding: '0 20px 16px', flexShrink: 0, position: 'relative', animation: 'stagger-up 0.45s 0.1s ease-out both' }}>
        <Search size={18} style={{ position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text3)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Branş ara…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%', height: '44px', paddingLeft: '44px', paddingRight: '16px',
            borderRadius: '100px', border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', fontSize: '15px', fontWeight: 500,
            color: 'var(--color-text1)', outline: 'none',
            boxShadow: 'var(--shadow-xs)', fontFamily: 'inherit',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#4F6AF5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,106,245,.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
        />
      </div>

      {/* Branş chip'leri */}
      <div style={{ padding: '0 20px', flexShrink: 0 }}>
        {!query && popular.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {popular.map((branch, idx) => {
              const sel = seciliBransId === branch.id
              const Icon = branch.icon
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBransToggle(branch)}
                  className={`stagger-${(idx % 5) + 1}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    height: '44px', padding: '0 16px', borderRadius: '100px',
                    border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`,
                    background: sel ? '#EEF1FE' : 'var(--color-surface)',
                    color: sel ? '#1B2E5E' : 'var(--color-text2)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: sel ? '0 4px 12px rgba(79,106,245,.2)' : 'var(--shadow-xs)',
                    transform: sel ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                    animation: `stagger-up 0.4s ${0.12 + idx * 0.04}s ease-out both`,
                  }}
                >
                  <Icon size={16} style={{ color: sel ? '#4F6AF5' : 'var(--color-text3)', flexShrink: 0 }} />
                  {branch.label}
                </button>
              )
            })}
          </div>
        )}

        {(query ? filtered : rest).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {(query ? filtered : rest).map((branch, idx) => {
              const sel = seciliBransId === branch.id
              const Icon = branch.icon
              const baseDelay = query ? 0.08 : (popular.length * 0.04 + 0.12)
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBransToggle(branch)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    height: '44px', padding: '0 16px', borderRadius: '100px',
                    border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`,
                    background: sel ? '#EEF1FE' : 'var(--color-surface)',
                    color: sel ? '#1B2E5E' : 'var(--color-text2)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: sel ? '0 4px 12px rgba(79,106,245,.2)' : 'var(--shadow-xs)',
                    transform: sel ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                    animation: `stagger-up 0.4s ${baseDelay + idx * 0.03}s ease-out both`,
                  }}
                >
                  <Icon size={16} style={{ color: sel ? '#4F6AF5' : 'var(--color-text3)', flexShrink: 0 }} />
                  {branch.label}
                </button>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text3)', padding: '32px 0' }}>
            "{query}" için sonuç bulunamadı
          </p>
        )}
      </div>

      {/* Sınıf seçimi — branş seçilince animasyonla açılır */}
      {seciliBrans && (
        <div
          ref={sinifSecRef}
          style={{
            padding: '8px 20px 24px', flexShrink: 0,
            animation: 'pop-in 0.32s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: '22px', fontWeight: 800, color: 'var(--color-text1)',
              letterSpacing: '-0.03em', marginBottom: '4px',
            }}
          >
            Hangi sınıflarda ders veriyorsunuz?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text2)', marginBottom: '16px' }}>
            Birden fazla sınıf seçebilirsiniz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: '18px', padding: '16px', boxShadow: 'var(--shadow-xs)',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '12px' }}>
                {seciliBrans.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {seciliBrans.classes.map((sinif, idx) => {
                  const sel = seciliSiniflar.includes(sinif)
                  return (
                    <button
                      key={sinif}
                      onClick={() => handleSinifToggle(sinif)}
                      style={{
                        height: '36px', padding: '0 14px', borderRadius: '100px',
                        border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`,
                        background: sel ? '#4F6AF5' : 'var(--color-bg)',
                        color: sel ? '#fff' : 'var(--color-text2)',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        transform: sel ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: sel ? '0 3px 10px rgba(79,106,245,.3)' : 'none',
                        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                        animation: `stagger-up 0.35s ${idx * 0.04}s ease-out both`,
                      }}
                    >
                      {sinif}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Devam Et butonu — sabit alt */}
      {seciliBrans && seciliSiniflar.length > 0 && (
        <div style={{
          position: 'sticky', bottom: 0, padding: '12px 20px 32px',
          background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
          flexShrink: 0, animation: 'stagger-up 0.4s 0.1s ease-out both',
        }}>
          <button
            onClick={handleDevamSinif}
            style={{
              width: '100%', height: '52px', borderRadius: '100px',
              background: '#4F6AF5',
              color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(79,106,245,.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {seciliSiniflar.length === 1
              ? `${seciliBrans.label} · ${seciliSiniflar[0]} · Devam →`
              : `${seciliBrans.label} · ${seciliSiniflar.length} sınıf · Devam →`}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
