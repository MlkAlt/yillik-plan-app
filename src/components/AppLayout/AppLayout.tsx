import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Home, Calendar, FileText, Sparkles } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
}

const TABS = [
  { name: 'Ana', path: '/app', icon: Home, exact: true },
  { name: 'Planla', path: '/app/planla', icon: Calendar, exact: true },
  { name: 'Dosyam', path: '/app/dosyam', icon: FileText, exact: true },
  { name: 'Üret', path: '/app/uret', icon: Sparkles, exact: true },
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
          className="fixed bottom-0 w-full max-w-lg z-50 flex items-center"
          style={{
            height: '80px',
            background: 'rgba(255, 255, 255, 0.75)',
            borderTop: '1px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            padding: '0 8px 12px',
            boxShadow: '0 -1px 0 rgba(0, 0, 0, 0.07)',
          }}
        >
          {TABS.map((tab) => {
            const active = isTabActive(tab, location.pathname)
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path, { replace: active })}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] px-1 py-2 relative cursor-pointer"
                style={{
                  minHeight: '44px',
                  borderRadius: '10px',
                  transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.88)'
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }}
              >
                {/* Active pill bar */}
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      width: '32px',
                      height: '3px',
                      background: '#4F6AF5',
                      borderRadius: '100px',
                      animation: 'pill-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  size={20}
                  style={{
                    color: active ? '#4F6AF5' : '#9B9B97',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s',
                    transform: active ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                  }}
                />

                {/* Label */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: active ? '#4F6AF5' : '#9B9B97',
                    letterSpacing: '0.01em',
                    lineHeight: '12px',
                    transition: 'color 0.2s',
                  }}
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
