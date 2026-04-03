import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles } from 'lucide-react'
import { OnboardingModal } from './OnboardingModal'
import type { PlanEntry } from '../../types/planEntry'

interface BosdurumuEkraniProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function BosdurumuEkrani({ onTamamla }: BosdurumuEkraniProps) {
  const [modalAcik, setModalAcik] = useState(false)

  const overlay = (
    <div
      data-testid="onboarding-deger-onizleme"
      className="fixed inset-0 z-40 flex items-end justify-center pb-24"
      style={{ animation: 'overlay-in 0.3s ease-out both' }}
    >
      {/* Blur backdrop */}
      <div
        className="absolute inset-0"
        style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.25)' }}
      />

      {/* Splash card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 text-center"
        style={{ animation: 'splash-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}
      >
        <div
          style={{
            borderRadius: 'var(--radius-2xl)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
            padding: '32px 28px 28px',
          }}
        >
          {/* Minimal ikon */}
          <div className="flex justify-center mb-5">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(79,106,245,0.35)',
              }}
            >
              <Sparkles size={22} color="#ffffff" strokeWidth={2} />
            </div>
          </div>

          {/* Başlık */}
          <h2
            className="font-bold tracking-tight mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              color: 'var(--color-text1)',
              letterSpacing: '-.02em',
            }}
          >
            Öğretmen Yaver
          </h2>
          <p
            className="text-sm leading-relaxed mb-7"
            style={{ color: 'var(--color-text2)' }}
          >
            Branşını seç, sınıflarını belirle —<br />
            yıllık planın otomatik hazır olsun.
          </p>

          {/* CTA */}
          <button
            onClick={() => setModalAcik(true)}
            className="w-full py-3.5 text-[15px] font-bold text-white transition-all active:scale-[0.97]"
            style={{
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(79,106,245,0.35)',
              letterSpacing: '-.01em',
            }}
          >
            Başlayalım →
          </button>

          {/* Alt not */}
          <p className="text-xs mt-3" style={{ color: 'var(--color-text3)' }}>
            MEB takvimine göre · Ücretsiz
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(overlay, document.body)}
      {modalAcik && (
        <OnboardingModal
          onTamamla={entries => {
            setModalAcik(false)
            onTamamla(entries)
          }}
        />
      )}
    </>
  )
}
