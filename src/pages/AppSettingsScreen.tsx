import { useState, useEffect, useRef } from 'react'
import type { PlanEntry } from '../types/planEntry'
import { signOut, type User } from '../lib/auth'
import { AuthModal } from '../components/AuthModal'
import {
  isBildirimDestekleniyor, getBildirimIzni, isBildirimAktif,
  setBildirimAktif, requestBildirimIzni,
} from '../lib/notifications'
import { getYilSecenekleri } from '../lib/dersSinifMap'
import { BottomSheet } from '../components/UI/BottomSheet'
import { PlanSelector } from '../components/PlanSelector'
import { useToast } from '../lib/toast'
import { StorageKeys } from '../lib/storageKeys'
import { Card } from '../components/UI/Card'
import { Button } from '../components/Button'
import { SectionHeader } from '../components/UI/SectionHeader'
import { EmptyState } from '../components/UI/EmptyState'
import { ConfirmActionRow } from '../components/UI/ConfirmActionRow'
import { Bell, BookOpen, ChevronRight, LogOut, Plus, Save, ShieldCheck, UserRound, X, Users2, School } from 'lucide-react'

interface AppSettingsScreenProps {
  onPlanEkle: (entries: PlanEntry[]) => void
  onPlanSil?: (sinif: string) => void
  user?: User | null
  planlar?: PlanEntry[]
}

interface OgretmenAyarlari {
  adSoyad?: string
  okulAdi?: string
  yil?: string
  mudurAdi?: string
  mudurYardimcisiAdi?: string
  zumreOgretmenleri?: string[]
}

function readAyarlar(): OgretmenAyarlari {
  try {
    const k = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    if (k) return JSON.parse(k)
  } catch { /* ignore */ }
  return {}
}

export function AppSettingsScreen({ onPlanEkle, onPlanSil, user, planlar: planlarProp = [] }: AppSettingsScreenProps) {
  const { goster } = useToast()
  const ayarlar = readAyarlar()
  const [adSoyad, setAdSoyad] = useState(() => ayarlar.adSoyad || '')
  const [okulAdi, setOkulAdi] = useState(() => ayarlar.okulAdi || '')
  const [mudurAdi, setMudurAdi] = useState(() => ayarlar.mudurAdi || '')
  const [mudurYardimcisiAdi, setMudurYardimcisiAdi] = useState(() => ayarlar.mudurYardimcisiAdi || '')
  const [zumreOgretmenleri, setZumreOgretmenleri] = useState<string[]>(() => ayarlar.zumreOgretmenleri?.length ? ayarlar.zumreOgretmenleri : [''])
  const [yil, setYil] = useState(() => ayarlar.yil || getYilSecenekleri()[0])
  const [degisti, setDegisti] = useState(false)
  const [authModalAcik, setAuthModalAcik] = useState(false)
  const [planSelectorAcik, setPlanSelectorAcik] = useState(false)
  const [silOnayBekleyen, setSilOnayBekleyen] = useState<string | null>(null)
  const [bildirimAktif, setBildirimAktifState] = useState(isBildirimAktif)
  const [bildirimIzni, setBildirimIzniState] = useState(getBildirimIzni)
  const [mufredatUyari, setMufredatUyari] = useState('')
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    setDegisti(true)
  }, [adSoyad, okulAdi, yil, mudurAdi, mudurYardimcisiAdi, zumreOgretmenleri])

  function handleKaydet() {
    const temizZumre = zumreOgretmenleri.map(item => item.trim()).filter(Boolean)
    localStorage.setItem(StorageKeys.OGRETMEN_AYARLARI, JSON.stringify({
      ...readAyarlar(),
      adSoyad,
      okulAdi,
      yil,
      mudurAdi,
      mudurYardimcisiAdi,
      zumreOgretmenleri: temizZumre,
    }))
    setZumreOgretmenleri(temizZumre.length ? temizZumre : [''])
    setDegisti(false)
    goster('Ayarlar kaydedildi', 'basari')
  }

  function handlePlanSilOnayla(sinif: string) {
    if (onPlanSil) onPlanSil(sinif)
    setSilOnayBekleyen(null)
  }

  async function handleBildirimToggle() {
    if (!bildirimAktif) {
      const izin = await requestBildirimIzni()
      setBildirimIzniState(Notification.permission)
      if (izin) {
        setBildirimAktif(true)
        setBildirimAktifState(true)
      }
    } else {
      setBildirimAktif(false)
      setBildirimAktifState(false)
    }
  }

  function handleYeniPlanEkle(entries: PlanEntry[]) {
    const eksik = entries.filter(e => !e.plan?.haftalar?.length).map(e => e.label || e.ders)
    setMufredatUyari(eksik.length > 0 ? `${eksik.join(', ')} icin ders icerigi bulunamadi.` : '')
    onPlanEkle(entries)
    setPlanSelectorAcik(false)
  }

  function handleZumreDegistir(index: number, value: string) {
    setZumreOgretmenleri(prev => prev.map((item, i) => i === index ? value : item))
  }

  function handleZumreEkle() {
    setZumreOgretmenleri(prev => [...prev, ''])
  }

  function handleZumreSil(index: number) {
    setZumreOgretmenleri(prev => prev.length === 1 ? [''] : prev.filter((_, i) => i !== index))
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Profil ve Ayarlar
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          Ogretmen, okul ve belge otomasyonu icin gereken bilgiler
        </p>
      </div>

      <div className="page-hero relative overflow-hidden" style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '18px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-pop))' }} />
        <div className="flex items-center gap-3 mt-1">
          <div className="w-11 h-11 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
            <UserRound size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.1em]" style={{ color: 'var(--color-text3)' }}>Hesap Durumu</p>
            <p className="text-[16px] font-bold truncate" style={{ color: 'var(--color-text1)' }}>{adSoyad || 'Ogretmen Profili'}</p>
            <p className="text-xs" style={{ color: user ? 'var(--color-success)' : 'var(--color-text2)' }}>
              {user ? 'Bulut senkronizasyonu aktif' : 'Yerel kullanim modu'}
            </p>
          </div>
          <div className="px-2.5 py-1.5" style={{ borderRadius: 'var(--radius-pill)', backgroundColor: user ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'color-mix(in srgb, var(--color-warning) 10%, transparent)' }}>
            <span className="text-[11px] font-bold" style={{ color: user ? 'var(--color-success)' : 'var(--color-warning)' }}>{user ? 'Bagli' : 'Misafir'}</span>
          </div>
        </div>
      </div>

      <div className="section-stack">
        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Ogretmen Bilgileri" meta={degisti ? 'Duzenleme var' : 'Kayitli'} />
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Ad Soyad</p>
              <input type="text" placeholder="Ad Soyad" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Okul Adi</p>
              <input type="text" placeholder="Okul Adi" value={okulAdi} onChange={e => setOkulAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Kurum Bilgileri" meta="Belgelerde kullanilacak" />
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Mudur Adi</p>
              <input type="text" placeholder="Okul muduru" value={mudurAdi} onChange={e => setMudurAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Mudur Yardimcisi</p>
              <input type="text" placeholder="Mudur yardimcisi" value={mudurYardimcisiAdi} onChange={e => setMudurYardimcisiAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
            </div>
            <div className="px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users2 size={15} style={{ color: 'var(--color-primary)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Zumre Ogretmenleri</p>
                </div>
                <button type="button" onClick={handleZumreEkle} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                  <Plus size={14} />
                  Ekle
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {zumreOgretmenleri.map((isim, index) => (
                  <div key={`${index}-${isim}`} className="flex items-center gap-2">
                    <input type="text" placeholder={`Zumre ogretmeni ${index + 1}`} value={isim} onChange={e => handleZumreDegistir(index, e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text1)', outline: 'none' }} />
                    <button type="button" onClick={() => handleZumreSil(index)} className="w-10 h-10 flex items-center justify-center" style={{ borderRadius: '999px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text3)' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-200 ${degisti ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <Button onClick={handleKaydet} variant="primary" className="w-full mt-1">
                <Save size={15} /> Kaydet
              </Button>
            </div>
          </div>
        </Card>

        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Planlarim" meta={`${planlarProp.length} plan`} />
          <button onClick={() => setPlanSelectorAcik(true)} className="w-full flex items-center justify-center gap-2 mb-3 py-3 text-sm font-bold transition-all active:scale-[0.98]" style={{ borderRadius: 'var(--radius-pill)', border: '1px dashed var(--color-primary-b)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)', color: 'var(--color-primary)' }}>
            <Plus size={15} /> Yeni Plan Ekle
          </button>

          {planlarProp.length === 0 ? (
            <EmptyState icon={<School size={20} />} title="Henuz plan yok" body="Yeni plan ekleyerek takip, not ve uretim akisini doldurabilirsin." />
          ) : (
            <div className="flex flex-col gap-2">
              {planlarProp.map(p => (
                <div key={p.sinif} className="px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                      <BookOpen size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text1)' }}>{p.label || p.ders}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text2)' }}>{p.sinifGercek || p.sinif} - {p.yil}</p>
                    </div>
                    {silOnayBekleyen === p.sinif ? (
                      <ConfirmActionRow onConfirm={() => handlePlanSilOnayla(p.sinif)} onCancel={() => setSilOnayBekleyen(null)} />
                    ) : (
                      <button onClick={() => setSilOnayBekleyen(p.sinif)} aria-label={`${p.label || p.ders} planini sil`} className="w-8 h-8 flex items-center justify-center transition-all active:scale-95" style={{ borderRadius: '999px', backgroundColor: 'var(--color-bg)', color: 'var(--color-text3)' }}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mufredatUyari && (
            <div className="mt-3 px-3 py-2.5" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>{mufredatUyari}</p>
            </div>
          )}
        </Card>

        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Tercihler" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Akademik Yil</p>
                <p className="text-xs" style={{ color: 'var(--color-text3)' }}>Varsayilan plan yili</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={yil} onChange={e => setYil(e.target.value)} className="text-sm font-bold bg-transparent border-none" style={{ color: 'var(--color-primary)', outline: 'none' }}>
                  {getYilSecenekleri().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronRight size={14} style={{ color: 'var(--color-text3)' }} />
              </div>
            </div>

            {isBildirimDestekleniyor() && (
              <div className="flex items-center justify-between px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                    <Bell size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Haftalik hatirlatici</p>
                    <p className="text-xs" style={{ color: 'var(--color-text3)' }}>{bildirimIzni === 'denied' ? 'Tarayici ayarlarindan izin ver' : 'Haftabasi kazanimi bildir'}</p>
                  </div>
                </div>
                <button onClick={handleBildirimToggle} disabled={bildirimIzni === 'denied'} className="relative w-11 h-6 transition-all duration-200 disabled:opacity-40" aria-label="Haftalik hatirlatici ayari" style={{ borderRadius: '999px', backgroundColor: bildirimAktif && bildirimIzni === 'granted' ? 'var(--color-primary)' : 'var(--color-border2)' }}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${bildirimAktif && bildirimIzni === 'granted' ? 'translate-x-5' : 'translate-x-0'}`} style={{ backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xs)' }} />
                </button>
              </div>
            )}
          </div>
        </Card>

        <Card style={{ borderRadius: 'var(--radius-xl)' }}>
          <SectionHeader title="Hesap ve Guvenlik" />
          {user ? (
            <div className="px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '999px', backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)', color: 'var(--color-success)' }}>
                  <ShieldCheck size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text1)' }}>{user.email}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>Planlar buluta kaydediliyor</p>
                </div>
              </div>
              <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all active:scale-[0.98]" style={{ borderRadius: 'var(--radius-pill)', border: '1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)', color: 'var(--color-danger)' }}>
                <LogOut size={15} /> Cikis Yap
              </button>
            </div>
          ) : (
            <div className="px-3.5 py-4" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '999px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text3)', border: '1px solid var(--color-border)' }}>
                  <UserRound size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Giris yapilmadi</p>
                  <p className="text-xs" style={{ color: 'var(--color-text3)' }}>Planlara tum cihazlardan erisilebilir olsun</p>
                </div>
              </div>
              <Button onClick={() => setAuthModalAcik(true)} variant="secondary" className="w-full">
                Giris Yap / Kayit Ol
              </Button>
            </div>
          )}
        </Card>
      </div>

      {authModalAcik && <AuthModal onClose={() => setAuthModalAcik(false)} />}

      <BottomSheet open={planSelectorAcik} onClose={() => setPlanSelectorAcik(false)}>
        <PlanSelector yil={yil} onComplete={handleYeniPlanEkle} onCancel={() => setPlanSelectorAcik(false)} />
      </BottomSheet>
    </div>
  )
}
