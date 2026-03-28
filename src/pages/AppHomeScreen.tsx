import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta, OlusturulmusPlan } from '../types/takvim';
import type { PlanEntry } from '../types/planEntry';
import { showKazanimBildirimi } from '../lib/notifications';
import { getYilSecenekleri } from '../lib/dersSinifMap';
import { PlanSelector } from '../components/PlanSelector';
import { BottomSheet } from '../components/UI/BottomSheet';

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
    const aktif = localStorage.getItem('aktif-sinif')
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
    <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-5">
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
            <p className="text-[#2D5BE3] font-bold text-[15px] leading-snug group-active:opacity-70 transition-opacity">
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
        <div className="flex gap-2 pt-3 border-t border-[#E7E5E4] overflow-x-auto pb-0.5 -mx-1 px-1">
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
      )}

      {/* Tek sınıf — alt progress */}
      {planlar.length === 1 && (() => {
        const entry = planlar[0]
        const total = entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0
        const done = tamamlananlar[entry.sinif]?.length || 0
        const yuzde = total > 0 ? Math.round((done / total) * 100) : 0
        return (
          <div className="flex items-center gap-3 pt-3 border-t border-[#E7E5E4]">
            <ProgressRing yuzde={yuzde} size={28} />
            <span className="text-xs text-gray-400 font-medium">{done}/{total} hafta tamamlandı</span>
          </div>
        )
      })()}
    </div>
  )
}

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec, syncing, tamamlananlar: tamamlananlarProp }: AppHomeScreenProps) {
  const navigate = useNavigate();
  const [planSelectorAcik, setPlanSelectorAcik] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'branch' | 'configure'>('branch');

  const [ogretmenAd] = useState(() => {
    try {
      const item = localStorage.getItem('ogretmen-ayarlari');
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
      const tItem = localStorage.getItem('tamamlanan-haftalar');
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
    // syncing false'a döndüğünde (Supabase sync tamamlandı) ve prop yoksa yenile
    if (!syncing && !tamamlananlarProp) {
      try {
        const tItem = localStorage.getItem('tamamlanan-haftalar');
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
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* KARSILAMA */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#2D5BE3]">{karsilama}</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Bu haftanın kazanımları</p>
      </div>

      {/* Supabase sync bildirimi */}
      {syncing && (
        <div className="mb-4 bg-[#2D5BE3]/5 border border-[#2D5BE3]/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2 animate-fade-in">
          <svg className="animate-spin text-[#2D5BE3] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-xs font-semibold text-[#2D5BE3]">Planlar buluttan güncelleniyor...</span>
        </div>
      )}

      {/* ONBOARDING — planlar yoksa her zaman göster (ilk kurulum veya tüm planlar silindi) */}
      {planlar.length === 0 && (
        <div className="mb-5">
          {/* Karşılama başlığı */}
          <div className="text-center mb-6 px-2">
            <div className="text-5xl mb-3">{onboardingStep === 'branch' ? '📋' : '🎯'}</div>
            <h2 className="text-xl font-bold text-[#1C1917] mb-1.5">
              {onboardingStep === 'branch' ? 'İlk planını oluştur' : 'Sınıflarını seç'}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {onboardingStep === 'branch'
                ? 'Branşını seç, sınıflarını belirle — MEB takvimine göre yıllık planın hazır olsun.'
                : 'Hangi sınıflar için plan oluşturmak istiyorsun?'}
            </p>
          </div>
          {/* Adım göstergesi */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                onboardingStep === 'branch' ? 'bg-[#2D5BE3] text-white' : 'bg-[#059669] text-white'
              }`}>
                {onboardingStep === 'branch' ? '1' : '✓'}
              </div>
              <span className={`text-xs font-semibold transition-colors ${
                onboardingStep === 'branch' ? 'text-[#2D5BE3]' : 'text-[#059669]'
              }`}>Branş</span>
            </div>
            <div className={`w-8 h-px transition-colors ${onboardingStep === 'configure' ? 'bg-[#2D5BE3]' : 'bg-[#E7E5E4]'}`} />
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                onboardingStep === 'configure' ? 'bg-[#2D5BE3] text-white' : 'bg-[#E7E5E4] text-gray-400'
              }`}>2</div>
              <span className={`text-xs font-semibold transition-colors ${
                onboardingStep === 'configure' ? 'text-[#2D5BE3]' : 'text-gray-400'
              }`}>Sınıf</span>
            </div>
            <div className="w-8 h-px bg-[#E7E5E4]" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#E7E5E4] text-gray-400 text-xs font-bold flex items-center justify-center">3</div>
              <span className="text-xs font-semibold text-gray-400">Hazır</span>
            </div>
          </div>
          <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5">
            <PlanSelector
              yil={getYilSecenekleri()[0]}
              onStepChange={setOnboardingStep}
              onComplete={entries => {
                localStorage.setItem('onboarding-tamamlandi', '1')
                onPlanEkle(entries)
                onSinifSec(entries[0].sinif)
                navigate('/app/plan')
              }}
            />
          </div>
        </div>
      )}

      {/* BU HAFTA KARTI — tüm sınıflar tek kartta */}
      {planlar.length > 0 && (
        <BuHaftaKarti
          planlar={planlar}
          tamamlananlar={tamamlananlar}
          onSinifSec={onSinifSec}
          navigate={navigate}
        />
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
              <span className="text-2xl">➕</span>
              <span className="text-sm font-bold text-[#2D5BE3]">Yeni Plan Ekle</span>
            </button>
            <button
              onClick={() => navigate('/yukle')}
              className="bg-[#FAFAF9] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-4 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <span className="text-2xl">📤</span>
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
