import { useNavigate } from 'react-router-dom'
import type { Hafta } from '../types/takvim'
import { Check, ChevronDown, Sun } from 'lucide-react'

const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

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
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Dönem başlığı */}
      <button
        onClick={onToggle}
        aria-expanded={acik}
        className="w-full flex items-center justify-between px-4 py-3.5 transition-colors active:opacity-70"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: tamamlandi
                ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
                : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            }}
          >
            <span
              className="text-[11px] font-black"
              style={{ color: tamamlandi ? 'var(--color-success)' : 'var(--color-primary)' }}
            >
              {donemNo}
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>
            {donemNo}. Dönem
          </span>
          {tamamlandi && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}
            >
              <Check size={9} strokeWidth={3} /> Tamamlandı
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${yuzde}%`,
                  backgroundColor: tamamlandi ? 'var(--color-success)' : 'var(--color-primary)',
                }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text3)' }}>
              {tamamlananSayisi}/{toplamSayisi}
            </span>
          </div>
          <ChevronDown
            size={15}
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

            // Sol accent rengi
            const accentColor = isBuHafta
              ? 'var(--color-primary)'
              : isTamamlandi
              ? 'var(--color-success)'
              : isTatil
              ? 'var(--color-warning)'
              : 'var(--color-border2)'

            const cardBg = isBuHafta
              ? 'color-mix(in srgb, var(--color-primary) 5%, var(--color-surface))'
              : isTamamlandi
              ? 'color-mix(in srgb, var(--color-success) 5%, var(--color-surface))'
              : isTatil
              ? 'color-mix(in srgb, var(--color-warning) 6%, var(--color-surface))'
              : 'var(--color-surface)'

            const cardBorder = isBuHafta
              ? '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)'
              : isTamamlandi
              ? '1px solid color-mix(in srgb, var(--color-success) 20%, transparent)'
              : isTatil
              ? '1px solid color-mix(in srgb, var(--color-warning) 20%, transparent)'
              : '1px solid var(--color-border)'

            return (
              <div
                key={`meb-${h.haftaNo}-${i}`}
                ref={isBuHafta && bugunRef ? bugunRef : undefined}
                onClick={() => navigate(`/app/hafta/${h.haftaNo}`)}
                className="flex items-start gap-0 cursor-pointer active:scale-[0.99] transition-transform overflow-hidden"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: cardBg,
                  border: cardBorder,
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                <div className="flex-1 p-3">
                  {/* Başlık satırı */}
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-[13px]"
                        style={{
                          color: isBuHafta ? 'var(--color-primary)'
                            : isTamamlandi ? 'var(--color-success)'
                            : isTatil ? 'var(--color-warning)'
                            : 'var(--color-text2)',
                        }}
                      >
                        {h.haftaNo}. Hafta
                      </span>
                      {isBuHafta && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: '#ffffff', backgroundColor: 'var(--color-primary)' }}
                        >
                          Bu Hafta
                        </span>
                      )}
                      {isTamamlandi && !isBuHafta && (
                        <Check size={12} strokeWidth={3} style={{ color: 'var(--color-success)' }} />
                      )}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text3)' }}>
                      {formatTarih(h.baslangicTarihi)} – {formatTarih(h.bitisTarihi)}
                    </span>
                  </div>

                  {/* İçerik */}
                  {isTatil ? (
                    <div className="flex items-center gap-1.5">
                      <Sun size={12} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--color-warning)' }}>
                        {h.tatilAdi}
                      </p>
                    </div>
                  ) : h.kazanim ? (
                    <div>
                      {h.uniteAdi && (
                        <span
                          className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-1"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {h.uniteAdi}
                        </span>
                      )}
                      <p
                        className="text-[13px] font-medium leading-snug line-clamp-2"
                        style={{ color: isTamamlandi ? 'var(--color-text3)' : 'var(--color-text1)' }}
                      >
                        {h.kazanim}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
