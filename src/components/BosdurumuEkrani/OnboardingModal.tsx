import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { BRANCHES, type Branch } from '../../lib/branchConfig'
import { buildPlan } from '../../lib/planBuilder'
import { getYilSecenekleri } from '../../lib/dersSinifMap'
import type { PlanEntry } from '../../types/planEntry'

interface OnboardingModalProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function OnboardingModal({ onTamamla }: OnboardingModalProps) {
  const [query, setQuery]                   = useState('')
  const [seciliBransId, setSeciliBransId]   = useState<string | null>(null)
  const [seciliSiniflar, setSeciliSiniflar] = useState<string[]>([])
  const [loading, setLoading]               = useState(false)
  const [tebrik, setTebrik]                 = useState<{ ders: string; siniflar: string[] } | null>(null)
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
      // Sınıf seçimine scroll
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

  async function handleOlustur() {
    if (!seciliBrans || seciliSiniflar.length === 0) return
    setLoading(true)
    try {
      const entries: PlanEntry[] = await Promise.all(
        seciliSiniflar.map(async sinif => {
          const { plan } = await buildPlan(seciliBrans.lessonId, sinif, yil)
          return { sinif, ders: seciliBrans.lessonId, yil, tip: 'meb' as const, plan, rows: null }
        })
      )
      setTebrik({ ders: seciliBrans.label, siniflar: seciliSiniflar })
      setLoading(false)
      setTimeout(() => onTamamla(entries), 2400)
    } catch {
      setLoading(false)
    }
  }

  // ── Tebrik ekranı ─────────────────────────────────────────────────────────
  if (tebrik) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px', animation: 'celebrate 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '28px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.04em', marginBottom: '12px', animation: 'stagger-up 0.5s 0.2s ease-out both' }}>
          Hazırsınız!
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text2)', lineHeight: '24px', marginBottom: '32px', animation: 'stagger-up 0.5s 0.3s ease-out both' }}>
          {tebrik.ders} branşı · {tebrik.siniflar.length} sınıf<br />
          <span style={{ color: 'var(--color-text3)', fontSize: '13px' }}>{tebrik.siniflar.join(', ')}</span>
        </p>
        <button
          onClick={() => onTamamla([])}
          style={{ width: '100%', maxWidth: '280px', height: '52px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,106,245,.35)', animation: 'stagger-up 0.5s 0.4s ease-out both' }}
        >
          Ana Ekrana Git
        </button>
        <p style={{ fontSize: '12px', color: 'var(--color-text3)', marginTop: '16px', lineHeight: '20px', animation: 'stagger-up 0.5s 0.5s ease-out both' }}>
          Ders programını daha sonra ekleyebilirsiniz.<br />
          Eklenince yıllık planınız otomatik hazırlanır.
        </p>
        <style>{`
          @keyframes celebrate {
            0%   { transform: scale(0.3) rotate(-20deg); opacity: 0; }
            60%  { transform: scale(1.2) rotate(5deg); }
            80%  { transform: scale(0.95) rotate(-2deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </div>,
      document.body
    )
  }

  // ── Ana onboarding ekranı ─────────────────────────────────────────────────
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Header — progress dots + Atla */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: '3px', borderRadius: '100px', background: i === 0 ? '#4F6AF5' : i === 1 ? 'rgba(79,106,245,.4)' : 'var(--color-border)', width: i === 0 ? '40px' : '20px', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
          ))}
        </div>
        <button onClick={() => onTamamla([])} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
          Atla
        </button>
      </div>

      {/* Başlık */}
      <div style={{ padding: '24px 20px 16px', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '26px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.04em', lineHeight: '32px', marginBottom: '4px' }}>
          Branşınızı seçin
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text2)', lineHeight: '20px' }}>
          Dersleriniz otomatik listelenecek.
        </p>
      </div>

      {/* Arama */}
      <div style={{ padding: '0 20px 16px', flexShrink: 0, position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text3)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Branş ara…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', height: '44px', paddingLeft: '44px', paddingRight: '16px', borderRadius: '100px', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text1)', outline: 'none', boxShadow: 'var(--shadow-xs)', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#4F6AF5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,106,245,.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
        />
      </div>

      {/* Branş chip'leri */}
      <div style={{ padding: '0 20px', flexShrink: 0 }}>
        {!query && popular.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {popular.map(branch => {
              const sel = seciliBransId === branch.id
              const Icon = branch.icon
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBransToggle(branch)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '44px', padding: '0 16px', borderRadius: '100px', border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`, background: sel ? '#EEF1FE' : 'var(--color-surface)', color: sel ? '#1B2E5E' : 'var(--color-text2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: sel ? '0 4px 12px rgba(79,106,245,.2)' : 'var(--shadow-xs)', transform: sel ? 'translateY(-2px)' : 'none', transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)' }}
                >
                  <Icon size={16} style={{ color: sel ? '#4F6AF5' : 'var(--color-text3)', flexShrink: 0 }} />
                  {branch.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Diğer branşlar — arama sonuçları veya tam liste */}
        {(query ? filtered : rest).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {(query ? filtered : rest).map(branch => {
              const sel = seciliBransId === branch.id
              const Icon = branch.icon
              return (
                <button
                  key={branch.id}
                  onClick={() => handleBransToggle(branch)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '44px', padding: '0 16px', borderRadius: '100px', border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`, background: sel ? '#EEF1FE' : 'var(--color-surface)', color: sel ? '#1B2E5E' : 'var(--color-text2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: sel ? '0 4px 12px rgba(79,106,245,.2)' : 'var(--shadow-xs)', transform: sel ? 'translateY(-2px)' : 'none', transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)' }}
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

      {/* Sınıf seçimi — branş seçilince açılır */}
      {seciliBrans && (
        <div ref={sinifSecRef} style={{ padding: '8px 20px 24px', flexShrink: 0 }}>
          <h2 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '22px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Sınıflarınızı seçin
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text2)', marginBottom: '16px' }}>
            Seçilen branşa göre dersler listelendi.
          </p>

          {/* Ders grupları */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '12px' }}>{seciliBrans.label}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {seciliBrans.classes.map(sinif => {
                  const sel = seciliSiniflar.includes(sinif)
                  return (
                    <button
                      key={sinif}
                      onClick={() => handleSinifToggle(sinif)}
                      style={{ height: '36px', padding: '0 14px', borderRadius: '100px', border: `1.5px solid ${sel ? '#4F6AF5' : 'var(--color-border)'}`, background: sel ? '#4F6AF5' : 'var(--color-bg)', color: sel ? '#fff' : 'var(--color-text2)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transform: sel ? 'scale(1.05)' : 'scale(1)', boxShadow: sel ? '0 3px 10px rgba(79,106,245,.3)' : 'none', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
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
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 32px', background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)', flexShrink: 0 }}>
          <button
            onClick={handleOlustur}
            disabled={loading}
            style={{ width: '100%', height: '52px', borderRadius: '100px', background: loading ? 'rgba(79,106,245,.6)' : '#4F6AF5', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(79,106,245,.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Plan hazırlanıyor…
              </>
            ) : (
              seciliSiniflar.length === 1
                ? `${seciliBrans.label} · ${seciliSiniflar[0]} için Plan Oluştur →`
                : `${seciliBrans.label} · ${seciliSiniflar.length} sınıf için Plan Oluştur →`
            )}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>,
    document.body
  )
}
