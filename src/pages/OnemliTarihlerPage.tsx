import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOnemliTarihler } from '../hooks/useOnemliTarihler'
import { OnemliTarihlerListesi } from '../components/Takvim/OnemliTarihlerListesi'
import { TarihEkleForm } from '../components/Takvim/TarihEkleForm'
import type { OnemliTarih } from '../types/onemliTarih'

interface OnemliTarihlerPageProps {
  yil?: string
}

export function OnemliTarihlerPage({ yil = '2025-2026' }: OnemliTarihlerPageProps) {
  const navigate = useNavigate()
  const { tarihler, ekle, sil, mebTakviminiYukle } = useOnemliTarihler()
  const [formAcik, setFormAcik] = useState(false)

  useEffect(() => {
    mebTakviminiYukle(yil)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yil])

  function handleEkle(tarih: OnemliTarih) {
    ekle(tarih)
    setFormAcik(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} style={{ color: 'var(--color-text2)' }} />
        </button>
        <div>
          <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>Önemli Tarihler</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text3)' }}>MEB takvimi + kişisel tarihler</p>
        </div>
      </div>

      <div style={{ padding: '0 16px 24px' }}>
        <OnemliTarihlerListesi
          tarihler={tarihler}
          onEkle={() => setFormAcik(true)}
          onSil={sil}
        />
      </div>

      {formAcik && (
        <TarihEkleForm
          onKaydet={handleEkle}
          onKapat={() => setFormAcik(false)}
        />
      )}
    </div>
  )
}
