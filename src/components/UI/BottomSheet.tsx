import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const sheet = (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: 'rgba(17, 17, 19, 0.44)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-lg mx-auto overflow-hidden transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '90vh',
          borderRadius: '28px 28px 0 0',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          }}
        />

        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-border2)' }}
          />
        </div>

        <div
          className="overflow-y-auto px-5 pb-8 pt-2"
          style={{ maxHeight: 'calc(90vh - 24px)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(sheet, document.body)
}
