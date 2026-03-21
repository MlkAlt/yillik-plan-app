import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta, OlusturulmusPlan } from '../types/takvim';
import type { PlanEntry } from '../types/planEntry';
import { planOlustur, mufredatliPlanOlustur, type MufredatJson } from '../lib/takvimUtils';
import fen5Mufredat from '../data/mufredat/fen-bilimleri-5.json';
import fen6Mufredat from '../data/mufredat/fen-bilimleri-6.json';
import fen7Mufredat from '../data/mufredat/fen-bilimleri-7.json';
import fen8Mufredat from '../data/mufredat/fen-bilimleri-8.json';

const DERS_SECENEKLERI = [
  'Fen Bilimleri', 'Matematik', 'Türkçe', 'Sosyal Bilgiler',
  'İngilizce', 'Din Kültürü ve Ahlak Bilgisi', 'Almanca', 'Fransızca',
  'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar', 'Tarih', 'Coğrafya',
  'Fizik', 'Kimya', 'Biyoloji', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Türk Dili ve Edebiyatı', 'Matematik Uygulamaları',
  'Bilişim Teknolojileri', 'Trafik ve İlk Yardım', 'Sağlık Bilgisi',
  'DKAB', 'Meslek Dersi', 'Diğer',
]

const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

const DERS_SINIF_MAP: Record<string, string[]> = {
  'Fen Bilimleri': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Matematik': SINIF_SEVIYELERI,
  'Beden Eğitimi': SINIF_SEVIYELERI,
  'Müzik': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Görsel Sanatlar': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'İngilizce': SINIF_SEVIYELERI,
  'Din Kültürü ve Ahlak Bilgisi': SINIF_SEVIYELERI,
  'Tarih': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Coğrafya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Fizik': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Kimya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Biyoloji': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
}

function buildPlan(ders: string, sinif: string, yil: string): OlusturulmusPlan {
  if (ders === 'Fen Bilimleri') {
    let mufredatData: MufredatJson | null = null
    if (sinif === '5. Sınıf') mufredatData = fen5Mufredat as MufredatJson
    else if (sinif === '6. Sınıf') mufredatData = fen6Mufredat as MufredatJson
    else if (sinif === '7. Sınıf') mufredatData = fen7Mufredat as MufredatJson
    else if (sinif === '8. Sınıf') mufredatData = fen8Mufredat as MufredatJson
    if (mufredatData) return mufredatliPlanOlustur(yil, mufredatData)
  }
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
  const bugunGun = new Date().getDay()
  const haftaSonu = bugunGun === 0 || bugunGun === 6

  // İlk MEB planından hafta bilgisini al (tüm sınıflar aynı takvimde)
  const referansPlan = planlar.find(p => p.tip === 'meb' && p.plan)
  const aktifHafta = referansPlan?.plan ? bugunHaftasiniAl(referansPlan.plan) : null
  const sonrakiHafta = !aktifHafta && referansPlan?.plan ? sonrakiHaftayiAl(referansPlan.plan) : null

  const haftaBaslik = aktifHafta
    ? `${aktifHafta.haftaNo}. Hafta · ${formatTarihKısa(aktifHafta.baslangicTarihi)}–${formatTarihKısa(aktifHafta.bitisTarihi)}`
    : sonrakiHafta
    ? `Sonraki: ${sonrakiHafta.haftaNo}. Hafta · ${formatTarihKısa(sonrakiHafta.baslangicTarihi)}`
    : 'Bu Hafta'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">📅 Bu Hafta</span>
        <span className="text-xs text-gray-400 font-medium">{haftaBaslik}</span>
      </div>

      {/* Hafta sonu */}
      {haftaSonu && !aktifHafta && (
        <div className="text-center py-3">
          <p className="font-bold text-gray-400">Hafta sonu ☕</p>
          {sonrakiHafta?.kazanim && (
            <p className="text-gray-400 text-xs mt-1.5">
              Pazartesi: {sonrakiHafta.kazanim}
            </p>
          )}
        </div>
      )}

      {/* Tatil */}
      {aktifHafta?.tatilMi && (
        <div className="text-center py-2">
          <p className="font-black text-[#f97316] text-base">🎉 {aktifHafta.tatilAdi}</p>
        </div>
      )}

      {/* Her sınıf için kazanım satırı */}
      {!haftaSonu && aktifHafta && !aktifHafta.tatilMi && (
        <div className="flex flex-col gap-3">
          {planlar.map((entry, i) => {
            const hafta = entry.plan ? bugunHaftasiniAl(entry.plan) : null
            const kazanim = hafta?.kazanim
            const unite = hafta?.uniteAdi

            return (
              <div
                key={entry.sinif}
                className={`${i < planlar.length - 1 ? 'pb-3 border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white bg-[#1e3a5f] px-2.5 py-0.5 rounded-full">
                    {entry.sinif}
                  </span>
                  {unite && (
                    <span className="text-xs text-[#f97316] font-semibold">{unite}</span>
                  )}
                </div>
                {kazanim ? (
                  <p className="text-sm font-semibold text-gray-700 leading-snug">{kazanim}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Kazanım girilmemiş</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Plan dönemi dışı + sonraki hafta */}
      {!haftaSonu && !aktifHafta && sonrakiHafta && (
        <div className="flex flex-col gap-2">
          {planlar.map(entry => {
            const hafta = entry.plan ? sonrakiHaftayiAl(entry.plan) : null
            return (
              <div key={entry.sinif}>
                <span className="text-xs font-black text-white bg-[#1e3a5f] px-2.5 py-0.5 rounded-full mr-2">
                  {entry.sinif}
                </span>
                <span className="text-sm text-gray-500">{hafta?.kazanim || '—'}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Alt: progress özeti + link */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-3">
          {planlar.map(entry => {
            const total = entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0
            const done = tamamlananlar[entry.sinif]?.length || 0
            const yuzde = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <button
                key={entry.sinif}
                onClick={() => { onSinifSec(entry.sinif); navigate('/app/plan') }}
                className="flex items-center gap-1.5 group"
              >
                <span className="text-xs font-bold text-gray-400 group-hover:text-[#1e3a5f] transition-colors">
                  {entry.sinif}
                </span>
                <span className="text-xs text-gray-300 font-medium">%{yuzde}</span>
              </button>
            )
          })}
        </div>
        <span className="text-xs text-gray-300 font-medium">
          {planlar.map(e => tamamlananlar[e.sinif]?.length || 0).reduce((a, b) => a + b, 0)} hafta ✓
        </span>
      </div>
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

  function handleOnboardingTamamla() {
    if (onbSiniflar.length === 0) return;
    setOlusturuluyor(true);
    try {
      const yil = '2025-2026';
      localStorage.setItem('ogretmen-ayarlari', JSON.stringify({ ders: onbDers, siniflar: onbSiniflar, yil }));
      localStorage.setItem('onboarding-tamamlandi', '1');
      setOnboardingTamamlandi(true);

      const entries: PlanEntry[] = onbSiniflar.map(sinif => ({
        sinif, ders: onbDers, yil, tip: 'meb' as const,
        plan: buildPlan(onbDers, sinif, yil), rows: null,
      }));

      onPlanEkle(entries);
      onSinifSec(entries[0].sinif);
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

  const aktifSiniflar = DERS_SINIF_MAP[onbDers] || SINIF_SEVIYELERI;

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* KARSILAMA */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{karsilama}</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Bu haftanın kazanımları</p>
      </div>

      {/* ONBOARDING */}
      {!onboardingTamamlandi && planlar.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Başlayalım</p>
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">
            Branşını ve sınıflarını seç, planların hazır olsun.
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Branş / Ders
            </label>
            <select
              value={onbDers}
              onChange={(e) => handleOnbDersChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all text-sm"
            >
              {DERS_SECENEKLERI.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

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
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all ${
                    onbSiniflar.includes(s)
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOnboardingTamamla}
            disabled={olusturuluyor || onbSiniflar.length === 0}
            className="w-full bg-[#f97316] text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
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
        <div className="mt-2">
          <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 pl-1">
            Hızlı Erişim
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/olustur')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-95 transition-transform flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <span className="text-2xl">📅</span>
              <span className="text-sm font-bold text-[#1e3a5f]">Plan Oluştur</span>
            </button>
            <button
              onClick={() => navigate('/yukle')}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-95 transition-transform flex flex-col items-center justify-center gap-2 hover:shadow-md"
            >
              <span className="text-2xl">📤</span>
              <span className="text-sm font-bold text-[#1e3a5f]">Dosya Yükle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
