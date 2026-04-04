import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight } from 'lucide-react'
import type { OlusturulmusPlan } from '../types/takvim'
import type { PlanEntry } from '../types/planEntry'
import { showKazanimBildirimi } from '../lib/notifications'
import { getSession } from '../lib/auth'
import { syncProgressToSupabase } from '../lib/planSync'
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'
import { SectionHeader } from '../components/UI/SectionHeader'

function formatTarihKisa(isoTarih: string) {
  const aylar = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${d.getDate()} ${aylar[d.getMonth()]}`
}

function bugunHaftasiniAl(plan: OlusturulmusPlan) {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi) ?? null
}

function sonrakiHaftayiAl(plan: OlusturulmusPlan) {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => h.baslangicTarihi > bugunStr) ?? null
}

interface AppHomeScreenProps {
  planlar: PlanEntry[]
  onPlanEkle: (entries: PlanEntry[]) => void
  onSinifSec: (sinif: string) => void
  syncing?: boolean
  tamamlananlar?: Record<string, number[]>
}

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
    if (syncing) goster('Planlar buluttan guncelleniyor...', 'bilgi', 3000)
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

  const saat = new Date().getHours()
  let mesaj = 'Iyi geceler'
  if (saat >= 6 && saat < 12) mesaj = 'Gunaydin'
  else if (saat >= 12 && saat < 17) mesaj = 'Iyi gunler'
  else if (saat >= 17 && saat < 21) mesaj = 'Iyi aksamlar'

  const bugunKartlari = planlar
    .filter(p => p.plan)
    .map(p => {
      const h = bugunHaftasiniAl(p.plan!)
      const sonraki = !h ? sonrakiHaftayiAl(p.plan!) : null
      const aktifHafta = h ?? sonraki
      const tamamlandi = aktifHafta ? (tamamlananlar[p.sinif] || []).includes(aktifHafta.haftaNo) : false
      return {
        sinif: p.label || p.sinif,
        ders: p.ders,
        kazanim: aktifHafta?.kazanim || (aktifHafta?.tatilMi ? aktifHafta.tatilAdi : '') || 'Kazanim girilmemis',
        haftaNo: aktifHafta?.haftaNo ?? null,
        tarih: aktifHafta ? `${formatTarihKisa(aktifHafta.baslangicTarihi)} - ${formatTarihKisa(aktifHafta.bitisTarihi)}` : '',
        tatilMi: aktifHafta?.tatilMi ?? false,
        gelecek: !h,
        tamamlandi,
        entry: p,
      }
    })

  const sonrakiGorev = bugunKartlari.find(item => !item.tatilMi && !item.tamamlandi) ?? bugunKartlari[0] ?? null

  async function handleTamamlaToggle(entry: PlanEntry, haftaNo: number | null) {
    if (!haftaNo) return
    try {
      const mevcut = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR)
      const parsed = mevcut ? JSON.parse(mevcut) : {}
      const eskiListe: number[] = Array.isArray(parsed) ? parsed : (parsed[entry.sinif] || [])
      const tamamlandi = eskiListe.includes(haftaNo)
      const yeniListe = tamamlandi ? eskiListe.filter(n => n !== haftaNo) : [...eskiListe, haftaNo]
      const yeniParsed = Array.isArray(parsed) ? { [entry.sinif]: yeniListe } : { ...parsed, [entry.sinif]: yeniListe }
      localStorage.setItem(StorageKeys.TAMAMLANAN_HAFTALAR, JSON.stringify(yeniParsed))
      setTamamlananlarLocal(yeniParsed)

      const session = await getSession()
      if (session) {
        const notlarItem = localStorage.getItem(StorageKeys.HAFTA_NOTLARI)
        const notlar = notlarItem ? JSON.parse(notlarItem) : {}
        syncProgressToSupabase(session.user.id, yeniParsed, notlar).catch(() => {})
      }

      goster(tamamlandi ? 'Tamamlandi isareti kaldirildi' : 'Kazanim tamamlandi olarak isaretlendi', 'basari')
    } catch {
      goster('Islem tamamlanamadi', 'hata')
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header stagger-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text3)', marginBottom: '2px' }}>
              {mesaj}
            </p>
            <p
              className="font-bold tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-text1)', letterSpacing: '-.03em' }}
            >
              {ogretmenAd ? `${ogretmenAd} Hoca` : 'Ogretmen Yaver'}
            </p>
          </div>

          <button
            type="button"
            aria-label="Bildirimler"
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center relative transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
          >
            <Bell size={16} style={{ color: 'var(--color-text2)' }} />
            <span className="absolute top-[8px] right-[8px] w-[7px] h-[7px] rounded-full" style={{ backgroundColor: 'var(--color-danger)', border: '1.5px solid var(--color-bg)' }} />
          </button>
        </div>
      </div>

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
          {sonrakiGorev && (
            <section
              className="page-hero stagger-2 relative overflow-hidden"
              style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '18px' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-pop))' }} />
              <p className="text-[10px] font-bold uppercase tracking-[.12em] mb-1 mt-1" style={{ color: 'var(--color-text3)' }}>
                Bugunun odagi
              </p>
              <p className="text-[18px] font-bold mb-1" style={{ color: 'var(--color-text1)' }}>
                {sonrakiGorev.sinif} - {sonrakiGorev.ders}
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text2)' }}>{sonrakiGorev.tarih}</p>
              <p className="text-sm leading-6 mb-2" style={{ color: 'var(--color-text1)' }}>{sonrakiGorev.kazanim}</p>

              <button
                type="button"
                onClick={() => {
                  onSinifSec(sonrakiGorev.entry.sinif)
                  if (sonrakiGorev.haftaNo) navigate(`/app/hafta/${sonrakiGorev.haftaNo}`)
                  else navigate('/app/plan')
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold mt-1"
                style={{ color: 'var(--color-primary)' }}
              >
                Haftanin detayina git
                <ChevronRight size={12} />
              </button>
            </section>
          )}

          <section className="stagger-3">
            <SectionHeader title="Bugunku kazanımlar" meta={`${bugunKartlari.length} sinif`} />
            <div className="flex flex-col gap-2.5">
              {bugunKartlari.map(item => (
                <div
                  key={`${item.sinif}-${item.haftaNo ?? 'yok'}`}
                  className="px-4 py-4"
                  style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleTamamlaToggle(item.entry, item.haftaNo)}
                      aria-label={`${item.sinif} kazanimi tamamlandi olarak isaretle`}
                      className="w-6 h-6 rounded-md mt-0.5 flex items-center justify-center transition-all active:scale-95"
                      style={{
                        backgroundColor: item.tamamlandi ? 'var(--color-success)' : 'var(--color-surface)',
                        border: `1.5px solid ${item.tamamlandi ? 'var(--color-success)' : 'var(--color-border2)'}`,
                        color: item.tamamlandi ? '#ffffff' : 'transparent',
                      }}
                    >
                      ✓
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: 'var(--color-text1)' }}>{item.sinif}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text3)' }}>
                            {item.ders} - {item.tarih || 'Takvim disi'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSinifSec(item.entry.sinif)
                            if (item.haftaNo) navigate(`/app/hafta/${item.haftaNo}`)
                            else navigate('/app/plan')
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Detay
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      <p className="text-sm leading-6" style={{ color: item.tatilMi ? 'var(--color-warning)' : 'var(--color-text1)' }}>
                        {item.kazanim}
                      </p>
                    </div>
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
