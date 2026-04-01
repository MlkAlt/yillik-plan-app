import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Home, CalendarDays, User } from 'lucide-react'
import { StorageKeys } from '../../lib/storageKeys'

interface AppLayoutProps {
  children: ReactNode
  headerAction?: { label: string; onClick: () => void }
}

export function AppLayout({ children, headerAction }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [basharf] = useState<string | null>(() => {
    try {
      const ayarlarItem = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      if (ayarlarItem) {
        const ayarlar = JSON.parse(ayarlarItem)
        if (ayarlar.adSoyad) {
          const ad = ayarlar.adSoyad.trim()
          if (ad) return ad.charAt(0).toUpperCase()
        }
      }
    } catch {
      // localStorage okunamadı
    }
    return null
  })

  const tabs = [
    { name: 'Ana', path: '/app', icon: Home },
    { name: 'Planım', path: '/app/plan', icon: CalendarDays },
  ]

  return (
    <div className="min-h-screen bg-[#E7E5E4] font-sans flex justify-center">
      {/* Container simulating a mobile device width on large screens */}
      <div className="w-full max-w-lg bg-[#FAFAF9] min-h-screen relative shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E7E5E4] h-14 px-5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => navigate('/app')}
            className="font-bold text-[#1C1917] text-lg tracking-tight active:opacity-70 transition-opacity"
          >
            Yıllık Plan
          </button>
          <div className="flex items-center gap-3">
            {headerAction && (
              <button
                onClick={headerAction.onClick}
                className="text-sm font-bold text-[#2D5BE3] active:scale-95 transition-all px-3 py-1.5 rounded-lg bg-[#2D5BE3]/8 hover:bg-[#2D5BE3]/15"
              >
                {headerAction.label}
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        {/* pb-20 prevents content from hiding behind the fixed tab bar */}
        {/* key prop ile her route değişiminde fade-in animasyonu tetiklenir */}
        <main key={location.pathname} className="flex-1 overflow-y-auto pb-20 animate-fade-in">
          {children}
        </main>

        <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-[#E7E5E4] z-50">
          <div className="flex justify-around items-center px-5 py-2">
            {tabs.map((tab) => {
              const isActive = tab.path === '/app/plan'
                ? location.pathname.startsWith('/app/plan') || location.pathname.startsWith('/app/hafta')
                : location.pathname === tab.path
              const Icon = tab.icon

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path, { replace: isActive })}
                  className="flex flex-col items-center gap-1 min-w-[4rem] group relative pb-1"
                >
                  <Icon
                    size={22}
                    className={`transition-all duration-200 ${isActive ? 'text-[#2D5BE3] scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? 'text-[#2D5BE3]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {tab.name}
                  </span>
                  <span className={`absolute bottom-0 rounded-full bg-[#2D5BE3] transition-all duration-300 ${isActive ? 'w-4 h-0.5 opacity-100' : 'w-0 h-0.5 opacity-0'}`} />
                </button>
              )
            })}

            {/* Profil / Ayarlar butonu */}
            <button
              onClick={() => navigate('/app/ayarlar')}
              className="flex flex-col items-center gap-1 min-w-[4rem] group relative pb-1"
            >
              {basharf ? (
                <div className={`w-7 h-7 rounded-full bg-[#2D5BE3] text-white flex items-center justify-center font-bold text-xs transition-all duration-200 ${location.pathname === '/app/ayarlar' ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                  {basharf}
                </div>
              ) : (
                <User
                  size={22}
                  className={`transition-all duration-200 ${location.pathname === '/app/ayarlar' ? 'text-[#2D5BE3] scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}
                  strokeWidth={location.pathname === '/app/ayarlar' ? 2.5 : 1.8}
                />
              )}
              <span className={`text-[10px] font-bold transition-colors duration-200 ${location.pathname === '/app/ayarlar' ? 'text-[#2D5BE3]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                Ayarlar
              </span>
              <span className={`absolute bottom-0 rounded-full bg-[#2D5BE3] transition-all duration-300 ${location.pathname === '/app/ayarlar' ? 'w-4 h-0.5 opacity-100' : 'w-0 h-0.5 opacity-0'}`} />
            </button>
          </div>
        </nav>

      </div>
    </div>
  )
}
