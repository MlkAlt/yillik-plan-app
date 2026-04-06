import { useState } from 'react'
import {
  ChevronRight, AlertTriangle, Construction,
  FolderOpen, Users, FileSignature, Club, GraduationCap, Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getEvrakSablonlari, isPremiumKategori, tespitEksikAlanlar } from '../lib/evrakService'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'
import type { EvrakKategori } from '../types/evrak'

const KATEGORI_IKON: Record<EvrakKategori, React.ElementType> = {
  'ogretmen-dosyasi': FolderOpen,
  'zumre-tutanaklari': Users,
  'genel-burokratik': FileSignature,
  'kulup-evraklari': Club,
  'sinif-rehberlik': GraduationCap,
}

const KATEGORI_RENK: Record<EvrakKategori, string> = {
  'ogretmen-dosyasi': '#4F6AF5',
  'zumre-tutanaklari': '#059669',
  'genel-burokratik': '#6D28D9',
  'kulup-evraklari': '#D97706',
  'sinif-rehberlik': '#0EA5E9',
}

export function DosyamPage() {
  const navigate = useNavigate()
  const { goster } = useToast()
  const sablonlar = getEvrakSablonlari()
  const isPremium = false

  function getAyarlar(): Partial<OgretmenAyarlari> {
    try {
      const item = localStorage.getItem(StorageKeys.OGRETMEN_AYARLARI)
      return item ? JSON.parse(item) : {}
    } catch { return {} }
  }

  const ayarlar = getAyarlar()
  const kritikSablon = sablonlar.find(s => !s.premium)
  const eksikAlanlar = kritikSablon ? tespitEksikAlanlar(kritikSablon, ayarlar) : []
  const freeSablonlar = sablonlar.filter(s => !s.premium)

  const kategoriler: EvrakKategori[] = ['ogretmen-dosyasi', 'zumre-tutanaklari', 'genel-burokratik', 'kulup-evraklari', 'sinif-rehberlik']
  const kategoriAd: Record<EvrakKategori, string> = {
    'ogretmen-dosyasi': 'Öğretmen Dosyası',
    'zumre-tutanaklari': 'Zümre',
    'genel-burokratik': 'Bürokratik',
    'kulup-evraklari': 'Kulüp',
    'sinif-rehberlik': 'Rehberlik',
  }

  const [aramaMetni, setAramaMetni] = useState('')
  const [aktifKategori, setAktifKategori] = useState<EvrakKategori | 'tumu'>('tumu')

  const filtreliSablonlar = sablonlar.filter(s => {
    const metinEsles = aramaMetni === '' || s.ad.toLowerCase().includes(aramaMetni.toLowerCase()) || s.aciklama.toLowerCase().includes(aramaMetni.toLowerCase())
    const kategoriEsles = aktifKategori === 'tumu' || s.kategori === aktifKategori
    return metinEsles && kategoriEsles
  })

  const kategoriChips: Array<{ id: EvrakKategori | 'tumu'; label: string }> = [
    { id: 'tumu', label: `Tümü` },
    ...kategoriler.map(k => ({ id: k as EvrakKategori, label: kategoriAd[k] })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 24 }}>
      {/* Başlık */}
      <div style={{ padding: '16px 16px 0' }}>
        <h1 className="font-display font-bold" style={{ fontSize: 24, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>
          Evrak Merkezi
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text2)', marginTop: 2 }}>
          {freeSablonlar.length} ücretsiz · {sablonlar.filter(s => s.premium).length} premium şablon
        </p>
      </div>

      {/* Okul bilgisi uyarısı — en önemli aksiyon item'ı */}
      {eksikAlanlar.length > 0 && (
        <div style={{ padding: '12px 16px 0' }}>
          <div
            className="flex items-center gap-3 rounded-xl px-4"
            style={{ height: 52, background: 'var(--color-warning-s)', border: '1px solid var(--color-warning-b)', cursor: 'pointer' }}
            onClick={() => navigate('/app/profil')}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--color-text1)', flex: 1 }}>
              Okul bilgilerini ekle — evraklar otomatik doldurulur.
            </p>
            <ChevronRight size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          </div>
        </div>
      )}

      {/* Arama */}
      <div style={{ padding: '12px 16px 0' }}>
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ height: 44, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Search size={16} style={{ color: 'var(--color-text3)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Evrak ara..."
            value={aramaMetni}
            onChange={e => setAramaMetni(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text1)' }}
          />
        </div>
      </div>

      {/* Kategori chips */}
      <div style={{ padding: '10px 0 0', overflowX: 'auto' }}>
        <div className="flex gap-2" style={{ padding: '0 16px', width: 'max-content' }}>
          {kategoriChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setAktifKategori(chip.id)}
              className="font-sans font-semibold whitespace-nowrap"
              style={{
                height: 34, padding: '0 14px', borderRadius: 'var(--radius-pill)', fontSize: 13,
                background: aktifKategori === chip.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: aktifKategori === chip.id ? '#fff' : 'var(--color-text2)',
                border: aktifKategori === chip.id ? 'none' : '1px solid var(--color-border)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Belge listesi */}
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtreliSablonlar.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <Search size={32} style={{ color: 'var(--color-text3)' }} />
            <p style={{ fontSize: 14, color: 'var(--color-text3)' }}>Evrak bulunamadı</p>
          </div>
        ) : (
          filtreliSablonlar.map(sablon => {
            const eksik = tespitEksikAlanlar(sablon, ayarlar)
            const premium = isPremiumKategori(sablon.kategori)
            const erisimVar = !premium || isPremium
            const KategoriIkon = KATEGORI_IKON[sablon.kategori as EvrakKategori] ?? FolderOpen
            const kategoriRenk = KATEGORI_RENK[sablon.kategori as EvrakKategori] ?? '#4F6AF5'

            return (
              <div
                key={sablon.id}
                className="rounded-xl p-4 relative"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
              >
                {sablon.premium && (
                  <span
                    className="absolute top-3 right-3 font-sans font-bold"
                    style={{ fontSize: 11, color: '#fff', background: 'var(--color-warning)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}
                  >
                    Premium
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-xl"
                    style={{ width: 40, height: 40, background: `color-mix(in srgb, ${kategoriRenk} 12%, var(--color-bg))`, color: kategoriRenk }}
                  >
                    <KategoriIkon size={18} />
                  </div>
                  <div className="flex-1 min-w-0" style={{ paddingRight: sablon.premium ? 60 : 0 }}>
                    <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>{sablon.ad}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text2)', marginTop: 2 }}>{sablon.aciklama}</p>
                  </div>
                </div>

                {erisimVar ? (
                  eksik.length > 0 ? (
                    <button
                      className="w-full flex items-center justify-center gap-2 font-sans font-bold mt-3"
                      style={{ height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--color-warning-s)', color: 'var(--color-warning)', fontSize: 13, border: '1px solid var(--color-warning-b)', cursor: 'pointer' }}
                      onClick={() => navigate('/app/profil')}
                    >
                      <AlertTriangle size={14} /> Bilgileri Tamamla
                    </button>
                  ) : (
                    /* İndir — geliştirme aşamasında, honest state */
                    <div
                      className="w-full flex items-center justify-center gap-2 font-sans font-semibold mt-3"
                      style={{ height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', color: 'var(--color-text3)', fontSize: 13, border: '1px solid var(--color-border)' }}
                    >
                      <Construction size={13} /> İndirme Yakında
                    </div>
                  )
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-2 font-sans font-bold mt-3"
                    style={{ height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', color: 'var(--color-text3)', fontSize: 13, border: '1px solid var(--color-border)', cursor: 'default' }}
                    onClick={() => goster('Premium özelliği yakında aktif olacak', 'bilgi')}
                  >
                    👑 Premium — Yakında
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Premium upsell — içerik sonunda */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ borderRadius: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>👑</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 2 }}>Premium'a Geç</p>
            <p style={{ fontSize: 12, color: 'var(--color-text2)' }}>Tüm evraklara erişim · 149 TL/ay</p>
          </div>
          <div style={{ height: 32, padding: '0 12px', borderRadius: 100, background: 'var(--color-border)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text3)' }}>Yakında</span>
          </div>
        </div>
      </div>
    </div>
  )
}
