import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowLeft, BarChart2, BookOpen, FileText, Target, Construction } from 'lucide-react'
import { StorageKeys } from '../lib/storageKeys'
import type { PlanEntry } from '../types/planEntry'

const ARACLAR = [
  { id: 'sinav',    ikon: FileText,  ad: 'Yazılı Sınav',    alt: 'Kazanım bazlı, cevap anahtarlı',  renk: '#4F6AF5' },
  { id: 'etkinlik', ikon: Target,    ad: 'Sınıf Etkinliği', alt: 'Grup, bireysel, oyun bazlı',       renk: '#059669' },
  { id: 'materyal', ikon: BookOpen,  ad: 'Ders Materyali',  alt: 'Çalışma yaprağı, kavram haritası', renk: '#6D28D9' },
  { id: 'rubrik',   ikon: BarChart2, ad: 'Rubrik',          alt: 'Performans, proje, sunum',          renk: '#D97706' },
]

const MAKS = 10

interface UretBaglami { sinif?: string; ders?: string; haftaNo?: number; kazanim?: string }

interface UretPageProps {
  planlar?: PlanEntry[]
}

export function UretPage({ planlar = [] }: UretPageProps) {
  const location     = useLocation()
  const baglam       = (location.state as UretBaglami | null) ?? null
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sinif, setSinif]           = useState(baglam?.sinif ?? '')
  const [kazanim, setKazanim]       = useState(baglam?.kazanim ?? '')
  const [soruSayisi, setSoruSayisi] = useState(10)
  const [soruTuru, setSoruTuru]     = useState('Karma')
  const [zorluk, setZorluk]         = useState('Orta')
  const [bakiye, setBakiye] = useState(0)
  const [gonderildi, setGonderildi] = useState(false)

  const selectedTool = useMemo(() => ARACLAR.find(a => a.id === selectedId) ?? null, [selectedId])
  const zorluklar = [{ id: 'Kolay', emoji: '🌱' }, { id: 'Orta', emoji: '⚡' }, { id: 'Zor', emoji: '🔥' }]

  // Kullanıcının planlarından sınıf listesi
  const sinifSecenekleri = useMemo(() => {
    if (planlar.length === 0) return []
    return planlar.map(p => ({ sinif: p.sinif, label: p.sinifGercek || p.sinif, ders: p.ders }))
  }, [planlar])

  useEffect(() => {
    try {
      const jeton = localStorage.getItem(StorageKeys.JETON_DURUMU)
      if (jeton) {
        const parsed = JSON.parse(jeton)
        setBakiye(typeof parsed === 'number' ? parsed : (parsed.bakiye ?? 0))
      }
    } catch { /* ignore */ }
  }, [])

  // Sınıf seçildiğinde otomatik ders dolsun
  function handleSinifSec(sinifDeger: string) {
    setSinif(sinifDeger)
    if (!kazanim) {
      const entry = planlar.find(p => p.sinif === sinifDeger)
      if (entry?.ders && !baglam?.kazanim) setKazanim('')
    }
  }

  if (gonderildi) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #4F6AF5, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Construction size={36} color="#fff" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Geliştirme Aşamasında
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text2)', lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>
          AI üretim motoru hazırlanıyor. Hazır olduğunda aynı formla hemen kullanabileceksiniz.
        </p>
        <button
          onClick={() => { setGonderildi(false); setSelectedId(null) }}
          style={{ height: 48, padding: '0 28px', borderRadius: 100, background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', fontSize: 15, fontWeight: 700, color: 'var(--color-text1)', cursor: 'pointer' }}
        >
          ← Geri Dön
        </button>
      </div>
    )
  }

  if (selectedTool) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text2)' }} />
          </button>
          <div>
            <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>
              {selectedTool.ad} Üret
            </h1>
            <p style={{ fontSize: 12, color: 'var(--color-text3)' }}>Formu doldur, üret</p>
          </div>
        </div>

        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Konu / Kazanım */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: 6 }}>Konu / Kazanım</p>
            <input
              value={kazanim}
              onChange={e => setKazanim(e.target.value)}
              placeholder="Konu veya kazanım girin"
              style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text1)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {/* Sınıf */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: 6 }}>Sınıf</p>
            {sinifSecenekleri.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sinifSecenekleri.map(s => (
                  <button
                    key={s.sinif}
                    type="button"
                    onClick={() => handleSinifSec(s.sinif)}
                    style={{
                      height: 40, padding: '0 16px', borderRadius: 100,
                      border: sinif === s.sinif ? '1.5px solid #4F6AF5' : '1.5px solid var(--color-border)',
                      background: sinif === s.sinif ? '#EEF1FE' : 'var(--color-surface)',
                      fontSize: 14, fontWeight: 700,
                      color: sinif === s.sinif ? '#4F6AF5' : 'var(--color-text2)',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={sinif}
                onChange={e => setSinif(e.target.value)}
                style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text1)', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}
              >
                <option value="">Sınıf girin (plan yok)</option>
              </select>
            )}
          </div>

          {/* Soru Sayısı — sadece sınav */}
          {selectedId === 'sinav' && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: 6 }}>Soru Sayısı</p>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', height: 44 }}>
                <button onClick={() => setSoruSayisi(s => Math.max(1, s - 1))} style={{ width: 44, height: '100%', background: 'none', border: 'none', fontSize: 22, color: '#4F6AF5', cursor: 'pointer' }}>-</button>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: 'var(--color-text1)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>{soruSayisi}</div>
                <button onClick={() => setSoruSayisi(s => Math.min(30, s + 1))} style={{ width: 44, height: '100%', background: 'none', border: 'none', fontSize: 22, color: '#4F6AF5', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          )}

          {/* Soru Türü — sadece sınav */}
          {selectedId === 'sinav' && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: 6 }}>Soru Türü</p>
              <select
                value={soruTuru}
                onChange={e => setSoruTuru(e.target.value)}
                style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 15, color: 'var(--color-text1)', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}
              >
                <option>Karma</option>
                <option>Sadece Çoktan Seçmeli</option>
                <option>Sadece Açık Uçlu</option>
              </select>
            </div>
          )}

          {/* Zorluk */}
          {(selectedId === 'sinav' || selectedId === 'etkinlik' || selectedId === 'materyal') && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: 6 }}>Zorluk</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {zorluklar.map(z => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZorluk(z.id)}
                    style={{ padding: '12px 8px', borderRadius: 12, border: zorluk === z.id ? '1.5px solid #4F6AF5' : '1.5px solid var(--color-border)', background: zorluk === z.id ? '#EEF1FE' : 'var(--color-surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                  >
                    <span style={{ fontSize: 20 }}>{z.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: zorluk === z.id ? '#4F6AF5' : 'var(--color-text2)' }}>{z.id}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bakiye bilgisi */}
          <div style={{ background: 'color-mix(in srgb, #4F6AF5 8%, var(--color-surface))', border: '1px solid color-mix(in srgb, #4F6AF5 20%, transparent)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🎯</span>
            <p style={{ fontSize: 13, color: 'var(--color-text2)', fontWeight: 500 }}>Bu üretim <strong>1 üretim hakkı</strong> kullanacak. Bakiye: <strong style={{ color: '#4F6AF5' }}>{bakiye}</strong></p>
          </div>

          {/* Üret butonu */}
          <button
            onClick={() => {
              if (!kazanim.trim() || (!sinif && sinifSecenekleri.length > 0)) return
              setGonderildi(true)
            }}
            disabled={!kazanim.trim() || (sinifSecenekleri.length > 0 && !sinif)}
            style={{
              width: '100%', height: 52, borderRadius: 100,
              background: (!kazanim.trim() || (sinifSecenekleri.length > 0 && !sinif)) ? 'var(--color-border)' : '#4F6AF5',
              color: '#fff', border: 'none',
              fontSize: 16, fontWeight: 700, cursor: (!kazanim.trim() || (sinifSecenekleri.length > 0 && !sinif)) ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {selectedTool.ad} Üret
          </button>
        </div>
      </div>
    )
  }

  // Ana liste ekranı
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '16px 20px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: 4 }}>Üret</p>
        <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.04em' }}>AI destekli üretim</h1>
      </div>

      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Üretim hakkı kartı */}
        <div style={{ borderRadius: 20, background: 'linear-gradient(145deg,#1B2E5E,#243A78)', padding: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'radial-gradient(circle,rgba(79,106,245,.22),transparent 70%)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>Üretim Hakkı</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: '40px' }}>{bakiye}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>üretim hakkı kaldı</p>
            </div>
            {/* Hak Al — geliştirme aşamasında, disabled */}
            <div style={{ height: 36, padding: '0 14px', borderRadius: 100, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Construction size={13} color="rgba(255,255,255,.4)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)' }}>Yakında</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.16)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${Math.min((bakiye / MAKS) * 100, 100)}%`, background: 'linear-gradient(90deg,rgba(255,255,255,.95),rgba(255,255,255,.58))', borderRadius: 100 }} />
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>Bu ay 3 ücretsiz üretim hakkı hediye edildi</p>
        </div>

        {/* Araçlar */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: 8 }}>Araçlar</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ARACLAR.map(arac => {
              const Icon = arac.ikon
              return (
                <button
                  key={arac.id}
                  type="button"
                  onClick={() => setSelectedId(arac.id)}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <Icon size={24} style={{ color: arac.renk, marginBottom: 10 }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 4 }}>{arac.ad}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text2)', lineHeight: '15px', marginBottom: 8 }}>{arac.alt}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>1 üretim hakkı</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Premium upsell — içerik sonrası */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 4 }}>Sınırsız mı istiyorsunuz?</p>
          <p style={{ fontSize: 12, color: 'var(--color-text2)', marginBottom: 12 }}>149 TL/ay ile tüm araçlar sınırsız.</p>
          <div style={{ height: 44, borderRadius: 100, background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Construction size={14} color="var(--color-text3)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text3)' }}>Premium — Yakında</span>
          </div>
        </div>
      </div>
    </div>
  )
}
