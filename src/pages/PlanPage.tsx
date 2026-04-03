import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';
import type { PlanEntry } from '../types/planEntry';
import { exportPlanToExcel, exportPlanToWord, exportPlanToPrint } from '../lib/exportUtils';
import { AdBanner } from '../components/AdBanner';
import { Button } from '../components/Button';
import { Download, FileSpreadsheet, FileText, Printer, MapPin, Check, CalendarDays, ChevronDown } from 'lucide-react';
import { StorageKeys } from '../lib/storageKeys';

// Dönem bazlı collapse bileşeni
function DonemGrubu({
  donemNo, haftalar, tamamlananlar, bugunHaftaNo, bugunRef,
  tamamlananSayisi, toplamSayisi, acik, onToggle, navigate,
}: {
  donemNo: number
  haftalar: Hafta[]
  tamamlananlar: number[]
  bugunHaftaNo: number | null
  bugunRef: React.RefObject<HTMLDivElement | null>
  tamamlananSayisi: number
  toplamSayisi: number
  acik: boolean
  onToggle: () => void
  navigate: ReturnType<typeof useNavigate>
}) {
  const yuzde = toplamSayisi > 0 ? Math.round((tamamlananSayisi / toplamSayisi) * 100) : 0
  const tamamlandi = tamamlananSayisi >= toplamSayisi && toplamSayisi > 0

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Dönem başlığı — tıklanabilir */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors active:opacity-70"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>{donemNo}. Dönem</span>
          {tamamlandi && (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}
            >
              <Check size={10} strokeWidth={3} /> Tamamlandı
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${yuzde}%`,
                  backgroundColor: tamamlandi ? 'var(--color-success)' : 'var(--color-primary)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>{tamamlananSayisi}/{toplamSayisi}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${acik ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text3)' }}
          />
        </div>
      </button>

      {/* Hafta listesi */}
      {acik && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {haftalar.map((h, i) => {
            const isTatil = h.tatilMi
            const isTamamlandi = tamamlananlar.includes(h.haftaNo)
            const isBuHafta = h.haftaNo === bugunHaftaNo

            // Duruma göre stil hesapla
            const cardStyle: React.CSSProperties = isBuHafta
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  border: '1px solid var(--color-primary)',
                  boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }
              : isTamamlandi
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
                }
              : isTatil
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
                }
              : {
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }

            return (
              <div
                key={`meb-${h.haftaNo}-${i}`}
                ref={isBuHafta ? bugunRef : undefined}
                onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
                className="p-3.5 transition-all cursor-pointer active:scale-[0.99]"
                style={{ borderRadius: 'var(--radius-lg)', ...cardStyle }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: isBuHafta ? 'var(--color-primary)'
                          : isTamamlandi ? 'var(--color-success)'
                          : isTatil ? 'var(--color-warning)'
                          : 'var(--color-text1)',
                      }}
                    >
                      {h.haftaNo}. Hafta
                    </span>
                    {isBuHafta && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                      >
                        Bu Hafta
                      </span>
                    )}
                    {isTamamlandi && (
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-success)' }}>
                        <Check size={10} strokeWidth={3} /> Tamam
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>
                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                  </span>
                </div>

                {isTatil ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>{h.tatilAdi}</p>
                ) : h.kazanim ? (
                  <div>
                    {h.uniteAdi && (
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {h.uniteAdi}
                      </span>
                    )}
                    <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text1)' }}>
                      {h.kazanim}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
  const [donemAcik, setDonemAcik] = useState<Record<number, boolean>>({ 1: true, 2: false });
  const bugunRef = useRef<HTMLDivElement>(null);

  const bugunStr = new Date().toISOString().split('T')[0]
  const bugunHaftaNo = entry?.plan?.haftalar.find(
    h => bugunStr >= h.baslangicTarihi && bugunStr <= h.bitisTarihi
  )?.haftaNo ?? entry?.plan?.haftalar.find(
    h => h.baslangicTarihi >= bugunStr
  )?.haftaNo ?? null

  function scrollToBugunHafta() {
    if (!entry?.plan || !bugunHaftaNo) return
    const bugunDonem = entry.plan.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
    setDonemAcik(prev => ({ ...prev, [bugunDonem]: true }))
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bugunRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    })
  }

  async function handleExcelIndir() {
    if (!entry) return;
    setExporting('excel');
    setExportMenuAcik(false);
    try {
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI);
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
      const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI);
      const meta = ayarlar ? JSON.parse(ayarlar) : {};
      exportPlanToWord(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad });
    } finally {
      setExporting(null);
    }
  }

  function handleYazdir() {
    if (!entry) return;
    setExportMenuAcik(false);
    const ayarlar = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI);
    const meta = ayarlar ? JSON.parse(ayarlar) : {};
    exportPlanToPrint(entry, { okulAdi: meta.okulAdi, ogretmenAdi: meta.adSoyad });
  }

  useEffect(() => {
    if (!entry?.plan) return
    const aktifDonem = entry.plan.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1
    setDonemAcik({ 1: aktifDonem === 1, 2: aktifDonem === 2 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.sinif])

  useEffect(() => {
    if (!entry) return;
    try {
      const item = localStorage.getItem(StorageKeys.TAMAMLANAN_HAFTALAR);
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
          <div
            className="w-16 h-16 flex items-center justify-center mb-5"
            style={{
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            }}
          >
            <CalendarDays size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2
            className="text-xl font-bold mb-2 tracking-tight"
            style={{ color: 'var(--color-text1)' }}
          >
            Henüz plan yok
          </h2>
          <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: 'var(--color-text3)' }}>
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
    <div className="px-4 pb-20 w-full max-w-lg mx-auto">

      {/* v6 Sayfa başlığı */}
      <div className="pt-4 pb-3">
        <h1
          className="text-[22px] font-bold tracking-tight mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
        >
          Yıllık Planım
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          {ders} · {sinifGercek || sinif}
        </p>
      </div>

      {/* v6 Plan özet kartı — mavi gradyan */}
      <div
        className="relative overflow-hidden mb-3 cursor-default"
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-primary)',
          padding: '18px',
        }}
      >
        {/* Dekoratif daire */}
        <div
          className="absolute"
          style={{
            top: '-30px', right: '-30px',
            width: '100px', height: '100px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
          }}
        />
        <p
          className="text-[10px] font-bold uppercase tracking-[.12em] mb-1.5 relative z-10"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Yıllık Plan
        </p>
        <p
          className="text-[19px] font-bold mb-1 relative z-10 tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#ffffff' }}
        >
          {ders}
        </p>
        <p
          className="text-xs mb-3 relative z-10"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {sinifGercek || sinif}
        </p>
        <div className="flex gap-2 relative z-10 mb-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
          >
            {dataLength} hafta
          </span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
          >
            %{yuzde} tamamlandı
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="relative z-10 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${visibleYuzde}%`, backgroundColor: 'rgba(255,255,255,0.75)' }}
          />
        </div>
      </div>

      {/* Plan seçici — birden fazla plan varsa */}
      {planlar && planlar.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
          {planlar.map(p => (
            <button
              key={p.sinif}
              onClick={() => onSinifSec?.(p.sinif)}
              className="whitespace-nowrap flex-shrink-0 text-sm font-bold transition-all active:scale-95"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: `1.5px solid ${p.sinif === entry?.sinif ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: p.sinif === entry?.sinif ? 'var(--color-primary)' : 'var(--color-bg)',
                color: p.sinif === entry?.sinif ? '#ffffff' : 'var(--color-text2)',
              }}
            >
              {p.label || p.sinif}
            </button>
          ))}
        </div>
      )}

      {/* Araç çubuğu — export + bu haftaya git */}
      <div className="flex gap-2 mb-4">
        {/* Export dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setExportMenuAcik(p => !p)}
            disabled={!!exporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
            }}
          >
            {exporting ? <span className="animate-pulse text-xs">Hazırlanıyor...</span> : <><Download size={16} /> İndir</>}
          </button>
          {exportMenuAcik && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportMenuAcik(false)} />
              <div
                className="absolute top-full left-0 right-0 mt-1 z-20 overflow-hidden"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <button
                  onClick={handleExcelIndir}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors active:opacity-70"
                  style={{
                    color: 'var(--color-text1)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <FileSpreadsheet size={16} style={{ color: 'var(--color-success)' }} /> Excel (.xlsx)
                </button>
                <button
                  onClick={handleWordIndir}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors active:opacity-70"
                  style={{
                    color: 'var(--color-text1)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <FileText size={16} style={{ color: 'var(--color-primary)' }} /> Word (.doc)
                </button>
                <button
                  onClick={handleYazdir}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors active:opacity-70"
                  style={{ color: 'var(--color-text1)' }}
                >
                  <Printer size={16} style={{ color: 'var(--color-text2)' }} /> Yazdır / PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* Yazdır */}
        <button
          onClick={handleYazdir}
          className="flex items-center gap-1.5 text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
          style={{
            padding: '0 14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text2)',
          }}
        >
          <Printer size={16} /> Yazdır
        </button>

        {/* Bu haftaya git */}
        {bugunHaftaNo && (
          <button
            onClick={scrollToBugunHafta}
            className="flex items-center gap-1.5 text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
            style={{
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            <MapPin size={15} /> Bu Hafta
          </button>
        )}
      </div>

      <AdBanner className="mb-4 rounded-lg" />

      {/* Hafta Listesi — dönem bazlı collapse */}
      {isMeb && (() => {
        const donem1 = plan!.haftalar.filter(h => h.donem === 1)
        const donem2 = plan!.haftalar.filter(h => h.donem === 2)
        const aktifDonem = plan!.haftalar.find(h => h.haftaNo === bugunHaftaNo)?.donem ?? 1

        return (
          <div className="flex flex-col gap-4">
            {[1, 2].map(donemNo => {
              const donemHaftalar = donemNo === 1 ? donem1 : donem2
              if (donemHaftalar.length === 0) return null
              const tamamlananSayisi = donemHaftalar.filter(h => !h.tatilMi && tamamlananlar.includes(h.haftaNo)).length
              const toplamSayisi = donemHaftalar.filter(h => !h.tatilMi).length
              const isAcik = donemAcik[donemNo] !== undefined ? donemAcik[donemNo] : donemNo === aktifDonem

              return (
                <DonemGrubu
                  key={donemNo}
                  donemNo={donemNo}
                  haftalar={donemHaftalar}
                  tamamlananlar={tamamlananlar}
                  bugunHaftaNo={bugunHaftaNo}
                  bugunRef={bugunRef}
                  tamamlananSayisi={tamamlananSayisi}
                  toplamSayisi={toplamSayisi}
                  acik={isAcik}
                  onToggle={() => setDonemAcik(prev => ({ ...prev, [donemNo]: !prev[donemNo] }))}
                  navigate={navigate}
                />
              )
            })}
          </div>
        )
      })()}

      {/* Yüklenen plan satırları */}
      <div className="flex flex-col gap-3">
        {isUploaded && rows!.map((r: ParsedRow, i: number) => {
          const isTamamlandi = r.haftaNo ? tamamlananlar.includes(r.haftaNo) : false;
          return (
            <div
              key={`row-${i}`}
              onClick={() => navigate(`/app/hafta/${r.haftaNo}`)}
              className="p-4 cursor-pointer transition-all active:scale-[0.99]"
              style={{
                borderRadius: 'var(--radius-xl)',
                border: `1px solid ${isTamamlandi ? 'color-mix(in srgb, var(--color-success) 30%, transparent)' : 'var(--color-border)'}`,
                backgroundColor: isTamamlandi ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'var(--color-surface)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className="font-bold text-lg"
                  style={{ color: isTamamlandi ? 'var(--color-success)' : 'var(--color-primary)' }}
                >
                  {r.haftaNo ? `${r.haftaNo}. Hafta` : 'Ekstra'}
                </span>
                <div className="flex items-center gap-2">
                  {isTamamlandi && (
                    <span
                      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: 'var(--color-success)',
                        backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--color-success) 25%, transparent)',
                      }}
                    >
                      <Check size={11} strokeWidth={3} /> Tamam
                    </span>
                  )}
                  {r.tarihAraligi && (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-md"
                      style={{
                        color: 'var(--color-text3)',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {r.tarihAraligi}
                    </span>
                  )}
                </div>
              </div>
              {r.donem && (
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-3"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text3)',
                  }}
                >
                  {r.donem}
                </span>
              )}
              <div
                className="mt-3 text-[13px] pt-3 leading-relaxed font-medium"
                style={{
                  color: 'var(--color-text2)',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                {r.kazanim}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
