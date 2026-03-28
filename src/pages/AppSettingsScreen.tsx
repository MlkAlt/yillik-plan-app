import { useState, useEffect, useRef } from 'react';
import type { PlanEntry } from '../types/planEntry';
import { signOut, type User } from '../lib/auth';
import { AuthModal } from '../components/AuthModal';
import {
  isBildirimDestekleniyor, getBildirimIzni, isBildirimAktif,
  setBildirimAktif, requestBildirimIzni,
} from '../lib/notifications';
import { getYilSecenekleri } from '../lib/dersSinifMap';
import { BottomSheet } from '../components/UI/BottomSheet';
import { PlanSelector } from '../components/PlanSelector';


interface AppSettingsScreenProps {
  onPlanEkle: (entries: PlanEntry[]) => void;
  onPlanSil?: (sinif: string) => void;
  user?: User | null;
  planlar?: PlanEntry[];
}

function readAyarlar() {
  try {
    const k = localStorage.getItem('ogretmen-ayarlari');
    if (k) return JSON.parse(k);
  } catch { /* okunamadi */ }
  return {};
}

export function AppSettingsScreen({ onPlanEkle, onPlanSil, user, planlar: planlarProp = [] }: AppSettingsScreenProps) {
  const [adSoyad, setAdSoyad] = useState(() => readAyarlar().adSoyad || '');
  const [okulAdi, setOkulAdi] = useState(() => readAyarlar().okulAdi || '');
  const [yil, setYil] = useState(() => readAyarlar().yil || getYilSecenekleri()[0]);
  const [degisti, setDegisti] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);
  const [authModalAcik, setAuthModalAcik] = useState(false);
  const [planSelectorAcik, setPlanSelectorAcik] = useState(false);
  const [silOnayBekleyen, setSilOnayBekleyen] = useState<string | null>(null);
  const [bildirimAktif, setBildirimAktifState] = useState(isBildirimAktif);
  const [bildirimIzni, setBildirimIzniState] = useState(getBildirimIzni);
  const [mufredatUyari, setMufredatUyari] = useState('');
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    setDegisti(true);
    setKaydedildi(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adSoyad, okulAdi, yil]);

  function handleKaydet() {
    const a = readAyarlar();
    localStorage.setItem('ogretmen-ayarlari', JSON.stringify({ ...a, adSoyad, okulAdi, yil }));
    setDegisti(false);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  }

  function handlePlanSilOnayla(sinif: string) {
    if (onPlanSil) onPlanSil(sinif);
    setSilOnayBekleyen(null);
  }

  async function handleBildirimToggle() {
    if (!bildirimAktif) {
      const izin = await requestBildirimIzni();
      setBildirimIzniState(Notification.permission);
      if (izin) { setBildirimAktif(true); setBildirimAktifState(true); }
    } else {
      setBildirimAktif(false);
      setBildirimAktifState(false);
    }
  }

  function handleYeniPlanEkle(entries: PlanEntry[]) {
    const eksik = entries.filter(e => !e.plan?.haftalar?.length).map(e => e.label || e.ders);
    setMufredatUyari(eksik.length > 0 ? eksik.join(', ') + ' icin mufredat bulunamadi.' : '');
    onPlanEkle(entries);
    setPlanSelectorAcik(false);
  }

  return (
    <div className="max-w-lg mx-auto p-4 w-full pb-24">
      <div className="mb-6 mt-2 flex items-center justify-between h-10">
        <h1 className="text-3xl font-bold text-[#2D5BE3]">Ayarlar</h1>
      </div>

      {/* PROFIL */}
      <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 mb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Profil</p>
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="Ad Soyad" value={adSoyad} onChange={e => setAdSoyad(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm" />
          <input type="text" placeholder="Okul Adi" value={okulAdi} onChange={e => setOkulAdi(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E7E5E4] bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition-all text-[#1C1917] text-sm" />
          {/* Kaydet — sadece değişiklik varsa görünür */}
          <div className={`overflow-hidden transition-all duration-200 ${degisti ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
            <button
              onClick={handleKaydet}
              className="w-full bg-[#F59E0B] text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all hover:opacity-90 mt-1"
            >
              Kaydet
            </button>
          </div>
          {kaydedildi && !degisti && (
            <p className="text-xs font-bold text-[#059669] text-center">Kaydedildi</p>
          )}
        </div>
      </div>

      {/* PLANLARIM */}
      <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planlarim</p>
          <button onClick={() => setPlanSelectorAcik(true)}
            className="text-xs font-bold text-[#2D5BE3] bg-[#2D5BE3]/8 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
            + Yeni Plan
          </button>
        </div>
        {planlarProp.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Henuz plan yok</p>
        ) : (
          <div className="flex flex-col">
            {planlarProp.map(p => (
              <div key={p.sinif} className="flex items-center justify-between gap-2 py-2.5 border-b border-[#E7E5E4] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917] truncate">{p.label || p.ders}</p>
                  <p className="text-xs text-gray-400">{p.sinifGercek || p.sinif} - {p.yil}</p>
                </div>
                {silOnayBekleyen === p.sinif ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handlePlanSilOnayla(p.sinif)}
                      className="text-xs font-bold text-white bg-red-500 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all">Sil</button>
                    <button onClick={() => setSilOnayBekleyen(null)}
                      className="text-xs font-bold text-gray-500 border border-[#E7E5E4] px-2.5 py-1.5 rounded-lg active:scale-95 transition-all">Iptal</button>
                  </div>
                ) : (
                  <button onClick={() => setSilOnayBekleyen(p.sinif)}
                    className="text-sm text-gray-300 hover:text-red-400 active:scale-95 transition-all shrink-0 px-2 py-1">
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {mufredatUyari && (
          <div className="mt-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl px-3 py-2">
            <p className="text-[#92400e] text-xs font-semibold">{mufredatUyari}</p>
          </div>
        )}
      </div>

      {/* TERCIHLER */}
      <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 mb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tercihler</p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#1C1917]">Akademik Yil</p>
            <select value={yil} onChange={e => setYil(e.target.value)}
              className="text-sm font-bold text-[#2D5BE3] bg-transparent border-none focus:outline-none cursor-pointer">
              {getYilSecenekleri().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {isBildirimDestekleniyor() && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1C1917]">Haftalik hatirlatici</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {bildirimIzni === 'denied' ? 'Tarayici ayarlarindan izin ver' : 'Kazanimi haftabasi bildir'}
                </p>
              </div>
              <button onClick={handleBildirimToggle} disabled={bildirimIzni === 'denied'}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none disabled:opacity-40 ${bildirimAktif && bildirimIzni === 'granted' ? 'bg-[#2D5BE3]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${bildirimAktif && bildirimIzni === 'granted' ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HESAP */}
      <div className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Hesap</p>
        {user ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1C1917]">{user.email}</p>
              <p className="text-xs text-[#059669] mt-0.5 font-medium">Planlar buluta kaydediliyor</p>
            </div>
            <button onClick={() => signOut()}
              className="text-xs font-bold text-red-500 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
              Cikis
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Giris yapilmadi</p>
              <p className="text-xs text-gray-400 mt-0.5">Planlarin tum cihazlarda erisebilir olsun</p>
            </div>
            <button onClick={() => setAuthModalAcik(true)}
              className="text-xs font-bold text-[#2D5BE3] border border-[#2D5BE3]/30 bg-[#2D5BE3]/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
              Giris Yap
            </button>
          </div>
        )}
      </div>

      {authModalAcik && <AuthModal onClose={() => setAuthModalAcik(false)} />}

      <BottomSheet open={planSelectorAcik} onClose={() => setPlanSelectorAcik(false)}>
        <PlanSelector yil={yil} onComplete={handleYeniPlanEkle} onCancel={() => setPlanSelectorAcik(false)} />
      </BottomSheet>
    </div>
  );
}
