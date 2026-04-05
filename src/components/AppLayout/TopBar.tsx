import { Menu, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StorageKeys } from '../../lib/storageKeys'

interface TopBarProps {
  onMenuClick: () => void
  pageTitle?: string
}

function getEksikAyarlar(): boolean {
  try {
    const raw = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    if (!raw) return true
    const ayarlar = JSON.parse(raw)
    return !ayarlar?.adSoyad || !ayarlar?.brans
  } catch {
    return false
  }
}

export function TopBar({ onMenuClick, pageTitle }: TopBarProps) {
  const navigate = useNavigate()
  const eksik = getEksikAyarlar()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
      style={{
        height: 'var(--topbar-height, 56px)',
        maxWidth: '512px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center rounded-xl"
        style={{ width: 40, height: 40, color: 'var(--color-text1)' }}
        aria-label="Menüyü aç"
      >
        <Menu size={22} />
      </button>

      {/* Logo / Sayfa Başlığı */}
      <div className="flex items-center gap-2">
        <span
          className="font-display font-bold"
          style={{ fontSize: 16, color: 'var(--color-text1)', letterSpacing: '-0.01em' }}
        >
          {pageTitle ?? 'ÖğretmenAsistan'}
        </span>
        {!pageTitle && (
          <span
            className="font-sans font-semibold"
            style={{
              fontSize: 10,
              color: '#fff',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-pill)',
              padding: '1px 7px',
              letterSpacing: '0.02em',
            }}
          >
            Beta
          </span>
        )}
      </div>

      {/* Bell */}
      <button
        onClick={() => navigate('/app/profil')}
        className="flex items-center justify-center rounded-xl relative"
        style={{ width: 40, height: 40, color: 'var(--color-text2)' }}
        aria-label="Bildirimler"
      >
        <Bell size={20} />
        {eksik && (
          <span
            className="absolute top-2 right-2 rounded-full"
            style={{ width: 7, height: 7, backgroundColor: 'var(--color-danger)' }}
          />
        )}
      </button>
    </header>
  )
}
