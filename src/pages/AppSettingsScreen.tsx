import { useState } from 'react';
import type { PlanEntry } from '../types/planEntry';
import { planOlustur, mufredatliPlanOlustur } from '../lib/takvimUtils';
import { getMufredat } from '../lib/mufredatRegistry';
import { signOut, type User } from '../lib/auth';
import { AuthModal } from '../components/AuthModal';
import {
  isBildirimDestekleniyor, getBildirimIzni, isBildirimAktif,
  setBildirimAktif, requestBildirimIzni,
} from '../lib/notifications';
import { SINIF_SEVIYELERI, DERS_SINIF_MAP } from '../lib/dersSinifMap';

const DERS_SECENEKLERI = [
  'Fen Bilimleri', 'Matematik', 'Türkçe', 'Hayat Bilgisi', 'Sosyal Bilgiler',
  'İngilizce', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya',
  'Fizik', 'Kimya', 'Biyoloji',
  'Din Kültürü ve Ahlak Bilgisi', 'Almanca', 'Fransızca',
  'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Matematik Uygulamaları',
  'Bilişim Teknolojileri', 'Trafik ve İlk Yardım', 'Sağlık Bilgisi',
  'DKAB', 'Meslek Dersi', 'Diğer',
]

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
  const mufredat = getMufredat(ders, sinif)
  if (mufredat) return mufredatliPlanOlustur(yil, mufredat)
  return planOlustur(yil)
}

interface AppSettingsScreenProps {
  onPlanEkle: (entries: PlanEntry[]) => void;
  user?: User | null;
}

function readAyarlar() {
  try {
    const kayitli = localStorage.getItem('ogretmen-ayarlari');
    if (kayitli) return JSON.parse(kayitli);
  } catch { /* okunamadı */ }
  return {};
}

export function AppSettingsScreen({ onPlanEkle, user }: AppSettingsScreenProps) {
  const [adSoyad, setAdSoyad] = useState(() => readAyarlar().adSoyad || '');
  const [okulAdi, setOkulAdi] = useState(() => readAyarlar().okulAdi || '');
  const [sehir, setSehir] = useState(() => readAyarlar().sehir || '');
  const [ders, setDers] = useState(() => readAyarlar().ders || 'Fen Bilimleri');
  const [siniflar, setSiniflar] = useState<string[]>(() => {
    const a = readAyarlar();
    if (a.siniflar?.length) return a.siniflar;
    if (a.sinif) return [a.sinif];
    return ['5. Sınıf'];
  });
  const [yil, setYil] = useState(() => readAyarlar().yil || '2025-2026');
  const [basariMesaji, setBasariMesaji] = useState(false);
  const [authModalAcik, setAuthModalAcik] = useState(false);
  const [bildirimAktif, setBildirimAktifState] = useState(isBildirimAktif);
  const [bildirimIzni, setBildirimIzniState] = useState(getBildirimIzni);

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

  async function handleBildirimToggle() {
    if (!bildirimAktif) {
      const izin = await requestBildirimIzni()
      setBildirimIzniState(Notification.permission)
      if (izin) {
        setBildirimAktif(true)
        setBildirimAktifState(true)
      }
    } else {
      setBildirimAktif(false)
      setBildirimAktifState(false)
    }
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
    <div className="max-w-lg mx-auto p-4 w-full pb-24">
      <div className="mb-6 mt-2">
        <h1 className="text-3xl font-bold text-[#2D5BE3]">Ayarlar</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Bilgilerini güncelle, yeni sınıflar için plan ekle.
        </p>
      </div>

      {/* Hesap Bölümü */}
      <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hesap</p>
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1C1917]">{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Giriş yapıldı</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all hover:bg-red-100"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Giriş yapılmadı</p>
              <p className="text-xs text-gray-400 mt-0.5">Planlarını buluta kaydet</p>
            </div>
            <button
              onClick={() => setAuthModalAcik(true)}
              className="text-xs font-bold text-[#2D5BE3] border border-[#2D5BE3]/30 bg-[#2D5BE3]/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all hover:bg-[#2D5BE3]/10"
            >
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        )}
      </div>

      {authModalAcik && <AuthModal onClose={() => setAuthModalAcik(false)} />}

      {/* Bildirim Bölümü */}
      {isBildirimDestekleniyor() && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bildirimler</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Haftalık kazanım hatırlatıcı</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {bildirimIzni === 'denied'
                  ? 'Tarayıcı ayarlarından izin ver'
                  : 'Yeni haftada kazanımı bildir'}
              </p>
            </div>
            <button
              onClick={handleBildirimToggle}
              disabled={bildirimIzni === 'denied'}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none disabled:opacity-40 ${
                bildirimAktif && bildirimIzni === 'granted'
                  ? 'bg-[#2D5BE3]'
                  : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                bildirimAktif && bildirimIzni === 'granted' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 bg-[#FAFAF9] p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4]">

        {/* Ad Soyad */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Ad Soyad</label>
          <input
            type="text"
            placeholder="Adınız Soyadınız"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          />
        </div>

        {/* Okul Adı */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Okul Adı</label>
          <input
            type="text"
            placeholder="Görev yaptığınız okul"
            value={okulAdi}
            onChange={(e) => setOkulAdi(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          />
        </div>

        {/* Şehir */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Şehir</label>
          <select
            value={sehir}
            onChange={(e) => setSehir(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          >
            <option value="" disabled>Lütfen şehrinizi seçin</option>
            {SEHIRLER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Ders */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Branş / Ders</label>
          <select
            value={ders}
            onChange={(e) => handleDersChange(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          >
            {DERS_SECENEKLERI.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Sınıflar — multi-select */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">
            Sınıf Seviyeleri
            <span className="text-gray-400 font-normal text-xs ml-1">(birden fazla seçilebilir)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {aktifSiniflar.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSinif(s)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                  siniflar.includes(s)
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Akademik Yıl */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Akademik Yıl</label>
          <select
            value={yil}
            onChange={(e) => setYil(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          >
            {YIL_SECENEKLERI.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Yeni sınıf uyarısı */}
        {yeniSinifSayisi > 0 && (
          <div className="bg-[#2D5BE3]/10 border border-[#2D5BE3]/20 rounded-xl px-3.5 py-2.5 text-[#2D5BE3] text-xs font-semibold">
            Kaydet'e basınca {yeniSinifSayisi} yeni sınıf için plan oluşturulacak.
          </div>
        )}

        {/* Kaydet */}
        <button
          onClick={handleSave}
          className="w-full bg-[#F59E0B] text-white py-3.5 rounded-xl font-bold shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Kaydet
        </button>

        {basariMesaji && (
          <p className="text-center text-[#059669] font-medium text-sm">
            ✅ Ayarlar kaydedildi!
          </p>
        )}
      </div>
    </div>
  );
}
