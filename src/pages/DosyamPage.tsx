import { CalendarDays, Download, ChevronRight, Check, AlertTriangle } from 'lucide-react'
import { SectionHeader } from '../components/UI/SectionHeader'
import { useNavigate } from 'react-router-dom'
import { getEvrakSablonlari, isPremiumKategori, tespitEksikAlanlar } from '../lib/evrakService'
import { PremiumKilit } from '../components/Evrak/PremiumKilit'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'
import type { EvrakKategori } from '../types/evrak'

const ikoBg = {
  blue: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  green: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
  amber: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
  violet: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  muted: 'var(--color-bg)',
}

type BelgeRenk = keyof typeof ikoBg

interface Belge {
  id: string
  ikon: React.ReactNode
  renk: BelgeRenk
  ad: string
  alt: string
  durum: 'hazir' | 'uyari' | 'ekle' | 'yeni'
  durumMetin?: string
  aksiyonMetni: string
}

function DurumBadge({ durum, metin }: { durum: string; metin?: string }) {
  if (durum === 'hazir') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}>
        <Check size={9} strokeWidth={3} /> {metin}
      </span>
    )
  }
  if (durum === 'uyari') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--color-warning)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, transparent)' }}>
        {metin}
      </span>
    )
  }
  if (durum === 'ekle') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--color-text3)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        {metin}
      </span>
    )
  }
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
}

function BelgeItem({ belge, soluk = false, onIndir }: { belge: Belge; soluk?: boolean; onIndir?: () => void }) {
  const uyari = belge.durum === 'uyari'
  const aksiyonRengi = uyari ? 'var(--color-warning)' : belge.durum === 'hazir' ? 'var(--color-primary)' : 'var(--color-text2)'

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-3"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${uyari ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)' : 'var(--color-border)'}`,
        backgroundColor: uyari ? 'color-mix(in srgb, var(--color-warning) 6%, transparent)' : 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
        opacity: soluk ? 0.72 : 1,
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
        style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: ikoBg[belge.renk],
          color: belge.renk === 'blue' ? 'var(--color-primary)'
            : belge.renk === 'green' ? 'var(--color-success)'
            : belge.renk === 'amber' ? 'var(--color-warning)'
            : belge.renk === 'violet' ? 'var(--color-accent)'
            : 'var(--color-text3)',
        }}
      >
        {belge.ikon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: 'var(--color-text1)' }}>{belge.ad}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text2)' }}>{belge.alt}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <DurumBadge durum={belge.durum} metin={belge.durumMetin} />
        <button
          type="button"
          onClick={onIndir}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
          style={{
            color: aksiyonRengi,
            backgroundColor: uyari
              ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)'
              : belge.durum === 'hazir'
              ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
              : 'var(--color-bg)',
            border: `1px solid ${uyari ? 'color-mix(in srgb, var(--color-warning) 18%, transparent)' : 'var(--color-border)'}`,
          }}
        >
          {belge.aksiyonMetni}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}


export function DosyamPage() {
  const navigate = useNavigate()
  const { goster } = useToast()
  const sablonlar = getEvrakSablonlari()
  const isPremium = false // TODO: gerçek premium kontrolü

  function getAyarlar(): Partial<OgretmenAyarlari> {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      return item ? JSON.parse(item) : {}
    } catch { return {} }
  }

  const ayarlar = getAyarlar()

  // Eksik alan uyarısı — ilk şablonun zorunlu alanlarını kontrol et
  const kritikSablon = sablonlar.find(s => !s.premium)
  const eksikAlanlar = kritikSablon ? tespitEksikAlanlar(kritikSablon, ayarlar) : []

  // Hero istatistikleri
  const freeSablonlar = sablonlar.filter(s => !s.premium)
  const hazirSablonlar = freeSablonlar.filter(s => tespitEksikAlanlar(s, ayarlar).length === 0)
  const eksikSablonlar = freeSablonlar.filter(s => tespitEksikAlanlar(s, ayarlar).length > 0)
  const toplamBelge = freeSablonlar.length

  // Durum satırları: hazır olanlar ✓, eksik olanlar ⚠
  const durumSatirlari = [
    ...hazirSablonlar.slice(0, 3).map(s => ({ metin: `✓ ${s.ad}`, renk: '#34d399' })),
    ...eksikSablonlar.slice(0, 2).map(s => ({ metin: `⚠ ${s.ad} eksik`, renk: '#FCD34D' })),
  ].slice(0, 4)

  const kategoriler: EvrakKategori[] = ['ogretmen-dosyasi', 'zumre-tutanaklari', 'genel-burokratik', 'kulup-evraklari', 'sinif-rehberlik']
  const kategoriAd: Record<EvrakKategori, string> = {
    'ogretmen-dosyasi': 'Öğretmen Dosyası',
    'zumre-tutanaklari': 'Zümre Tutanakları',
    'genel-burokratik': 'Genel Bürokratik',
    'kulup-evraklari': 'Kulüp Evrakları',
    'sinif-rehberlik': 'Sınıf Rehberlik',
  }
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Öğretmen Dosyası
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          Hazır belgeler, eksikler ve manuel eklenebilir alanlar
        </p>
      </div>

      <div
        className="page-hero relative overflow-hidden"
        style={{
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,.08)',
          background: 'linear-gradient(145deg,#1B2E5E,#243A78)',
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          padding: '18px',
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{ top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'radial-gradient(circle,rgba(79,106,245,.22),transparent 70%)', borderRadius: '50%' }}
        />
        <div className="flex justify-between items-start gap-4 mb-4 mt-1 relative z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-1" style={{ color: 'rgba(255,255,255,.55)' }}>
              Toplam Belge
            </p>
            <p className="text-[28px] font-bold leading-none" style={{ fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-.03em' }}>
              {toplamBelge}
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,.55)' }}>
              {hazirSablonlar.length} hazır · {eksikSablonlar.length} eksik
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {durumSatirlari.map(item => (
              <span key={item.metin} className="text-[11px] font-semibold" style={{ color: item.renk }}>
                {item.metin}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => goster('PDF indirme yakında aktif olacak', 'bilgi')}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-all active:scale-[0.97] relative z-10"
          style={{
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(255,255,255,.15)',
            border: '1px solid rgba(255,255,255,.2)',
          }}
        >
          <Download size={16} /> Tüm Dosyayı İndir · PDF
        </button>
      </div>

      <div className="section-stack">
        {/* Eksik alan uyarısı */}
        {eksikAlanlar.length > 0 && (
          <div
            onClick={() => navigate('/app/profil')}
            style={{ borderRadius: 'var(--radius-lg)', border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)', flex: 1 }}>
              Eksik bilgi: {eksikAlanlar.join(', ')} — Ayarlardan tamamla
            </p>
            <ChevronRight size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          </div>
        )}

        {/* Kategoriler */}
        {kategoriler.map(kategori => {
          const kategoriSablonlari = sablonlar.filter(s => s.kategori === kategori)
          if (kategoriSablonlari.length === 0) return null
          const premium = isPremiumKategori(kategori)
          const erisimVar = !premium || isPremium

          return (
            <div key={kategori}>
              <SectionHeader title={kategoriAd[kategori]} meta={`${kategoriSablonlari.length} belge`} />
              {erisimVar ? (
                <div className="flex flex-col gap-2">
                  {kategoriSablonlari.map(sablon => {
                    const eksik = tespitEksikAlanlar(sablon, ayarlar)
                    return (
                      <BelgeItem
                        key={sablon.id}
                        belge={{
                          id: sablon.id,
                          ikon: <CalendarDays size={18} />,
                          renk: 'blue',
                          ad: sablon.ad,
                          alt: sablon.aciklama,
                          durum: eksik.length > 0 ? 'uyari' : 'hazir',
                          durumMetin: eksik.length > 0 ? 'Eksik' : 'Hazır',
                          aksiyonMetni: eksik.length > 0 ? 'Tamamla' : 'İndir',
                        }}
                        onIndir={eksik.length > 0
                          ? () => navigate('/app/profil')
                          : () => goster(`${sablon.ad} indirme yakında aktif olacak`, 'bilgi')
                        }
                      />
                    )
                  })}
                </div>
              ) : (
                <PremiumKilit ozellik={kategoriAd[kategori]} onYukselt={() => navigate('/app/uret')} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
