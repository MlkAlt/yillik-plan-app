import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, CalendarDays, FolderOpen, Sparkles } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
  headerAction?: { label: string; onClick: () => void }
}

const TABS = [
  { name: 'Ana',    path: '/app',         icon: Home,         exact: true  },
  { name: 'Planla', path: '/app/plan',    icon: CalendarDays, exact: false },
  { name: 'Dosyam', path: '/app/dosyam',  icon: FolderOpen,   exact: false },
  { name: 'Üret',   path: '/app/uret',    icon: Sparkles,     exact: false },
]

function isTabActive(tab: typeof TABS[number], pathname: string) {
  if (tab.path === '/app/plan') {
    return pathname.startsWith('/app/plan') || pathname.startsWith('/app/hafta')
  }
  if (tab.exact) return pathname === tab.path
  return pathname.startsWith(tab.path)
}

export function AppLayout({ children, headerAction }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen font-sans flex justify-center" style={{ backgroundColor: 'var(--color-bg2, #ededea)' }}>
      <div className="w-full max-w-lg min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--color-bg, #f5f5f2)', boxShadow: 'var(--shadow-md)' }}>

        {/* HEADER */}
        <header
          className="sticky top-0 z-40 h-14 px-5 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-surface, #fff)',
            borderBottom: '1px solid var(--color-border, #e6e6e3)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <button
            onClick={() => navigate('/app')}
            className="font-bold text-lg tracking-tight active:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
          >
            Öğretmen Yaver
          </button>
          {headerAction && (
            <button
              onClick={headerAction.onClick}
              className="text-sm font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all"
              style={{
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-s)',
              }}
            >
              {headerAction.label}
            </button>
          )}
        </header>

        {/* MAIN */}
        <main key={location.pathname} className="flex-1 overflow-y-auto pb-[72px] animate-fade-in">
          {children}
        </main>

        {/* BOTTOM NAV — v6 4 sekme */}
        <nav
          className="fixed bottom-0 w-full max-w-lg z-50 flex items-center px-1"
          style={{
            height: '72px',
            backgroundColor: 'var(--color-surface, #fff)',
            borderTop: '1px solid var(--color-border, #e6e6e3)',
            paddingBottom: '8px',
          }}
        >
          {TABS.map((tab) => {
            const active = isTabActive(tab, location.pathname)
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path, { replace: active })}
                className="flex-1 flex flex-col items-center gap-[3px] px-1 py-2 rounded-xl transition-all duration-150 active:scale-90"
                style={{ borderRadius: '12px' }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{
                    color: active ? 'var(--color-primary)' : 'var(--color-text3)',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s, color 0.15s',
                  }}
                />
                <span
                  className="text-[10px] font-bold tracking-[0.01em]"
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text3)' }}
                >
                  {tab.name}
                </span>
              </button>
            )
          })}
        </nav>

      </div>
    </div>
  )
}
