import { useState } from 'react'
import { SO_DERSLER, SO_SINIFLAR, type Branch } from '../../lib/branchConfig'
import type { PlanEntry } from '../../types/planEntry'
import { buildPlan } from '../../lib/planBuilder'
import { BranchStep } from './BranchStep'
import { ClassStep } from './ClassStep'
import { LessonClassStep } from './LessonClassStep'

type Step = 'branch' | 'configure'

interface PlanSelectorProps {
  yil: string
  onComplete: (entries: PlanEntry[]) => void
  onCancel?: () => void
}

export function PlanSelector({ yil, onComplete, onCancel }: PlanSelectorProps) {
  const [step, setStep] = useState<Step>('branch')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  // Branş modu state
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])

  // Sınıf öğretmeni modu state
  const [selectedClass, setSelectedClass] = useState(SO_SINIFLAR[2]) // varsayılan: 3. Sınıf
  const [selectedLessons, setSelectedLessons] = useState<string[]>(SO_DERSLER)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleBranchSelect(branch: Branch) {
    setSelectedBranch(branch)
    setSuccess(false)
    setError('')
    if (branch.mode === 'brans') {
      setSelectedClasses([branch.classes[0]])
    }
    setStep('configure')
  }

  function handleBack() {
    setStep('branch')
    setSelectedBranch(null)
    setSuccess(false)
    setError('')
  }

  function handleLessonToggle(lesson: string) {
    setSelectedLessons(prev =>
      prev.includes(lesson)
        ? prev.length > 1 ? prev.filter(l => l !== lesson) : prev
        : [...prev, lesson]
    )
  }

  function handleClassToggle(cls: string) {
    setSelectedClasses(prev =>
      prev.includes(cls)
        ? prev.length > 1 ? prev.filter(c => c !== cls) : prev
        : [...prev, cls]
    )
  }

  function handleConfirm() {
    if (!selectedBranch) return
    setLoading(true)
    setError('')
    try {
      let entries: PlanEntry[]

      if (selectedBranch.mode === 'sinif-ogretmeni') {
        entries = selectedLessons.map(ders => {
          const { plan } = buildPlan(ders, selectedClass, yil)
          return {
            sinif: `${selectedClass}—${ders}`,
            ders, yil, tip: 'meb' as const, plan, rows: null,
            label: ders, sinifGercek: selectedClass,
          }
        })
        localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
          ders: selectedLessons[0], siniflar: selectedLessons, yil,
          ogretmenTuru: 'sinif', sinifGercek: selectedClass,
        }))
      } else {
        entries = selectedClasses.map(sinif => {
          const { plan } = buildPlan(selectedBranch.lessonId, sinif, yil)
          return {
            sinif, ders: selectedBranch.lessonId, yil, tip: 'meb' as const, plan, rows: null,
          }
        })
        localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
          ders: selectedBranch.lessonId, siniflar: selectedClasses, yil,
        }))
      }

      setLoading(false)
      setSuccess(true)
      setTimeout(() => onComplete(entries), 600)
    } catch {
      setLoading(false)
      setError('Plan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  if (step === 'branch') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Başlayalım</p>
            <h2 className="text-base font-bold text-[#1C1917]">Branşını seç</h2>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 active:scale-95 transition-all">
              İptal
            </button>
          )}
        </div>
        <BranchStep onSelect={handleBranchSelect} />
      </div>
    )
  }

  if (!selectedBranch) return null

  return (
    <div>
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          <p className="text-red-600 text-xs font-semibold">{error}</p>
        </div>
      )}
      {selectedBranch.mode === 'sinif-ogretmeni' ? (
        <LessonClassStep
          selectedClass={selectedClass}
          selectedLessons={selectedLessons}
          onClassSelect={setSelectedClass}
          onLessonToggle={handleLessonToggle}
          onShortcut={setSelectedLessons}
          onConfirm={handleConfirm}
          onBack={handleBack}
          loading={loading}
          success={success}
        />
      ) : (
        <ClassStep
          branch={selectedBranch}
          selectedClasses={selectedClasses}
          onToggle={handleClassToggle}
          onShortcut={setSelectedClasses}
          onConfirm={handleConfirm}
          onBack={handleBack}
          loading={loading}
          success={success}
        />
      )}
    </div>
  )
}
