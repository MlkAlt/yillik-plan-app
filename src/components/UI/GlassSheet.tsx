interface GlassSheetProps {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  position?: 'bottom' | 'center'
  size?: 'sm' | 'md' | 'lg'
}

export function GlassSheet({ open, title, onClose, children, position = 'bottom', size = 'md' }: GlassSheetProps) {
  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[size]

  if (position === 'center') {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          style={{ animation: 'fade-in 0.2s ease-out both' }}
        />
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${sizeClass}`}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="w-full rounded-2xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(20px)',
              animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {title && (
              <div
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text1)' }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-2xl leading-none"
                  style={{ color: 'var(--color-text2)' }}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </>
    )
  }

  // bottom
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/20"
        onClick={onClose}
        style={{ animation: 'fade-in 0.2s ease-out both' }}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          animation: 'slide-up 0.3s ease-out both',
        }}
      >
        <div className="px-6 py-4">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text1)' }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-2xl leading-none"
                style={{ color: 'var(--color-text2)' }}
              >
                ✕
              </button>
            </div>
          )}
          <div>{children}</div>
        </div>
      </div>
    </>
  )
}
