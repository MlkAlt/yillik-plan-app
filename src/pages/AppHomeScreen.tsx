import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OlusturulmusPlan, Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';
import { planOlustur, mufredatliPlanOlustur, type MufredatJson } from '../lib/takvimUtils';
import fen5Mufredat from '../data/mufredat/fen-bilimleri-5.json';
import fen6Mufredat from '../data/mufredat/fen-bilimleri-6.json';
import fen7Mufredat from '../data/mufredat/fen-bilimleri-7.json';
import fen8Mufredat from '../data/mufredat/fen-bilimleri-8.json';

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  const gun = String(d.getDate()).padStart(2, '0')
  const ay = aylar[d.getMonth()]
  return `${gun} ${ay}`
}

interface AppHomeScreenProps {
  onPlanOlustur?: (plan: OlusturulmusPlan, ders: string, sinif: string) => void;
}

export function AppHomeScreen({ onPlanOlustur }: AppHomeScreenProps) {
  const navigate = useNavigate();

  const [aktifPlan, setAktifPlan] = useState<{
    tip: 'meb' | 'yukle';
    plan: OlusturulmusPlan | null;
    rows: ParsedRow[] | null;
    ders: string;
    sinif: string;
  } | null>(null);

  const [ogretmenAd, setOgretmenAd] = useState('');
  const [kazanimlar, setKazanimlar] = useState<Record<string, string>>({});
  const [ayarlar, setAyarlar] = useState<{ ders: string; sinif: string; yil: string } | null>(null);
  const [planOlusturuluyor, setPlanOlusturuluyor] = useState(false);

  useEffect(() => {
    try {
      const planItem = localStorage.getItem('aktif-plan');
      if (planItem) setAktifPlan(JSON.parse(planItem));

      const kazanimItem = localStorage.getItem('kazanimlar');
      if (kazanimItem) setKazanimlar(JSON.parse(kazanimItem));

      const ayarlarItem = localStorage.getItem('ogretmen-ayarlari');
      if (ayarlarItem) {
        const parsed = JSON.parse(ayarlarItem);
        if (parsed.adSoyad) {
          const ad = parsed.adSoyad.trim().split(' ')[0];
          setOgretmenAd(ad);
        }
        if (parsed.ders && parsed.sinif) {
          setAyarlar({ ders: parsed.ders, sinif: parsed.sinif, yil: parsed.yil || '2024-2025' });
        }
      }
    } catch (e) {
      console.error('Veri okunurken hata', e);
    }
  }, []);

  function handleHizliPlanOlustur() {
    if (!ayarlar || !onPlanOlustur) return;
    setPlanOlusturuluyor(true);
    try {
      const { ders, sinif, yil } = ayarlar;
      let plan: OlusturulmusPlan;

      if (ders === 'Fen Bilimleri') {
        let mufredatData: MufredatJson | null = null;
        if (sinif === '5. Sınıf') mufredatData = fen5Mufredat as MufredatJson;
        else if (sinif === '6. Sınıf') mufredatData = fen6Mufredat as MufredatJson;
        else if (sinif === '7. Sınıf') mufredatData = fen7Mufredat as MufredatJson;
        else if (sinif === '8. Sınıf') mufredatData = fen8Mufredat as MufredatJson;
        plan = mufredatData ? mufredatliPlanOlustur(yil, mufredatData) : planOlustur(yil);
      } else {
        plan = planOlustur(yil);
      }

      onPlanOlustur(plan, ders, sinif);
      navigate('/app/plan');
    } catch {
      setPlanOlusturuluyor(false);
    }
  }

  const saat = new Date().getHours();
  let mesaj = "İyi geceler";
  let emoji = "🌙";
  if (saat >= 6 && saat < 12) { mesaj = "Günaydın"; emoji = "🌅"; }
  else if (saat >= 12 && saat < 17) { mesaj = "İyi günler"; emoji = "☀️"; }
  else if (saat >= 17 && saat < 21) { mesaj = "İyi akşamlar"; emoji = "🌆"; }

  const karsilama = ogretmenAd ? `${mesaj}, ${ogretmenAd}! ${emoji}` : `${mesaj} ${emoji}`;

  const bugunGun = new Date().getDay();
  const gunAdlari = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const bugunAdi = gunAdlari[bugunGun] || '';

  // Aktif haftayı bulma
  let aktifHafta: Hafta | null = null;
  if (aktifPlan?.tip === 'meb' && aktifPlan.plan) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const bugunStr = bugun.toISOString().split('T')[0];
    for (const hafta of aktifPlan.plan.haftalar) {
      if (bugunStr >= hafta.baslangicTarihi && bugunStr <= hafta.bitisTarihi) {
        aktifHafta = hafta;
        break;
      }
    }
  }

  const dataLength = aktifPlan?.tip === 'meb'
    ? (aktifPlan.plan?.haftalar.length || 0)
    : (aktifPlan?.rows?.length || 0);

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* 1. KARSILAMA */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{karsilama}</h1>
        <p className="text-gray-500 mt-1.5 text-sm font-medium">
          Bugün ne öğretiyorsunuz?
        </p>
      </div>

      {/* 2. PLAN OLUŞTUR KARTI — aktif plan yokken, ayarlar doluyken göster */}
      {!aktifPlan && ayarlar && onPlanOlustur && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl shadow-md p-5 mb-5 text-white">
          <div className="text-xs font-semibold tracking-wider text-blue-200 uppercase mb-3 flex items-center gap-1.5">
            ✨ Hazır Müfredat
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">{ayarlar.ders}</h2>
          <p className="text-blue-200 text-sm font-medium mt-0.5">{ayarlar.sinif} · {ayarlar.yil}</p>

          {ayarlar.ders === 'Fen Bilimleri' &&
            ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].includes(ayarlar.sinif) && (
              <span className="inline-block mt-3 bg-orange-400/20 border border-orange-300/30 text-orange-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                📚 Kazanım müfredatı mevcut
              </span>
          )}

          <button
            onClick={handleHizliPlanOlustur}
            disabled={planOlusturuluyor}
            className="mt-5 w-full bg-[#f97316] text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {planOlusturuluyor ? (
              <span className="animate-pulse">Oluşturuluyor...</span>
            ) : (
              <><span>📅</span> Planımı Oluştur</>
            )}
          </button>
        </div>
      )}

      {/* 3. AKTİF PLAN KARTI */}
      {aktifPlan && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 transition-shadow hover:shadow-md">
          <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-1.5">
            📋 Aktif Planım
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1e3a5f] tracking-tight uppercase">{aktifPlan.ders}</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{aktifPlan.sinif}</p>
          </div>

          <div className="flex items-end justify-between mt-5">
            <span className="bg-orange-100 text-[#f97316] px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
              {dataLength} Hafta
            </span>
            <button
              onClick={() => navigate('/app/plan')}
              className="bg-[#f97316] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 hover:opacity-90"
            >
              Planı Görüntüle <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. BUGÜN KARTI */}
      {(!aktifPlan || aktifPlan.tip !== 'meb' || !aktifHafta || bugunGun === 0 || bugunGun === 6) ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 text-center transition-shadow hover:shadow-md">
          <p className="text-[#1e3a5f] font-bold mb-4">📅 Bugün ders yok</p>
          <button
            onClick={() => navigate('/app/plan')}
            className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all hover:opacity-90 inline-flex items-center gap-1.5"
          >
            Planımı Görüntüle <span>→</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 transition-shadow hover:shadow-md">
          <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-1.5">
            📅 BUGÜN — {bugunAdi}
          </div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-400">
              {aktifHafta.haftaNo}. Hafta
            </span>
            <span className="text-[11px] text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
              {formatTarih(aktifHafta.baslangicTarihi)} – {formatTarih(aktifHafta.bitisTarihi)}
            </span>
          </div>

          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block mb-3">
              {aktifHafta.donem}. Dönem
            </span>
            
            {aktifHafta.tatilMi ? (
              <div className="text-xl font-black text-[#f97316] mt-1 mb-2">
                🎉 Tatil Haftası
              </div>
            ) : (
              <div className="mt-1">
                {aktifHafta.kazanim ? (
                  <>
                    <p className="font-bold text-[#1e3a5f] text-base mb-1.5 leading-snug">{aktifHafta.kazanim}</p>
                    {aktifHafta.kazanimDetay && (
                      <p className="text-gray-500 text-[13px] mt-1 mb-4 leading-relaxed">{aktifHafta.kazanimDetay}</p>
                    )}
                  </>
                ) : null}

                {kazanimlar[`${aktifHafta.haftaNo}_${bugunAdi}`] ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3.5 py-3 rounded-xl text-sm mt-3">
                    <span className="font-bold">📝 Notunuz:</span> {kazanimlar[`${aktifHafta.haftaNo}_${bugunAdi}`]}
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate(`/app/hafta/${aktifHafta.haftaNo}`)} 
                    className="w-full text-left text-gray-500 text-xs font-medium mt-3 flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-700 border border-gray-100 transition-all"
                  >
                    <span>✏️</span> Not eklemek için hafta detayına gidin
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. HIZLI ERİŞİM */}
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
