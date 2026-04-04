import { useState } from 'react'
import type { GunlukPlan } from '../../types/gunlukPlan'
import type { Gun } from '../../types/dersProgrami'
import { StorageKeys } from '../../lib/storageKeys'

const YONTEMLER = ['Soru-Cevap', 'Grup Çalışması', 'Anlatım', 'Tartışma', 'Problem Çözme', 'Gösteri', 'Oyun']

interface GunlukPlanTaslakProps {
  haftaNo: number
  gun: Gun
  sinif: string
  ders: string
  kazanim: string
  onKaydet?: (plan: GunlukPlan) => void
  onAtla?: () => void
}

export function GunlukPlanTaslak({ haftaNo, gun, sinif, ders, kazanim, onKaydet, onAtla }: GunlukPlanTaslakProps) {
  const [seciliYontemler, setSeciliYontemler] = useState<string[]>(['Soru-Cevap'])
  const [etkinlikler, setEtkinlikler] = useState('')
  const [materyaller, setMateryaller] = useState('')
  const [sure, setSure] = useState(40)

  function handleKaydet() {
    const plan: GunlukPlan = {
      id: crypto.randomUUID(),
      haftaNo,
      gun,
      sinif,
      ders,
      kazanim,
      yontem: seciliYontemler,
      etkinlikler: etkinlikler.split('\n').filter(Boolean),
      materyaller: materyaller.split('\n').filter(Boolean),
      sure,
      olusturmaTarihi: new Date().toISOString(),
    }
    try {
      const mevcut = JSON.parse(localStorage.getItem(StorageKeys.GUNLUK_PLANLAR) ?? '[]') as GunlukPlan[]
      localStorage.setItem(StorageKeys.GUNLUK_PLANLAR, JSON.stringify([...mevcut, plan]))
    } catch { /* ignore */ }
    onKaydet?.(plan)
  }

  function toggleYontem(y: string) {
    setSeciliYontemler(prev => prev.includes(y) ? (prev.length > 1 ? prev.filter(x => x !== y) : prev) : [...prev, y])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Kazanım özeti */}
      <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#EEF1FE', border: '1px solid #C7D2FD' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#4F6AF5', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ders} · {sinif} · {haftaNo}. Hafta</p>
        <p style={{ fontSize: '13px', color: 'var(--color-text1)', fontWeight: 500 }}>{kazanim}</p>
      </div>

      {/* Yöntemler */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Yöntemler</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {YONTEMLER.map(y => (
            <button key={y} type="button" onClick={() => toggleYontem(y)}
              style={{ height: '32px', padding: '0 12px', borderRadius: '100px', border: `1.5px solid ${seciliYontemler.includes(y) ? '#4F6AF5' : 'var(--color-border)'}`, background: seciliYontemler.includes(y) ? '#4F6AF5' : 'var(--color-bg)', color: seciliYontemler.includes(y) ? '#fff' : 'var(--color-text2)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Etkinlikler */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Etkinlikler (her satır ayrı)</p>
        <textarea value={etkinlikler} onChange={e => setEtkinlikler(e.target.value)} rows={3} placeholder="Giriş sorusu, grup tartışması..." style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '14px', color: 'var(--color-text1)', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
      </div>

      {/* Süre */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Süre (dakika)</p>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', height: '44px', width: '160px' }}>
          <button onClick={() => setSure(s => Math.max(10, s - 5))} style={{ width: '44px', height: '100%', background: 'none', border: 'none', fontSize: '20px', color: '#4F6AF5', cursor: 'pointer' }}>−</button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 700, color: 'var(--color-text1)', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>{sure}</div>
          <button onClick={() => setSure(s => Math.min(90, s + 5))} style={{ width: '44px', height: '100%', background: 'none', border: 'none', fontSize: '20px', color: '#4F6AF5', cursor: 'pointer' }}>+</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleKaydet} style={{ flex: 1, height: '48px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          Kaydet
        </button>
        {onAtla && (
          <button onClick={onAtla} style={{ height: '48px', padding: '0 20px', borderRadius: '100px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Atla
          </button>
        )}
      </div>
    </div>
  )
}
