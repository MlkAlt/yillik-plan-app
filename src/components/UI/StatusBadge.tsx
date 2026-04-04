interface StatusBadgeProps {
  status: 'hazir' | 'eksik' | 'gelecek' | 'success' | 'warning' | 'info'
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'soft' | 'outline'
}

const statusConfig = {
  hazir: { bg: '#ecfdf5', border: '#d1fae5', text: '#065f46', icon: '✓' },
  eksik: { bg: '#fef3c7', border: '#fcd34d', text: '#78350f', icon: '⚠' },
  gelecek: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: '→' },
  success: { bg: '#ecfdf5', border: '#d1fae5', text: '#065f46', icon: '✓' },
  warning: { bg: '#fef3c7', border: '#fcd34d', text: '#78350f', icon: '⚠' },
  info: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: '→' },
}

export function StatusBadge({ status, label, size = 'md', variant = 'soft' }: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClass = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size]

  if (variant === 'outline') {
    return (
      <span
        className={`font-bold rounded-full inline-flex items-center gap-1 ${sizeClass}`}
        style={{
          border: `1.5px solid ${config.text}`,
          color: config.text,
          backgroundColor: 'transparent',
        }}
      >
        <span>{config.icon}</span>
        {label}
      </span>
    )
  }

  if (variant === 'solid') {
    return (
      <span
        className={`font-bold rounded-full inline-flex items-center gap-1 ${sizeClass}`}
        style={{
          backgroundColor: config.text,
          color: '#ffffff',
        }}
      >
        <span>{config.icon}</span>
        {label}
      </span>
    )
  }

  return (
    <span
      className={`font-bold rounded-full inline-flex items-center gap-1 ${sizeClass}`}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      <span>{config.icon}</span>
      {label}
    </span>
  )
}
