import { FolderOpen } from 'lucide-react'

export function DosyamPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-s)] flex items-center justify-center">
        <FolderOpen size={28} className="text-[var(--color-primary)]" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--color-text1)] tracking-tight mb-1">
          Dosyam
        </h2>
        <p className="text-sm text-[var(--color-text2)]">
          Öğretmen dosyası yakında geliyor.
        </p>
      </div>
    </div>
  )
}
