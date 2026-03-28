import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [basharf] = useState<string | null>(() => {
    try {
      const ayarlarItem = localStorage.getItem('ogretmen-ayarlari')
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
    { name: 'Ana', path: '/app', icon: '🏠' },
    { name: 'Planım', path: '/app/plan', icon: '📅' },
    { name: 'Ayarlar', path: '/app/ayarlar', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-[#E7E5E4] font-sans flex justify-center">
      {/* Container simulating a mobile device width on large screens */}
      <div className="w-full max-w-lg bg-[#FAFAF9] min-h-screen relative shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E7E5E4] h-14 px-5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => navigate('/app')}
            className="font-bold text-[#2D5BE3] text-lg tracking-tight active:opacity-70 transition-opacity"
          >
            Yıllık Plan
          </button>
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate('/app/ayarlar')}
              className="w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-2 ring-amber-50 cursor-pointer active:scale-90 transition-transform"
            >
              {basharf ? basharf : '👤'}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        {/* pb-20 prevents content from hiding behind the fixed tab bar */}
        {/* key prop ile her route değişiminde fade-in animasyonu tetiklenir */}
        <main key={location.pathname} className="flex-1 overflow-y-auto pb-20 animate-fade-in">
          {children}
        </main>

        {/* BOTTOM TAB BAR */}
        <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-[#E7E5E4] z-50">
          <div className="flex justify-around items-center px-4 py-2">
            {tabs.map((tab) => {
              // /app/hafta/:no → "Planım" aktif; diğerleri exact match
              const isActive = tab.path === '/app/plan'
                ? location.pathname.startsWith('/app/plan') || location.pathname.startsWith('/app/hafta')
                : location.pathname === tab.path

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center gap-1 min-w-[4rem] group relative pb-1"
                >
                  <span className={`text-[22px] transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                    {tab.icon}
                  </span>
                  <span
                    className={`text-[10px] font-bold transition-colors duration-200 ${
                      isActive ? 'text-[#F59E0B]' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {tab.name}
                  </span>
                  {/* Aktif nokta göstergesi */}
                  <span
                    className={`absolute bottom-0 rounded-full bg-[#F59E0B] transition-all duration-300 ${
                      isActive ? 'w-4 h-1 opacity-100' : 'w-0 h-1 opacity-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </nav>

      </div>
    </div>
  )
}
