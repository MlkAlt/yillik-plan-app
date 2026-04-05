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
  const [ilkkeriyeGrubu, setIlkkeriyeGrubu] = useState(() => (ayarlar as Record<string, unknown>).ilkkeriyeGrubu as string || '')
  const [ilkkeriyeYontemi, setIlkkeriyeYontemi] = useState(() => (ayarlar as Record<string, unknown>).ilkkeriyeYontemi as string || '')
  const [bildirimOnemliTarihler, setBildirimOnemliTarihler] = useState(() => {
    const bt = (ayarlar as Record<string, unknown>).bildirimTercihleri as Record<string, boolean> | undefined
    return bt?.onemliTarihler ?? true
  })
  const [, setDegisti] = useState(false)
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
  }, [adSoyad, okulAdi, yil, mudurAdi, mudurYardimcisiAdi, zumreOgretmenleri, ilkkeriyeGrubu, ilkkeriyeYontemi])

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
      ilkkeriyeGrubu: ilkkeriyeGrubu.trim() || undefined,
      ilkkeriyeYontemi: ilkkeriyeYontemi.trim() || undefined,
      bildirimTercihleri: { onemliTarihler: bildirimOnemliTarihler, haftaBaslangici: true },
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

  const isIlkokul = planlarProp.some(p => {
    const sinifStr = p.sinifGercek || p.sinif
    const sinifNo = parseInt(sinifStr)
    return !isNaN(sinifNo) && sinifNo <= 4
  })

  function handleZumreDegistir(index: number, value: string) {
    setZumreOgretmenleri(prev => prev.map((item, i) => i === index ? value : item))
  }

  function handleZumreEkle() {
    setZumreOgretmenleri(prev => [...prev, ''])
  }

  function handleZumreSil(index: number) {
    setZumreOgretmenleri(prev => prev.length === 1 ? [''] : prev.filter((_, i) => i !== index))
  }

  const [aktifTab, setAktifTab] = useState<'profil' | 'okul' | 'zumre' | 'uygulama'>('profil')

  const avatarHarf = adSoyad ? adSoyad.charAt(0).toUpperCase() : 'Ö'
  const planBrans = planlarProp[0]?.ders || ''
  const planSiniflar = planlarProp.map(p => p.sinifGercek || p.sinif)

  const TABS = [
    { id: 'profil', label: 'Profil' },
    { id: 'okul', label: 'Okul' },
    { id: 'zumre', label: 'Zümre' },
    { id: 'uygulama', label: 'Uygulama' },
  ] as const

  return (
    <div className="page-shell">
      {/* Başlık + Kaydet */}
      <div className="flex items-center justify-between" style={{ padding: '16px 16px 0' }}>
        <div>
          <h1 className="font-display font-bold" style={{ fontSize: 22, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>Ayarlar</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text2)', marginTop: 2 }}>Profil, okul ve uygulama tercihlerinizi yönetin</p>
        </div>
        <button
          onClick={handleKaydet}
          className="flex items-center gap-2 font-sans font-bold"
          style={{ height: 38, padding: '0 14px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: '#fff', fontSize: 13, cursor: 'pointer', border: 'none' }}
        >
          <Save size={15} /> Kaydet
        </button>
      </div>

      {/* Gradient Profil Kartı */}
      <div
        className="relative overflow-hidden"
        style={{ margin: '16px 16px 0', borderRadius: 'var(--radius-xl)', background: 'var(--gradient-primary, linear-gradient(135deg,#4F6AF5,#6D28D9))', padding: '18px' }}
      >
        <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center font-display font-bold rounded-xl flex-shrink-0"
            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 20 }}
          >
            {avatarHarf}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold truncate" style={{ fontSize: 16, color: '#fff' }}>{adSoyad || 'Öğretmen'}</p>
            {planBrans && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{planBrans}</p>
            )}
            {planSiniflar.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {planSiniflar.map(s => (
                  <span
                    key={s}
                    className="font-sans font-semibold"
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', padding: '1px 8px', borderRadius: 'var(--radius-pill)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setAktifTab('profil')}
            className="flex items-center gap-1 font-sans font-semibold"
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', flexShrink: 0 }}
          >
            ✏ Düzenle
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ padding: '12px 16px 0' }}>
        <div
          className="flex"
          style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-pill)', padding: 4 }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setAktifTab(tab.id)}
              className="flex-1 font-sans font-semibold"
              style={{
                height: 36, borderRadius: 'var(--radius-pill)', fontSize: 13,
                background: aktifTab === tab.id ? '#fff' : 'transparent',
                color: aktifTab === tab.id ? 'var(--color-primary)' : 'var(--color-text3)',
                border: 'none', cursor: 'pointer',
                boxShadow: aktifTab === tab.id ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-stack" style={{ padding: '0 16px 32px' }}>

        {/* ── PROFİL TAB ── */}
        {aktifTab === 'profil' && (
          <>
            <Card style={{ borderRadius: 'var(--radius-xl)', marginTop: 12 }}>
              <div className="flex items-center gap-2 mb-3">
                <UserRound size={16} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Kişisel Bilgiler</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>Ad soyad evraklarda kullanılır</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Ad Soyad</p>
                  <input type="text" placeholder="Ad Soyad" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
                </div>
              </div>
            </Card>

            <Card style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Branş ve Sınıflar</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text3)' }}>Plan ve evrak oluşturmada kullanılır</p>
                </div>
              </div>

              {planlarProp.length === 0 ? (
                <EmptyState icon={<School size={20} />} title="Plan yok" body="Plan ekleyerek branş ve sınıf bilgisi oluşturulur." />
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {planlarProp.map(p => (
                    <div key={p.sinif} className="flex items-center gap-3 px-3 py-2.5" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                      <BookOpen size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text1)' }}>{p.label || p.ders}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text2)' }}>{p.sinifGercek || p.sinif} · {p.yil}</p>
                      </div>
                      {silOnayBekleyen === p.sinif ? (
                        <ConfirmActionRow onConfirm={() => handlePlanSilOnayla(p.sinif)} onCancel={() => setSilOnayBekleyen(null)} />
                      ) : (
                        <button onClick={() => setSilOnayBekleyen(p.sinif)} className="w-7 h-7 flex items-center justify-center" style={{ borderRadius: '999px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text3)', cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setPlanSelectorAcik(true)} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold" style={{ borderRadius: 'var(--radius-pill)', border: '1px dashed var(--color-primary-b)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)', color: 'var(--color-primary)', cursor: 'pointer' }}>
                <Plus size={15} /> Yeni Plan Ekle
              </button>

              {mufredatUyari && (
                <div className="mt-3 px-3 py-2.5" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>{mufredatUyari}</p>
                </div>
              )}
            </Card>

            {isIlkokul && (
              <Card style={{ borderRadius: 'var(--radius-xl)' }}>
                <SectionHeader title="İlkkeriye Bilgileri" meta="İlkokul 1. sınıf" />
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>İlkkeriye Grubu</p>
                    <input value={ilkkeriyeGrubu} onChange={e => setIlkkeriyeGrubu(e.target.value)} placeholder="Örn: Ses Temelli Cümle Yöntemi" className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Öğretim Yöntemi</p>
                    <input value={ilkkeriyeYontemi} onChange={e => setIlkkeriyeYontemi(e.target.value)} placeholder="Örn: Analitik Sentez" className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ── OKUL TAB ── */}
        {aktifTab === 'okul' && (
          <Card style={{ borderRadius: 'var(--radius-xl)', marginTop: 12 }}>
            <SectionHeader title="Okul Bilgileri" meta="Belgelerde kullanılacak" />
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Okul Adı</p>
                <input type="text" placeholder="Okul adı" value={okulAdi} onChange={e => setOkulAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Müdür Adı</p>
                <input type="text" placeholder="Okul müdürü" value={mudurAdi} onChange={e => setMudurAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Müdür Yardımcısı</p>
                <input type="text" placeholder="Müdür yardımcısı" value={mudurYardimcisiAdi} onChange={e => setMudurYardimcisiAdi(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div className="flex items-center justify-between px-3.5 py-3" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Akademik Yıl</p>
                  <p className="text-xs" style={{ color: 'var(--color-text3)' }}>Varsayılan plan yılı</p>
                </div>
                <div className="flex items-center gap-1">
                  <select value={yil} onChange={e => setYil(e.target.value)} className="text-sm font-bold bg-transparent border-none" style={{ color: 'var(--color-primary)', outline: 'none' }}>
                    {getYilSecenekleri().map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronRight size={14} style={{ color: 'var(--color-text3)' }} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── ZÜMRE TAB ── */}
        {aktifTab === 'zumre' && (
          <Card style={{ borderRadius: 'var(--radius-xl)', marginTop: 12 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users2 size={16} style={{ color: 'var(--color-primary)' }} />
                <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>Zümre Öğretmenleri</p>
              </div>
              <button type="button" onClick={handleZumreEkle} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                <Plus size={14} /> Ekle
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {zumreOgretmenleri.map((isim, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="text" placeholder={`Zümre öğretmeni ${index + 1}`} value={isim} onChange={e => handleZumreDegistir(index, e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
                  <button type="button" onClick={() => handleZumreSil(index)} className="w-10 h-10 flex items-center justify-center" style={{ borderRadius: '999px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text3)', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── UYGULAMA TAB ── */}
        {aktifTab === 'uygulama' && (
          <>
            <Card style={{ borderRadius: 'var(--radius-xl)', marginTop: 12 }}>
              <SectionHeader title="Bildirim Tercihleri" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Önemli tarih bildirimleri</p>
                  <p className="text-xs" style={{ color: 'var(--color-text3)' }}>ZHA, not girişi, veli toplantısı</p>
                </div>
                <button
                  onClick={() => { setBildirimOnemliTarihler(p => !p); setDegisti(true) }}
                  style={{ width: 44, height: 24, borderRadius: 100, background: bildirimOnemliTarihler ? '#4F6AF5' : 'var(--color-border)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: bildirimOnemliTarihler ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </button>
              </div>

              {isBildirimDestekleniyor() && (
                <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center" style={{ borderRadius: 'var(--radius-md)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                      <Bell size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Haftalık hatırlatıcı</p>
                      <p className="text-xs" style={{ color: 'var(--color-text3)' }}>{bildirimIzni === 'denied' ? 'Tarayıcı ayarlarından izin ver' : 'Haftabaşı kazanımı bildir'}</p>
                    </div>
                  </div>
                  <button onClick={handleBildirimToggle} disabled={bildirimIzni === 'denied'} className="relative w-11 h-6 disabled:opacity-40" style={{ borderRadius: 999, backgroundColor: bildirimAktif && bildirimIzni === 'granted' ? 'var(--color-primary)' : 'var(--color-border2)', border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${bildirimAktif && bildirimIzni === 'granted' ? 'translate-x-5' : 'translate-x-0'}`} style={{ backgroundColor: '#fff', boxShadow: 'var(--shadow-xs)', display: 'block' }} />
                  </button>
                </div>
              )}
            </Card>

            <Card style={{ borderRadius: 'var(--radius-xl)' }}>
              <SectionHeader title="Hesap ve Güvenlik" />
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
                  <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold" style={{ borderRadius: 'var(--radius-pill)', border: '1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)', color: 'var(--color-danger)', cursor: 'pointer' }}>
                    <LogOut size={15} /> Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="px-3.5 py-4" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: '999px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text3)', border: '1px solid var(--color-border)' }}>
                      <UserRound size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text1)' }}>Giriş yapılmadı</p>
                      <p className="text-xs" style={{ color: 'var(--color-text3)' }}>Planlara tüm cihazlardan erişilebilir olsun</p>
                    </div>
                  </div>
                  <Button onClick={() => setAuthModalAcik(true)} variant="secondary" className="w-full">
                    Giriş Yap / Kayıt Ol
                  </Button>
                </div>
              )}
            </Card>

                    <div
              className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
              style={{ background: 'color-mix(in srgb, var(--color-danger) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 20%, transparent)' }}
            >
              <p className="font-sans font-semibold" style={{ fontSize: 14, color: 'var(--color-danger)' }}>Tüm verileri sıfırla</p>
              <ConfirmActionRow
                confirmLabel="Sıfırla"
                onConfirm={() => { localStorage.clear(); window.location.reload() }}
                onCancel={() => {}}
              />
            </div>
          </>
        )}
      </div>

      {authModalAcik && <AuthModal onClose={() => setAuthModalAcik(false)} />}

      <BottomSheet open={planSelectorAcik} onClose={() => setPlanSelectorAcik(false)}>
        <PlanSelector yil={yil} onComplete={handleYeniPlanEkle} onCancel={() => setPlanSelectorAcik(false)} />
      </BottomSheet>
    </div>
  )
}

