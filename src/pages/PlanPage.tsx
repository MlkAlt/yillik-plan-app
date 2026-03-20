
import type { OlusturulmusPlan, Hafta } from '../types/takvim';
import type { ParsedRow } from '../lib/fileParser';

interface PlanPageProps {
    plan: OlusturulmusPlan | null;
    rows: ParsedRow[] | null;
    ders: string;
    sinif: string;
}

function formatTarih(isoTarih: string): string {
    const aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
    const d = new Date(isoTarih)
    const gun = String(d.getDate()).padStart(2, '0')
    const ay = aylar[d.getMonth()]
    return `${gun} ${ay}`
}

export function PlanPage({ plan, rows, ders, sinif }: PlanPageProps) {
    const isMeb = plan !== null && plan.haftalar && plan.haftalar.length > 0;
    const isUploaded = rows !== null && rows.length > 0;
    const dataLength = isMeb ? plan!.haftalar.length : (isUploaded ? rows!.length : 0);

    const getEmoji = (ad: string = '') => {
        const lower = ad.toLowerCase();
        if (lower.includes('bayram')) return '🎊';
        if (lower.includes('yılbaşı')) return '🎄';
        if (lower.includes('ara tatil')) return '🌴';
        if (lower.includes('yarıyıl')) return '⛄';
        if (lower.includes('atatürk')) return '🇹🇷';
        return '🏖️';
    };

    if (!isMeb && !isUploaded) {
        return (
            <div className="p-4 flex justify-center items-center h-full text-gray-500">
                Henüz plan oluşturulmadı.
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 w-full">
            {/* Üst Bilgi Kartı */}
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-black text-[#1e3a5f] tracking-tight uppercase">
                        {ders || 'Ders Seçilmedi'}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {sinif || 'Sınıf Seçilmedi'}
                    </p>
                </div>
                <div className="bg-orange-100 border border-orange-200 text-[#f97316] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap flex items-center gap-1.5">
                    <span>📅</span> {dataLength} Hafta
                </div>
            </div>

            {/* Listeleme */}
            <div className="flex flex-col gap-3">
                {/* Otomatik Oluşturulan (MEB) Plan Gösterimi */}
                {isMeb && plan!.haftalar.map((h: Hafta, i: number) => {
                    const isTatil = h.tatilMi;
                    return (
                        <div
                            key={`meb-${h.haftaNo}-${i}`}
                            className={`rounded-2xl shadow-sm p-4 border transition-colors ${isTatil ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`font-extrabold text-lg ${isTatil ? 'text-orange-700' : 'text-[#1e3a5f]'}`}>
                                    {h.haftaNo}. Hafta
                                </span>
                                <span className="text-[11px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
                                    {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block">
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

                {/* Dosyadan Yüklenen Excel/Word Gösterimi */}
                {isUploaded && rows!.map((r: ParsedRow, i: number) => (
                    <div
                        key={`row-${i}`}
                        className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 transition-colors hover:shadow-md"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-extrabold text-[#1e3a5f] text-lg">
                                {r.haftaNo ? `${r.haftaNo}. Hafta` : 'Ekstra'}
                            </span>
                            {r.tarihAraligi && (
                                <span className="text-[11px] text-gray-400 font-semibold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100/50">
                                    {r.tarihAraligi}
                                </span>
                            )}
                        </div>

                        {r.donem && (
                            <div className="mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full inline-block">
                                    {r.donem}
                                </span>
                            </div>
                        )}

                        <div className="mt-3 text-[13px] text-gray-600 border-t border-gray-100 pt-3 leading-relaxed font-medium">
                            {r.kazanim}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}