import type { DersProgrami, Gun } from '../../types/dersProgrami'

const GUNLER: Gun[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
const GUN_KISALTMA: Record<Gun, string> = {
  Pazartesi: 'Pzt', Salı: 'Sal', Çarşamba: 'Çar', Perşembe: 'Per', Cuma: 'Cum',
}
const SAAT_SAYISI = 8

interface DersProgramiGridProps {
  program: DersProgrami
  onHucreGuncelle?: (gun: Gun, saat: number, sinif: string | null) => void
  readOnly?: boolean
  cakismaHucreleri?: Array<{ gun: Gun; saat: number }>
}

export function DersProgramiGrid({ program, onHucreGuncelle, readOnly = false, cakismaHucreleri = [] }: DersProgramiGridProps) {
  function getSinif(gun: Gun, saat: number): string | null {
    return program.saatler.find(s => s.gun === gun && s.saat === saat)?.sinif ?? null
  }

  function isCakisma(gun: Gun, saat: number): boolean {
    return cakismaHucreleri.some(c => c.gun === gun && c.saat === saat)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${GUNLER.length}, 1fr)`, gap: '3px', minWidth: '320px' }}>
        {/* Header */}
        <div style={{ fontSize: '10px', color: 'var(--color-text3)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>
        {GUNLER.map(gun => (
          <div key={gun} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text3)', textAlign: 'center', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {GUN_KISALTMA[gun]}
          </div>
        ))}

        {/* Satırlar */}
        {Array.from({ length: SAAT_SAYISI }, (_, i) => i + 1).map(saat => (
          <>
            <div key={`saat-${saat}`} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {saat}
            </div>
            {GUNLER.map(gun => {
              const sinif = getSinif(gun, saat)
              const cakisma = isCakisma(gun, saat)
              return (
                <button
                  key={`${gun}-${saat}`}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && onHucreGuncelle?.(gun, saat, sinif)}
                  style={{
                    minHeight: '36px',
                    borderRadius: '8px',
                    border: cakisma
                      ? '1.5px solid #DC2626'
                      : sinif
                      ? '1.5px solid #4F6AF5'
                      : '1px solid var(--color-border)',
                    background: cakisma
                      ? '#FEF2F2'
                      : sinif
                      ? '#EEF1FE'
                      : 'var(--color-bg)',
                    color: cakisma ? '#DC2626' : sinif ? '#4F6AF5' : 'var(--color-text3)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: readOnly ? 'default' : 'pointer',
                    padding: '2px 4px',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {sinif ?? '—'}
                </button>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
