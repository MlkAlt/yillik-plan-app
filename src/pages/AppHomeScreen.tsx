import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta } from '../types/takvim';
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

function buildPlan(ders: string, sinif: string, yil: string) {
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

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${aylar[d.getMonth()]}`
}

interface AppHomeScreenProps {
  planlar: PlanEntry[];
  onPlanEkle: (entries: PlanEntry[]) => void;
  onSinifSec: (sinif: string) => void;
}

export function AppHomeScreen({ planlar, onPlanEkle, onSinifSec }: AppHomeScreenProps) {
  const navigate = useNavigate();

  const [ogretmenAd, setOgretmenAd] = useState('');
  const [onboardingTamamlandi, setOnboardingTamamlandi] = useState(false);
  const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>({});
  const [olusturuluyor, setOlusturuluyor] = useState(false);

  // Onboarding state
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
        // Eski format (number[]) → yeni format migration
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
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev // en az 1 seçili kalmalı
        : [...prev, sinif]
    );
  }

  function handleOnboardingTamamla() {
    if (onbSiniflar.length === 0) return;
    setOlusturuluyor(true);
    try {
      const yil = '2025-2026';
      localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
        ders: onbDers, siniflar: onbSiniflar, yil
      }));
      localStorage.setItem('onboarding-tamamlandi', '1');
      setOnboardingTamamlandi(true);

      const entries: PlanEntry[] = onbSiniflar.map(sinif => ({
        sinif,
        ders: onbDers,
        yil,
        tip: 'meb' as const,
        plan: buildPlan(onbDers, sinif, yil),
        rows: null,
      }));

      onPlanEkle(entries);
      onSinifSec(entries[0].sinif);
      navigate('/app/plan');
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

  const bugunGun = new Date().getDay();
  const gunAdlari = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', '', ''];
  const bugunAdi = gunAdlari[bugunGun] || '';
  const bugunStr = new Date().toISOString().split('T')[0];

  const aktifSiniflar = DERS_SINIF_MAP[onbDers] || SINIF_SEVIYELERI;

  // İlk MEB planında bugünün haftasını bul (today card için)
  const mebPlan = planlar.find(p => p.tip === 'meb' && p.plan);
  let aktifHafta: Hafta | null = null;
  if (mebPlan?.plan) {
    for (const hafta of mebPlan.plan.haftalar) {
      if (bugunStr >= hafta.baslangicTarihi && bugunStr <= hafta.bitisTarihi) {
        aktifHafta = hafta;
        break;
      }
    }
  }

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* KARSILAMA */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{karsilama}</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">Bugün ne öğretiyorsunuz?</p>
      </div>

      {/* ONBOARDING — planı olmayan ilk kullanıcı */}
      {!onboardingTamamlandi && planlar.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Başlayalım</p>
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">
            Branşını ve sınıflarını seç, planların hazır olsun.
          </h2>

          {/* Ders seçimi */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Branş / Ders
            </label>
            <select
              value={onbDers}
              onChange={(e) => handleOnbDersChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all text-sm"
            >
              {DERS_SECENEKLERI.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Sınıf çoklu seçim */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sınıf Seviyeleri <span className="text-gray-300 font-normal">(birden fazla seçebilirsin)</span>
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

      {/* PLAN KARTLARI — her sınıf için ayrı */}
      {planlar.map(entry => {
        const totalHafta = entry.tip === 'meb'
          ? (entry.plan?.haftalar.filter(h => !h.tatilMi).length || 0)
          : (entry.rows?.length || 0);
        const tamamlanan = tamamlananlar[entry.sinif]?.length || 0;
        const yuzde = totalHafta > 0 ? Math.round((tamamlanan / totalHafta) * 100) : 0;

        return (
          <div key={entry.sinif} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-black text-[#1e3a5f] tracking-tight">{entry.ders}</h2>
                <p className="text-sm font-medium text-gray-400 mt-0.5">{entry.sinif} · {entry.yil}</p>
              </div>
              <span className="bg-orange-50 text-[#f97316] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200 whitespace-nowrap">
                {totalHafta} hafta
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-400 font-medium">İlerleme</span>
                <span className="text-xs font-bold text-gray-500">{tamamlanan}/{totalHafta} hafta</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[#f97316] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${yuzde}%` }}
                />
              </div>
              {tamamlanan > 0 && (
                <p className="text-xs text-gray-400 mt-1">{yuzde}% tamamlandı</p>
              )}
            </div>

            <button
              onClick={() => { onSinifSec(entry.sinif); navigate('/app/plan'); }}
              className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              Planı Görüntüle →
            </button>
          </div>
        );
      })}

      {/* BUGÜN KARTI */}
      {planlar.length > 0 && (
        bugunGun === 0 || bugunGun === 6 || !aktifHafta ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 text-center">
            <p className="text-[#1e3a5f] font-bold mb-1">📅 Bugün ders yok</p>
            <p className="text-gray-400 text-xs">
              {bugunGun === 0 || bugunGun === 6 ? 'Hafta sonu' : 'Aktif hafta bulunamadı'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                📅 Bugün — {bugunAdi}
              </span>
              <span className="text-[11px] text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                {formatTarih(aktifHafta.baslangicTarihi)} – {formatTarih(aktifHafta.bitisTarihi)}
              </span>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block mb-3">
              {aktifHafta.donem}. Dönem · {aktifHafta.haftaNo}. Hafta
            </span>

            {aktifHafta.tatilMi ? (
              <p className="text-[#f97316] font-bold">🎉 {aktifHafta.tatilAdi}</p>
            ) : aktifHafta.kazanim ? (
              <>
                <p className="font-bold text-[#1e3a5f] text-sm leading-snug">{aktifHafta.kazanim}</p>
                {aktifHafta.kazanimDetay && (
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{aktifHafta.kazanimDetay}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">Bu hafta için kazanım girilmemiş.</p>
            )}
          </div>
        )
      )}

      {/* HIZLI ERİŞİM */}
      <div>
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
    </div>
  );
}
