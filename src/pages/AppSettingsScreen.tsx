import { useState } from 'react';
import type { PlanEntry } from '../types/planEntry';
import { signOut, type User } from '../lib/auth';
import { AuthModal } from '../components/AuthModal';
import {
  isBildirimDestekleniyor, getBildirimIzni, isBildirimAktif,
  setBildirimAktif, requestBildirimIzni,
} from '../lib/notifications';
import {
  SINIF_SEVIYELERI, DERS_SINIF_MAP,
  SINIF_OGRETMENI_DERSLER, SINIF_OGRETMENI_SINIFLAR,
  getYilSecenekleri,
} from '../lib/dersSinifMap';
import { BRANCHES } from '../lib/branchConfig';
import { buildPlan } from '../lib/planBuilder';
import { LeadForm } from '../components/LeadForm';

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

interface AppSettingsScreenProps {
  onPlanEkle: (entries: PlanEntry[]) => void;
  onPlanSil?: (sinif: string) => void;
  user?: User | null;
  planlar?: PlanEntry[];
}

function readAyarlar() {
  try {
    const kayitli = localStorage.getItem('ogretmen-ayarlari');
    if (kayitli) return JSON.parse(kayitli);
  } catch { /* okunamadı */ }
  return {};
}

export function AppSettingsScreen({ onPlanEkle, onPlanSil, user, planlar: planlarProp = [] }: AppSettingsScreenProps) {
  const [adSoyad, setAdSoyad] = useState(() => readAyarlar().adSoyad || '');
  const [okulAdi, setOkulAdi] = useState(() => readAyarlar().okulAdi || '');
  const [sehir, setSehir] = useState(() => readAyarlar().sehir || '');
  const [ders, setDers] = useState(() => {
    const a = readAyarlar();
    if (a.ogretmenTuru === 'sinif') return 'Sınıf Öğretmeni';
    return a.ders || 'Fen Bilimleri';
  });
  const [bransTumunuGoster, setBransTumunuGoster] = useState(false);
  const [siniflar, setSiniflar] = useState<string[]>(() => {
    const a = readAyarlar();
    if (a.ogretmenTuru === 'sinif') return ['5. Sınıf']; // branş modunda kullanılmaz
    if (a.siniflar?.length) return a.siniflar;
    if (a.sinif) return [a.sinif];
    return ['5. Sınıf'];
  });
  const [sinifOgrSinif, setSinifOgrSinif] = useState(() => readAyarlar().sinifGercek || '3. Sınıf');
  const [sinifOgrDersler, setSinifOgrDersler] = useState<string[]>(() => {
    const a = readAyarlar();
    if (a.ogretmenTuru === 'sinif' && a.siniflar?.length) return a.siniflar;
    return SINIF_OGRETMENI_DERSLER;
  });
  const [yil, setYil] = useState(() => readAyarlar().yil || '2025-2026');
  const [basariMesaji, setBasariMesaji] = useState(false);
  const [mufredatUyari, setMufredatUyari] = useState('');
  const [authModalAcik, setAuthModalAcik] = useState(false);
  const [silOnayBekleyen, setSilOnayBekleyen] = useState<string | null>(null);
  const [bildirimAktif, setBildirimAktifState] = useState(isBildirimAktif);
  const [bildirimIzni, setBildirimIzniState] = useState(getBildirimIzni);
  const [leadGonderildi, setLeadGonderildi] = useState(
    () => localStorage.getItem('lead-gonderildi') === '1'
  );


  const isSinifOgretmeni = ders === 'Sınıf Öğretmeni';

  function handleDersChange(yeniDers: string) {
    setDers(yeniDers);
    if (yeniDers !== 'Sınıf Öğretmeni') {
      const branch = BRANCHES.find(b => b.lessonId === yeniDers)
      const secilebilir = branch?.classes || DERS_SINIF_MAP[yeniDers] || SINIF_SEVIYELERI;
      const gecerli = siniflar.filter(s => secilebilir.includes(s));
      setSiniflar(gecerli.length > 0 ? gecerli : [secilebilir[0]]);
    }
  }

  function toggleSinif(sinif: string) {
    setSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    );
  }

  function toggleSinifOgrDers(d: string) {
    setSinifOgrDersler(prev =>
      prev.includes(d)
        ? prev.length > 1 ? prev.filter(x => x !== d) : prev
        : [...prev, d]
    );
  }

  function handleSave() {
    if (isSinifOgretmeni) {
      localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
        adSoyad, okulAdi, sehir,
        ders: sinifOgrDersler[0],
        siniflar: sinifOgrDersler,
        yil, ogretmenTuru: 'sinif', sinifGercek: sinifOgrSinif,
      }));
      const yeniResults = sinifOgrDersler
        .filter(d => !planlarProp.find(p => p.sinif === `${sinifOgrSinif}—${d}`))
        .map(d => ({ ders: d, ...buildPlan(d, sinifOgrSinif, yil) }));
      if (yeniResults.length > 0) {
        const yeniEntries: PlanEntry[] = yeniResults.map(r => ({
          sinif: `${sinifOgrSinif}—${r.ders}`,
          ders: r.ders, yil, tip: 'meb' as const, plan: r.plan, rows: null,
          label: r.ders, sinifGercek: sinifOgrSinif,
        }));
        onPlanEkle(yeniEntries);
      }
      const eksik = yeniResults.filter(r => !r.hasMufredat).map(r => r.ders);
      setMufredatUyari(eksik.length > 0 ? `${eksik.join(', ')} için müfredat bulunamadı, boş plan oluşturuldu.` : '');
    } else {
      localStorage.setItem('ogretmen-ayarlari', JSON.stringify({
        adSoyad, okulAdi, sehir, ders, siniflar, yil
      }));
      const yeniResults = siniflar
        .filter(s => !planlarProp.find(p => p.sinif === s && p.ders === ders))
        .map(s => ({ sinif: s, ...buildPlan(ders, s, yil) }));
      if (yeniResults.length > 0) {
        const yeniEntries: PlanEntry[] = yeniResults.map(r => ({
          sinif: r.sinif, ders, yil, tip: 'meb' as const, plan: r.plan, rows: null,
        }));
        onPlanEkle(yeniEntries);
      }
      const eksik = yeniResults.filter(r => !r.hasMufredat).map(r => r.sinif);
      setMufredatUyari(eksik.length > 0 ? `${eksik.join(', ')} için müfredat bulunamadı, boş plan oluşturuldu.` : '');
    }
    setBasariMesaji(true);
    setTimeout(() => setBasariMesaji(false), 2500);
  }

  function handlePlanSilOnayla(sinif: string) {
    if (onPlanSil) onPlanSil(sinif);
    setSilOnayBekleyen(null);
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

  const aktifBranch = BRANCHES.find(b => b.lessonId === ders)
  const aktifSiniflar = aktifBranch?.classes || DERS_SINIF_MAP[ders] || SINIF_SEVIYELERI;
  const yeniSinifSayisi = isSinifOgretmeni
    ? sinifOgrDersler.filter(d => !planlarProp.find(p => p.sinif === `${sinifOgrSinif}—${d}`)).length
    : siniflar.filter(s => !planlarProp.find(p => p.sinif === s && p.ders === ders)).length;

  return (
    <div className="max-w-lg mx-auto p-4 w-full pb-36">
      <div className="mb-6 mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D5BE3]">Ayarlar</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Bilgilerini güncelle, yeni sınıflar için plan ekle.
          </p>
        </div>
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

      {/* Lead toplama — giriş yapılmamış ve daha önce gönderilmemişse */}
      {!user && !leadGonderildi && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Güncellemelerden Haberdar Ol</p>
          <p className="text-sm text-gray-500 mb-4">Yeni müfredat ve özellikler için bildirim al.</p>
          <LeadForm
            embedded
            onSuccess={() => {
              localStorage.setItem('lead-gonderildi', '1')
              setLeadGonderildi(true)
            }}
          />
        </div>
      )}

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

        {/* Branş / Ders */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Branş / Ders</label>
          {/* Popüler branşlar */}
          <div className="grid grid-cols-2 gap-2">
            {BRANCHES.filter(b => b.popular).map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleDersChange(b.lessonId)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-semibold transition-all active:scale-[0.97] ${
                  ders === b.lessonId
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4] hover:border-[#2D5BE3]/40'
                }`}
              >
                <span className="text-lg flex-shrink-0">{b.icon}</span>
                <span className="leading-tight">{b.label}</span>
              </button>
            ))}
          </div>
          {/* Diğer branşlar */}
          {bransTumunuGoster && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              {BRANCHES.filter(b => !b.popular).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleDersChange(b.lessonId)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm font-semibold transition-all active:scale-[0.97] ${
                    ders === b.lessonId
                      ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                      : 'bg-[#FAFAF9] text-[#1C1917] border-[#E7E5E4] hover:border-[#2D5BE3]/40'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{b.icon}</span>
                  <span className="leading-tight">{b.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setBransTumunuGoster(p => !p)}
            className="mt-1 py-2 text-xs font-bold text-[#2D5BE3] border border-[#2D5BE3]/20 bg-[#2D5BE3]/5 rounded-xl active:scale-95 transition-all hover:bg-[#2D5BE3]/10"
          >
            {bransTumunuGoster ? 'Daha az göster ↑' : `Tüm branşları göster ↓`}
          </button>
        </div>

        {/* Sınıf Öğretmeni: sınıf + ders seçimi */}
        {isSinifOgretmeni ? (
          <>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-[#2D5BE3] text-sm">Sınıfın</label>
              <div className="flex gap-2 flex-wrap">
                {SINIF_OGRETMENI_SINIFLAR.map(s => (
                  <button key={s} type="button" onClick={() => setSinifOgrSinif(s)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                      sinifOgrSinif === s
                        ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                        : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-[#2D5BE3] text-sm">
                Dersler
                <span className="text-gray-400 font-normal text-xs ml-1">(birden fazla seçilebilir)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SINIF_OGRETMENI_DERSLER.map(d => (
                  <button key={d} type="button" onClick={() => toggleSinifOgrDers(d)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                      sinifOgrDersler.includes(d)
                        ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                        : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Branş öğretmeni: sınıf seviyeleri multi-select */
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[#2D5BE3] text-sm">
              Sınıf Seviyeleri
              <span className="text-gray-400 font-normal text-xs ml-1">(birden fazla seçilebilir)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {aktifSiniflar.map(s => (
                <button key={s} type="button" onClick={() => toggleSinif(s)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                    siniflar.includes(s)
                      ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                      : 'bg-[#FAFAF9] text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Akademik Yıl */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-[#2D5BE3] text-sm">Akademik Yıl</label>
          <select
            value={yil}
            onChange={(e) => setYil(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm"
          >
            {getYilSecenekleri().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Yeni sınıf uyarısı */}
        {yeniSinifSayisi > 0 && (
          <div className="bg-[#2D5BE3]/10 border border-[#2D5BE3]/20 rounded-xl px-3.5 py-2.5 text-[#2D5BE3] text-xs font-semibold">
            Kaydet'e basınca {yeniSinifSayisi} yeni sınıf için plan oluşturulacak.
          </div>
        )}

        {mufredatUyari && (
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl px-3.5 py-2.5">
            <p className="text-[#92400e] text-xs font-semibold">⚠️ {mufredatUyari}</p>
          </div>
        )}
      </div>

      {/* Mevcut Planlar */}
      {planlarProp.length > 0 && (
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Mevcut Planlar</p>
          <div className="flex flex-col gap-3">
            {planlarProp.map(p => (
              <div key={p.sinif} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917] truncate">{p.label || p.ders}</p>
                  <p className="text-xs text-gray-400">{p.sinifGercek || p.sinif} · {p.yil}</p>
                </div>
                {silOnayBekleyen === p.sinif ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePlanSilOnayla(p.sinif)}
                      className="text-xs font-bold text-white bg-red-500 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                    >
                      Evet, Sil
                    </button>
                    <button
                      onClick={() => setSilOnayBekleyen(null)}
                      className="text-xs font-bold text-gray-500 border border-[#E7E5E4] px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSilOnayBekleyen(p.sinif)}
                    className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all hover:bg-red-100 shrink-0"
                  >
                    Sil
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Kaydet Butonu */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center pointer-events-none z-30">
        <div className="w-full max-w-lg px-4 pointer-events-auto">
          <button
            onClick={handleSave}
            className="w-full bg-[#F59E0B] text-white py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {basariMesaji ? '✅ Kaydedildi!' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
