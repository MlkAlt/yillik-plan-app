import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BRANCHES, type Branch } from '../../lib/branchConfig'
import { buildPlan } from '../../lib/planBuilder'
import { getYilSecenekleri } from '../../lib/dersSinifMap'
import type { PlanEntry } from '../../types/planEntry'
import { Button } from '../Button'
import { Search, ChevronDown } from 'lucide-react'

interface OnboardingModalProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function OnboardingModal({ onTamamla }: OnboardingModalProps) {
  const [query, setQuery] = useState('')
  const [acikBrans, setAcikBrans] = useState<string | null>(null)
  const [seciliSiniflar, setSeciliSiniflar] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [tebrik, setTebrik] = useState<{ ders: string; siniflar: string[] } | null>(null)
  const yil = getYilSecenekleri()[0]

  const filtered = query
    ? BRANCHES.filter(b => b.label.toLowerCase().includes(query.toLowerCase()))
    : BRANCHES

  const popular = filtered.filter(b => b.popular)
  const rest = filtered.filter(b => !b.popular)

  function handleBransToggle(branch: Branch) {
    if (acikBrans === branch.id) {
      setAcikBrans(null)
      setSeciliSiniflar([])
    } else {
      setAcikBrans(branch.id)
      setSeciliSiniflar([branch.classes[0]])
    }
  }

  function handleSinifToggle(sinif: string) {
    setSeciliSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    )
  }

  function handleOlustur() {
    const branch = BRANCHES.find(b => b.id === acikBrans)
    if (!branch || seciliSiniflar.length === 0) return
    setLoading(true)
    try {
      const entries: PlanEntry[] = seciliSiniflar.map(sinif => {
        const { plan } = buildPlan(branch.lessonId, sinif, yil)
        return { sinif, ders: branch.lessonId, yil, tip: 'meb' as const, plan, rows: null }
      })
      setTebrik({ ders: branch.label, siniflar: seciliSiniflar })
      setLoading(false)
      setTimeout(() => {
        onTamamla(entries)
      }, 2200)
    } catch {
      setLoading(false)
    }
  }

  const seciliBrans = BRANCHES.find(b => b.id === acikBrans)

  const modal = (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto rounded-t-3xl animate-fade-in flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Tutamaç */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Başlık */}
        <div className="px-5 pb-4 flex-shrink-0">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
          >
            Branşını seç
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text3)' }}>
            Sınıflarını belirle, planın hazır olsun.
          </p>
        </div>

        {/* Arama */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-text3)' }}
            />
            <input
              type="text"
              placeholder="Branş ara..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 text-sm font-medium transition-all outline-none"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text1)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
          </div>
        </div>

        {/* Tebrik ekranı */}
        {tebrik ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center animate-fade-in">
            <div className="text-6xl mb-4" style={{ animation: 'pop .4s ease-out' }}>🎉</div>
            <h2
              className="text-2xl font-bold mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
            >
              Planın hazır!
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text2)' }}>
              <span className="font-semibold" style={{ color: 'var(--color-text1)' }}>{tebrik.ders}</span> için{' '}
              {tebrik.siniflar.length === 1
                ? <span className="font-semibold" style={{ color: 'var(--color-text1)' }}>{tebrik.siniflar[0]}</span>
                : <span className="font-semibold" style={{ color: 'var(--color-text1)' }}>{tebrik.siniflar.length} sınıf</span>
              }{' '}
              yıllık planın oluşturuldu.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text3)' }}>
              <svg className="animate-spin" style={{ color: 'var(--color-primary)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Plana yönlendiriliyorsun...
            </div>
          </div>
        ) : (
          <>
            {/* Branş listesi */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {!query && popular.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[.1em] mb-2"
                    style={{ color: 'var(--color-text3)' }}
                  >
                    Popüler
                  </p>
                  <BransList
                    branches={popular}
                    acikBrans={acikBrans}
                    seciliSiniflar={seciliSiniflar}
                    onBransToggle={handleBransToggle}
                    onSinifToggle={handleSinifToggle}
                  />
                </div>
              )}

              {rest.length > 0 && (
                <div>
                  {!query && (
                    <p
                      className="text-[10px] font-bold uppercase tracking-[.1em] mb-2"
                      style={{ color: 'var(--color-text3)' }}
                    >
                      Diğer Branşlar
                    </p>
                  )}
                  <BransList
                    branches={query ? filtered : rest}
                    acikBrans={acikBrans}
                    seciliSiniflar={seciliSiniflar}
                    onBransToggle={handleBransToggle}
                    onSinifToggle={handleSinifToggle}
                  />
                </div>
              )}

              {filtered.length === 0 && (
                <p className="text-center text-sm py-10" style={{ color: 'var(--color-text3)' }}>
                  "{query}" için sonuç bulunamadı
                </p>
              )}
            </div>

            {/* CTA — branş seçilince görünür */}
            {acikBrans && seciliBrans && (
              <div
                className="px-5 pb-8 pt-3 flex-shrink-0"
                style={{
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <Button
                  onClick={handleOlustur}
                  disabled={loading || seciliSiniflar.length === 0}
                  loading={loading}
                  variant="primary"
                  className="w-full text-base"
                >
                  {seciliSiniflar.length === 1
                    ? `${seciliBrans.label} · ${seciliSiniflar[0]} için Plan Oluştur →`
                    : `${seciliBrans.label} · ${seciliSiniflar.length} sınıf için Plan Oluştur →`
                  }
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function BransList({
  branches, acikBrans, seciliSiniflar, onBransToggle, onSinifToggle,
}: {
  branches: Branch[]
  acikBrans: string | null
  seciliSiniflar: string[]
  onBransToggle: (b: Branch) => void
  onSinifToggle: (s: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {branches.map(branch => (
        <BransItem
          key={branch.id}
          branch={branch}
          isOpen={acikBrans === branch.id}
          seciliSiniflar={seciliSiniflar}
          onToggle={() => onBransToggle(branch)}
          onSinifToggle={onSinifToggle}
        />
      ))}
    </div>
  )
}

function BransItem({
  branch, isOpen, seciliSiniflar, onToggle, onSinifToggle,
}: {
  branch: Branch
  isOpen: boolean
  seciliSiniflar: string[]
  onToggle: () => void
  onSinifToggle: (s: string) => void
}) {
  return (
    <div
      className="overflow-hidden transition-all"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: isOpen ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--color-surface)',
      }}
    >
      {/* Branş satırı */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:opacity-70"
      >
        <branch.icon
          size={20}
          className="flex-shrink-0"
          style={{ color: 'var(--color-primary)' }}
        />
        <span
          className="text-sm font-semibold flex-1"
          style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-text1)' }}
        >
          {branch.label}
        </span>
        <span
          className="transition-transform duration-200"
          style={{
            color: 'var(--color-text3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {/* Sınıf seçimi — accordion */}
      {isOpen && (
        <div
          className="px-4 pb-4 pt-2"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--color-text3)' }}>Hangi sınıflar için?</p>
          <div className="flex flex-wrap gap-2">
            {branch.classes.map(sinif => {
              const sel = seciliSiniflar.includes(sinif)
              return (
                <button
                  key={sinif}
                  onClick={() => onSinifToggle(sinif)}
                  className="font-bold text-xs transition-all active:scale-95"
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: sel ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: sel ? '#ffffff' : 'var(--color-text2)',
                  }}
                >
                  {sinif}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
