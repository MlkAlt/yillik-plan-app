import { OnboardingModal } from './OnboardingModal'
import type { PlanEntry } from '../../types/planEntry'
import { StorageKeys } from '../../lib/storageKeys'

interface BosdurumuEkraniProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function BosdurumuEkrani({ onTamamla }: BosdurumuEkraniProps) {
  return (
    <OnboardingModal
      onTamamla={entries => {
        localStorage.setItem(StorageKeys.ONBOARDING_TAMAMLANDI, '1')
        onTamamla(entries)
      }}
    />
  )
}
