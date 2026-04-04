import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  body: string
}

export function EmptyState({ icon, title, body }: EmptyStateProps) {
  return (
    <div
      className="text-center py-6 px-4"
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {icon && (
        <div className="mb-2 flex justify-center" style={{ color: 'var(--color-text3)' }}>
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text1)' }}>
        {title}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text3)' }}>
        {body}
      </p>
    </div>
  )
}
