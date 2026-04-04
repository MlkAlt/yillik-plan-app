import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, UserRound } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
}

const TABS = [
  { name: 'Ana', path: '/app', icon: Home, exact: true },
  { name: 'Profil', path: '/app/profil', icon: UserRound, exact: false },
]

function isTabActive(tab: typeof TABS[number], pathname: string) {
  if (tab.exact) return pathname === tab.path
  return pathname.startsWith(tab.path)
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      className="min-h-screen font-sans flex justify-center"
      style={{
        background: 'var(--color-bg2, #ededea)',
      }}
    >
      <div
        className="w-full max-w-lg min-h-screen relative flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg, #f5f5f2)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 42%, transparent) 0%, transparent 18%)',
          }}
        />

        <main key={location.pathname} className="relative flex-1 overflow-y-auto pb-[72px] animate-fade-in">
          {children}
        </main>

        <nav
          className="fixed bottom-0 w-full max-w-lg z-50 flex items-center px-1"
          style={{
            height: '72px',
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 92%, var(--color-bg)) 0%, var(--color-surface) 100%)',
            borderTop: '1px solid var(--color-border)',
            paddingBottom: '8px',
            backdropFilter: 'blur(12px)',
          }}
        >
          {TABS.map((tab) => {
            const active = isTabActive(tab, location.pathname)
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path, { replace: active })}
                className="flex-1 flex flex-col items-center gap-[3px] px-1 py-2 transition-all duration-150 active:scale-90"
                style={{
                  borderRadius: '12px',
                  backgroundColor: active ? 'color-mix(in srgb, var(--color-primary) 7%, transparent)' : 'transparent',
                }}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{
                      color: active ? 'var(--color-primary)' : 'var(--color-text3)',
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.15s, color 0.15s',
                    }}
                  />
                  {active && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--color-pop)' }}
                    />
                  )}
                </div>
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
