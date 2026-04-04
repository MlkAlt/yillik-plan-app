import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowLeft, BarChart2, BookOpen, FileText, Target } from 'lucide-react'

const ARACLAR = [
  { id: 'sinav',    ikon: FileText,  ad: 'Yazılı Sınav',    alt: 'Kazanım bazlı, cevap anahtarlı',  renk: '#4F6AF5' },
  { id: 'etkinlik', ikon: Target,    ad: 'Sınıf Etkinliği', alt: 'Grup, bireysel, oyun bazlı',       renk: '#059669' },
  { id: 'materyal', ikon: BookOpen,  ad: 'Ders Materyali',  alt: 'Çalışma yaprağı, kavram haritası', renk: '#6D28D9' },
  { id: 'rubrik',   ikon: BarChart2, ad: 'Rubrik',          alt: 'Performans, proje, sunum',          renk: '#D97706' },
]

const SINIFLAR = ['9-A','9-B','9-C','10-A','10-B','10-C','11-A','11-B','11-C','11-D','12-A','12-B']
const BAKIYE = 7
const MAKS   = 10

interface UretBaglami { sinif?: string; ders?: string; haftaNo?: number; kazanim?: string }

export function UretPage() {
  const location     = useLocation()
  const baglam       = (location.state as UretBaglami | null) ?? null
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sinif, setSinif]           = useState(baglam?.sinif ?? '')
  const [kazanim, setKazanim]       = useState(baglam?.kazanim ?? '')
  const [soruSayisi, setSoruSayisi] = useState(10)
  const [soruTuru, setSoruTuru]     = useState('Karma')
  const [zorluk, setZorluk]         = useState('Orta')
  const selectedTool = useMemo(() => ARACLAR.find(a => a.id === selectedId) ?? null, [selectedId])
  const zorluklar = [{ id: 'Kolay', emoji: '🌱' }, { id: 'Orta', emoji: '⚡' }, { id: 'Zor', emoji: '🔥' }]

  if (selectedTool) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSelectedId(null)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} style={{ color: 'var(--color-text2)' }} />
          </button>
          <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>{selectedTool.ad} Üret</h1>
        </div>
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: '6px' }}>
          {[0,1,2].map(i => <div key={i} style={{ height: '3px', borderRadius: '100px', background: i === 0 ? '#4F6AF5' : 'var(--color-border)', flex: i === 0 ? 2 : 1 }} />)}
        </div>
        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: '6px' }}>Konu / Kazanim</p>
            <input value={kazanim} onChange={e => setKazanim(e.target.value)} placeholder="Konu veya kazanim girin" style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '15px', color: 'var(--color-text1)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: '6px' }}>Sınıf</p>
            <select value={sinif} onChange={e => setSinif(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '15px', color: 'var(--color-text1)', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}>
              <option value="">Sınıf seç</option>
              {SINIFLAR.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: '6px' }}>Soru Sayısı</p>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', height: '44px' }}>
              <button onClick={() => setSoruSayisi(s => Math.max(1, s - 1))} style={{ width: '44px', height: '100%', background: 'none', border: 'none', fontSize: '22px', color: '#4F6AF5', cursor: 'pointer' }}>-</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 700, color: 'var(--color-text1)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>{soruSayisi}</div>
              <button onClick={() => setSoruSayisi(s => Math.min(30, s + 1))} style={{ width: '44px', height: '100%', background: 'none', border: 'none', fontSize: '22px', color: '#4F6AF5', cursor: 'pointer' }}>+</button>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: '6px' }}>Soru Türü</p>
            <select value={soruTuru} onChange={e => setSoruTuru(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: '15px', color: 'var(--color-text1)', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}>
              <option>Karma</option>
              <option>Sadece Çoktan Seçmeli</option>
              <option>Sadece Açık Uçlu</option>
            </select>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text2)', marginBottom: '6px' }}>Zorluk</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {zorluklar.map(z => (
                <button key={z.id} type="button" onClick={() => setZorluk(z.id)} style={{ padding: '12px 8px', borderRadius: '12px', border: zorluk === z.id ? '1.5px solid #4F6AF5' : '1.5px solid var(--color-border)', background: zorluk === z.id ? '#EEF1FE' : 'var(--color-surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{z.emoji}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: zorluk === z.id ? '#4F6AF5' : 'var(--color-text2)' }}>{z.id}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>!</span>
            <p style={{ fontSize: '13px', color: '#92400E', fontWeight: 500 }}>Bu üretim 1 üretim hakkı kullanacak. Bakiyeniz: {BAKIYE} üretim hakkı.</p>
          </div>
          <button style={{ width: '100%', height: '52px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
            {selectedTool.ad} Üret — 1 Üretim Hakkı
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '16px 20px 8px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: '4px' }}>Üret</p>
        <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.04em' }}>AI destekli üretim</h1>
      </div>
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ borderRadius: '20px', background: 'linear-gradient(145deg,#1B2E5E,#243A78)', padding: '18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'radial-gradient(circle,rgba(79,106,245,.22),transparent 70%)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,.55)', marginBottom: '4px' }}>Üretim Hakkı</p>
              <p style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: '40px' }}>{BAKIYE}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)', marginTop: '2px' }}>uretim hakki kaldi</p>
            </div>
            <button style={{ height: '36px', padding: '0 14px', borderRadius: '100px', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Hak Al</button>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,.16)', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${(BAKIYE / MAKS) * 100}%`, background: 'linear-gradient(90deg,rgba(255,255,255,.95),rgba(255,255,255,.58))', borderRadius: '100px' }} />
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>Bu ay 3 ücretsiz üretim hakkı hediye edildi</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)', marginBottom: '8px' }}>Araclar</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {ARACLAR.map(arac => {
              const Icon = arac.ikon
              return (
                <button key={arac.id} type="button" onClick={() => setSelectedId(arac.id)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                  <Icon size={24} style={{ color: arac.renk, marginBottom: '10px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '4px' }}>{arac.ad}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text2)', lineHeight: '15px', marginBottom: '8px' }}>{arac.alt}</p>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706' }}>1 üretim hakkı</span>
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '4px' }}>Sınırsız mı istiyorsunuz?</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text2)', marginBottom: '12px' }}>149 TL/ay ile tüm araçlar sınırsız.</p>
          <button style={{ width: '100%', height: '44px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Premium'a Geç</button>
        </div>
      </div>
    </div>
  )
}
