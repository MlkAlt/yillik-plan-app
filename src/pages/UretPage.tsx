import { Sparkles } from 'lucide-react'

export function UretPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-s)] flex items-center justify-center">
        <Sparkles size={28} className="text-[var(--color-accent)]" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--color-text1)] tracking-tight mb-1">
          Üret
        </h2>
        <p className="text-sm text-[var(--color-text2)]">
          Sınav ve etkinlik üreteci yakında geliyor.
        </p>
      </div>
    </div>
  )
}
