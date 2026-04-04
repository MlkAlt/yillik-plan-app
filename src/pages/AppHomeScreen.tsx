import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import type { OlusturulmusPlan } from '../types/takvim'
import type { PlanEntry } from '../types/planEntry'
import { showKazanimBildirimi } from '../lib/notifications'
import { getSession } from '../lib/auth'
import { syncProgressToSupabase } from '../lib/planSync'
import { exportPlanToExcel, exportPlanToWord, exportPlanToPrint } from '../lib/exportUtils'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { DonemGrubu } from '../components/DonemGrubu'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'

/* ── Yardımcılar ─────────────────────────────────────── */

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function formatTarihKisa(isoTarih: string) {
  const d = new Date(isoTarih)
  return `${d.getDate()} ${AYLAR[d.getMonth()]}`
}

function bugunHaftasiniAl(plan: OlusturulmusPlan) {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi) ?? null
}

function sonrakiHaftayiAl(plan: OlusturulmusPlan) {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => h.baslangicTarihi > bugunStr) ?? null
}

function selamMesaji(): string {
  const saat = new Date().getHours()
  if (saat >= 6 && saat < 12) return 'Günaydın'
  if (saat >= 12 && saat < 18) return 'İyi günler'
  if (saat >= 18 && saat < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

/* ── Kazanım tipi ────────────────────────────────────── */

interface KazanimSatiri {
  sinif: string
  label: string
  ders: string
  kazanim: string
  haftaNo: number
  haftaBaslangic: string
  haftaBitis: string
  tamamlandi: boolean
  tatilMi: boolean
  tatilAdi?: string
  entry: PlanEntry
}

/* ── Props ───────────────────────────────────────────── */

interface AppHomeScreenProps {
  planlar: PlanEntry[]
  onPlanEkle: (entries: PlanEntry[]) => void
  onSinifSec: (sinif: string) => void
  syncing?: boolean
  tamamlananlar?: Record<string, number[]>
}

/* ── Ana Ekran ───────────────────────────────────────── */

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec, syncing, tamamlananlar: tamamlananlarProp }: AppHomeScreenProps) {
  const navigate = useNavigate()
  const { goster } = useToast()
  const bugunRef = useRef<HTMLDivElement>(null)

  /* ── Öğretmen adı ────────────────────────────────── */
  const [ogretmenAd] = useState(() => {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      if (item) {
        const parsed = JSON.parse(item)
        if (parsed.adSoyad) return parsed.adSoyad.trim().split(' ')[0] as string
      }
    } catch { /* ignore */ }
    return ''
  })

  /* ── Tamamlananlar state ─────────────────────────── */
  const [tamamlananlarLocal, setTamamlananlarLocal] = useState<Record<string, number[]>>(() => {
    if (tamamlananlarProp) return tamamlananlarProp
    try {
      const tItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      if (tItem) {
        const parsed = JSON.parse(tItem)
        if (Array.isArray(parsed)) {
          const sinif = planlar[0]?.sinif || ''
          return sinif ? { [sinif]: parsed } : {}
        }
        return parsed
      }
    } catch { /* ignore */ }
    return {}
  })

  const tamamlananlar = tamamlananlarProp ?? tamamlananlarLocal

  useEffect(() => {
    if (syncing) goster('Planlar buluttan güncelleniyor...', 'bilgi', 3000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing])

  useEffect(() => {
    if (!syncing && !tamamlananlarProp) {
      try {
        const tItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
        if (tItem) {
          const parsed = JSON.parse(tItem)
          if (Array.isArray(parsed)) {
            const sinif = planlar[0]?.sinif || ''
            setTamamlananlarLocal(sinif ? { [sinif]: parsed } : {})
          } else {
            setTamamlananlarLocal(parsed)
          }
        }
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing])

  /* ── Bildirim ────────────────────────────────────── */
  useEffect(() => {
    if (planlar.length > 0) {
      const aktifPlan = planlar[0]
      if (aktifPlan.plan) {
        const bugunStr = new Date().toISOString().split('T')[0]
        const bugunHafta = aktifPlan.plan.haftalar.find(
          h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
        )
        if (bugunHafta && !bugunHafta.tatilMi && bugunHafta.kazanim) {
          showKazanimBildirimi(bugunHafta.haftaNo, bugunHafta.kazanim, aktifPlan.ders)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planlar.length])

  /* ── Animasyon state ─────────────────────────────── */
  const [tamamlananAnim, setTamamlananAnim] = useState<string | null>(null)
  const [checkingAnim, setCheckingAnim] = useState<Set<string>>(new Set())
  const [kutlamaAktif, setKutlamaAktif] = useState(false)

  /* ── Yıllık plan bölümü state ────────────────────── */
  const [seciliPlanIdx, setSeciliPlanIdx] = useState(0)
  const [donemAcik, setDonemAcik] = useState<Record<number, boolean>>({ 1: true, 2: false })
  const [exportMenuAcik, setExportMenuAcik] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'word' | null>(null)

  const seciliPlan = planlar[seciliPlanIdx] || null

  // Dönem açık/kapalı state'ini seçili plana göre güncelle
  useEffect(() => {
    if (!seciliPlan?.plan) return
    const bugunStr = new Date().toISOString().split('T')[0]
    const bugunHaftaNo = seciliPlan.plan.haftalar.find(
      h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
    )?.haftaNo ?? null
    const aktifDonem = seciliPlan.plan.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
    setDonemAcik({ 1: aktifDonem === 1, 2: aktifDonem === 2 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seciliPlan?.sinif])

  /* ── Bu haftanın kazanımları (tüm sınıflar) ──────── */

  const bugunStr = new Date().toISOString().split('T')[0]

  const buHaftaKazanimlari: KazanimSatiri[] = planlar
    .filter(p => p.plan)
    .map(p => {
      const hafta = bugunHaftasiniAl(p.plan!) ?? sonrakiHaftayiAl(p.plan!)
      if (!hafta) return null
      if (hafta.tatilMi) {
        return {
          sinif: p.sinif,
          label: p.label || p.sinif,
          ders: p.ders,
          kazanim: '',
          haftaNo: hafta.haftaNo,
          haftaBaslangic: hafta.baslangicTarihi,
          haftaBitis: hafta.bitisTarihi,
          tamamlandi: false,
          tatilMi: true,
          tatilAdi: hafta.tatilAdi,
          entry: p,
        }
      }
      return {
        sinif: p.sinif,
        label: p.label || p.sinif,
        ders: p.ders,
        kazanim: hafta.kazanim || 'Kazanım girilmemiş',
        haftaNo: hafta.haftaNo,
        haftaBaslangic: hafta.baslangicTarihi,
        haftaBitis: hafta.bitisTarihi,
        tamamlandi: (tamamlananlar[p.sinif] || []).includes(hafta.haftaNo),
        tatilMi: false,
        entry: p,
      }
    })
    .filter(Boolean) as KazanimSatiri[]

  // Tatil olmayan kazanımlar
  const normalKazanimlar = buHaftaKazanimlari.filter(k => !k.tatilMi)
  const tatilKazanim = buHaftaKazanimlari.find(k => k.tatilMi)
  const bekleyenler = normalKazanimlar.filter(k => !k.tamamlandi)
  const tamamlananlarListesi = normalKazanimlar.filter(k => k.tamamlandi)
  const toplamKazanim = normalKazanimlar.length
  const tamamlananSayi = tamamlananlarListesi.length
  const hepsiTamam = toplamKazanim > 0 && tamamlananSayi === toplamKazanim

  // Hafta bilgisi (ilk planın haftası)
  const ilkPlan = planlar[0]
  const aktifHafta = ilkPlan?.plan ? (bugunHaftasiniAl(ilkPlan.plan) ?? sonrakiHaftayiAl(ilkPlan.plan)) : null

  /* ── Toggle handler ───────────────────────────────── */

  const handleTamamlaToggle = useCallback(async (entry: PlanEntry, hNo: number) => {
    try {
      const mevcut = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = mevcut ? JSON.parse(mevcut) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[entry.sinif] || [])
      const zatenTamamlandi = eskiListe.includes(hNo)
      const yeniListe = zatenTamamlandi ? eskiListe.filter((n: number) => n !== hNo) : [...eskiListe, hNo]
      const yeniParsed = Array.isArray(parsed) ? { [entry.sinif]: yeniListe } : { ...parsed, [entry.sinif]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      setTamamlananlarLocal(yeniParsed)

      if (!zatenTamamlandi) {
        // Animasyon tetikle
        setTamamlananAnim(`${entry.sinif}-${hNo}`)
        setTimeout(() => setTamamlananAnim(null), 800)

        // Tüm kazanımlar tamamlandı mı kontrol et
        const yeniTamamSayi = normalKazanimlar.filter(k => {
          if (k.sinif === entry.sinif && k.haftaNo === hNo) return true
          return (yeniParsed[k.sinif] || []).includes(k.haftaNo)
        }).length
        if (yeniTamamSayi === toplamKazanim && toplamKazanim > 0) {
          setTimeout(() => {
            setKutlamaAktif(true)
            setTimeout(() => setKutlamaAktif(false), 2000)
          }, 500)
        }
      }

      const session = await getSession()
      if (session) {
        const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
        const notlar = notlarItem ? JSON.parse(notlarItem) : {}
        syncProgressToSupabase(session.user.id, yeniParsed, notlar).catch(err => {
          console.error('[Sync Error]', err)
          goster('Bulut senkronizasyonu başarısız. Yerel versin kaydedildi.', 'uyari')
        })
      }

      goster(zatenTamamlandi ? 'İşaret kaldırıldı' : 'Kazanım tamamlandı ✓', 'basari')
    } catch {
      goster('İşlem tamamlanamadı', 'hata')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalKazanimlar, toplamKazanim, goster])

  /* ── Check click: önce bounce animasyonu, sonra state ─ */

  const handleCheckClick = useCallback((item: KazanimSatiri) => {
    const key = `${item.sinif}-${item.haftaNo}`
    if (item.tamamlandi) {
      handleTamamlaToggle(item.entry, item.haftaNo)
      return
    }
    setCheckingAnim(prev => new Set([...prev, key]))
    setTimeout(() => {
      setCheckingAnim(prev => { const n = new Set(prev); n.delete(key); return n })
      handleTamamlaToggle(item.entry, item.haftaNo)
    }, 320)
  }, [handleTamamlaToggle])

  /* ── Export handlers ──────────────────────────────── */

  async function handleExcelIndir() {
    if (!seciliPlan) return
    setExporting('excel')
    setExportMenuAcik(false)
    try {
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      const meta = ayarlar ? JSON.parse(ayarlar) : {}
      await exportPlanToExcel(seciliPlan, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
    } finally {
      setExporting(null)
    }
  }

  function handleWordIndir() {
    if (!seciliPlan) return
    setExporting('word')
    setExportMenuAcik(false)
    try {
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      const meta = ayarlar ? JSON.parse(ayarlar) : {}
      exportPlanToWord(seciliPlan, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
    } finally {
      setExporting(null)
    }
  }

  function handleYazdir() {
    if (!seciliPlan) return
    setExportMenuAcik(false)
    const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
    const meta = ayarlar ? JSON.parse(ayarlar) : {}
    exportPlanToPrint(seciliPlan, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad })
  }

  /* ── Yıllık plan verileri ────────────────────────── */

  const yillikPlan = seciliPlan?.plan
  const yillikTamamlananlar = seciliPlan ? (tamamlananlar[seciliPlan.sinif] || []) : []
  const yillikBugunHaftaNo = yillikPlan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? yillikPlan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

  /* ── Render ───────────────────────────────────────── */

  // Hero renk sistemi
  const heroColor = tatilKazanim && toplamKazanim === 0
    ? 'var(--color-warning)'
    : hepsiTamam
    ? 'var(--color-success)'
    : 'var(--color-primary)'

  return (
    <div className="page-shell">

      {/* ── Header ─────────────────────────────────── */}
      <div className="page-header stagger-1">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="font-bold tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-text1)', letterSpacing: '-0.02em' }}
            >
              {selamMesaji()}{ogretmenAd ? `, ${ogretmenAd} Hoca` : ''}
            </p>
            {planlar.length > 0 && aktifHafta && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-text3)' }}>
                {aktifHafta.haftaNo}. Hafta · {formatTarihKisa(aktifHafta.baslangicTarihi)} – {formatTarihKisa(aktifHafta.bitisTarihi)}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Bildirimler"
            className="w-9 h-9 rounded-full flex items-center justify-center relative transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
          >
            <Bell size={16} style={{ color: 'var(--color-text3)' }} />
          </button>
        </div>
      </div>

      {/* ── Boş durum: Onboarding ──────────────────── */}
      {planlar.length === 0 && (
        <BosdurumuEkrani
          onTamamla={entries => {
            localStorage.setItem(StorageKeys.ONBOARDING_TAMAMLANDI, '1')
            onPlanEkle(entries)
            onSinifSec(entries[0].sinif)
          }}
        />
      )}

      {planlar.length > 0 && (
        <div className="section-stack">

          {/* ── Hero Kartı ─────────────────────────────── */}
          <section
            className="stagger-2"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: `linear-gradient(135deg, ${heroColor}, color-mix(in srgb, ${heroColor} 80%, #818cf8))`,
              padding: '20px 20px 18px',
              boxShadow: `0 4px 20px color-mix(in srgb, ${heroColor} 35%, transparent)`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
            }}
          >
            {/* Decorative orb */}
            <div style={{
              position: 'absolute', top: '-24px', right: '-24px',
              width: '96px', height: '96px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.10)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-16px', left: '30%',
              width: '64px', height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }} />

            {tatilKazanim && toplamKazanim === 0 ? (
              /* Tatil haftası */
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em' }}>
                  Bu Hafta
                </p>
                <p className="font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '-0.02em' }}>
                  {tatilKazanim.tatilAdi || 'Tatil Haftası'}
                </p>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {formatTarihKisa(tatilKazanim.haftaBaslangic)} – {formatTarihKisa(tatilKazanim.haftaBitis)}
                </p>
              </div>
            ) : (
              /* Normal hafta */
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em' }}>
                  Bu Hafta
                </p>
                <div className="flex items-end justify-between mb-4">
                  <span
                    className="font-bold text-white leading-none"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: hepsiTamam ? '22px' : '44px',
                      letterSpacing: '-0.03em',
                      animation: kutlamaAktif ? 'pop-in 0.6s ease-out' : 'none',
                    }}
                  >
                    {hepsiTamam ? 'Harika bir hafta! ✓' : `${tamamlananSayi}/${toplamKazanim}`}
                  </span>
                  {!hepsiTamam && toplamKazanim > 0 && (
                    <span className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      kazanım
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {toplamKazanim > 0 && (
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.22)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(tamamlananSayi / toplamKazanim) * 100}%`,
                        backgroundColor: 'rgba(255,255,255,0.75)',
                        transition: 'width 0.4s ease-out',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Bekleyen Kazanımlar ────────────────────── */}
          {bekleyenler.length > 0 && (
            <section className="stagger-3">
              <div className="flex items-center justify-between mb-3">
                <span className="section-label mb-0">Bu Hafta</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary-s)', color: 'var(--color-primary)' }}
                >
                  {toplamKazanim} kazanım
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {bekleyenler.map((item, idx) => {
                  const animKey = `${item.sinif}-${item.haftaNo}`
                  const isAnimating = tamamlananAnim === animKey
                  return (
                    <div
                      key={animKey}
                      className="transition-all overflow-hidden"
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderLeft: '3.5px solid var(--color-primary)',
                        boxShadow: 'var(--shadow-xs)',
                        opacity: isAnimating ? 0 : 1,
                        transform: isAnimating ? 'translateY(-6px) scale(0.97)' : 'none',
                        maxHeight: isAnimating ? '0px' : '200px',
                        marginBottom: isAnimating ? '-8px' : '0',
                        transition: isAnimating ? 'opacity 0.28s ease-out, transform 0.28s ease-out, max-height 0.28s ease-out 0.1s, margin 0.28s ease-out 0.1s' : 'none',
                        animation: `stagger-up 0.35s ease-out ${0.05 + idx * 0.07}s both`,
                      }}
                    >
                      <div className="flex items-start gap-3 p-3.5">
                        {/* Check circle */}
                        {(() => {
                          const isChecking = checkingAnim.has(animKey)
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCheckClick(item)
                              }}
                              aria-label={`${item.label} kazanımı tamamla`}
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                border: isChecking ? 'none' : '2px solid var(--color-primary)',
                                backgroundColor: isChecking ? 'var(--color-success)' : 'var(--color-primary-s)',
                                transition: 'background-color 0.15s, border-color 0.15s',
                                animation: isChecking ? 'pop-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
                                transform: 'translateZ(0)',
                              }}
                            >
                              {isChecking ? (
                                <Check size={13} strokeWidth={3.5} color="#fff" />
                              ) : (
                                <Check size={11} strokeWidth={2.5} style={{ color: 'var(--color-primary)', opacity: 0.35 }} />
                              )}
                            </button>
                          )
                        })()}

                        {/* İçerik */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            onSinifSec(item.entry.sinif)
                            navigate(`/app/hafta/${item.haftaNo}`)
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--color-primary-s)', color: 'var(--color-primary)' }}
                            >
                              {item.label}
                            </span>
                            <span className="text-[12px] font-semibold" style={{ color: 'var(--color-text2)' }}>
                              {item.ders}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text1)' }}>
                            {item.kazanim}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}


          {/* ── Yıllık Plan Bölümü ─────────────────────── */}
          <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--section-gap)', marginTop: 'var(--space-2)' }}>
            <span className="section-label">Yıllık Plan</span>

            {/* Sınıf chips (birden fazla plan varsa) */}
            {planlar.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {planlar.map((p, i) => (
                  <button
                    key={p.sinif}
                    onClick={() => setSeciliPlanIdx(i)}
                    className="whitespace-nowrap flex-shrink-0 text-xs font-bold transition-all active:scale-95"
                    style={{
                      padding: '7px 15px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: i === seciliPlanIdx ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: i === seciliPlanIdx ? '#ffffff' : 'var(--color-text2)',
                      border: i === seciliPlanIdx ? 'none' : '1.5px solid var(--color-border)',
                      boxShadow: i === seciliPlanIdx ? '0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'var(--shadow-xs)',
                    }}
                  >
                    {p.label || p.sinif}
                  </button>
                ))}
              </div>
            )}

            {/* Dönem grupları */}
            {yillikPlan && (
              <div className="flex flex-col gap-4">
                {[1, 2].map(donemNo => {
                  const donemHaftalar = yillikPlan.haftalar.filter(h => h.donem === donemNo)
                  if (donemHaftalar.length === 0) return null
                  const dTamamlananSayisi = donemHaftalar.filter(h => !h.tatilMi && yillikTamamlananlar.includes(h.haftaNo)).length
                  const dToplamSayisi = donemHaftalar.filter(h => !h.tatilMi).length

                  return (
                    <DonemGrubu
                      key={donemNo}
                      donemNo={donemNo}
                      haftalar={donemHaftalar}
                      tamamlananlar={yillikTamamlananlar}
                      bugunHaftaNo={yillikBugunHaftaNo}
                      bugunRef={bugunRef}
                      tamamlananSayisi={dTamamlananSayisi}
                      toplamSayisi={dToplamSayisi}
                      acik={donemAcik[donemNo] ?? false}
                      onToggle={() => setDonemAcik(prev => ({ ...prev, [donemNo]: !prev[donemNo] }))}
                    />
                  )
                })}
              </div>
            )}

            {/* Export butonları */}
            {seciliPlan && (
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setExportMenuAcik(p => !p)}
                  disabled={!!exporting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    boxShadow: '0 3px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                  }}
                >
                  {exporting ? (
                    <span className="animate-pulse text-xs">Hazırlanıyor...</span>
                  ) : (
                    <><Download size={16} /> İndir</>
                  )}
                </button>
              </div>
            )}

            {/* Export Modal */}
            {exportMenuAcik && (
              <>
                <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setExportMenuAcik(false)} />
                <div
                  className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl p-6"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                    boxShadow: '0 -4px 16px color-mix(in srgb, black 10%, transparent)',
                    animation: 'slide-up 0.3s ease-out both',
                  }}
                >
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-5">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>Planı dışa aktar</p>
                      <button
                        onClick={() => setExportMenuAcik(false)}
                        className="text-xl"
                        style={{ color: 'var(--color-text2)' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleExcelIndir}
                        disabled={!!exporting}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70 disabled:opacity-50"
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface2)',
                          color: 'var(--color-text1)',
                        }}
                      >
                        <FileSpreadsheet size={18} style={{ color: 'var(--color-success)' }} />
                        <div className="text-left">
                          <p className="font-bold">Excel (.xlsx)</p>
                          <p className="text-xs" style={{ color: 'var(--color-text2)' }}>Tüm haftalar, hesaplamalar dahil</p>
                        </div>
                      </button>
                      <button
                        onClick={handleWordIndir}
                        disabled={!!exporting}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70 disabled:opacity-50"
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface2)',
                          color: 'var(--color-text1)',
                        }}
                      >
                        <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                        <div className="text-left">
                          <p className="font-bold">Word (.docx)</p>
                          <p className="text-xs" style={{ color: 'var(--color-text2)' }}>Düzenlenebilir belge</p>
                        </div>
                      </button>
                      <button
                        onClick={handleYazdir}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold active:opacity-70"
                        style={{
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface2)',
                          color: 'var(--color-text1)',
                        }}
                      >
                        <Printer size={18} style={{ color: 'var(--color-warning)' }} />
                        <div className="text-left">
                          <p className="font-bold">Yazdır</p>
                          <p className="text-xs" style={{ color: 'var(--color-text2)' }}>Yazıcıya gönder</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

        </div>
      )}
    </div>
  )
}
