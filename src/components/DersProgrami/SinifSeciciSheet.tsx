import type { PlanEntry } from '../../types/planEntry'
import type { Gun } from '../../types/dersProgrami'

interface SinifSeciciSheetProps {
  gun: Gun
  saat: number
  mevcutSinif: string | null
  planlar: PlanEntry[]
  onSec: (sinif: string | null) => void
  onKapat: () => void
}

export function SinifSeciciSheet({ gun, saat, mevcutSinif, planlar, onSec, onKapat }: SinifSeciciSheetProps) {
  const siniflar = planlar.map(p => ({ sinif: p.sinif, label: p.label || p.sinif, ders: p.ders }))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onKapat} />
      <div style={{ position: 'relative', background: 'var(--color-surface)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ width: '36px', height: '4px', background: 'var(--color-border)', borderRadius: '100px', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '4px' }}>
          {gun} {saat}. Saat
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text3)', marginBottom: '16px' }}>Sınıf seçin</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Boş seçeneği */}
          <button
            type="button"
            onClick={() => { onSec(null); onKapat() }}
            style={{ padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${mevcutSinif === null ? '#4F6AF5' : 'var(--color-border)'}`, background: mevcutSinif === null ? '#EEF1FE' : 'var(--color-bg)', color: mevcutSinif === null ? '#4F6AF5' : 'var(--color-text2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
          >
            Boş
          </button>

          {siniflar.map(({ sinif, label, ders }) => (
            <button
              key={sinif}
              type="button"
              onClick={() => { onSec(sinif); onKapat() }}
              style={{ padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${mevcutSinif === sinif ? '#4F6AF5' : 'var(--color-border)'}`, background: mevcutSinif === sinif ? '#EEF1FE' : 'var(--color-bg)', color: mevcutSinif === sinif ? '#4F6AF5' : 'var(--color-text1)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <span>{label}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text3)', marginLeft: '8px' }}>{ders}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
