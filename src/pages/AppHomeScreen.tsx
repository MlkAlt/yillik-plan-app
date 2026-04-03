import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronRight, Plus, Upload } from 'lucide-react';
import type { OlusturulmusPlan } from '../types/takvim';
import type { PlanEntry } from '../types/planEntry';
import { showKazanimBildirimi } from '../lib/notifications';
import { getYilSecenekleri } from '../lib/dersSinifMap';
import { BottomSheet } from '../components/UI/BottomSheet';
import { PlanSelector } from '../components/PlanSelector';
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani';
import { StorageKeys } from '../lib/storageKeys';
import { useToast } from '../lib/toast';

function formatTarihKisa(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
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
  planlar: PlanEntry[];
  onPlanEkle: (entries: PlanEntry[]) => void;
  onSinifSec: (sinif: string) => void;
  syncing?: boolean;
  tamamlananlar?: Record<string, number[]>;
}

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec, syncing, tamamlananlar: tamamlananlarProp }: AppHomeScreenProps) {
  const navigate = useNavigate()
  const { goster } = useToast()
  const [planSelectorAcik, setPlanSelectorAcik] = useState(false)

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
    if (syncing) goster('Planlar buluttan güncelleniyor...', 'bilgi', 4000)
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

  // Karşılama metni
  const saat = new Date().getHours()
  let mesaj = 'İyi geceler'
  if (saat >= 6 && saat < 12) mesaj = 'Günaydın'
  else if (saat >= 12 && saat < 17) mesaj = 'İyi günler'
  else if (saat >= 17 && saat < 21) mesaj = 'İyi akşamlar'

  // Bu haftanın tarih aralığı (ilk plandan)
  const buHaftaAralik = (() => {
    const ilk = planlar[0]?.plan
    if (!ilk) return ''
    const h = bugunHaftasiniAl(ilk)
    if (!h) return ''
    return `${formatTarihKisa(h.baslangicTarihi)} – ${formatTarihKisa(h.bitisTarihi)}`
  })()

  // Bu hafta kazanım satırları (her plan için bir satır)
  const kazanimSatirlari = planlar
    .filter(p => p.plan)
    .map(p => {
      const h = bugunHaftasiniAl(p.plan!)
      const sonraki = !h ? sonrakiHaftayiAl(p.plan!) : null
      const tamamlandi = h ? (tamamlananlar[p.sinif] || []).includes(h.haftaNo) : false
      return {
        sinif: p.label || p.sinif,
        ders: p.ders,
        kazanim: h?.kazanim || (h?.tatilMi ? h.tatilAdi : '') || sonraki?.kazanim || '',
        haftaNo: h?.haftaNo ?? sonraki?.haftaNo ?? null,
        tatilMi: h?.tatilMi ?? false,
        geleceK: !h,
        tamamlandi,
        entry: p,
      }
    })

  return (
    <div className="pb-8 w-full max-w-lg mx-auto">

      {/* ── TOPBAR ── */}
      <div
        className="px-[18px] pt-[10px] pb-3 flex items-center justify-between"
      >
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--color-text3)', marginBottom: '2px' }}
          >
            {mesaj}{ogretmenAd ? '' : ' 👋'}
          </p>
          <p
            className="font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-text1)', letterSpacing: '-.03em' }}
          >
            {ogretmenAd ? `${ogretmenAd} Hoca` : 'Öğretmen Yaver'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-[33px] h-[33px] rounded-full flex items-center justify-center relative transition-all active:scale-90"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Bell size={15} style={{ color: 'var(--color-text2)' }} />
            {/* bildirim noktası */}
            <span
              className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full"
              style={{
                backgroundColor: 'var(--color-danger)',
                border: '1.5px solid var(--color-bg)',
              }}
            />
          </button>
          <button
            className="w-[33px] h-[33px] rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <User size={15} style={{ color: 'var(--color-text2)' }} />
          </button>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3">

        {/* ── PLAN YOK → Onboarding overlay (portal, blur arkaplanlı) ── */}

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
          <>
            {/* ── ACİL KART ── */}
            <div
              className="px-4 py-3.5 card-lift stagger-1"
              style={{
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-warning-s)',
                border: '1px solid var(--color-warning-b)',
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[.1em] mb-1"
                style={{ color: 'var(--color-warning)' }}
              >
                Acil
              </p>
              <p className="text-[15px] font-bold mb-0.5" style={{ color: 'var(--color-text1)' }}>
                Not girişi son gün yaklaşıyor
              </p>
              <p className="text-xs mb-2.5" style={{ color: 'var(--color-text2)' }}>
                2 gün kaldı · Tamamlanmamış sınıflar var
              </p>
              <span
                className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
                  color: 'var(--color-warning)',
                }}
              >
                Şimdi Tamamla →
              </span>
            </div>

            {/* ── TASARRUF KARTI ── */}
            <div
              className="relative overflow-hidden stagger-2"
              style={{
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                padding: '18px',
              }}
            >
              {/* Üst şerit: blue → indigo */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{
                  background: 'linear-gradient(90deg, var(--color-primary), #818cf8)',
                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                }}
              />
              <div className="flex justify-between items-start mb-3 mt-1">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[.1em] mb-1"
                    style={{ color: 'var(--color-text3)' }}
                  >
                    Bu ay tasarruf
                  </p>
                  <p
                    className="font-bold leading-none mb-1"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '48px',
                      color: 'var(--color-pop)',
                      letterSpacing: '-.04em',
                      animation: 'count-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
                    }}
                  >
                    {planlar.length > 0
                      ? Math.round(planlar.reduce((acc, p) => {
                          const done = (tamamlananlar[p.sinif] || []).length
                          return acc + done * 0.5
                        }, 0) * 10) / 10
                      : 0}
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text2)' }}>
                    saat geri aldınız
                  </p>
                </div>
                <div
                  className="px-2.5 py-1.5 h-fit"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-success-s)',
                    border: '1px solid var(--color-success-b)',
                  }}
                >
                  <span className="text-[11px] font-bold" style={{ color: '#047857' }}>
                    ↑ Kazanılan
                  </span>
                </div>
              </div>
              <div
                className="flex pt-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                {[
                  { sayi: planlar.length, etiket: 'Ders planı' },
                  {
                    sayi: planlar.reduce((acc, p) => acc + (tamamlananlar[p.sinif] || []).length, 0),
                    etiket: 'Tamamlanan',
                  },
                  {
                    sayi: planlar.reduce((acc, p) => {
                      const total = p.plan?.haftalar.filter(h => !h.tatilMi).length || 0
                      const done = (tamamlananlar[p.sinif] || []).length
                      return acc + Math.max(0, total - done)
                    }, 0),
                    etiket: 'Kalan hafta',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center"
                    style={i > 0 ? { borderLeft: '1px solid var(--color-border)' } : {}}
                  >
                    <p
                      className="font-bold"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-text1)', letterSpacing: '-.02em' }}
                    >
                      {item.sayi}
                    </p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text3)' }}>
                      {item.etiket}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BU HAFTA WİDGET ── */}
            <div className="stagger-3">
              <p
                className="text-[11px] font-bold uppercase tracking-[.1em] mb-2"
                style={{ color: 'var(--color-text3)' }}
              >
                Bu Hafta{buHaftaAralik ? ` · ${buHaftaAralik}` : ''}
              </p>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                }}
              >
                {/* Kart başlığı */}
                <div
                  className="flex justify-between items-center px-4 py-3"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>
                    Dersler & Kazanımlar
                  </span>
                  {kazanimSatirlari[0]?.haftaNo && (
                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                      {kazanimSatirlari[0].haftaNo}. Hafta
                    </span>
                  )}
                </div>

                {/* Kazanım satırları */}
                {kazanimSatirlari.length === 0 ? (
                  <div className="px-4 py-4">
                    <p className="text-sm" style={{ color: 'var(--color-text3)' }}>Plan dönemi dışı</p>
                  </div>
                ) : (
                  kazanimSatirlari.map((satir, i) => (
                    <button
                      key={i}
                      onClick={() => { onSinifSec(satir.entry.sinif); navigate('/app/plan') }}
                      className="w-full flex items-start gap-3 px-4 py-[11px] text-left transition-all active:opacity-70"
                      style={
                        i < kazanimSatirlari.length - 1
                          ? { borderBottom: '1px solid var(--color-border)' }
                          : {}
                      }
                    >
                      {/* Sınıf etiketi */}
                      <div className="min-w-[40px] flex-shrink-0">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[.04em]"
                          style={{ color: 'var(--color-text3)' }}
                        >
                          Sınıf
                        </p>
                        <p
                          className="font-bold"
                          style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--color-text1)' }}
                        >
                          {satir.sinif.replace(/[^0-9A-Za-z-]/g, '').slice(0, 4)}
                        </p>
                      </div>
                      {/* Ders + kazanım */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold mb-0.5 truncate" style={{ color: 'var(--color-text1)' }}>
                          {satir.ders}
                          {satir.sinif !== satir.entry.sinif ? ` · ${satir.sinif}` : ` · ${satir.sinif}`}
                        </p>
                        <p
                          className="text-[11px] leading-relaxed line-clamp-2"
                          style={{ color: 'var(--color-text2)' }}
                        >
                          {satir.tatilMi
                            ? `🎉 ${satir.kazanim}`
                            : satir.kazanim || 'Kazanım girilmemiş'}
                        </p>
                      </div>
                      {/* Durum noktası */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{
                          backgroundColor: satir.tatilMi
                            ? 'var(--color-warning)'
                            : satir.tamamlandi
                            ? 'var(--color-success)'
                            : satir.geleceK
                            ? 'var(--color-border2)'
                            : 'var(--color-warning)',
                        }}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── YAKLAŞAN ── */}
            <div className="stagger-4">
              <p
                className="text-[11px] font-bold uppercase tracking-[.1em] mb-2"
                style={{ color: 'var(--color-text3)' }}
              >
                Yaklaşan
              </p>
              <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
                {[
                  { ad: 'Not Girişi', gun: 2, renk: 'var(--color-danger)' },
                  { ad: 'ZHA Tutanak', gun: 5, renk: 'var(--color-warning)' },
                  { ad: 'Yazılı Sınav', gun: 12, renk: 'var(--color-success)' },
                  { ad: 'Karne', gun: 28, renk: 'var(--color-success)' },
                ].map(item => (
                  <div
                    key={item.ad}
                    className="flex-shrink-0 cursor-pointer transition-all active:scale-95"
                    style={{
                      minWidth: '88px',
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>
                      {item.ad}
                    </p>
                    <p
                      className="font-bold leading-none"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.renk, letterSpacing: '-.02em' }}
                    >
                      {item.gun}
                    </p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text3)' }}>
                      gün kaldı
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── HIZLI ERİŞİM ── */}
            <div className="stagger-5">
              <p
                className="text-[11px] font-bold uppercase tracking-[.1em] mb-2"
                style={{ color: 'var(--color-text3)' }}
              >
                Hızlı Erişim
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setPlanSelectorAcik(true)}
                  className="flex items-center gap-3 px-3.5 py-3 card-lift w-full text-left"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary-s), var(--color-primary-b))',
                      border: '2px dashed var(--color-primary-b)',
                    }}
                  >
                    <Plus size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-bold" style={{ color: 'var(--color-text1)' }}>
                      Yeni Plan Oluştur
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text2)' }}>
                      Ders ve sınıf seç, plan hazır
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--color-text3)' }} />
                </button>
                <button
                  onClick={() => navigate('/app/yukle')}
                  className="flex items-center gap-3 px-3.5 py-3 card-lift w-full text-left"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-success-s), var(--color-success-b))',
                      border: '2px dashed var(--color-success-b)',
                    }}
                  >
                    <Upload size={16} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-bold" style={{ color: 'var(--color-text1)' }}>
                      Dosya Yükle
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-text2)' }}>
                      Excel / Word planını içe aktar
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--color-text3)' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* YENİ PLAN EKLE — Bottom Sheet */}
      <BottomSheet open={planSelectorAcik} onClose={() => setPlanSelectorAcik(false)}>
        <PlanSelector
          yil={getYilSecenekleri()[0]}
          onComplete={entries => {
            onPlanEkle(entries)
            onSinifSec(entries[0].sinif)
            setPlanSelectorAcik(false)
            navigate('/app/plan')
          }}
          onCancel={() => setPlanSelectorAcik(false)}
        />
      </BottomSheet>
    </div>
  )
}
