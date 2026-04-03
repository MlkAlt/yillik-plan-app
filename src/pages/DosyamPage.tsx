import { CalendarDays, ClipboardList, Users, BookOpen, Moon, Eye, Download, ChevronRight, AlertTriangle, Check } from 'lucide-react'

// Belge tiplerine göre ikon arka plan renkleri
const ikoBg = {
  blue:   'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  green:  'color-mix(in srgb, var(--color-success) 12%, transparent)',
  amber:  'color-mix(in srgb, var(--color-warning) 12%, transparent)',
  violet: 'color-mix(in srgb, var(--color-accent)  12%, transparent)',
  muted:  'var(--color-bg)',
}

type BelgeRenk = keyof typeof ikoBg

interface Belge {
  id: string
  ikon: React.ReactNode
  renk: BelgeRenk
  ad: string
  alt: string
  durum: 'hazir' | 'uyari' | 'ekle' | 'yeni'
  durumMetin?: string
}

const otomatikBelgeler: Belge[] = [
  {
    id: 'yillik-plan',
    ikon: <CalendarDays size={18} />,
    renk: 'blue',
    ad: 'Yıllık Plan — 2025/26',
    alt: '3 ders · Tüm şubeler · PDF hazır',
    durum: 'hazir',
    durumMetin: 'Hazır',
  },
  {
    id: 'zha',
    ikon: <ClipboardList size={18} />,
    renk: 'violet',
    ad: 'ZHA Tutanakları',
    alt: '3 toplantı · Ekim, Kasım, Ocak',
    durum: 'hazir',
    durumMetin: '3 belge',
  },
  {
    id: 'veli',
    ikon: <Users size={18} />,
    renk: 'green',
    ad: 'Veli Görüşme Kayıtları',
    alt: '5 görüşme · Tarih sıralı',
    durum: 'yeni',
  },
  {
    id: 'gunluk-plan',
    ikon: <BookOpen size={18} />,
    renk: 'amber',
    ad: 'Günlük Plan Örnekleri',
    alt: 'Son 5 hafta · 12 ders planı',
    durum: 'hazir',
    durumMetin: 'Hazır',
  },
]

const eksikBelgeler: Belge[] = [
  {
    id: 'nobet',
    ikon: <Moon size={18} />,
    renk: 'amber',
    ad: 'Nöbet Dökümü',
    alt: 'Henüz girilmedi · Nöbet takibini başlat',
    durum: 'uyari',
    durumMetin: 'Ekle',
  },
]

const manuelBelgeler: Belge[] = [
  {
    id: 'gozlem',
    ikon: <Eye size={18} />,
    renk: 'muted',
    ad: 'Ders Gözlem Formu',
    alt: 'Müdür / denetmen ziyareti için',
    durum: 'ekle',
    durumMetin: 'Ekle +',
  },
]

function DurumBadge({ durum, metin }: { durum: Belge['durum']; metin?: string }) {
  if (durum === 'hazir') {
    return (
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
        style={{
          color: 'var(--color-success)',
          backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
        }}
      >
        <Check size={9} strokeWidth={3} /> {metin}
      </span>
    )
  }
  if (durum === 'uyari') {
    return (
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{
          color: 'var(--color-warning)',
          backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
        }}
      >
        {metin}
      </span>
    )
  }
  if (durum === 'ekle') {
    return (
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{
          color: 'var(--color-text3)',
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {metin}
      </span>
    )
  }
  if (durum === 'yeni') {
    return (
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
    )
  }
  return null
}

function BelgeItem({ belge, soluk = false }: { belge: Belge; soluk?: boolean }) {
  const uyari = belge.durum === 'uyari'
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all active:scale-[0.98]"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${uyari ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)' : 'var(--color-border)'}`,
        backgroundColor: uyari
          ? 'color-mix(in srgb, var(--color-warning) 6%, transparent)'
          : 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
        opacity: soluk ? 0.7 : 1,
      }}
    >
      {/* İkon */}
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
        style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: ikoBg[belge.renk],
          color: belge.renk === 'blue'   ? 'var(--color-primary)'
               : belge.renk === 'green'  ? 'var(--color-success)'
               : belge.renk === 'amber'  ? 'var(--color-warning)'
               : belge.renk === 'violet' ? 'var(--color-accent)'
               : 'var(--color-text3)',
        }}
      >
        {belge.ikon}
      </div>

      {/* Metin */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: 'var(--color-text1)' }}>
          {belge.ad}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text2)' }}>
          {belge.alt}
        </p>
      </div>

      {/* Sağ: badge + ok */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <DurumBadge durum={belge.durum} metin={belge.durumMetin} />
        {belge.durum !== 'ekle' && (
          <ChevronRight size={15} style={{ color: 'var(--color-text3)' }} />
        )}
      </div>
    </div>
  )
}

function BelgeGrubu({
  baslik,
  sayi,
  sayiRenk,
  belgeler,
  soluk = false,
}: {
  baslik: string
  sayi?: string
  sayiRenk?: string
  belgeler: Belge[]
  soluk?: boolean
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-[11px] font-bold uppercase tracking-[.1em]"
          style={{ color: 'var(--color-text3)' }}
        >
          {baslik}
        </span>
        {sayi && (
          <span
            className="text-[11px] font-bold"
            style={{ color: sayiRenk ?? 'var(--color-text2)' }}
          >
            {sayi}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {belgeler.map(b => (
          <BelgeItem key={b.id} belge={b} soluk={soluk} />
        ))}
      </div>
    </div>
  )
}

export function DosyamPage() {
  return (
    <div className="px-4 pb-20 w-full max-w-lg mx-auto">

      {/* Sayfa başlığı */}
      <div className="pt-4 pb-3">
        <h1
          className="text-[22px] font-bold tracking-tight mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}
        >
          Öğretmen Dosyası
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          Müfettiş hazırlığı · Tek tıkla indir
        </p>
      </div>

      {/* Özet kartı */}
      <div
        className="relative overflow-hidden mb-4"
        style={{
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          padding: '18px',
        }}
      >
        {/* Üst şerit — violet → blue gradyan */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          }}
        />

        <div className="flex justify-between items-center mb-4 mt-1">
          {/* Sol: sayaç */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[.1em] mb-1"
              style={{ color: 'var(--color-text3)' }}
            >
              Toplam Belge
            </p>
            <p
              className="text-[28px] font-bold leading-none"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)', letterSpacing: '-.03em' }}
            >
              14
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text2)' }}>
              Son güncelleme: bugün
            </p>
          </div>

          {/* Sağ: durum listesi */}
          <div className="flex flex-col gap-1 items-end">
            {[
              { metin: '✓ Yıllık Plan', renk: 'var(--color-success)' },
              { metin: '✓ 3 ZHA Tutanağı', renk: 'var(--color-success)' },
              { metin: '✓ 5 Veli Görüşmesi', renk: 'var(--color-success)' },
              { metin: '⚠ Nöbet eksik', renk: 'var(--color-warning)' },
            ].map(item => (
              <span key={item.metin} className="text-[11px] font-semibold" style={{ color: item.renk }}>
                {item.metin}
              </span>
            ))}
          </div>
        </div>

        {/* İndir butonu */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 3px 12px rgba(124,58,237,.28)',
            border: 'none',
          }}
        >
          <Download size={16} /> Tüm Dosyayı İndir · PDF
        </button>
      </div>

      {/* Eksik uyarı bandı */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 mb-4"
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
        }}
      >
        <AlertTriangle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <p className="text-[12px] font-semibold" style={{ color: 'var(--color-warning)' }}>
          1 eksik belge var — Nöbet Dökümü girilmedi.
        </p>
      </div>

      {/* Otomatik oluşan belgeler */}
      <BelgeGrubu
        baslik="Otomatik Oluşanlar"
        sayi="9 belge"
        belgeler={otomatikBelgeler}
      />

      {/* Eksik belgeler */}
      <BelgeGrubu
        baslik="Tamamlanması Gereken"
        sayi="1 eksik"
        sayiRenk="var(--color-warning)"
        belgeler={eksikBelgeler}
      />

      {/* Manuel eklenebilir */}
      <BelgeGrubu
        baslik="Manuel Eklenebilir"
        belgeler={manuelBelgeler}
        soluk
      />

    </div>
  )
}
