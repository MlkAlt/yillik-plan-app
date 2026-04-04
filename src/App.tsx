import { useRef, useState, useCallback, useEffect } from 'react'
import { useColorScheme } from './hooks/useColorScheme'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { YuklemePage } from './pages/YuklemePage'
import { AppHomeScreen } from './pages/AppHomeScreen'
import { PlanPage } from './pages/PlanPage'
import { DosyamPage } from './pages/DosyamPage'
import { UretPage } from './pages/UretPage'
import { AppSettingsScreen } from './pages/AppSettingsScreen'
import { AppLayout } from './components/AppLayout'
import { HaftaDetayPage } from './pages/HaftaDetayPage'
import { AuthModal } from './components/AuthModal'
import { ToastProvider } from './lib/toast'
import { usePlanYonetimi } from './hooks/usePlanYonetimi'
import { useAuthSync } from './hooks/useAuthSync'
import type { User } from './lib/auth'
import { StorageKeys } from './lib/storageKeys'

function AppInner() {
  useColorScheme() // dark mode'u başlatır — data-theme'i document.documentElement'e uygular
  const userRef = useRef<User | null>(null)

  const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>(() => {
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (item) {
        const parsed = JSON.parse(item)
        return Array.isArray(parsed) ? {} : parsed
      }
    } catch { /* okunamadı */ }
    return {}
  })

  const {
    planlar, setPlanlar, setAktifSinif,
    yuklendi, authPromptAcik, setAuthPromptAcik,
    aktifEntry, handlePlanEkle, handlePlanSil, handleSinifSec, handleYukleLegacy,
    triggerAuthPromptIfNeeded,
  } = usePlanYonetimi(userRef)

  const handleTamamlananGuncelle = useCallback(() => {
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (item) {
        const parsed = JSON.parse(item)
        setTamamlananlar(Array.isArray(parsed) ? {} : parsed)
      }
    } catch { /* okunamadı */ }
    triggerAuthPromptIfNeeded()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerAuthPromptIfNeeded])

  const { user, syncing, tamamlananlar: tamamlananlarCloud } = useAuthSync(setPlanlar, setAktifSinif)
  userRef.current = user

  useEffect(() => {
    if (tamamlananlarCloud && Object.keys(tamamlananlarCloud).length > 0) {
      setTamamlananlar(prev => ({ ...prev, ...tamamlananlarCloud }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tamamlananlarCloud)])

  if (!yuklendi) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/olustur" element={<Navigate to="/app" replace />} />
        <Route path="/yukle" element={<Navigate to="/app/yukle" replace />} />
        <Route path="/plan" element={<Navigate to="/app" replace />} />
        <Route path="/app" element={<AppLayout><AppHomeScreen planlar={planlar} onPlanEkle={handlePlanEkle} onSinifSec={handleSinifSec} syncing={syncing} tamamlananlar={tamamlananlar} /></AppLayout>} />
        <Route path="/app/planla" element={<AppLayout><PlanPage entry={aktifEntry} planlar={planlar} onSinifSec={handleSinifSec} /></AppLayout>} />
        <Route path="/app/dosyam" element={<AppLayout><DosyamPage /></AppLayout>} />
        <Route path="/app/uret" element={<AppLayout><UretPage /></AppLayout>} />
        <Route path="/app/yukle" element={<AppLayout><YuklemePage onYukle={handleYukleLegacy} /></AppLayout>} />
        <Route path="/app/profil" element={<AppLayout><AppSettingsScreen onPlanEkle={handlePlanEkle} onPlanSil={handlePlanSil} planlar={planlar} user={user} /></AppLayout>} />
        <Route path="/app/hafta/:haftaNo" element={<AppLayout><HaftaDetayPage entry={aktifEntry} onTamamlaToggle={handleTamamlananGuncelle} /></AppLayout>} />
        {/* Backward compat redirects */}
        <Route path="/app/plan" element={<Navigate to="/app/planla" replace />} />
        <Route path="/app/ayarlar" element={<Navigate to="/app/profil" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {authPromptAcik && (
        <AuthModal
          mode="prompt"
          planBaglami={aktifEntry ? { ders: aktifEntry.ders, sinif: aktifEntry.sinifGercek || aktifEntry.sinif } : undefined}
          onClose={() => setAuthPromptAcik(false)}
        />
      )}
    </BrowserRouter>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}

export default App
