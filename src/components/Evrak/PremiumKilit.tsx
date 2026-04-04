import { Lock } from 'lucide-react'

interface PremiumKilitProps {
  ozellik: string
  onYukselt: () => void
}

export function PremiumKilit({ ozellik, onYukselt }: PremiumKilitProps) {
  return (
    <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden' }}>
      {/* Blur overlay */}
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '18px', border: '1.5px dashed #C7D2FD' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EEF1FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={18} style={{ color: '#4F6AF5' }} />
        </div>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text1)', textAlign: 'center' }}>{ozellik}</p>
        <p style={{ fontSize: '11px', color: 'var(--color-text3)', textAlign: 'center' }}>Premium özellik</p>
        <button
          onClick={onYukselt}
          style={{ height: '36px', padding: '0 16px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,106,245,.3)' }}
        >
          Premium'a Geç
        </button>
      </div>
      {/* Placeholder içerik (blur altında) */}
      <div style={{ padding: '16px', opacity: 0.3, pointerEvents: 'none' }}>
        <div style={{ height: '12px', background: 'var(--color-border)', borderRadius: '6px', marginBottom: '8px', width: '60%' }} />
        <div style={{ height: '12px', background: 'var(--color-border)', borderRadius: '6px', width: '40%' }} />
      </div>
    </div>
  )
}
