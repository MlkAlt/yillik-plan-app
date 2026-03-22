import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta, OlusturulmusPlan } from '../types/takvim';
import type { PlanEntry } from '../types/planEntry';
import { planOlustur, mufredatliPlanOlustur } from '../lib/takvimUtils';
import { getMufredat } from '../lib/mufredatRegistry';

const DERS_SECENEKLERI = [
  'Sınıf Öğretmeni',
  'Fen Bilimleri', 'Matematik', 'Türkçe', 'Hayat Bilgisi', 'Sosyal Bilgiler',
  'İngilizce', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya',
  'Fizik', 'Kimya', 'Biyoloji',
  'Din Kültürü ve Ahlak Bilgisi', 'Almanca', 'Fransızca',
  'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Matematik Uygulamaları',
  'Bilişim Teknolojileri', 'Trafik ve İlk Yardım', 'Sağlık Bilgisi',
  'DKAB', 'Meslek Dersi', 'Diğer',
]

const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

const DERS_SINIF_MAP: Record<string, string[]> = {
  'Hayat Bilgisi': ['1. Sınıf', '2. Sınıf', '3. Sınıf'],
  'Fen Bilimleri': ['3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Matematik': SINIF_SEVIYELERI,
  'Beden Eğitimi': SINIF_SEVIYELERI,
  'Müzik': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Görsel Sanatlar': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'İngilizce': SINIF_SEVIYELERI,
  'Din Kültürü ve Ahlak Bilgisi': SINIF_SEVIYELERI,
  'Türk Dili ve Edebiyatı': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Tarih': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Coğrafya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Fizik': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Kimya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Biyoloji': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
}

// Sınıf öğretmeni sabitleri
const SINIF_OGRETMENI_DERSLER = [
  'Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri',
  'Sosyal Bilgiler', 'İngilizce', 'Müzik', 'Görsel Sanatlar', 'Beden Eğitimi',
]
const SINIF_OGRETMENI_SINIFLAR = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf']

function buildPlan(ders: string, sinif: string, yil: string): OlusturulmusPlan {
  const mufredat = getMufredat(ders, sinif)
  if (mufredat) return mufredatliPlanOlustur(yil, mufredat)
  return planOlustur(yil)
}

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
  const [seciliSinif, setSeciliSinif] = useState(planlar[0]?.sinif || '')

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
        className="w-full text-left mb-4 group min-h-[56px]"
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
        <div className="flex gap-2 pt-3 border-t border-[#E7E5E4]">
          {planlar.map(entry => {
            const total = entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0
            const done = tamamlananlar[entry.sinif]?.length || 0
            const yuzde = total > 0 ? Math.round((done / total) * 100) : 0
            const isSelected = entry.sinif === seciliSinif
            return (
              <button
                key={entry.sinif}
                onClick={() => setSeciliSinif(entry.sinif)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border font-bold text-sm transition-all active:scale-95 ${
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

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec }: AppHomeScreenProps) {
  const navigate = useNavigate();

  const [ogretmenAd, setOgretmenAd] = useState('');
  const [onboardingTamamlandi, setOnboardingTamamlandi] = useState(false);
  const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>({});
  const [olusturuluyor, setOlusturuluyor] = useState(false);

  const [onbDers, setOnbDers] = useState('Fen Bilimleri');
  const [onbSiniflar, setOnbSiniflar] = useState<string[]>(['5. Sınıf']);
  const [onbSinifOgrSinif, setOnbSinifOgrSinif] = useState('3. Sınıf');
  const [onbSinifOgrDersler, setOnbSinifOgrDersler] = useState<string[]>(['Türkçe']);

  useEffect(() => {
    try {
      const ayarlarItem = localStorage.getItem('ogretmen-ayarlari');
      if (ayarlarItem) {
        const parsed = JSON.parse(ayarlarItem);
        if (parsed.adSoyad) setOgretmenAd(parsed.adSoyad.trim().split(' ')[0]);
        if (parsed.ders) setOnbDers(parsed.ders);
        if (parsed.siniflar?.length) setOnbSiniflar(parsed.siniflar);
        else if (parsed.sinif) setOnbSiniflar([parsed.sinif]);
      }
      if (localStorage.getItem('onboarding-tamamlandi')) setOnboardingTamamlandi(true);

      const tItem = localStorage.getItem('tamamlanan-haftalar');
      if (tItem) {
        const parsed = JSON.parse(tItem);
        if (Array.isArray(parsed)) {
          const sinif = planlar[0]?.sinif || '';
          if (sinif) setTamamlananlar({ [sinif]: parsed });
        } else {
          setTamamlananlar(parsed);
        }
      }
    } catch {
      // localStorage okunamadı
    }
  }, []);

  function handleOnbDersChange(ders: string) {
    setOnbDers(ders);
    const siniflar = DERS_SINIF_MAP[ders] || SINIF_SEVIYELERI;
    setOnbSiniflar([siniflar[0]]);
  }

  function toggleOnbSinif(sinif: string) {
    setOnbSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    );
  }

  function toggleSinifOgrDers(ders: string) {
    setOnbSinifOgrDersler(prev =>
      prev.includes(ders)
        ? prev.length > 1 ? prev.filter(d => d !== ders) : prev
        : [...prev, ders]
    );
  }

  function handleOnboardingTamamla() {
    setOlusturuluyor(true);
    try {
      const yil = '2025-2026';
      const isSinifOgretmeni = onbDers === 'Sınıf Öğretmeni';

      if (isSinifOgretmeni) {
        if (onbSinifOgrDersler.length === 0) { setOlusturuluyor(false); return; }
        localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
          ders: onbSinifOgrDersler[0], siniflar: onbSinifOgrDersler, yil,
          ogretmenTuru: 'sinif', sinifGercek: onbSinifOgrSinif,
        }));
        localStorage.setItem('onboarding-tamamlandi', '1');
        setOnboardingTamamlandi(true);
        const entries: PlanEntry[] = onbSinifOgrDersler.map(ders => ({
          sinif: `${onbSinifOgrSinif}—${ders}`,
          ders, yil, tip: 'meb' as const,
          plan: buildPlan(ders, onbSinifOgrSinif, yil),
          rows: null,
          label: ders,
          sinifGercek: onbSinifOgrSinif,
        }));
        onPlanEkle(entries);
        onSinifSec(entries[0].sinif);
      } else {
        if (onbSiniflar.length === 0) { setOlusturuluyor(false); return; }
        localStorage.setItem('ogretmen-ayarlari', JSON.stringify({ ders: onbDers, siniflar: onbSiniflar, yil }));
        localStorage.setItem('onboarding-tamamlandi', '1');
        setOnboardingTamamlandi(true);
        const entries: PlanEntry[] = onbSiniflar.map(sinif => ({
          sinif, ders: onbDers, yil, tip: 'meb' as const,
          plan: buildPlan(onbDers, sinif, yil), rows: null,
        }));
        onPlanEkle(entries);
        onSinifSec(entries[0].sinif);
      }
    } catch {
      setOlusturuluyor(false);
    }
  }

  const saat = new Date().getHours();
  let mesaj = 'İyi geceler';
  if (saat >= 6 && saat < 12) mesaj = 'Günaydın';
  else if (saat >= 12 && saat < 17) mesaj = 'İyi günler';
  else if (saat >= 17 && saat < 21) mesaj = 'İyi akşamlar';
  const karsilama = ogretmenAd ? `${mesaj}, ${ogretmenAd}!` : `${mesaj}!`;

  const isSinifOgretmeni = onbDers === 'Sınıf Öğretmeni';
  const aktifSiniflar = DERS_SINIF_MAP[onbDers] || SINIF_SEVIYELERI;

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* KARSILAMA */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#2D5BE3]">{karsilama}</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Bu haftanın kazanımları</p>
      </div>

      {/* ONBOARDING */}
      {!onboardingTamamlandi && planlar.length === 0 && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Başlayalım</p>
          <h2 className="text-base font-bold text-[#2D5BE3] mb-4">
            Branşını seç, planın hazır olsun.
          </h2>

          {/* Ders / Branş seçimi */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Branş / Ders
            </label>
            <select
              value={onbDers}
              onChange={(e) => handleOnbDersChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-[#1C1917] font-medium focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all text-sm"
            >
              {DERS_SECENEKLERI.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Sınıf Öğretmeni seçilince */}
          {isSinifOgretmeni ? (
            <>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Sınıfın
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SINIF_OGRETMENI_SINIFLAR.map(s => (
                    <button
                      key={s}
                      onClick={() => setOnbSinifOgrSinif(s)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                        onbSinifOgrSinif === s
                          ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                          : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Dersler
                  <span className="text-gray-300 font-normal ml-1">(birden fazla seçebilirsin)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SINIF_OGRETMENI_DERSLER.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleSinifOgrDers(d)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                        onbSinifOgrDersler.includes(d)
                          ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                          : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Sınıf Seviyeleri
                <span className="text-gray-300 font-normal ml-1">(birden fazla seçebilirsin)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {aktifSiniflar.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleOnbSinif(s)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                      onbSiniflar.includes(s)
                        ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                        : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleOnboardingTamamla}
            disabled={olusturuluyor || (isSinifOgretmeni ? onbSinifOgrDersler.length === 0 : onbSiniflar.length === 0)}
            className="w-full bg-[#F59E0B] text-white py-3 rounded-xl font-bold shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {olusturuluyor
              ? <span className="animate-pulse">Oluşturuluyor...</span>
              : <>Planlarımı Oluştur →</>
            }
          </button>
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
              onClick={() => navigate('/olustur')}
              className="bg-[#FAFAF9] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-4 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <span className="text-2xl">📅</span>
              <span className="text-sm font-bold text-[#2D5BE3]">Plan Oluştur</span>
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
    </div>
  );
}
