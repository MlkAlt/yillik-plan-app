import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';
import type { PlanEntry } from '../types/planEntry';

interface PlanPageProps {
  entry: PlanEntry | null;
}

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${aylar[d.getMonth()]}`
}

const getEmoji = (ad: string = '') => {
  const lower = ad.toLowerCase();
  if (lower.includes('bayram')) return '🎊';
  if (lower.includes('yılbaşı')) return '🎄';
  if (lower.includes('ara tatil')) return '🌴';
  if (lower.includes('yarıyıl')) return '⛄';
  if (lower.includes('atatürk')) return '🇹🇷';
  return '🏖️';
};

export function PlanPage({ entry }: PlanPageProps) {
  const navigate = useNavigate();

  const [tamamlananlar, setTamamlananlar] = useState<number[]>([]);

  useEffect(() => {
    if (!entry) return;
    try {
      const item = localStorage.getItem('tamamlanan-haftalar');
      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          setTamamlananlar(parsed);
        } else {
          setTamamlananlar(parsed[entry.sinif] || []);
        }
      }
    } catch {
      // localStorage okunamadı
    }
  }, [entry?.sinif]);

  if (!entry) {
    return (
      <div className="p-4 flex justify-center items-center h-full text-gray-500">
        Henüz plan oluşturulmadı.
      </div>
    );
  }

  const { plan, rows, ders, sinif, tip } = entry;
  const isMeb = tip === 'meb' && plan && plan.haftalar.length > 0;
  const isUploaded = tip === 'yukle' && rows && rows.length > 0;
  const dataLength = isMeb ? plan!.haftalar.length : (isUploaded ? rows!.length : 0);

  const tamamlananSayi = tamamlananlar.length;
  const toplamDers = isMeb
    ? plan!.haftalar.filter(h => !h.tatilMi).length
    : dataLength;
  const yuzde = toplamDers > 0 ? Math.round((tamamlananSayi / toplamDers) * 100) : 0;

  return (
    <div className="p-4 pb-24 w-full max-w-lg mx-auto">
      {/* Üst Bilgi Kartı */}
      <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-[#1e3a5f] tracking-tight uppercase">
              {ders || 'Ders Seçilmedi'}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{sinif}</p>
          </div>
          <div className="bg-orange-100 border border-orange-200 text-[#f97316] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
            {dataLength} hafta
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400 font-medium">İlerleme</span>
          <span className="text-xs font-bold text-gray-500">{tamamlananSayi}/{toplamDers} hafta · %{yuzde}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-[#f97316] h-2 rounded-full transition-all duration-500"
            style={{ width: `${yuzde}%` }}
          />
        </div>
      </div>

      {/* Hafta Listesi */}
      <div className="flex flex-col gap-3">
        {isMeb && plan!.haftalar.map((h: Hafta, i: number) => {
          const isTatil = h.tatilMi;
          const isTamamlandi = tamamlananlar.includes(h.haftaNo);
          return (
            <div
              key={`meb-${h.haftaNo}-${i}`}
              onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
              className={`rounded-2xl shadow-sm p-4 border transition-colors cursor-pointer ${
                isTamamlandi ? 'bg-green-50 border-green-200' :
                isTatil ? 'bg-orange-50 border-orange-200' :
                'bg-white border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`font-extrabold text-lg ${
                  isTamamlandi ? 'text-green-700' :
                  isTatil ? 'text-orange-700' :
                  'text-[#1e3a5f]'
                }`}>
                  {h.haftaNo}. Hafta
                </span>
                <div className="flex items-center gap-2">
                  {isTamamlandi && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                      ✅ Tamam
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                  </span>
                </div>
              </div>

              {h.kazanim && (
                <div className="mb-3">
                  {h.uniteAdi && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                      {h.uniteAdi}
                    </span>
                  )}
                  <p className="font-bold text-gray-800 text-sm mb-1">{h.kazanim}</p>
                  {h.kazanimDetay && (
                    <p className="text-gray-500 text-xs">{h.kazanimDetay}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                  {h.donem}. Dönem
                </span>
                {isTatil && (
                  <span className="text-sm font-bold text-[#f97316] flex items-center gap-1.5">
                    <span className="text-lg">{getEmoji(h.tatilAdi)}</span> {h.tatilAdi}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {isUploaded && rows!.map((r: ParsedRow, i: number) => {
          const isTamamlandi = r.haftaNo ? tamamlananlar.includes(r.haftaNo) : false;
          return (
            <div
              key={`row-${i}`}
              onClick={() => navigate(`/app/hafta/${r.haftaNo}`)}
              className={`rounded-2xl shadow-sm p-4 border cursor-pointer transition-colors ${
                isTamamlandi ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`font-extrabold text-lg ${isTamamlandi ? 'text-green-700' : 'text-[#1e3a5f]'}`}>
                  {r.haftaNo ? `${r.haftaNo}. Hafta` : 'Ekstra'}
                </span>
                <div className="flex items-center gap-2">
                  {isTamamlandi && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                      ✅ Tamam
                    </span>
                  )}
                  {r.tarihAraligi && (
                    <span className="text-[11px] text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
                      {r.tarihAraligi}
                    </span>
                  )}
                </div>
              </div>
              {r.donem && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block mb-3">
                  {r.donem}
                </span>
              )}
              <div className="mt-3 text-[13px] text-gray-600 border-t border-gray-100 pt-3 leading-relaxed font-medium">
                {r.kazanim}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
