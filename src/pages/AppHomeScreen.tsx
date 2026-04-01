import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta, OlusturulmusPlan } from '../types/takvim';
import type { PlanEntry } from '../types/planEntry';
import { showKazanimBildirimi } from '../lib/notifications';
import { getYilSecenekleri } from '../lib/dersSinifMap';
import { BottomSheet } from '../components/UI/BottomSheet';
import { PlanSelector } from '../components/PlanSelector';
import { useToast } from '../lib/toast';
import { IlerlemeGostergesi } from '../components/IlerlemeGostergesi/IlerlemeGostergesi';
import { BosdurumuEkrani } from '../components/BosdurumuEkrani/BosdurumuEkrani';
import { StorageKeys } from '../lib/storageKeys';
import { Plus, Upload } from 'lucide-react';
import { Card } from '../components/UI/Card';

function formatTarihKısa(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${d.getDate()} ${aylar[d.getMonth()]}`
}

function bugunHaftasiniAl(plan: OlusturulmusPlan): Hafta | null {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi) || null
}

function sonrakiHaftayiAl(plan: OlusturulmusPlan): Hafta | null {
  const bugunStr = new Date().toISOString().split('T')[0]
  return plan.haftalar.find(h => h.baslangicTarihi > bugunStr) || null
}

interface AppHomeScreenProps {
  planlar: PlanEntry[];
  onPlanEkle: (entries: PlanEntry[]) => void;
  onSinifSec: (sinif: string) => void;
  syncing?: boolean;
  tamamlananlar?: Record<string, number[]>;
}

function ProgressRing({ yuzde, selected = false, size = 20 }: { yuzde: number; selected?: boolean; size?: number }) {
  const r = (size - 5) / 2
  const cevre = 2 * Math.PI * r
  const offset = cevre - (yuzde / 100) * cevre
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={selected ? 'rgba(255,255,255,0.2)' : '#e5e7eb'} strokeWidth="2.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={selected ? 'rgba(255,255,255,0.85)' : '#F59E0B'} strokeWidth="2.5"
        strokeDasharray={cevre} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  )
}

// Tüm sınıfların bu haftaki kazanımlarını tek kartta gösteren component
function BuHaftaKarti({
  planlar,
  tamamlananlar,
  onSinifSec,
  navigate,
}: {
  planlar: PlanEntry[];
  tamamlananlar: Record<string, number[]>;
  onSinifSec: (sinif: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [seciliSinif, setSeciliSinif] = useState(() => {
    const aktif = localStorage.getItem(StorageKeys.AKTIF_SINIF)
    if (aktif && planlar.find(p => p.sinif === aktif)) return aktif
    return planlar[0]?.sinif || ''
  })

  const bugunGun = new Date().getDay()
  const haftaSonu = bugunGun === 0 || bugunGun === 6

  const aktifEntry = planlar.find(p => p.sinif === seciliSinif) || planlar[0]
  const aktifHafta = aktifEntry?.plan ? bugunHaftasiniAl(aktifEntry.plan) : null
  const sonrakiHafta = !aktifHafta && aktifEntry?.plan ? sonrakiHaftayiAl(aktifEntry.plan) : null

  function handleKazanimTikla() {
    if (!aktifEntry) return
    onSinifSec(aktifEntry.sinif)
    navigate('/app/plan')
  }

  const haftaBilgi = aktifHafta
    ? `${aktifHafta.haftaNo}. Hafta · ${formatTarihKısa(aktifHafta.baslangicTarihi)}–${formatTarihKısa(aktifHafta.bitisTarihi)}`
    : sonrakiHafta
    ? `Sonraki: ${sonrakiHafta.haftaNo}. Hafta · ${formatTarihKısa(sonrakiHafta.baslangicTarihi)}`
    : 'Bu Hafta'

  return (
    <Card className="mb-5">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bu Hafta</span>
        <span className="text-xs text-gray-400 font-medium">{haftaBilgi}</span>
      </div>

      {/* Kazanım içeriği — tıklanabilir */}
      <button
        onClick={handleKazanimTikla}
        className="w-full text-left mb-4 group h-[96px] overflow-hidden"
      >
        {/* Hafta sonu */}
        {haftaSonu && !aktifHafta && (
          <p className="font-bold text-gray-400">Hafta sonu ☕</p>
        )}

        {/* Tatil */}
        {aktifHafta?.tatilMi && (
          <p className="font-bold text-[#F59E0B] text-base">🎉 {aktifHafta.tatilAdi}</p>
        )}

        {/* Normal hafta */}
        {aktifHafta && !aktifHafta.tatilMi && (
          <>
            {aktifHafta.uniteAdi && (
              <p className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider mb-1.5">
                {aktifHafta.uniteAdi}
              </p>
            )}
            <p className="text-[#2D5BE3] font-semibold text-base leading-snug group-active:opacity-70 transition-opacity">
              {aktifHafta.kazanim || 'Bu hafta için kazanım girilmemiş.'}
            </p>
            {aktifHafta.kazanimDetay && (
              <p className="text-gray-500 text-sm mt-1.5 leading-relaxed line-clamp-2">
                {aktifHafta.kazanimDetay}
              </p>
            )}
          </>
        )}

        {/* Plan dönemi dışı */}
        {!aktifHafta && !haftaSonu && (
          <p className="text-gray-400 text-sm">
            {sonrakiHafta ? `Pazartesi başlıyor: ${sonrakiHafta.kazanim || sonrakiHafta.haftaNo + '. hafta'}` : 'Plan dönemi dışı'}
          </p>
        )}

        <p className="text-[11px] text-gray-300 mt-2 font-medium group-hover:text-gray-400 transition-colors">
          Yıllık plana git →
        </p>
      </button>

      {/* Sınıf seçici — birden fazla sınıf varsa */}
      {planlar.length > 1 && (
        <div className="pt-3 border-t border-[#E7E5E4]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sınıf seç</p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 mb-2">
            {planlar.map(entry => {
              const total = entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0
              const done = tamamlananlar[entry.sinif]?.length || 0
              const yuzde = total > 0 ? Math.round((done / total) * 100) : 0
              const isSelected = entry.sinif === seciliSinif
              return (
                <button
                  key={entry.sinif}
                  onClick={() => { setSeciliSinif(entry.sinif); onSinifSec(entry.sinif); }}
                  className={`flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border font-bold text-sm transition-all active:scale-95 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#2D5BE3] border-[#2D5BE3] text-white'
                      : 'bg-[#FAFAF9] border-[#E7E5E4] text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <ProgressRing yuzde={yuzde} selected={isSelected} size={20} />
                  {entry.label || entry.sinif}
                </button>
              )
            })}
          </div>
          {/* Aktif sınıf için ilerleme metni */}
          {(() => {
            const entry = planlar.find(p => p.sinif === seciliSinif) || planlar[0]
            const total = entry?.plan?.haftalar.filter(h => !h.tatilMi).length || 0
            const done = tamamlananlar[entry?.sinif || '']?.length || 0
            const bitisTarihi = entry?.plan?.haftalar[entry.plan.haftalar.length - 1]?.bitisTarihi || ''
            return <IlerlemeGostergesi tamamlanan={done} toplam={total} bitisTarihi={bitisTarihi} />
          })()}
        </div>
      )}

      {/* Tek sınıf — alt progress */}
      {planlar.length === 1 && (() => {
        const entry = planlar[0]
        const total = entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0
        const done = tamamlananlar[entry.sinif]?.length || 0
        const bitisTarihi = entry.plan?.haftalar[entry.plan.haftalar.length - 1]?.bitisTarihi || ''
        return (
          <div className="pt-3 border-t border-[#E7E5E4]">
            <IlerlemeGostergesi tamamlanan={done} toplam={total} bitisTarihi={bitisTarihi} />
          </div>
        )
      })()}
    </Card>
  )
}

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec, syncing, tamamlananlar: tamamlananlarProp }: AppHomeScreenProps) {
  const navigate = useNavigate();
  const { goster } = useToast();
  const [planSelectorAcik, setPlanSelectorAcik] = useState(false);

  const [ogretmenAd] = useState(() => {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.adSoyad) return parsed.adSoyad.trim().split(' ')[0] as string;
      }
    } catch { /* localStorage okunamadı */ }
    return '';
  });

  // Prop varsa kullan, yoksa localStorage'dan oku (fallback)
  const [tamamlananlarLocal, setTamamlananlarLocal] = useState<Record<string, number[]>>(() => {
    if (tamamlananlarProp) return tamamlananlarProp
    try {
      const tItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR);
      if (tItem) {
        const parsed = JSON.parse(tItem);
        if (Array.isArray(parsed)) {
          const sinif = planlar[0]?.sinif || '';
          return sinif ? { [sinif]: parsed } : {};
        }
        return parsed;
      }
    } catch { /* localStorage okunamadı */ }
    return {};
  });

  const tamamlananlar = tamamlananlarProp ?? tamamlananlarLocal

  useEffect(() => {
    if (syncing) {
      goster('Planlar buluttan güncelleniyor...', 'bilgi', 4000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing]);

  useEffect(() => {
    // syncing false'a döndüğünde (Supabase sync tamamlandı) ve prop yoksa yenile
    if (!syncing && !tamamlananlarProp) {
      try {
        const tItem = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR);
        if (tItem) {
          const parsed = JSON.parse(tItem);
          if (Array.isArray(parsed)) {
            const sinif = planlar[0]?.sinif || '';
            setTamamlananlarLocal(sinif ? { [sinif]: parsed } : {});
          } else {
            setTamamlananlarLocal(parsed);
          }
        }
      } catch { /* localStorage okunamadı */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing]);

  useEffect(() => {
    // Haftanın kazanımını bildirim olarak göster (yeni hafta ise)
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
  }, [planlar.length]);

  const saat = new Date().getHours();
  let mesaj = 'İyi geceler';
  if (saat >= 6 && saat < 12) mesaj = 'Günaydın';
  else if (saat >= 12 && saat < 17) mesaj = 'İyi günler';
  else if (saat >= 17 && saat < 21) mesaj = 'İyi akşamlar';
  const karsilama = ogretmenAd ? `${mesaj}, ${ogretmenAd}!` : `${mesaj}!`;

  return (
    <div className="p-4 pb-20 w-full max-w-lg mx-auto">
      {/* BU HAFTA KARTI — birincil içerik, en üstte */}
      {planlar.length > 0 && (
        <div className="mt-2 mb-4">
          <BuHaftaKarti
            planlar={planlar}
            tamamlananlar={tamamlananlar}
            onSinifSec={onSinifSec}
            navigate={navigate}
          />
        </div>
      )}

      {/* KARSILAMA — ikincil, BuHaftaKarti'nın altında */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-500">{karsilama}</p>
      </div>

      {/* ONBOARDING — planlar yoksa her zaman göster (ilk kurulum veya tüm planlar silindi) */}
      {planlar.length === 0 && (
        <div className="mb-5">
          <BosdurumuEkrani
            onTamamla={entries => {
              localStorage.setItem(StorageKeys.ONBOARDING_TAMAMLANDI, '1')
              onPlanEkle(entries)
              onSinifSec(entries[0].sinif)
              navigate('/app/plan')
            }}
          />
        </div>
      )}

      {/* HIZLI ERİŞİM */}
      {planlar.length > 0 && (
        <div>
          <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 pl-1">
            Hızlı Erişim
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlanSelectorAcik(true)}
              className="bg-[#FAFAF9] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-4 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <Plus size={24} className="text-[#2D5BE3]" />
              <span className="text-sm font-bold text-[#2D5BE3]">Yeni Plan Ekle</span>
            </button>
            <button
              onClick={() => navigate('/app/yukle')}
              className="bg-[#FAFAF9] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-4 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <Upload size={24} className="text-[#2D5BE3]" />
              <span className="text-sm font-bold text-[#2D5BE3]">Dosya Yükle</span>
            </button>
          </div>
        </div>
      )}

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
  );
}
