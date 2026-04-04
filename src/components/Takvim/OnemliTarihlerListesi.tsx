import { Trash2 } from 'lucide-react'
import type { OnemliTarih } from '../../types/onemliTarih'
import { hesaplaYakinlik } from '../../lib/onemliTarihlerService'

const KATEGORI_ETIKET: Record<string, string> = {
  'zha': 'ZHA',
  'not-girisi': 'Not Girişi',
  'veli-toplantisi': 'Veli',
  'sinav': 'Sınav',
  'tatil': 'Tatil',
  'diger': 'Diğer',
}

interface OnemliTarihlerListesiProps {
  tarihler: OnemliTarih[]
  onEkle?: () => void
  onSil?: (id: string) => void
}

export function OnemliTarihlerListesi({ tarihler, onEkle, onSil }: OnemliTarihlerListesiProps) {
  const bugunStr = new Date().toISOString().split('T')[0]

  if (tarihler.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text3)', marginBottom: '16px' }}>Henüz önemli tarih eklenmedi</p>
        {onEkle && (
          <button onClick={onEkle} style={{ height: '44px', padding: '0 20px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            + Tarih Ekle
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {onEkle && (
        <button onClick={onEkle} style={{ height: '44px', borderRadius: '12px', background: 'var(--color-surface)', border: '1.5px dashed var(--color-border)', color: '#4F6AF5', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          + Tarih Ekle
        </button>
      )}
      {tarihler.map(tarih => {
        const yakinlik = hesaplaYakinlik(tarih.tarih, bugunStr)
        const renk = yakinlik === 'kritik' ? '#DC2626' : yakinlik === 'yaklasan' ? '#D97706' : yakinlik === 'gecmis' ? 'var(--color-text3)' : 'var(--color-text2)'
        const bg = yakinlik === 'kritik' ? '#FEF2F2' : yakinlik === 'yaklasan' ? '#FFFBEB' : 'var(--color-surface)'
        const border = yakinlik === 'kritik' ? '#FECACA' : yakinlik === 'yaklasan' ? '#FDE68A' : 'var(--color-border)'

        return (
          <div key={tarih.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: bg, border: `1px solid ${border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: 'var(--color-bg)', color: 'var(--color-text3)', border: '1px solid var(--color-border)' }}>
                  {KATEGORI_ETIKET[tarih.kategori] ?? tarih.kategori}
                </span>
                {yakinlik !== 'gecmis' && yakinlik !== 'normal' && (
                  <span style={{ fontSize: '10px', fontWeight: 800, color: renk, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {yakinlik === 'kritik' ? '🔴 Yarın' : '🟡 Bu hafta'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text1)', marginBottom: '2px' }}>{tarih.baslik}</p>
              <p style={{ fontSize: '12px', color: renk, fontWeight: 600 }}>
                {new Date(tarih.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {!tarih.otomatik && onSil && (
              <button onClick={() => onSil(tarih.id)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Trash2 size={14} style={{ color: 'var(--color-text3)' }} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
