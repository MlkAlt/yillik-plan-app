type Sekme = 'yillik' | 'ders-programi' | 'takvim'

interface PlanAltSekmelerProps {
  aktif: Sekme
  onChange: (sekme: Sekme) => void
}

const SEKMELER: Array<{ id: Sekme; label: string }> = [
  { id: 'yillik', label: 'Yıllık Plan' },
  { id: 'ders-programi', label: 'Ders Prog.' },
  { id: 'takvim', label: 'Takvim' },
]

export function PlanAltSekmeler({ aktif, onChange }: PlanAltSekmelerProps) {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {SEKMELER.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          style={{
            whiteSpace: 'nowrap',
            flexShrink: 0,
            height: '36px',
            padding: '0 16px',
            borderRadius: '100px',
            border: `1.5px solid ${aktif === s.id ? '#4F6AF5' : 'var(--color-border)'}`,
            background: aktif === s.id ? '#4F6AF5' : 'var(--color-surface)',
            color: aktif === s.id ? '#fff' : 'var(--color-text2)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export type { Sekme }
