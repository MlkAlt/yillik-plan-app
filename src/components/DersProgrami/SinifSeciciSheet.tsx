import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { PlanEntry } from '../../types/planEntry'
import type { Gun } from '../../types/dersProgrami'

const SUBELER = ['A', 'B', 'C', 'D', 'E']

interface SinifSeciciSheetProps {
  gun: Gun
  saat: number
  mevcutSinif: string | null
  planlar: PlanEntry[]
  onSec: (sinif: string | null, sube?: string) => void
  onKapat: () => void
}

export function SinifSeciciSheet({ gun, saat, mevcutSinif, planlar, onSec, onKapat }: SinifSeciciSheetProps) {
  const [adim, setAdim] = useState<'sinif' | 'sube'>('sinif')
  const [seciliSinif, setSeciliSinif] = useState<string | null>(null)

  const siniflar = planlar.map(p => ({ sinif: p.sinif, label: p.label || p.sinif, ders: p.ders }))

  function handleSinifSec(sinif: string) {
    setSeciliSinif(sinif)
    setAdim('sube')
  }

  const sinifLabel = siniflar.find(s => s.sinif === seciliSinif)?.label ?? seciliSinif ?? ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onKapat} />
      <div style={{ position: 'relative', background: 'var(--color-surface)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', maxHeight: '70vh', overflowY: 'auto' }}>

        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: 'var(--color-border)', borderRadius: 100, margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          {adim === 'sube' && (
            <button
              onClick={() => setAdim('sinif')}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <ArrowLeft size={16} style={{ color: 'var(--color-text2)' }} />
            </button>
          )}
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text1)' }}>
              {gun} {saat}. Saat
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text3)' }}>
              {adim === 'sinif' ? 'Sınıf seçin' : `${sinifLabel} — Şube seçin`}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>

          {/* Adım 1: Sınıf */}
          {adim === 'sinif' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => { onSec(null); onKapat() }}
                style={{ padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${mevcutSinif === null ? '#4F6AF5' : 'var(--color-border)'}`, background: mevcutSinif === null ? '#EEF1FE' : 'var(--color-bg)', color: mevcutSinif === null ? '#4F6AF5' : 'var(--color-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              >
                Boş
              </button>
              {siniflar.map(({ sinif, label, ders }) => (
                <button
                  key={sinif}
                  type="button"
                  onClick={() => handleSinifSec(sinif)}
                  style={{ padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${mevcutSinif === sinif ? '#4F6AF5' : 'var(--color-border)'}`, background: mevcutSinif === sinif ? '#EEF1FE' : 'var(--color-bg)', color: mevcutSinif === sinif ? '#4F6AF5' : 'var(--color-text1)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text3)', marginLeft: 8 }}>{ders}</span>
                </button>
              ))}
            </div>
          )}

          {/* Adım 2: Şube */}
          {adim === 'sube' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUBELER.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { onSec(seciliSinif, s); onKapat() }}
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      border: '1.5px solid var(--color-border)',
                      background: 'var(--color-bg)',
                      fontSize: 20, fontWeight: 800,
                      color: 'var(--color-text1)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s',
                    }}
                    onMouseDown={e => { e.currentTarget.style.background = '#EEF1FE'; e.currentTarget.style.color = '#4F6AF5'; e.currentTarget.style.borderColor = '#4F6AF5' }}
                    onMouseUp={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text1)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text1)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => { onSec(seciliSinif, undefined); onKapat() }}
                style={{ padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
              >
                Şubesiz devam et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
