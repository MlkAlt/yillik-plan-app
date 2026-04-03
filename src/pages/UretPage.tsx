import { FileText, Target, BookOpen, BarChart2, Coins } from 'lucide-react'

const ARACLAR = [
  {
    id: 'sinav',
    ikon: <FileText size={22} />,
    ad: 'Yazılı Sınav',
    alt: 'Kazanım bazlı, cevap anahtarlı',
    renk: 'var(--color-primary)',
    renkBg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
  },
  {
    id: 'etkinlik',
    ikon: <Target size={22} />,
    ad: 'Sınıf Etkinliği',
    alt: 'Grup, bireysel, oyun bazlı',
    renk: 'var(--color-success)',
    renkBg: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
  },
  {
    id: 'materyal',
    ikon: <BookOpen size={22} />,
    ad: 'Ders Materyali',
    alt: 'Çalışma yaprağı, kavram haritası',
    renk: 'var(--color-accent)',
    renkBg: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
  },
  {
    id: 'rubrik',
    ikon: <BarChart2 size={22} />,
    ad: 'Rubrik',
    alt: 'Performans, proje, sunum',
    renk: 'var(--color-warning)',
    renkBg: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
  },
]

const JETON_BAKIYE = 7
const JETON_MAKS = 10

export function UretPage() {
  return (
    <div className="px-4 pb-20 w-full max-w-lg mx-auto">

      {/* Sayfa başlığı */}
      <div className="pt-4 pb-3">
        <h1
          className="text-[22px] font-bold tracking-tight mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
        >
          Üret
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          AI destekli · Jeton ile
        </p>
      </div>

      {/* Jeton kartı */}
      <div
        className="relative overflow-hidden mb-4"
        style={{
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #1e1a4a, #2d3580)',
          padding: '18px',
        }}
      >
        {/* Dekoratif daire */}
        <div
          className="absolute"
          style={{
            top: '-20px', right: '-20px',
            width: '80px', height: '80px',
            backgroundColor: 'rgba(129,140,248,.15)',
            borderRadius: '50%',
          }}
        />

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[.12em] mb-1"
              style={{ color: 'rgba(255,255,255,.45)' }}
            >
              Jeton Bakiyesi
            </p>
            <p
              className="font-bold leading-none mb-1"
              style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#ffffff', letterSpacing: '-.03em' }}
            >
              {JETON_BAKIYE}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>
              jeton · Bu ay 3 ücretsiz hediye edildi
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.15)',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            <Coins size={13} /> + Jeton Al
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="relative z-10 h-1 rounded-full overflow-hidden mb-2"
          style={{ backgroundColor: 'rgba(255,255,255,.15)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(JETON_BAKIYE / JETON_MAKS) * 100}%`,
              backgroundColor: 'rgba(255,255,255,.6)',
            }}
          />
        </div>
        <p className="text-[11px] font-semibold relative z-10" style={{ color: 'rgba(255,255,255,.4)' }}>
          {JETON_BAKIYE} üretim hakkınız var · 1 yazılı sınav = 1 jeton
        </p>
      </div>

      {/* Araçlar */}
      <p
        className="text-[11px] font-bold uppercase tracking-[.1em] mb-2"
        style={{ color: 'var(--color-text3)' }}
      >
        Araçlar
      </p>

      <div className="grid grid-cols-2 gap-[9px] mb-4">
        {ARACLAR.map(arac => (
          <button
            key={arac.id}
            className="text-left p-3.5 transition-all active:scale-[0.96]"
            style={{
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center mb-2"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: arac.renkBg,
                color: arac.renk,
              }}
            >
              {arac.ikon}
            </div>
            <p className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--color-text1)' }}>
              {arac.ad}
            </p>
            <p className="text-[11px] leading-snug mb-1.5" style={{ color: 'var(--color-text2)' }}>
              {arac.alt}
            </p>
            <p
              className="text-[11px] font-bold flex items-center gap-1"
              style={{ color: 'var(--color-warning)' }}
            >
              <Coins size={11} /> 1 jeton
            </p>
          </button>
        ))}
      </div>

      {/* Abonelik CTA */}
      <div
        className="text-center"
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
          padding: '14px 16px',
        }}
      >
        <p className="text-[13px] font-bold mb-1" style={{ color: 'var(--color-text1)' }}>
          Sınırsız Üretim İster misiniz?
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text2)' }}>
          Aylık 149 TL ile tüm araçlar sınırsız.
        </p>
        <button
          className="w-full py-2.5 text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 3px 12px rgba(79,106,245,.28)',
            border: 'none',
          }}
        >
          Premium'a Geç
        </button>
      </div>

    </div>
  )
}
