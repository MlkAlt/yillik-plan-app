import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, CSSProperties> = {
  primary:   { backgroundColor: 'var(--color-primary)',   color: '#ffffff',                   boxShadow: 'var(--shadow-sm)' },
  secondary: { backgroundColor: 'var(--color-surface2)',  color: 'var(--color-text1)',         boxShadow: 'var(--shadow-xs)' },
  outline:   { backgroundColor: 'var(--color-bg)',        color: 'var(--color-primary)',       border: '1px solid var(--color-border)' },
  danger:    { backgroundColor: 'var(--color-danger-s)',  color: 'var(--color-danger)',        border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)' },
  ghost:     { backgroundColor: 'transparent',            color: 'var(--color-text3)' },
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'py-1.5 px-3.5 text-xs',
  md: 'py-3 px-5 text-sm',
  lg: 'py-3.5 px-6 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2',
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
      style={{
        borderRadius: 'var(--radius-pill)',
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...props}
    >
      {loading ? <span className="animate-pulse">İşleniyor...</span> : children}
    </button>
  )
}
