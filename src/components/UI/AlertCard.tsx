import { AlertTriangle } from 'lucide-react'

interface AlertCardProps {
  status: 'acil' | 'uyari' | 'info'
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

const statusConfig = {
  acil: {
    icon: AlertTriangle,
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    textColor: '#78350f',
    badgeColor: '#dc2626',
  },
  uyari: {
    icon: AlertTriangle,
    bgColor: '#fef08a',
    borderColor: '#fde047',
    textColor: '#713f12',
    badgeColor: '#ea580c',
  },
  info: {
    icon: AlertTriangle,
    bgColor: '#dbeafe',
    borderColor: '#93c5fd',
    textColor: '#1e40af',
    badgeColor: '#2563eb',
  },
}

export function AlertCard({ status, title, subtitle, actionLabel, onAction }: AlertCardProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        padding: '16px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div className="flex gap-3">
        <Icon size={20} style={{ color: config.textColor, flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase" style={{ color: config.badgeColor }}>
              {status === 'acil' ? 'ACİL · 2 GÜN KALDI' : 'UYARI'}
            </span>
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: config.textColor }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs leading-5 mb-3" style={{ color: config.textColor }}>
              {subtitle}
            </p>
          )}
          {actionLabel && (
            <button
              onClick={onAction}
              className="text-xs font-bold px-3 py-1 rounded transition-all active:scale-95"
              style={{
                color: config.badgeColor,
                border: `1.5px solid ${config.badgeColor}`,
                backgroundColor: 'transparent',
              }}
            >
              {actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
