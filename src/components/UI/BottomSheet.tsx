import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Body scroll'u kilitle
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
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-2xl shadow-xl transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 pb-8 pt-2">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(sheet, document.body)
}
