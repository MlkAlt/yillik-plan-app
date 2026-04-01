import type { Branch } from '../../lib/branchConfig'

const ILKOKUL = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf']
const ORTAOKUL = ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf']
const LISE = ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf']

interface ClassStepProps {
  branch: Branch
  selectedClasses: string[]
  onToggle: (cls: string) => void
  onShortcut: (classes: string[]) => void
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
  success?: boolean
}

export function ClassStep({
  branch, selectedClasses, onToggle, onShortcut, onConfirm, onBack, loading, success,
}: ClassStepProps) {
  const { classes } = branch

  const shortcuts = [
    { label: 'İlkokul (1–4)', subset: ILKOKUL.filter(c => classes.includes(c)) },
    { label: 'Ortaokul (5–8)', subset: ORTAOKUL.filter(c => classes.includes(c)) },
    { label: 'Lise (9–12)', subset: LISE.filter(c => classes.includes(c)) },
    { label: 'Hepsini Seç', subset: classes },
  ].filter(s => s.subset.length > 0 && s.subset.length < classes.length)

  const ctaLabel = selectedClasses.length === 0
    ? 'Sınıf Seç'
    : selectedClasses.length === 1
    ? `${selectedClasses[0]} için Plan Oluştur →`
    : `${selectedClasses.length} Sınıf için Plan Oluştur →`

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
        >
          ← Geri
        </button>
        <div>
          <p className="font-bold text-[#1C1917] leading-tight flex items-center gap-1.5"><branch.icon size={16} className="text-[#2D5BE3]" /> {branch.label}</p>
          <p className="text-xs text-gray-400">Kaç sınıf için plan oluşturacaksın?</p>
        </div>
      </div>

      {/* Kısayollar */}
      {shortcuts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {shortcuts.map(s => (
            <button
              key={s.label}
              onClick={() => onShortcut(s.subset)}
              className="px-3 py-1.5 text-xs font-bold rounded-full border border-[#2D5BE3]/30 text-[#2D5BE3] bg-[#2D5BE3]/5 active:scale-95 transition-all hover:bg-[#2D5BE3]/10"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Sınıf pilleri */}
      <div className="flex flex-wrap gap-2 mb-6">
        {classes.map(cls => (
          <button
            key={cls}
            onClick={() => onToggle(cls)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
              selectedClasses.includes(cls)
                ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                : 'bg-white text-gray-500 border-[#E7E5E4] hover:border-gray-300'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onConfirm}
        disabled={selectedClasses.length === 0 || loading || success}
        className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${
          success ? 'bg-[#059669] text-white' : 'bg-[#F59E0B] text-white hover:opacity-90'
        }`}
      >
        {loading
          ? <span className="animate-pulse">Oluşturuluyor...</span>
          : success
          ? '✓ Hazır!'
          : ctaLabel}
      </button>
    </div>
  )
}
