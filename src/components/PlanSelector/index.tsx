import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { SO_SINIFLAR, type Branch } from '../../lib/branchConfig'
import { StorageKeys } from '../../lib/storageKeys'
import type { PlanEntry } from '../../types/planEntry'
import { buildPlan } from '../../lib/planBuilder'
import { BranchStep } from './BranchStep'
import { ClassStep } from './ClassStep'
import { LessonClassStep } from './LessonClassStep'

const TEMEL_DERSLER = ['Turkce', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri', 'Sosyal Bilgiler']

type Step = 'branch' | 'configure'

interface PlanSelectorProps {
  yil: string
  onComplete: (entries: PlanEntry[]) => void
  onCancel?: () => void
  onStepChange?: (step: 'branch' | 'configure') => void
}

const LOADING_MESAJLARI = [
  'MEB takvimine gore haftalar yerlestiriliyor',
  'Kazanımlar ve sinif yapisi eslestiriliyor',
  'Plan ekranin icin duzenli bir akis hazirlaniyor',
]

export function PlanSelector({ yil, onComplete, onCancel, onStepChange }: PlanSelectorProps) {
  const [step, setStep] = useState<Step>('branch')
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState(SO_SINIFLAR[2])
  const [selectedLessons, setSelectedLessons] = useState(TEMEL_DERSLER)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [mufredatUyari, setMufredatUyari] = useState('')
  const [loadingMesajIndex, setLoadingMesajIndex] = useState(0)

  useEffect(() => {
    if (!loading || success) return
    const interval = window.setInterval(() => {
      setLoadingMesajIndex(prev => (prev + 1) % LOADING_MESAJLARI.length)
    }, 1100)
    return () => window.clearInterval(interval)
  }, [loading, success])

  function goStep(s: Step) {
    setStep(s)
    onStepChange?.(s)
  }

  function handleBranchSelect(branch: Branch) {
    setSelectedBranch(branch)
    setSuccess(false)
    setError('')
    if (branch.mode === 'brans') setSelectedClasses([branch.classes[0]])
    goStep('configure')
  }

  function handleBack() {
    goStep('branch')
    setSelectedBranch(null)
    setSuccess(false)
    setError('')
  }

  function handleLessonToggle(lesson: string) {
    setSelectedLessons(prev => prev.includes(lesson) ? (prev.length > 1 ? prev.filter(l => l !== lesson) : prev) : [...prev, lesson])
  }

  function handleClassToggle(cls: string) {
    setSelectedClasses(prev => prev.includes(cls) ? (prev.length > 1 ? prev.filter(c => c !== cls) : prev) : [...prev, cls])
  }

  function handleConfirm() {
    if (!selectedBranch) return
    setLoading(true)
    setLoadingMesajIndex(0)
    setError('')
    setMufredatUyari('')

    try {
      let entries: PlanEntry[]
      let eksikDersler: string[] = []

      if (selectedBranch.mode === 'sinif-ogretmeni') {
        const results = selectedLessons.map(ders => {
          const { plan, hasMufredat } = buildPlan(ders, selectedClass, yil)
          return { ders, plan, hasMufredat }
        })
        eksikDersler = results.filter(r => !r.hasMufredat).map(r => r.ders)
        entries = results.map(r => ({
          sinif: `${selectedClass}-${r.ders}`,
          ders: r.ders,
          yil,
          tip: 'meb' as const,
          plan: r.plan,
          rows: null,
          label: r.ders,
          sinifGercek: selectedClass,
        }))
        localStorage.setItem(StorageKeys.OGRETMEN_AYARLARI, JSON.stringify({
          ...safeReadAyarlar(),
          ders: selectedLessons[0],
          siniflar: selectedLessons,
          yil,
          ogretmenTuru: 'sinif',
          sinifGercek: selectedClass,
        }))
      } else {
        const results = selectedClasses.map(sinif => {
          const { plan, hasMufredat } = buildPlan(selectedBranch.lessonId, sinif, yil)
          return { sinif, plan, hasMufredat }
        })
        eksikDersler = results.filter(r => !r.hasMufredat).map(r => r.sinif)
        entries = results.map(r => ({
          sinif: r.sinif,
          ders: selectedBranch.lessonId,
          yil,
          tip: 'meb' as const,
          plan: r.plan,
          rows: null,
        }))
        localStorage.setItem(StorageKeys.OGRETMEN_AYARLARI, JSON.stringify({
          ...safeReadAyarlar(),
          ders: selectedBranch.lessonId,
          siniflar: selectedClasses,
          yil,
        }))
      }

      if (eksikDersler.length > 0) {
        setMufredatUyari(`${eksikDersler.join(', ')} icin mufredat bulunamadi, bos plan olusturuldu.`)
      }

      setLoading(false)
      setSuccess(true)
      setTimeout(() => onComplete(entries), 1400)
    } catch {
      setLoading(false)
      setError('Plan olusturulurken bir hata olustu. Lutfen tekrar deneyin.')
    }
  }

  return (
    <div className="relative min-h-[480px]">
      {(loading || success) && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center px-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', backdropFilter: 'blur(10px)', animation: 'overlay-in 0.25s ease-out both' }}
        >
          <div className="w-full max-w-sm text-center" style={{ animation: 'splash-in 0.45s ease-out both' }}>
            <div
              style={{
                borderRadius: 'var(--radius-2xl)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                padding: '32px 28px 28px',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex justify-center mb-5 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[92px] h-[92px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 68%)' }} />
                </div>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(79,106,245,0.35)',
                    animation: 'pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  }}
                >
                  <Sparkles size={24} color="#ffffff" strokeWidth={2} />
                </div>
              </div>

              <h2 className="font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-text1)', letterSpacing: '-.02em' }}>
                {success ? 'Planin hazir!' : 'Planin hazirlaniyor'}
              </h2>

              <p className="text-sm leading-relaxed mb-6 min-h-[44px]" style={{ color: 'var(--color-text2)' }}>
                {success
                  ? 'Yillik plan olusturuldu. Simdi seni plan ekranina aliyoruz.'
                  : LOADING_MESAJLARI[loadingMesajIndex]}
              </p>

              <div className="flex items-center justify-center gap-2 mb-4">
                {[0, 1, 2].map(index => (
                  <span
                    key={index}
                    className="inline-flex w-2.5 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: success || index === loadingMesajIndex ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 24%, transparent)',
                      transform: success || index === loadingMesajIndex ? 'scale(1.12)' : 'scale(0.92)',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-text3)' }}>
                <span className="inline-flex w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: success ? 'var(--color-success)' : 'var(--color-primary)' }} />
                {success ? 'Plan ekranina yonlendiriliyorsun...' : 'Hazirlama islemi suruyor...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'branch' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text3)' }}>Baslayalim</p>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text1)' }}>Bransini sec</h2>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="text-xs font-semibold transition-all active:scale-95" style={{ color: 'var(--color-text3)' }}>
                Iptal
              </button>
            )}
          </div>
          <BranchStep onSelect={handleBranchSelect} />
        </div>
      ) : selectedBranch ? (
        <div>
          {error && (
            <div className="mb-3 px-3.5 py-2.5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 20%, transparent)', borderRadius: 'var(--radius-lg)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>{error}</p>
            </div>
          )}

          {mufredatUyari && (
            <div className="mb-3 px-3.5 py-2.5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', borderRadius: 'var(--radius-lg)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>{mufredatUyari}</p>
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
      ) : null}
    </div>
  )
}

function safeReadAyarlar() {
  try {
    const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    return item ? JSON.parse(item) : {}
  } catch {
    return {}
  }
}
