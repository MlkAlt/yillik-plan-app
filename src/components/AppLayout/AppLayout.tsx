import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: ReactNode
}

const PAGE_TITLES: Record<string, string> = {
  '/app':                      'Gösterge Paneli',
  '/app/planla':               'Yıllık Planlar',
  '/app/dosyam':               'Evrak Merkezi',
  '/app/planla/takvim':        'Takvim',
  '/app/planla/ders-programi': 'Ders Programı',
  '/app/uret':                 'Üret',
  '/app/profil':               'Ayarlar',
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()

  const pageTitle = PAGE_TITLES[location.pathname]

  return (
    <div
      className="min-h-screen font-sans flex justify-center"
      style={{ background: 'var(--color-bg2, #ededea)' }}
    >
      <div
        className="w-full max-w-lg min-h-screen relative flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg, #f5f5f2)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* TopBar */}
        <TopBar pageTitle={pageTitle} />

        {/* İçerik */}
        <main
          key={location.pathname}
          className="relative flex-1 overflow-y-auto animate-fade-in"
          style={{
            paddingTop: 'var(--topbar-height, 56px)',
            paddingBottom: 'calc(var(--bottomnav-height, 64px) + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {children}
        </main>

        {/* Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  )
}
