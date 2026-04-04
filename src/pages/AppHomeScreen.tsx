import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, AlertTriangle } from 'lucide-react'
import type { OlusturulmusPlan } from '../types/takvim'
import type { PlanEntry } from '../types/planEntry'
import { showKazanimBildirimi } from '../lib/notifications'
import { getSession } from '../lib/auth'
import { syncProgressToSupabase } from '../lib/planSync'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'

/* ── Yardımcılar ─────────────────────────────────────── */

const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
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

function haftaninGunleriOlustur(planlar: PlanEntry[], tamamlananlar: Record<string, number[]>) {
  const bugun = new Date()
  const bugunGun = bugun.getDay()
  const pazartesi = new Date(bugun)
  pazartesi.setDate(bugun.getDate() - ((bugunGun === 0 ? 7 : bugunGun) - 1))

  const gunler: {
    gun: string
    tarih: number
    bugun: boolean
    dersler: { sinif: string; ders: string; kazanim: string; haftaNo: number; tamamlandi: boolean; entry: PlanEntry }[]
  }[] = []

  for (let i = 0; i < 5; i++) {
    const tarih = new Date(pazartesi)
    tarih.setDate(pazartesi.getDate() + i)
    const tarihStr = tarih.toISOString().split('T')[0]
    const isBugun = tarihStr === bugun.toISOString().split('T')[0]

    const dersler = planlar
      .filter(p => p.plan)
      .map(p => {
        const hafta = p.plan!.haftalar.find(h => tarihStr >= h.baslangicTarihi && tarihStr <= h.bitisTarihi)
        if (!hafta || hafta.tatilMi) return null
        return {
          sinif: p.label || p.sinif,
          ders: p.ders,
          kazanim: hafta.kazanim || 'Kazanım girilmemiş',
          haftaNo: hafta.haftaNo,
          tamamlandi: (tamamlananlar[p.sinif] || []).includes(hafta.haftaNo),
          entry: p,
        }
      })
      .filter(Boolean) as {
        sinif: string; ders: string; kazanim: string; haftaNo: number; tamamlandi: boolean; entry: PlanEntry
      }[]

    gunler.push({
      gun: GUNLER[tarih.getDay()],
      tarih: tarih.getDate(),
      bugun: isBugun,
      dersler,
    })
  }

  return gunler
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

  useEffect(() => {
    if (planlar.length > 0) {
      const aktifEntry = planlar[0]
      if (aktifEntry.plan) {
        const bugunStr = new Date().toISOString().split('T')[0]
        const bugunHafta = aktifEntry.plan.haftalar.find(
          h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
        )
        if (bugunHafta && !bugunHafta.tatilMi && bugunHafta.kazanim) {
          showKazanimBildirimi(bugunHafta.haftaNo, bugunHafta.kazanim, aktifEntry.ders)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planlar.length])

  /* ── Hesaplamalar ─────────────────────────────────── */

  const saat = new Date().getHours()
  let mesaj = 'İyi geceler'
  if (saat >= 6 && saat < 12) mesaj = 'Günaydın'
  else if (saat >= 12 && saat < 17) mesaj = 'İyi günler'
  else if (saat >= 17 && saat < 21) mesaj = 'İyi akşamlar'

  const haftaGunleri = planlar.length > 0 ? haftaninGunleriOlustur(planlar, tamamlananlar) : []

  const ilkPlan = planlar[0]
  const aktifHafta = ilkPlan?.plan ? (bugunHaftasiniAl(ilkPlan.plan) ?? sonrakiHaftayiAl(ilkPlan.plan)) : null
  const haftaNo = aktifHafta?.haftaNo ?? null

  // Bugünkü kazanımlar (flat list — tüm sınıflar)
  const bugunKartlari = planlar
    .filter(p => p.plan)
    .map(p => {
      const h = bugunHaftasiniAl(p.plan!)
      const sonraki = !h ? sonrakiHaftayiAl(p.plan!) : null
      const aktif = h ?? sonraki
      const tamamlandi = aktif ? (tamamlananlar[p.sinif] || []).includes(aktif.haftaNo) : false
      return {
        sinif: p.label || p.sinif,
        ders: p.ders,
        kazanim: aktif?.kazanim || (aktif?.tatilMi ? aktif.tatilAdi : '') || 'Kazanım girilmemiş',
        haftaNo: aktif?.haftaNo ?? null,
        tarih: aktif ? `${formatTarihKisa(aktif.baslangicTarihi)} – ${formatTarihKisa(aktif.bitisTarihi)}` : '',
        tatilMi: aktif?.tatilMi ?? false,
        gelecek: !h,
        tamamlandi,
        entry: p,
      }
    })

  // Deadline placeholder'ları
  const deadlines = [
    { ad: 'Not Girişi', gun: 2, renk: 'var(--color-danger)' },
    { ad: 'ZHA Tutanak', gun: 5, renk: 'var(--color-warning)' },
    { ad: 'Yazılı Sınav', gun: 12, renk: 'var(--color-success)' },
  ]

  /* ── Toggle handler ───────────────────────────────── */

  async function handleTamamlaToggle(entry: PlanEntry, hNo: number | null) {
    if (!hNo) return
    try {
      const mevcut = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = mevcut ? JSON.parse(mevcut) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[entry.sinif] || [])
      const tamamlandi = eskiListe.includes(hNo)
      const yeniListe = tamamlandi ? eskiListe.filter((n: number) => n !== hNo) : [...eskiListe, hNo]
      const yeniParsed = Array.isArray(parsed) ? { [entry.sinif]: yeniListe } : { ...parsed, [entry.sinif]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      setTamamlananlarLocal(yeniParsed)

      const session = await getSession()
      if (session) {
        const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
        const notlar = notlarItem ? JSON.parse(notlarItem) : {}
        syncProgressToSupabase(session.user.id, yeniParsed, notlar).catch(() => {})
      }

      goster(tamamlandi ? 'İşaret kaldırıldı' : 'Kazanım tamamlandı ✓', 'basari')
    } catch {
      goster('İşlem tamamlanamadı', 'hata')
    }
  }

  /* ── Render ───────────────────────────────────────── */

  return (
    <div className="page-shell">

      {/* ── Header ─────────────────────────────────── */}
      <div className="page-header stagger-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold" style={{ color: 'var(--color-text3)' }}>
              {mesaj}
            </p>
            <p
              className="font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-text1)', letterSpacing: '-.03em' }}
            >
              {ogretmenAd ? `${ogretmenAd} Hoca` : 'Öğretmen Yaver'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/app/ayarlar')}
              aria-label="Profil"
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
            >
              <span className="text-[14px]">👤</span>
            </button>
            <button
              type="button"
              aria-label="Bildirimler"
              className="w-[36px] h-[36px] rounded-full flex items-center justify-center relative transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
            >
              <Bell size={15} style={{ color: 'var(--color-text2)' }} />
              <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full" style={{ backgroundColor: 'var(--color-danger)', border: '1.5px solid var(--color-bg)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Boş durum: Onboarding ──────────────────── */}
      {planlar.length === 0 && (
        <BosdurumuEkrani
          onTamamla={entries => {
            localStorage.setItem(StorageKeys.ONBOARDING_TAMAMLANDI, '1')
            onPlanEkle(entries)
            onSinifSec(entries[0].sinif)
            navigate('/app/plan')
          }}
        />
      )}

      {planlar.length > 0 && (
        <div className="section-stack">

          {/* ── Acil Kart ─────────────────────────────── */}
          <section
            className="stagger-2"
            style={{
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-warning-s)',
              border: '1px solid var(--color-warning-b)',
              padding: '14px 16px',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-1" style={{ color: 'var(--color-warning)' }}>
                  Acil
                </p>
                <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--color-text1)' }}>
                  Not girişi son gün yaklaşıyor
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-text2)' }}>
                  2 gün kaldı · Tamamlanmamış sınıflar var
                </p>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-warning)', color: '#ffffff' }}
              >
                Tamamla →
              </span>
            </div>
          </section>

          {/* ── Bu Hafta Widget ────────────────────────── */}
          <section
            className="stagger-3 overflow-hidden"
            style={{
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="text-[14px] font-bold" style={{ color: 'var(--color-text1)' }}>
                Bu Hafta
              </span>
              {haftaNo && (
                <span
                  className="text-[12px] font-bold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {haftaNo}. Hafta
                </span>
              )}
            </div>

            <div>
              {haftaGunleri.map((g, gi) => (
                <div
                  key={g.gun}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{
                    borderBottom: gi < haftaGunleri.length - 1 ? '1px solid var(--color-border)' : 'none',
                    backgroundColor: g.bugun ? 'color-mix(in srgb, var(--color-primary) 4%, transparent)' : 'transparent',
                  }}
                >
                  {/* Gün + Tarih */}
                  <div className="w-[32px] text-center flex-shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.04em]" style={{ color: 'var(--color-text3)' }}>
                      {g.gun}
                    </p>
                    <p
                      className="font-bold leading-none"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: g.bugun ? 'var(--color-primary)' : 'var(--color-text1)', letterSpacing: '-.02em' }}
                    >
                      {g.tarih}
                    </p>
                  </div>

                  {/* Ders bilgisi */}
                  <div className="flex-1 min-w-0">
                    {g.dersler.length === 0 ? (
                      <p className="text-[12px] font-medium" style={{ color: 'var(--color-text3)' }}>Ders yok</p>
                    ) : (
                      g.dersler.map((d, di) => (
                        <div
                          key={`${d.sinif}-${di}`}
                          className="cursor-pointer"
                          onClick={() => {
                            onSinifSec(d.entry.sinif)
                            navigate(`/app/hafta/${d.haftaNo}`)
                          }}
                        >
                          <p className="text-[13px] font-bold" style={{ color: 'var(--color-text1)' }}>
                            {d.ders} · {d.sinif}
                          </p>
                          <p className="text-[11px] leading-snug line-clamp-1" style={{ color: 'var(--color-text2)' }}>
                            {d.kazanim}
                          </p>
                          {di < g.dersler.length - 1 && <div className="my-1.5" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Durum noktası */}
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {g.dersler.length === 0 ? (
                      <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: 'var(--color-border2)' }} />
                    ) : (
                      g.dersler.map((d, di) => (
                        <span
                          key={`dot-${di}`}
                          className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: d.tamamlandi
                              ? 'var(--color-success)'
                              : g.bugun
                              ? 'var(--color-warning)'
                              : 'var(--color-border2)',
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Deadline Strip ───────────��─────────────── */}
          <section className="stagger-4">
            <p className="section-label">Yaklaşan</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {deadlines.map(d => (
                <div
                  key={d.ad}
                  className="flex-shrink-0 min-w-[92px] px-3 py-3 cursor-pointer transition-all active:scale-[0.96]"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>{d.ad}</p>
                  <p
                    className="font-bold leading-none"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: d.renk, letterSpacing: '-.02em' }}
                  >
                    {d.gun}
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text3)' }}>gün kaldı</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Bugünkü Kazanımlar ─────────────────────── */}
          <section className="stagger-5">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label mb-0">Bugünkü Kazanımlar</span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--color-text2)' }}>{bugunKartlari.length} sınıf</span>
            </div>
            <div className="flex flex-col gap-2">
              {bugunKartlari.map(item => (
                <div
                  key={`${item.sinif}-${item.haftaNo ?? 'yok'}`}
                  className="flex items-start gap-3 px-3.5 py-3"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleTamamlaToggle(item.entry, item.haftaNo)}
                    aria-label={`${item.sinif} kazanımı tamamla`}
                    className="w-5 h-5 rounded mt-0.5 flex items-center justify-center transition-all active:scale-90"
                    style={{
                      backgroundColor: item.tamamlandi ? 'var(--color-success)' : 'transparent',
                      border: `1.5px solid ${item.tamamlandi ? 'var(--color-success)' : 'var(--color-border2)'}`,
                      color: item.tamamlandi ? '#fff' : 'transparent',
                      fontSize: '10px',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </button>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[13px] font-bold" style={{ color: 'var(--color-text1)' }}>{item.sinif}</p>
                      <button
                        type="button"
                        onClick={() => {
                          onSinifSec(item.entry.sinif)
                          if (item.haftaNo) navigate(`/app/hafta/${item.haftaNo}`)
                          else navigate('/app/plan')
                        }}
                        className="inline-flex items-center gap-0.5 text-[11px] font-bold flex-shrink-0"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Detay <ChevronRight size={12} />
                      </button>
                    </div>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--color-text3)' }}>
                      {item.ders} · {item.tarih || 'Takvim dışı'}
                    </p>
                    <p
                      className="text-[12px] leading-5 line-clamp-2"
                      style={{ color: item.tatilMi ? 'var(--color-warning)' : 'var(--color-text1)' }}
                    >
                      {item.kazanim}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}
    </div>
  )
}
