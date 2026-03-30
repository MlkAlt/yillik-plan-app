import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';
import type { PlanEntry } from '../types/planEntry';
import { exportPlanToExcel, exportPlanToWord, exportPlanToPrint } from '../lib/exportUtils';
import { AdBanner } from '../components/AdBanner';
import { Card } from '../components/UI/Card';
import { Button } from '../components/Button';
import { Download, FileSpreadsheet, FileText, Printer, MapPin, Check, CalendarDays } from 'lucide-react';

interface PlanPageProps {
  entry: PlanEntry | null;
  planlar?: PlanEntry[];
  onSinifSec?: (sinif: string) => void;
}

function formatTarih(isoTarih: string): string {
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${aylar[d.getMonth()]}`
}

export function PlanPage({ entry, planlar, onSinifSec }: PlanPageProps) {
  const navigate = useNavigate();

  const [tamamlananlar, setTamamlananlar] = useState<number[]>([]);
  const [exportMenuAcik, setExportMenuAcik] = useState(false);
  const [exporting, setExporting] = useState<'excel' | 'word' | null>(null);
  const [visibleYuzde, setVisibleYuzde] = useState(0);
  const bugunRef = useRef<HTMLDivElement>(null);

  const bugunStr = new Date().toISOString().split('T')[0]
  // Aktif hafta veya en yakın hafta (hafta sonu dahil)
  const bugunHaftaNo = entry?.plan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? entry?.plan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

  function scrollToBugunHafta() {
    if (!bugunRef.current) return
    bugunRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleExcelIndir() {
    if (!entry) return;
    setExporting('excel');
    setExportMenuAcik(false);
    try {
      const ayarlar = localStorage.getItem('ogretmen-ayarlari');
      const meta = ayarlar ? JSON.parse(ayarlar) : {};
      await exportPlanToExcel(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad });
    } finally {
      setExporting(null);
    }
  }

  function handleWordIndir() {
    if (!entry) return;
    setExporting('word');
    setExportMenuAcik(false);
    try {
      const ayarlar = localStorage.getItem('ogretmen-ayarlari');
      const meta = ayarlar ? JSON.parse(ayarlar) : {};
      exportPlanToWord(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad });
    } finally {
      setExporting(null);
    }
  }

  function handleYazdir() {
    if (!entry) return;
    setExportMenuAcik(false);
    const ayarlar = localStorage.getItem('ogretmen-ayarlari');
    const meta = ayarlar ? JSON.parse(ayarlar) : {};
    exportPlanToPrint(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad });
  }

  useEffect(() => {
    // Otomatik scroll kaldırıldı — kullanıcı "Bu Hafta" butonuna basınca gider
  }, [entry?.sinif])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.sinif]);

  // Progress bar mount animasyonu — 0'dan gerçek yüzdeye
  useEffect(() => {
    if (!entry) { setVisibleYuzde(0); return; }
    const isMebCalc = entry.tip === 'meb' && entry.plan && entry.plan.haftalar.length > 0;
    const toplamCalc = isMebCalc
      ? entry.plan!.haftalar.filter(h => !h.tatilMi).length
      : (entry.tip === 'yukle' && entry.rows ? entry.rows.length : 0);
    const calc = toplamCalc > 0 ? Math.round((tamamlananlar.length / toplamCalc) * 100) : 0;
    const t = setTimeout(() => setVisibleYuzde(calc), 80)
    return () => clearTimeout(t)
  }, [tamamlananlar, entry])

  if (!entry) {
    return (
      <div className="p-4 pb-20 w-full max-w-lg mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-16 h-16 bg-[#2D5BE3]/10 rounded-2xl flex items-center justify-center mb-5">
            <CalendarDays size={32} className="text-[#2D5BE3]" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1917] mb-2">Henüz plan yok</h2>
          <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
            Ana ekrandan planını oluştur ve tüm haftaları burada takip et.
          </p>
          <Button onClick={() => navigate('/app')} variant="primary" size="md">
            Plan Oluştur →
          </Button>
        </div>
      </div>
    );
  }

  const { plan, rows, ders, sinif, sinifGercek, tip } = entry;
  const isMeb = tip === 'meb' && plan && plan.haftalar.length > 0;
  const isUploaded = tip === 'yukle' && rows && rows.length > 0;
  const dataLength = isMeb ? plan!.haftalar.length : (isUploaded ? rows!.length : 0);

  const tamamlananSayi = tamamlananlar.length;
  const toplamDers = isMeb
    ? plan!.haftalar.filter(h => !h.tatilMi).length
    : dataLength;
  const yuzde = toplamDers > 0 ? Math.round((tamamlananSayi / toplamDers) * 100) : 0;

  return (
    <div className="p-4 pb-20 w-full max-w-lg mx-auto">
      {/* Üst Bilgi Kartı */}
      <Card className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-[#1C1917] tracking-tight uppercase">
              {ders || 'Ders Seçilmedi'}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{sinifGercek || sinif}</p>
          </div>
          <div className="bg-amber-100 border border-amber-200 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
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
            className="bg-[#F59E0B] h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${visibleYuzde}%` }}
          />
        </div>
      </Card>

      {/* Plan seçici — birden fazla plan varsa */}
      {planlar && planlar.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
          {planlar.map(p => (
            <button
              key={p.sinif}
              onClick={() => onSinifSec?.(p.sinif)}
              className={`whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                p.sinif === entry?.sinif
                  ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                  : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
              }`}
            >
              {p.label || p.sinif}
            </button>
          ))}
        </div>
      )}

      {/* Üst araç çubuğu — export dropdown + bu haftaya git */}
      <div className="flex gap-2 mb-4">
        {/* Export dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setExportMenuAcik(p => !p)}
            disabled={!!exporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] text-sm font-bold text-[#2D5BE3] hover:border-[#2D5BE3] active:scale-95 transition-all disabled:opacity-60"
          >
            {exporting ? <span className="animate-pulse text-xs">Hazırlanıyor...</span> : <><Download size={16} /> İndir</>}
          </button>
          {exportMenuAcik && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportMenuAcik(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E7E5E4] shadow-lg z-20 overflow-hidden">
                <button onClick={handleExcelIndir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1C1917] hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-[#E7E5E4]">
                  <FileSpreadsheet size={16} className="text-green-600" /> Excel (.xlsx)
                </button>
                <button onClick={handleWordIndir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1C1917] hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-[#E7E5E4]">
                  <FileText size={16} className="text-blue-600" /> Word (.doc)
                </button>
                <button onClick={handleYazdir} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1C1917] hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <Printer size={16} className="text-gray-600" /> Yazdır / PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bu haftaya git */}
        {bugunHaftaNo && (
          <button
            onClick={scrollToBugunHafta}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#2D5BE3]/30 bg-[#2D5BE3]/5 text-sm font-bold text-[#2D5BE3] active:scale-95 transition-all hover:bg-[#2D5BE3]/10 whitespace-nowrap"
          >
            <MapPin size={15} /> Bu Hafta
          </button>
        )}
      </div>

      <AdBanner className="mb-4 rounded-xl" />

      {/* Hafta Listesi */}
      <div className="flex flex-col gap-3">
        {isMeb && plan!.haftalar.map((h: Hafta, i: number) => {
          const isTatil = h.tatilMi;
          const isTamamlandi = tamamlananlar.includes(h.haftaNo);
          const isBuHafta = h.haftaNo === bugunHaftaNo;
          return (
            <div
              key={`meb-${h.haftaNo}-${i}`}
              ref={isBuHafta ? bugunRef : undefined}
              onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
              className={`rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 border transition-all cursor-pointer ${
                isBuHafta ? 'bg-[#2D5BE3]/5 border-[#2D5BE3] ring-1 ring-[#2D5BE3]/30' :
                isTamamlandi ? 'bg-[#059669]/10 border-[#059669]/30' :
                isTatil ? 'bg-amber-50 border-amber-200' :
                'bg-[#FAFAF9] border-[#E7E5E4] hover:shadow-md active:scale-[0.99]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${
                    isBuHafta ? 'text-[#2D5BE3]' :
                    isTamamlandi ? 'text-[#059669]' :
                    isTatil ? 'text-amber-700' :
                    'text-[#2D5BE3]'
                  }`}>
                    {h.haftaNo}. Hafta
                  </span>
                  {isBuHafta && (
                    <span className="text-[10px] font-bold text-white bg-[#2D5BE3] px-2 py-0.5 rounded-full">
                      Bu Hafta
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isTamamlandi && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-full border border-[#059669]/30">
                      <Check size={11} strokeWidth={3} /> Tamam
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 font-semibold bg-[#FAFAF9] px-2.5 py-1 rounded-md border border-[#E7E5E4]/50">
                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                  </span>
                </div>
              </div>

              {h.kazanim && (
                <div className="mb-3">
                  {h.uniteAdi && (
                    <span className="inline-block bg-[#2D5BE3]/10 text-[#2D5BE3] text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                      {h.uniteAdi}
                    </span>
                  )}
                  <p className="font-bold text-[#1C1917] text-sm mb-1">{h.kazanim}</p>
                  {h.kazanimDetay && (
                    <p className="text-gray-500 text-xs">{h.kazanimDetay}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
                  {h.donem}. Dönem
                </span>
                {isTatil && (
                  <span className="text-sm font-bold text-[#F59E0B]">{h.tatilAdi}</span>
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
              className={`rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 border cursor-pointer transition-all ${
                isTamamlandi ? 'bg-[#059669]/10 border-[#059669]/30' : 'bg-[#FAFAF9] border-[#E7E5E4] hover:shadow-md active:scale-[0.99]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`font-bold text-lg ${isTamamlandi ? 'text-[#059669]' : 'text-[#2D5BE3]'}`}>
                  {r.haftaNo ? `${r.haftaNo}. Hafta` : 'Ekstra'}
                </span>
                <div className="flex items-center gap-2">
                  {isTamamlandi && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-full border border-[#059669]/30">
                      <Check size={11} strokeWidth={3} /> Tamam
                    </span>
                  )}
                  {r.tarihAraligi && (
                    <span className="text-[11px] text-gray-400 font-semibold bg-[#FAFAF9] px-2.5 py-1 rounded-md border border-[#E7E5E4]/50">
                      {r.tarihAraligi}
                    </span>
                  )}
                </div>
              </div>
              {r.donem && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full inline-block mb-3">
                  {r.donem}
                </span>
              )}
              <div className="mt-3 text-[13px] text-gray-500 border-t border-[#E7E5E4] pt-3 leading-relaxed font-medium">
                {r.kazanim}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
