import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Gun } from '../types/dersProgrami'
import type { PlanEntry } from '../types/planEntry'
import { useDersProgrami } from '../hooks/useDersProgrami'
import { DersProgramiGrid } from '../components/DersProgrami/DersProgramiGrid'
import { SinifSeciciSheet } from '../components/DersProgrami/SinifSeciciSheet'
import { useToast } from '../lib/toast'

interface DersProgramiPageProps {
  planlar: PlanEntry[]
}

export function DersProgramiPage({ planlar }: DersProgramiPageProps) {
  const navigate = useNavigate()
  const { program, error, guncelle, kaydet } = useDersProgrami()
  const { goster: showToast } = useToast()
  const [seciliHucre, setSeciliHucre] = useState<{ gun: Gun; saat: number } | null>(null)

  function handleHucreGuncelle(gun: Gun, saat: number, _mevcutSinif: string | null) {
    setSeciliHucre({ gun, saat })
  }

  function handleSinifSec(sinif: string | null) {
    if (!seciliHucre) return
    const ders = planlar.find(p => p.sinif === sinif)?.ders
    guncelle(seciliHucre.gun, seciliHucre.saat, sinif, ders)
    setSeciliHucre(null)
  }

  function handleKaydet() {
    kaydet()
    showToast('Ders programı kaydedildi', 'basari')
    navigate(-1)
  }

  const mevcutSinif = seciliHucre
    ? program.saatler.find(s => s.gun === seciliHucre.gun && s.saat === seciliHucre.saat)?.sinif ?? null
    : null

  const SINIF_RENKLERI = ['#4F6AF5', '#6D28D9', '#059669', '#D97706', '#DC2626', '#0EA5E9', '#7C3AED', '#10B981']
  const dersSayisi = program.saatler.filter(s => s.sinif !== null).length
  const benzersizSiniflar = [...new Set(program.saatler.filter(s => s.sinif).map(s => s.sinif!))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} style={{ color: 'var(--color-text2)' }} />
        </button>
        <div className="flex-1">
          <h1 style={{ fontFamily: "var(--font-display),'Bricolage Grotesque',sans-serif", fontSize: '20px', fontWeight: 800, color: 'var(--color-text1)', letterSpacing: '-0.03em' }}>Ders Programı</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text3)' }}>Hücreye tıklayarak sınıf atayın</p>
        </div>
      </div>

      {/* Ders sayısı badge + sınıf renk göstergesi */}
      <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          className="font-sans font-bold"
          style={{ fontSize: 13, color: 'var(--color-primary)', background: 'var(--color-primary-s)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}
        >
          🕐 {dersSayisi} Ders
        </span>
        {benzersizSiniflar.slice(0, 6).map((sinif, i) => (
          <span
            key={sinif}
            className="flex items-center gap-1.5 font-sans font-semibold"
            style={{ fontSize: 12, color: 'var(--color-text2)' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: SINIF_RENKLERI[i % SINIF_RENKLERI.length], display: 'inline-block', flexShrink: 0 }} />
            {sinif}
          </span>
        ))}
      </div>

      {error && (
        <div style={{ margin: '0 16px 8px', padding: '10px 14px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{error}</p>
        </div>
      )}

      <div style={{ padding: '0 16px 16px', flex: 1 }}>
        <DersProgramiGrid
          program={program}
          onHucreGuncelle={handleHucreGuncelle}
        />
      </div>

      {/* Kaydet butonu */}
      <div style={{ padding: '12px 16px 32px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <button
          onClick={handleKaydet}
          style={{ width: '100%', height: '52px', borderRadius: '100px', background: '#4F6AF5', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,106,245,.32)' }}
        >
          Kaydet
        </button>
      </div>

      {/* Sınıf seçici sheet */}
      {seciliHucre && (
        <SinifSeciciSheet
          gun={seciliHucre.gun}
          saat={seciliHucre.saat}
          mevcutSinif={mevcutSinif}
          planlar={planlar}
          onSec={handleSinifSec}
          onKapat={() => setSeciliHucre(null)}
        />
      )}
    </div>
  )
}
