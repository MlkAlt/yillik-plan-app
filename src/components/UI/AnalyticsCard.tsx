interface AnalyticsCardProps {
  totalTime: string // "6.5 saat"
  breakdown: Array<{
    label: string  // "Yazılı"
    value: string  // "3.2s"
  }>
  meta?: string    // "BU AY TASARRUF"
}

export function AnalyticsCard({ totalTime, breakdown, meta }: AnalyticsCardProps) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
      }}
    >
      {meta && (
        <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-3" style={{ color: 'var(--color-text3)' }}>
          {meta}
        </p>
      )}

      <p
        className="text-6xl font-bold mb-1 leading-none"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text1)',
          letterSpacing: '-0.02em',
        }}
      >
        {totalTime.split(' ')[0]}
      </p>
      <p className="text-sm font-semibold mb-5" style={{ color: 'var(--color-text2)' }}>
        saat geri aldınız
      </p>

      <div className="grid grid-cols-3 gap-3">
        {breakdown.map(item => (
          <div key={item.label} className="text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
              {item.value}
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text2)' }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
