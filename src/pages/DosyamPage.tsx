import { useState } from 'react'
import { CalendarDays, Download, ChevronRight, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getEvrakSablonlari, isPremiumKategori, tespitEksikAlanlar } from '../lib/evrakService'
import { StorageKeys } from '../lib/storageKeys'
import { useToast } from '../lib/toast'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'
import type { EvrakKategori } from '../types/evrak'

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
    'zumre-tutanaklari': 'Zümre Tutanakları',
    'genel-burokratik': 'Genel Bürokratik',
    'kulup-evraklari': 'Kulüp Evrakları',
    'sinif-rehberlik': 'Sınıf Rehberlik',
  }

  const [aramaMetni, setAramaMetni] = useState('')
  const [aktifKategori, setAktifKategori] = useState<EvrakKategori | 'tumu'>('tumu')

  const filtreliSablonlar = sablonlar.filter(s => {
    const metinEsles = aramaMetni === '' || s.ad.toLowerCase().includes(aramaMetni.toLowerCase()) || s.aciklama.toLowerCase().includes(aramaMetni.toLowerCase())
    const kategoriEsles = aktifKategori === 'tumu' || s.kategori === aktifKategori
    return metinEsles && kategoriEsles
  })

  const kategoriChips: Array<{ id: EvrakKategori | 'tumu'; label: string }> = [
    { id: 'tumu', label: `Tümü (${sablonlar.length})` },
    ...kategoriler.map(k => ({ id: k as EvrakKategori, label: `${kategoriAd[k]} (${sablonlar.filter(s => s.kategori === k).length})` })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 24 }}>
      {/* Başlık */}
      <div style={{ padding: '16px 16px 0' }}>
        <h1 className="font-display font-bold" style={{ fontSize: 22, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>
          Evrak Merkezi
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-text2)', marginTop: 2 }}>
          {freeSablonlar.length} ücretsiz + {sablonlar.filter(s => s.premium).length} premium evrak
        </p>
      </div>

      {/* Premium banner */}
      <div style={{ padding: '12px 16px 0' }}>
        <button
          className="w-full flex items-center justify-center gap-2 font-sans font-bold"
          style={{ height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-warning)', color: '#fff', fontSize: 15, border: 'none', cursor: 'pointer' }}
          onClick={() => goster('Premium özelliği yakında aktif olacak', 'bilgi')}
        >
          👑 Premium'a Geç
        </button>
      </div>

      {/* Okul bilgisi uyarısı */}
      {eksikAlanlar.length > 0 && (
        <div style={{ padding: '8px 16px 0' }}>
          <div
            className="flex items-center gap-3 rounded-xl px-4"
            style={{ height: 52, background: 'var(--color-warning-s)', border: '1px solid var(--color-warning-b)', cursor: 'pointer' }}
            onClick={() => navigate('/app/profil')}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--color-text1)', flex: 1 }}>
              Okul bilgilerini ekleyin: Evraklar otomatik doldurulur.
            </p>
            <button
              className="font-sans font-bold"
              style={{ fontSize: 12, color: 'var(--color-warning)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              Ayarlar
            </button>
          </div>
        </div>
      )}

      {/* Arama */}
      <div style={{ padding: '8px 16px 0' }}>
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ height: 42, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <ChevronRight size={16} style={{ color: 'var(--color-text3)', transform: 'rotate(90deg)' }} />
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
            <CalendarDays size={32} style={{ color: 'var(--color-text3)' }} />
            <p style={{ fontSize: 14, color: 'var(--color-text3)' }}>Evrak bulunamadı</p>
          </div>
        ) : (
          filtreliSablonlar.map(sablon => {
            const eksik = tespitEksikAlanlar(sablon, ayarlar)
            const premium = isPremiumKategori(sablon.kategori)
            const erisimVar = !premium || isPremium
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
                    style={{ width: 40, height: 40, background: 'var(--color-primary-s)', color: 'var(--color-primary)' }}
                  >
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex-1 min-w-0" style={{ paddingRight: sablon.premium ? 60 : 0 }}>
                    <p className="font-sans font-bold" style={{ fontSize: 14, color: 'var(--color-text1)' }}>{sablon.ad}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text2)', marginTop: 2 }}>{sablon.aciklama}</p>
                  </div>
                </div>
                {erisimVar ? (
                  <button
                    className="w-full flex items-center justify-center gap-2 font-sans font-bold mt-3"
                    style={{ height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer' }}
                    onClick={eksik.length > 0
                      ? () => navigate('/app/profil')
                      : () => goster(`${sablon.ad} indirme yakında aktif olacak`, 'bilgi')
                    }
                  >
                    <Download size={14} /> {eksik.length > 0 ? 'Bilgileri Tamamla' : 'İndir'}
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-2 font-sans font-bold mt-3"
                    style={{ height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--color-warning)', color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer' }}
                    onClick={() => goster('Premium özelliği yakında aktif olacak', 'bilgi')}
                  >
                    👑 Premium'a Geç
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
