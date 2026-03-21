import React, { useState, useEffect } from 'react';

const DERS_SECENEKLERI = [
  'Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'Din Kültürü ve Ahlak Bilgisi',
  'İngilizce', 'Almanca', 'Fransızca', 'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar',
  'Tarih', 'Coğrafya', 'Fizik', 'Kimya', 'Biyoloji', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Türk Dili ve Edebiyatı', 'Matematik Uygulamaları', 'Bilişim Teknolojileri',
  'Trafik ve İlk Yardım', 'Sağlık Bilgisi', 'DKAB', 'Meslek Dersi', 'Diğer'
];

const SINIF_SECENEKLERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`);

const YIL_SECENEKLERI = ['2024-2025', '2025-2026'];

const SEHIRLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

interface AyarlarState {
  adSoyad: string;
  okulAdi: string;
  sehir: string;
  ders: string;
  sinif: string;
  yil: string;
}

const STORAGE_KEY = 'ogretmen-ayarlari';

export function AppSettingsScreen() {
  const [ayarlar, setAyarlar] = useState<AyarlarState>({
    adSoyad: '',
    okulAdi: '',
    sehir: '',
    ders: '',
    sinif: '',
    yil: '2024-2025'
  });
  
  const [basariMesaji, setBasariMesaji] = useState(false);

  // Sayfa açıldığında localStorage'dan mevcut ayarları yükle
  useEffect(() => {
    const kayitli = localStorage.getItem(STORAGE_KEY);
    if (kayitli) {
      try {
        setAyarlar(JSON.parse(kayitli));
      } catch (e) {
        console.error('Ayarlar yüklenirken hata:', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setAyarlar(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ayarlar));
    setBasariMesaji(true);
    
    // Mesajı 2 saniye sonra kaldır
    setTimeout(() => {
      setBasariMesaji(false);
    }, 2000);
  };

  return (
    <div className="max-w-lg mx-auto p-4 w-full">
      {/* Header */}
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">
          ⚙️ Ayarlar
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Ders, sınıf ve akademik yıl bilgilerinizi buradan kaydedebilirsiniz.
        </p>
      </div>

      {/* Form Content */}
      <div className="flex flex-col gap-5 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Ad Soyad */}
        <div className="flex flex-col gap-2">
          <label htmlFor="adSoyad" className="font-medium text-[#1e3a5f] text-sm">
            Ad Soyad
          </label>
          <input
            type="text"
            id="adSoyad"
            name="adSoyad"
            placeholder="Adınız Soyadınız"
            value={ayarlar.adSoyad || ''}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          />
        </div>

        {/* Okul Adı */}
        <div className="flex flex-col gap-2">
          <label htmlFor="okulAdi" className="font-medium text-[#1e3a5f] text-sm">
            Okul Adı
          </label>
          <input
            type="text"
            id="okulAdi"
            name="okulAdi"
            placeholder="Görev yaptığınız okul"
            value={ayarlar.okulAdi || ''}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          />
        </div>

        {/* Şehir Seçimi */}
        <div className="flex flex-col gap-2">
          <label htmlFor="sehir" className="font-medium text-[#1e3a5f] text-sm">
            Şehir Seç
          </label>
          <select
            id="sehir"
            name="sehir"
            value={ayarlar.sehir || ''}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          >
            <option value="" disabled>Lütfen şehrinizi seçin</option>
            {SEHIRLER.map(sehir => (
              <option key={sehir} value={sehir}>{sehir}</option>
            ))}
          </select>
        </div>

        {/* Ders Seçimi */}
        <div className="flex flex-col gap-2">
          <label htmlFor="ders" className="font-medium text-[#1e3a5f] text-sm">
            Ders Seç
          </label>
          <select
            id="ders"
            name="ders"
            value={ayarlar.ders}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          >
            <option value="" disabled>Lütfen bir ders seçin</option>
            {DERS_SECENEKLERI.map(ders => (
              <option key={ders} value={ders}>{ders}</option>
            ))}
          </select>
        </div>

        {/* Sınıf Seviyesi */}
        <div className="flex flex-col gap-2">
          <label htmlFor="sinif" className="font-medium text-[#1e3a5f] text-sm">
            Sınıf Seviyesi
          </label>
          <select
            id="sinif"
            name="sinif"
            value={ayarlar.sinif}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          >
            <option value="" disabled>Lütfen sınıf seçin</option>
            {SINIF_SECENEKLERI.map(sinif => (
              <option key={sinif} value={sinif}>{sinif}</option>
            ))}
          </select>
        </div>

        {/* Akademik Yıl */}
        <div className="flex flex-col gap-2">
          <label htmlFor="yil" className="font-medium text-[#1e3a5f] text-sm">
            Akademik Yıl
          </label>
          <select
            id="yil"
            name="yil"
            value={ayarlar.yil}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-gray-800"
          >
            {YIL_SECENEKLERI.map(yil => (
              <option key={yil} value={yil}>{yil}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={handleSave}
            className="w-full bg-[#f97316] text-white py-3.5 rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Kaydet
          </button>
          
          {/* Success Message Placeholder */}
          <div className="h-8 mt-3 flex items-center justify-center transition-all">
            {basariMesaji && (
              <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                ✅ Ayarlar kaydedildi!
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
