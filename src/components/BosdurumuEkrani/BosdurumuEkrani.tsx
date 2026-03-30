import { useState } from 'react'
import { OnboardingModal } from './OnboardingModal'
import type { PlanEntry } from '../../types/planEntry'
import { Button } from '../Button'

interface BosdurumuEkraniProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function BosdurumuEkrani({ onTamamla }: BosdurumuEkraniProps) {
  const [modalAcik, setModalAcik] = useState(false)

  return (
    <div data-testid="onboarding-deger-onizleme" className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* İkon */}
      <div className="text-7xl mb-6">📋</div>

      {/* Başlık */}
      <h2 className="text-2xl font-bold text-[#1C1917] mb-3 leading-tight">        Yıllık planın<br />dakikalar içinde hazır
      </h2>
      <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
        MEB takvimine göre otomatik oluşturulur. Branşını seç, sınıflarını belirle — hepsi bu.
      </p>

      {/* Tek buton */}
      <Button
        onClick={() => setModalAcik(true)}
        variant="secondary"
        size="lg"
        className="w-full max-w-xs text-base shadow-[0_4px_16px_rgba(45,91,227,0.3)]"
      >
        Branşını Seç →
      </Button>

      {/* Modal */}
      {modalAcik && (
        <OnboardingModal
          onTamamla={entries => {
            setModalAcik(false)
            onTamamla(entries)
          }}
        />
      )}
    </div>
  )
}
