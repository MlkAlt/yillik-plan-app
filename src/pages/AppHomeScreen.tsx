import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OlusturulmusPlan, Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  const gun = String(d.getDate()).padStart(2, '0')
  const ay = aylar[d.getMonth()]
  return `${gun} ${ay}`
}

export function AppHomeScreen() {
  const navigate = useNavigate();

  const [aktifPlan, setAktifPlan] = useState<{
    tip: 'meb' | 'yukle';
    plan: OlusturulmusPlan | null;
    rows: ParsedRow[] | null;
    ders: string;
    sinif: string;
  } | null>(null);

  const [ogretmenAd, setOgretmenAd] = useState('');

  useEffect(() => {
    try {
      const planItem = localStorage.getItem('aktif-plan');
      if (planItem) setAktifPlan(JSON.parse(planItem));

      const ayarlarItem = localStorage.getItem('ogretmen-ayarlari');
      if (ayarlarItem) {
        const ayarlar = JSON.parse(ayarlarItem);
        if (ayarlar.adSoyad) {
          const ad = ayarlar.adSoyad.trim().split(' ')[0];
          setOgretmenAd(ad);
        }
      }
    } catch (e) {
      console.error('Veri okunurken hata', e);
    }
  }, []);

  const saat = new Date().getHours();
  let mesaj = "İyi geceler";
  let emoji = "🌙";
  if (saat >= 6 && saat < 12) { mesaj = "Günaydın"; emoji = "🌅"; }
  else if (saat >= 12 && saat < 17) { mesaj = "İyi günler"; emoji = "☀️"; }
  else if (saat >= 17 && saat < 21) { mesaj = "İyi akşamlar"; emoji = "🌆"; }

  const karsilama = ogretmenAd ? `${mesaj}, ${ogretmenAd}! ${emoji}` : `${mesaj} ${emoji}`;

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

      {/* 2. AKTİF PLAN KARTI */}
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

      {/* 3. BU HAFTA KARTI */}
      {aktifPlan?.tip === 'meb' && aktifHafta && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 transition-shadow hover:shadow-md">
          <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-3 flex items-center gap-1.5">
            📅 Bu Hafta
          </div>
          <div className="flex justify-between items-start mb-3">
            <span className="font-extrabold text-lg text-[#1e3a5f]">
              {aktifHafta.haftaNo}. Hafta
            </span>
            <span className="text-[11px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
              {formatTarih(aktifHafta.baslangicTarihi)} – {formatTarih(aktifHafta.bitisTarihi)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block">
              {aktifHafta.donem}. Dönem
            </span>
            {aktifHafta.tatilMi && (
              <span className="text-sm font-bold text-[#f97316] flex items-center gap-1.5">
                🎉 Tatil haftası!
              </span>
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
