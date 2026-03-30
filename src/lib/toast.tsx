import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

export type ToastTipi = 'basari' | 'hata' | 'bilgi' | 'uyari'

interface Toast {
  id: string
  tip: ToastTipi
  mesaj: string
  sure: number
}

interface ToastContextValue {
  goster: (mesaj: string, tip?: ToastTipi, sure?: number) => void
  kapat: (id: string) => void
  aktifToast: Toast | null
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TIP_STIL: Record<ToastTipi, { bg: string; ikon: string }> = {
  basari: { bg: 'bg-[#059669]', ikon: '✓' },
  hata:   { bg: 'bg-red-500',   ikon: '✕' },
  bilgi:  { bg: 'bg-[#2D5BE3]', ikon: 'ℹ' },
  uyari:  { bg: 'bg-[#F59E0B]', ikon: '⚠' },
}

function ToastUI({ toast, onKapat }: { toast: Toast; onKapat: () => void }) {
  const stil = TIP_STIL[toast.tip]
  return (
    <div className={`${stil.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[240px] max-w-[320px] animate-fade-in`}>
      <span className="text-base font-bold flex-shrink-0">{stil.ikon}</span>
      <span className="text-sm font-medium flex-1">{toast.mesaj}</span>
      <button onClick={onKapat} className="text-white/70 hover:text-white transition-colors flex-shrink-0 text-lg leading-none">×</button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [aktifToast, setAktifToast] = useState<Toast | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const kapat = useCallback((id: string) => {
    setAktifToast(prev => prev?.id === id ? null : prev)
  }, [])

  const goster = useCallback((mesaj: string, tip: ToastTipi = 'bilgi', sure: number = 3000) => {
    // Minimum 3000ms garantisi
    const gercekSure = Math.max(sure, 3000)
    const id = Date.now().toString()

    // Önceki timer'ı temizle
    if (timerRef.current) clearTimeout(timerRef.current)

    // Yeni toast — öncekinin yerini alır
    setAktifToast({ id, tip, mesaj, sure: gercekSure })

    timerRef.current = setTimeout(() => {
      setAktifToast(prev => prev?.id === id ? null : prev)
    }, gercekSure)
  }, [])

  return (
    <ToastContext.Provider value={{ goster, kapat, aktifToast }}>
      {children}
      {/* Toast UI — alt nav'ın hemen üstü */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center">
        {aktifToast && (
          <div className="pointer-events-auto">
            <ToastUI toast={aktifToast} onKapat={() => kapat(aktifToast.id)} />
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast, ToastProvider içinde kullanılmalıdır')
  return ctx
}
