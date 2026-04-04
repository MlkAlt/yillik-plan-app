import { OnboardingModal } from './OnboardingModal'
import type { PlanEntry } from '../../types/planEntry'

interface BosdurumuEkraniProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function BosdurumuEkrani({ onTamamla }: BosdurumuEkraniProps) {
  return (
    <OnboardingModal
      onTamamla={entries => {
        if (entries.length > 0) onTamamla(entries)
      }}
    />
  )
}
