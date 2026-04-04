interface NavyCardProps {
  title: string
  subtitle?: string
  value?: string | number
  valueSize?: 'sm' | 'lg'
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick?: () => void
  }>
  meta?: string
  children?: React.ReactNode
}

export function NavyCard({ title, subtitle, value, valueSize = 'lg', actions, meta, children }: NavyCardProps) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--color-navy), #2d4a8e)',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(27, 46, 94, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '10%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {meta && (
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {meta}
          </p>
        )}

        {value !== undefined && (
          <p
            className={valueSize === 'lg' ? 'text-5xl font-bold mb-2' : 'text-2xl font-bold mb-1'}
            style={{
              fontFamily: 'var(--font-display)',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </p>
        )}

        <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          {title}
        </p>

        {subtitle && (
          <p className="text-xs leading-5 mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {subtitle}
          </p>
        )}

        {children && <div className="mb-4">{children}</div>}

        {actions && actions.length > 0 && (
          <div className="flex flex-col gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
