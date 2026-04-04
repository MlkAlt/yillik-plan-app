import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import type { DersSaati } from '../../types/dersProgrami'

interface BugunDersleriProps {
  dersler: DersSaati[]
  programVar: boolean
}

export function BugunDersleri({ dersler, programVar }: BugunDersleriProps) {
  const navigate = useNavigate()

  if (!programVar) {
    return (
      <div
        onClick={() => navigate('/app/planla/ders-programi')}
        style={{ margin: '0 16px 8px', background: '#EEF1FE', border: '1px solid #C7D2FD', borderRadius: '18px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(79,106,245,0.1)', border: '2px dashed #C7D2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Calendar size={16} style={{ color: '#4F6AF5' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1B2E5E' }}>Ders programını ekle</p>
          <p style={{ fontSize: '11px', color: 'var(--color-text2)' }}>Bugünün derslerini görmek için</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F6AF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
      </div>
    )
  }

  if (dersler.length === 0) {
    return (
      <div style={{ margin: '0 16px 8px', padding: '12px 16px', borderRadius: '18px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text3)', textAlign: 'center' }}>Bugün ders yok</p>
      </div>
    )
  }

  return (
    <div style={{ margin: '0 16px 8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '18px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text3)' }}>Bugünün Dersleri</p>
      </div>
      {dersler.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: i < dersler.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4F6AF5', minWidth: '28px' }}>{d.saat}.</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text1)', flex: 1 }}>{d.sinif}</span>
          {d.ders && <span style={{ fontSize: '11px', color: 'var(--color-text3)' }}>{d.ders}</span>}
        </div>
      ))}
    </div>
  )
}
