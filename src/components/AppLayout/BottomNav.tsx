import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, FileText, Sparkles, UserRound } from 'lucide-react'

const TABS = [
  { label: 'Ana',    icon: Home,       path: '/app',        exact: true  },
  { label: 'Planla', icon: BookOpen,   path: '/app/planla', exact: false },
  { label: 'Dosyam', icon: FileText,   path: '/app/dosyam', exact: true  },
  { label: 'Üret',   icon: Sparkles,   path: '/app/uret',   exact: true  },
  { label: 'Profil', icon: UserRound,  path: '/app/profil', exact: true  },
]

function isActive(path: string, exact: boolean, pathname: string) {
  if (exact) return pathname === path
  return pathname.startsWith(path)
}

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 512,
        height: 'calc(var(--bottomnav-height, 64px) + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: '8px',
        zIndex: 50,
      }}
    >
      {TABS.map(tab => {
        const active = isActive(tab.path, tab.exact, location.pathname)
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              position: 'relative',
            }}
            aria-label={tab.label}
          >
            {/* Aktif indicator pill */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: active ? 20 : 0,
                height: 2,
                borderRadius: 100,
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            <Icon
              size={22}
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text3)',
                transition: 'color 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.12)' : 'scale(1)',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--color-primary)' : 'var(--color-text3)',
                letterSpacing: active ? '-0.01em' : '0',
                transition: 'color 0.15s, font-weight 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
