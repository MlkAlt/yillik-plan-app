import { Trash2 } from 'lucide-react'
import type { OnemliTarih } from '../../types/onemliTarih'

const AYLAR_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

const KATEGORI_RENK: Record<string, string> = {
  'zha':            '#4F6AF5',
  'not-girisi':     '#6D28D9',
  'veli-toplantisi':'#059669',
  'sinav':          '#DC2626',
  'tatil':          '#D97706',
  'diger':          '#9B9B97',
}

const KATEGORI_ETIKET: Record<string, string> = {
  'zha':            'ZHA',
  'not-girisi':     'Not Girişi',
  'veli-toplantisi':'Veli',
  'sinav':          'Sınav',
  'tatil':          'Tatil',
  'diger':          'Diğer',
}

function gunKaldi(tarihStr: string): number {
  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)
  const hedef = new Date(tarihStr)
  hedef.setHours(0, 0, 0, 0)
  return Math.round((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24))
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
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
        <p style={{ fontSize: 14, color: 'var(--color-text3)', marginBottom: 20 }}>Henüz önemli tarih eklenmedi</p>
        {onEkle && (
          <button
            onClick={onEkle}
            style={{ height: 44, padding: '0 24px', borderRadius: 100, background: '#4F6AF5', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            + Tarih Ekle
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {onEkle && (
        <button
          onClick={onEkle}
          style={{ height: 44, borderRadius: 12, background: 'var(--color-surface)', border: '1.5px dashed var(--color-border)', color: '#4F6AF5', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          + Tarih Ekle
        </button>
      )}

      {tarihler.map(tarih => {
        const renk = KATEGORI_RENK[tarih.kategori] ?? KATEGORI_RENK.diger
        const gun = new Date(tarih.tarih).getDate()
        const ay = AYLAR_KISA[new Date(tarih.tarih).getMonth()]
        const kalan = gunKaldi(tarih.tarih)
        const gecmis = tarih.tarih < bugunStr

        return (
          <div
            key={tarih.id}
            className="group"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderRadius: 14,
              background: 'var(--color-surface)',
              border: `1px solid var(--color-border)`,
              borderLeft: `3px solid ${renk}`,
              transition: 'border-color 0.15s',
            }}
          >
            {/* Tarih Badge — gün + ay görsel */}
            <div style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 44, borderRadius: 12,
              background: `color-mix(in srgb, ${renk} 12%, var(--color-bg))`,
              border: `1px solid color-mix(in srgb, ${renk} 25%, transparent)`,
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: renk, lineHeight: 1 }}>{gun}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: renk, opacity: 0.8 }}>{ay}</p>
            </div>

            {/* Bilgi */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                  background: `color-mix(in srgb, ${renk} 12%, var(--color-bg))`,
                  color: renk,
                  border: `1px solid color-mix(in srgb, ${renk} 25%, transparent)`,
                }}>
                  {KATEGORI_ETIKET[tarih.kategori] ?? tarih.kategori}
                </span>

                {/* Gün kaldı badge */}
                {!gecmis && kalan === 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '1px 6px', borderRadius: 100 }}>
                    Bugün!
                  </span>
                )}
                {!gecmis && kalan === 1 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: 100 }}>
                    Yarın
                  </span>
                )}
                {!gecmis && kalan > 1 && kalan <= 7 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: 100 }}>
                    {kalan} gün
                  </span>
                )}
                {gecmis && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text3)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: 100 }}>
                    Geçti
                  </span>
                )}
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text1)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tarih.baslik}
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text3)', fontWeight: 600 }}>
                {new Date(tarih.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Sil */}
            {!tarih.otomatik && onSil && (
              <button
                onClick={() => onSil(tarih.id)}
                style={{
                  flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                <Trash2 size={14} color="#DC2626" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
