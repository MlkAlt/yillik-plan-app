import { Plus, Sparkles } from 'lucide-react'

interface UretimHakkiBadgeProps {
  bakiye: number
  maksimum: number
  aylikHediye?: number
  onHakEkle?: () => void
}

export function UretimHakkiBadge({
  bakiye,
  maksimum,
  aylikHediye = 0,
  onHakEkle,
}: UretimHakkiBadgeProps) {
  const doluluk = Math.min(100, Math.max(0, (bakiye / maksimum) * 100))

  return (
    <section
      className="page-hero relative overflow-hidden"
      style={{
        borderRadius: 'var(--radius-2xl)',
        padding: '20px',
        background:
          'linear-gradient(140deg, color-mix(in srgb, var(--color-primary) 86%, #121631) 0%, color-mix(in srgb, var(--color-primary) 68%, #243477) 58%, color-mix(in srgb, var(--color-pop) 18%, var(--color-primary)) 100%)',
        boxShadow: '0 18px 42px rgba(37,50,124,.26)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-28px',
          right: '-18px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,.08)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-34px',
          left: '-20px',
          width: '132px',
          height: '132px',
          borderRadius: '50%',
          backgroundColor: 'rgba(224,96,48,.14)',
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] mb-1" style={{ color: 'rgba(255,255,255,.56)' }}>
            Uretim Hakki
          </p>
          <p
            className="font-bold leading-none mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: '38px', color: '#ffffff', letterSpacing: '-.04em' }}
          >
            {bakiye}
          </p>
          <p className="text-xs leading-5 max-w-[220px]" style={{ color: 'rgba(255,255,255,.68)' }}>
            {aylikHediye > 0
              ? `Bu ay ${aylikHediye} ucretsiz hak tanimlandi. En cok sinav ve materyal akislari kullaniliyor.`
              : 'Uretim haklariniz sinav, etkinlik ve materyal akislari icin kullanilir.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onHakEkle}
          className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          style={{
            backgroundColor: 'rgba(255,255,255,.12)',
            border: '1px solid rgba(255,255,255,.16)',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          <Plus size={14} />
          Hak Ekle
        </button>
      </div>

      <div className="relative z-10 h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'rgba(255,255,255,.16)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${doluluk}%`,
            background: 'linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.58))',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,.58)' }}>
          {bakiye} uretim hakkiniz var - 1 sinav = 1 hak
        </p>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,.12)', color: '#ffffff' }}
        >
          <Sparkles size={11} />
          Premium ile limitsiz
        </span>
      </div>
    </section>
  )
}
