import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [basharf, setBasharf] = useState<string | null>(null)

  useEffect(() => {
    try {
      const ayarlarItem = localStorage.getItem('ogretmen-ayarlari')
      if (ayarlarItem) {
        const ayarlar = JSON.parse(ayarlarItem)
        if (ayarlar.adSoyad) {
          const ad = ayarlar.adSoyad.trim()
          if (ad) {
            setBasharf(ad.charAt(0).toUpperCase())
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const tabs = [
    { name: 'Ana', path: '/app', icon: '🏠' },
    { name: 'Planım', path: '/app/plan', icon: '📅' },
    { name: 'Ayarlar', path: '/app/ayarlar', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex justify-center">
      {/* Container simulating a mobile device width on large screens */}
      <div className="w-full max-w-lg bg-slate-50 min-h-screen relative shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-14 px-5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <span className="font-black text-[#2D5BE3] text-lg tracking-tight">📋 Yıllık Plan</span>
          <div className="flex items-center gap-3">
            <button className="text-xl hover:opacity-80 transition-opacity">🔔</button>
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-2 ring-amber-50 cursor-pointer">
              {basharf ? basharf : '👤'}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        {/* pb-20 prevents content from hiding behind the fixed tab bar */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* BOTTOM TAB BAR */}
        <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-slate-200 z-50">
          <div className="flex justify-around items-center px-4 py-2">
            {tabs.map((tab) => {
              // Exact match or active logic
              const isActive = location.pathname === tab.path

              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center gap-1 min-w-[4rem] group"
                >
                  <span className={`text-[22px] transition-transform ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}>
                    {tab.icon}
                  </span>
                  <span
                    className={`text-[10px] font-bold transition-colors ${
                      isActive ? 'text-[#F59E0B]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

      </div>
    </div>
  )
}
