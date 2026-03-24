import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-[#F59E0B] text-white hover:opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
  secondary: 'bg-[#2D5BE3] text-white hover:opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
  outline:   'border border-[#E7E5E4] bg-[#FAFAF9] text-[#2D5BE3] hover:border-[#2D5BE3]',
  danger:    'border border-red-200 bg-red-50 text-red-500 hover:bg-red-100',
  ghost:     'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'py-1.5 px-3.5 text-xs rounded-lg',
  md: 'py-3 px-5 text-sm rounded-xl',
  lg: 'py-3.5 px-6 text-sm rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? <span className="animate-pulse">İşleniyor...</span> : children}
    </button>
  )
}
