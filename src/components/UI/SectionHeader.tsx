interface SectionHeaderProps {
  title: string
  meta?: string
}

export function SectionHeader({ title, meta }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="section-label mb-0">{title}</span>
      {meta && (
        <span className="text-[11px] font-bold" style={{ color: 'var(--color-text2)' }}>
          {meta}
        </span>
      )}
    </div>
  )
}
