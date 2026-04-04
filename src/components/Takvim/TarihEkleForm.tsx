import { useState } from 'react'
import type { OnemliTarih, OnemliTarihKategori } from '../../types/onemliTarih'

const KATEGORILER: Array<{ id: OnemliTarihKategori; label: string }> = [
  { id: 'zha', label: 'ZHA Toplantısı' },
  { id: 'not-girisi', label: 'Not Girişi' },
  { id: 'veli-toplantisi', label: 'Veli Toplantısı' },
  { id: 'sinav', label: 'Sınav' },
  { id: 'tatil', label: 'Tatil' },
  { id: 'diger', label: 'Diğer' },
]

interface TarihEkleFormProps {
  onKaydet: (tarih: OnemliTarih) => void
  onKapat: () => void
}

export function TarihEkleForm({ onKaydet, onKapat }: TarihEkleFormProps) {
  const [baslik, setBaslik] = useState('')
  const [tarih, setTarih] = useState(new Date().toISOString().split('T')[0])
  const [kategori, setKategori] = useState<OnemliTarihKategori>('diger')

  function handleKaydet() {
    if (!baslik.trim() || !tarih) return
    onKaydet({
      id: crypto.randomUUID(),
      tarih,
      baslik: baslik.trim(),
      kategori,
      otomatik: false,
      bildirimGonderildi: false,
    })
    onKapat()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onKapat} />
      <div style={{ position: 'relative', background: 'var(--color-surface)', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px' }}>
        <div style={{ width: '36px', height: '4px', background: 'var(--color-border)', borderRadius: '100px', margin: '0 auto 20px' }} />
        <h2 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '18px', fontWeight: 800, color: 'var(--color-text1)', marginBottom: '16px' }}>Tarih Ekle</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Başlık</p>
            <input value={baslik} onChange={e => setBaslik(e.target.value)} placeholder="Örn: ZHA Toplantısı" style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '15px', color: 'var(--color-text1)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tarih</p>
            <input type="date" value={tarih} onChange={e => setTarih(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '15px', color: 'var(--color-text1)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kategori</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {KATEGORILER.map(k => (
                <button key={k.id} type="button" onClick={() => setKategori(k.id)}
                  style={{ height: '36px', padding: '0 14px', borderRadius: '100px', border: `1.5px solid ${kategori === k.id ? '#4F6AF5' : 'var(--color-border)'}`, background: kategori === k.id ? '#EEF1FE' : 'var(--color-bg)', color: kategori === k.id ? '#4F6AF5' : 'var(--color-text2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleKaydet} disabled={!baslik.trim()} style={{ width: '100%', height: '52px', borderRadius: '100px', background: baslik.trim() ? '#4F6AF5' : 'var(--color-border)', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: baslik.trim() ? 'pointer' : 'not-allowed', marginTop: '4px' }}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
