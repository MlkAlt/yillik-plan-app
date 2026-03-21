import { useState, useEffect } from 'react';
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

const YIL_SECENEKLERI = ['2024-2025', '2025-2026']

const SEHIRLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop",
  "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat",
  "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın",
  "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
]

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

interface AppSettingsScreenProps {
  onPlanEkle: (entries: PlanEntry[]) => void;
}

export function AppSettingsScreen({ onPlanEkle }: AppSettingsScreenProps) {
  const [adSoyad, setAdSoyad] = useState('');
  const [okulAdi, setOkulAdi] = useState('');
  const [sehir, setSehir] = useState('');
  const [ders, setDers] = useState('Fen Bilimleri');
  const [siniflar, setSiniflar] = useState<string[]>(['5. Sınıf']);
  const [yil, setYil] = useState('2025-2026');
  const [basariMesaji, setBasariMesaji] = useState(false);

  useEffect(() => {
    try {
      const kayitli = localStorage.getItem('ogretmen-ayarlari');
      if (kayitli) {
        const parsed = JSON.parse(kayitli);
        if (parsed.adSoyad) setAdSoyad(parsed.adSoyad);
        if (parsed.okulAdi) setOkulAdi(parsed.okulAdi);
        if (parsed.sehir) setSehir(parsed.sehir);
        if (parsed.ders) setDers(parsed.ders);
        if (parsed.siniflar?.length) setSiniflar(parsed.siniflar);
        else if (parsed.sinif) setSiniflar([parsed.sinif]);
        if (parsed.yil) setYil(parsed.yil);
      }
    } catch {
      // okunamadı
    }
  }, []);

  function handleDersChange(yeniDers: string) {
    setDers(yeniDers);
    const secilebilir = DERS_SINIF_MAP[yeniDers] || SINIF_SEVIYELERI;
    // Mevcut seçimleri koru, geçersiz olanları filtrele, boşsa ilkini seç
    const gecerli = siniflar.filter(s => secilebilir.includes(s));
    setSiniflar(gecerli.length > 0 ? gecerli : [secilebilir[0]]);
  }

  function toggleSinif(sinif: string) {
    setSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    );
  }

  function handleSave() {
    // Ayarları kaydet
    localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
      adSoyad, okulAdi, sehir, ders, siniflar, yil
    }));

    // Yeni/değişen sınıflar için plan oluştur
    const mevcutPlanlarItem = localStorage.getItem('tum-planlar');
    const mevcutPlanlar: PlanEntry[] = mevcutPlanlarItem ? JSON.parse(mevcutPlanlarItem) : [];

    const yeniEntries: PlanEntry[] = siniflar
      .filter(s => !mevcutPlanlar.find(p => p.sinif === s && p.ders === ders))
      .map(s => ({
        sinif: s,
        ders,
        yil,
        tip: 'meb' as const,
        plan: buildPlan(ders, s, yil),
        rows: null,
      }));

    if (yeniEntries.length > 0) {
      onPlanEkle(yeniEntries);
    }

    setBasariMesaji(true);
    setTimeout(() => setBasariMesaji(false), 2500);
  }

  const aktifSiniflar = DERS_SINIF_MAP[ders] || SINIF_SEVIYELERI;
  const yeniSinifSayisi = (() => {
    try {
      const item = localStorage.getItem('tum-planlar');
      const mevcut: PlanEntry[] = item ? JSON.parse(item) : [];
      return siniflar.filter(s => !mevcut.find(p => p.sinif === s && p.ders === ders)).length;
    } catch { return 0; }
  })();

  return (
    <div className="max-w-lg mx-auto p-4 w-full">
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">⚙️ Ayarlar</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Bilgilerini güncelle, yeni sınıflar için plan ekle.
        </p>
      </div>

      <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

        {/* Ad Soyad */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">Ad Soyad</label>
          <input
            type="text"
            placeholder="Adınız Soyadınız"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800 text-sm"
          />
        </div>

        {/* Okul Adı */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">Okul Adı</label>
          <input
            type="text"
            placeholder="Görev yaptığınız okul"
            value={okulAdi}
            onChange={(e) => setOkulAdi(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800 text-sm"
          />
        </div>

        {/* Şehir */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">Şehir</label>
          <select
            value={sehir}
            onChange={(e) => setSehir(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800 text-sm"
          >
            <option value="" disabled>Lütfen şehrinizi seçin</option>
            {SEHIRLER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Ders */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">Branş / Ders</label>
          <select
            value={ders}
            onChange={(e) => handleDersChange(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800 text-sm"
          >
            {DERS_SECENEKLERI.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Sınıflar — multi-select */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">
            Sınıf Seviyeleri
            <span className="text-gray-400 font-normal text-xs ml-1">(birden fazla seçilebilir)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {aktifSiniflar.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSinif(s)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all ${
                  siniflar.includes(s)
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Akademik Yıl */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#1e3a5f] text-sm">Akademik Yıl</label>
          <select
            value={yil}
            onChange={(e) => setYil(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800 text-sm"
          >
            {YIL_SECENEKLERI.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Yeni sınıf uyarısı */}
        {yeniSinifSayisi > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 text-blue-700 text-xs font-semibold">
            ✨ Kaydet'e basınca {yeniSinifSayisi} yeni sınıf için plan oluşturulacak.
          </div>
        )}

        {/* Kaydet */}
        <button
          onClick={handleSave}
          className="w-full bg-[#f97316] text-white py-3.5 rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Kaydet
        </button>

        {basariMesaji && (
          <p className="text-center text-green-600 font-medium text-sm">
            ✅ Ayarlar kaydedildi!
          </p>
        )}
      </div>
    </div>
  );
}
