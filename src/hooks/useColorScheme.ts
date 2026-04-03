import { useCallback, useEffect, useState } from 'react'
import { StorageKeys } from '../lib/storageKeys'

type Theme = 'light' | 'dark' | 'system'

function resolveIsDark(theme: Theme): boolean {
  if (theme === 'light') return false
  if (theme === 'dark') return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(StorageKeys.TEMA)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch { /* localStorage erişim hatası */ }
  return 'light'
}

export function useColorScheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme())
  const [isDark, setIsDark] = useState(() => resolveIsDark(readStoredTheme()))

  // Sistem tercihi değişince güncelle
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        const dark = mq.matches
        setIsDark(dark)
        applyTheme(dark)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Tema değişince DOM'a uygula
  useEffect(() => {
    const dark = resolveIsDark(theme)
    setIsDark(dark)
    applyTheme(dark)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(StorageKeys.TEMA, next)
    } catch { /* localStorage erişim hatası */ }
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return { isDark, theme, setTheme, toggle }
}
