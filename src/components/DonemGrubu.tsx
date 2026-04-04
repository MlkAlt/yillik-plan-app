import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import { Check, ChevronDown } from 'lucide-react'

const AYLAR = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara']

export function formatTarih(isoTarih: string): string {
  const d = new Date(isoTarih)
  return `${String(d.getDate()).padStart(2, '0')} ${AYLAR[d.getMonth()]}`
}

interface DonemGrubuProps {
  donemNo: number
  haftalar: Hafta[]
  tamamlananlar: number[]
  bugunHaftaNo: number | null
  bugunRef?: React.RefObject<HTMLDivElement | null>
  tamamlananSayisi: number
  toplamSayisi: number
  acik: boolean
  onToggle: () => void
}

export function DonemGrubu({
  donemNo, haftalar, tamamlananlar, bugunHaftaNo, bugunRef,
  tamamlananSayisi, toplamSayisi, acik, onToggle,
}: DonemGrubuProps) {
  const navigate = useNavigate()
  const yuzde = toplamSayisi > 0 ? Math.round((tamamlananSayisi / toplamSayisi) * 100) : 0
  const tamamlandi = tamamlananSayisi >= toplamSayisi && toplamSayisi > 0

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={acik}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors active:opacity-70"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>{donemNo}. Donem</span>
          {tamamlandi && (
            <span
              className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}
            >
              <Check size={10} strokeWidth={3} /> Tamamlandi
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${yuzde}%`,
                  backgroundColor: tamamlandi ? 'var(--color-success)' : 'var(--color-primary)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>{tamamlananSayisi}/{toplamSayisi}</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${acik ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text3)' }}
          />
        </div>
      </button>

      {acik && (
        <div
          className="flex flex-col gap-2 p-3"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {haftalar.map((h, i) => {
            const isTatil = h.tatilMi
            const isTamamlandi = tamamlananlar.includes(h.haftaNo)
            const isBuHafta = h.haftaNo === bugunHaftaNo

            const cardStyle: React.CSSProperties = isBuHafta
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  border: '1px solid var(--color-primary)',
                  boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }
              : isTamamlandi
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
                }
              : isTatil
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
                }
              : {
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }

            return (
              <div
                key={`meb-${h.haftaNo}-${i}`}
                ref={isBuHafta && bugunRef ? bugunRef : undefined}
                onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
                className="p-3.5 transition-all cursor-pointer active:scale-[0.99]"
                style={{ borderRadius: 'var(--radius-lg)', ...cardStyle }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: isBuHafta ? 'var(--color-primary)'
                          : isTamamlandi ? 'var(--color-success)'
                          : isTatil ? 'var(--color-warning)'
                          : 'var(--color-text1)',
                      }}
                    >
                      {h.haftaNo}. Hafta
                    </span>
                    {isBuHafta && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                      >
                        Bu Hafta
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text3)' }}>
                    {formatTarih(h.baslangicTarihi)} - {formatTarih(h.bitisTarihi)}
                  </span>
                </div>

                {isTatil ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>{h.tatilAdi}</p>
                ) : h.kazanim ? (
                  <div>
                    {h.uniteAdi && (
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {h.uniteAdi}
                      </span>
                    )}
                    <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--color-text1)' }}>
                      {h.kazanim}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
