import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  X,
  LayoutDashboard,
  BookOpen,
  FileText,
  CalendarDays,
  Clock,
  Sparkles,
  Settings,
  Crown,
  Zap,
} from 'lucide-react'
import { StorageKeys } from '../../lib/storageKeys'

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
}

const MENU_ITEMS = [
  { label: 'Gösterge Paneli', path: '/app', icon: LayoutDashboard, exact: true },
  { label: 'Yıllık Planlar',  path: '/app/planla', icon: BookOpen, exact: false },
  { label: 'Evrak Merkezi',   path: '/app/dosyam', icon: FileText, exact: true },
  { label: 'Takvim',          path: '/app/planla/takvim', icon: CalendarDays, exact: true },
  { label: 'Ders Programı',   path: '/app/planla/ders-programi', icon: Clock, exact: true },
  { label: 'Üret',            path: '/app/uret', icon: Sparkles, exact: true },
]

const HESAP_ITEMS = [
  { label: 'Ayarlar', path: '/app/profil', icon: Settings, exact: true },
]

function isActive(path: string, exact: boolean, pathname: string) {
  if (exact) return pathname === path
  return pathname.startsWith(path)
}

interface KullaniciBilgisi {
  adSoyad?: string
  brans?: string
}

function getKullanici(): KullaniciBilgisi {
  try {
    const raw = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    if (!raw) return {}
    return JSON.parse(raw) ?? {}
  } catch {
    return {}
  }
}

export function SidebarDrawer({ open, onClose }: SidebarDrawerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [kullanici, setKullanici] = useState<KullaniciBilgisi>({})

  useEffect(() => {
    if (open) {
      setKullanici(getKullanici())
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNav = (path: string) => {
    navigate(path)
    onClose()
  }

  if (!open) return null

  const adSoyad = kullanici.adSoyad || 'Öğretmen'
  const brans   = kullanici.brans   || ''
  const avatarHarf = adSoyad.charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="relative flex flex-col h-full"
        style={{
          width: 'var(--sidebar-width, 280px)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slide-in-left 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        {/* Logo + kapat */}
        <div
          className="flex items-center justify-between px-5"
          style={{ height: 64, borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            {/* App icon */}
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 32, height: 32, background: 'var(--gradient-primary)' }}
            >
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <div
                className="font-display font-bold leading-none"
                style={{ fontSize: 14, color: 'var(--color-text1)' }}
              >
                ÖğretmenAsistan
              </div>
              <span
                className="font-sans font-semibold"
                style={{
                  fontSize: 9,
                  color: 'var(--color-primary)',
                  letterSpacing: '0.04em',
                }}
              >
                Beta
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, color: 'var(--color-text3)' }}
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {/* Menü */}
          <div
            className="font-sans font-semibold uppercase"
            style={{ fontSize: 10, color: 'var(--color-text3)', letterSpacing: '0.08em', padding: '0 8px 6px' }}
          >
            Menü
          </div>
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact, location.pathname)
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="flex items-center gap-3 w-full text-left rounded-xl px-3 transition-colors"
                style={{
                  height: 44,
                  backgroundColor: active ? 'var(--color-primary-s)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text2)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text3)', flexShrink: 0 }}
                />
                {item.label}
                {active && (
                  <div
                    className="ml-auto rounded-full"
                    style={{ width: 6, height: 6, backgroundColor: 'var(--color-primary)' }}
                  />
                )}
              </button>
            )
          })}

          {/* Hesap */}
          <div
            className="font-sans font-semibold uppercase"
            style={{ fontSize: 10, color: 'var(--color-text3)', letterSpacing: '0.08em', padding: '12px 8px 6px' }}
          >
            Hesap
          </div>
          {HESAP_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact, location.pathname)
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="flex items-center gap-3 w-full text-left rounded-xl px-3 transition-colors"
                style={{
                  height: 44,
                  backgroundColor: active ? 'var(--color-primary-s)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text2)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text3)', flexShrink: 0 }}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Alt kısım */}
        <div
          className="px-3 py-4 flex flex-col gap-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {/* Premium banner */}
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--color-warning-s)', border: '1px solid var(--color-warning-b)' }}
          >
            <div className="flex items-center gap-2">
              <Crown size={16} style={{ color: 'var(--color-warning)' }} />
              <span
                className="font-sans font-semibold"
                style={{ fontSize: 13, color: 'var(--color-text1)' }}
              >
                Premium'a Geç
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text2)' }}>
              Tüm evraklara sınırsız erişim
            </p>
            <button
              className="w-full rounded-xl font-sans font-semibold flex items-center justify-center gap-2"
              style={{
                height: 36,
                backgroundColor: 'var(--color-warning)',
                color: '#fff',
                fontSize: 13,
              }}
            >
              <Sparkles size={14} />
              Hemen Yükselt
            </button>
          </div>

          {/* Kullanıcı kartı */}
          <button
            onClick={() => handleNav('/app/profil')}
            className="flex items-center gap-3 rounded-xl px-3 w-full text-left"
            style={{ height: 52 }}
          >
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full font-display font-bold flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                background: 'var(--gradient-primary)',
                color: '#fff',
                fontSize: 15,
              }}
            >
              {avatarHarf}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-sans font-semibold truncate"
                style={{ fontSize: 13, color: 'var(--color-text1)' }}
              >
                {adSoyad}
              </div>
              {brans && (
                <div
                  className="font-sans truncate"
                  style={{ fontSize: 12, color: 'var(--color-text3)' }}
                >
                  {brans}
                </div>
              )}
            </div>
            <Settings size={16} style={{ color: 'var(--color-text3)', flexShrink: 0 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
