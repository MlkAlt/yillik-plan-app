import { CalendarDays, ClipboardList, Users, BookOpen, Moon, Eye, Download, ChevronRight, AlertTriangle, Check, ArrowRight, FileCheck2 } from 'lucide-react'
import { SectionHeader } from '../components/UI/SectionHeader'

const ikoBg = {
  blue: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
  green: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
  amber: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
  violet: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  muted: 'var(--color-bg)',
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
  aksiyonMetni: string
}

const otomatikBelgeler: Belge[] = [
  { id: 'yillik-plan', ikon: <CalendarDays size={18} />, renk: 'blue', ad: 'Yillik Plan - 2025/26', alt: '3 ders - Tum subeler - PDF hazir', durum: 'hazir', durumMetin: 'Hazir', aksiyonMetni: 'Indir' },
  { id: 'zha', ikon: <ClipboardList size={18} />, renk: 'violet', ad: 'ZHA Tutanaklari', alt: '3 toplanti - Ekim, Kasim, Ocak', durum: 'hazir', durumMetin: '3 belge', aksiyonMetni: 'Gor' },
  { id: 'veli', ikon: <Users size={18} />, renk: 'green', ad: 'Veli Gorusme Kayitlari', alt: '5 gorusme - Tarih sirali', durum: 'yeni', aksiyonMetni: 'Duzenle' },
  { id: 'gunluk-plan', ikon: <BookOpen size={18} />, renk: 'amber', ad: 'Gunluk Plan Ornekleri', alt: 'Son 5 hafta - 12 ders plani', durum: 'hazir', durumMetin: 'Hazir', aksiyonMetni: 'Ac' },
]

const eksikBelgeler: Belge[] = [
  { id: 'nobet', ikon: <Moon size={18} />, renk: 'amber', ad: 'Nobet Dokumu', alt: 'Henuz girilmedi - Takibi baslat', durum: 'uyari', durumMetin: 'Ekle', aksiyonMetni: 'Tamamla' },
]

const manuelBelgeler: Belge[] = [
  { id: 'gozlem', ikon: <Eye size={18} />, renk: 'muted', ad: 'Ders Gozlem Formu', alt: 'Mudurluk veya denetmen ziyareti icin', durum: 'ekle', durumMetin: 'Ekle +', aksiyonMetni: 'Ekle' },
]

function DurumBadge({ durum, metin }: { durum: Belge['durum']; metin?: string }) {
  if (durum === 'hazir') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: 'var(--color-success)', backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}>
        <Check size={9} strokeWidth={3} /> {metin}
      </span>
    )
  }
  if (durum === 'uyari') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--color-warning)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, transparent)' }}>
        {metin}
      </span>
    )
  }
  if (durum === 'ekle') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--color-text3)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        {metin}
      </span>
    )
  }
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
}

function BelgeItem({ belge, soluk = false }: { belge: Belge; soluk?: boolean }) {
  const uyari = belge.durum === 'uyari'
  const aksiyonRengi = uyari ? 'var(--color-warning)' : belge.durum === 'hazir' ? 'var(--color-primary)' : 'var(--color-text2)'

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-3"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${uyari ? 'color-mix(in srgb, var(--color-warning) 30%, transparent)' : 'var(--color-border)'}`,
        backgroundColor: uyari ? 'color-mix(in srgb, var(--color-warning) 6%, transparent)' : 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
        opacity: soluk ? 0.72 : 1,
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
        style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: ikoBg[belge.renk],
          color: belge.renk === 'blue' ? 'var(--color-primary)'
            : belge.renk === 'green' ? 'var(--color-success)'
            : belge.renk === 'amber' ? 'var(--color-warning)'
            : belge.renk === 'violet' ? 'var(--color-accent)'
            : 'var(--color-text3)',
        }}
      >
        {belge.ikon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold truncate" style={{ color: 'var(--color-text1)' }}>{belge.ad}</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text2)' }}>{belge.alt}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <DurumBadge durum={belge.durum} metin={belge.durumMetin} />
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
          style={{
            color: aksiyonRengi,
            backgroundColor: uyari
              ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)'
              : belge.durum === 'hazir'
              ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
              : 'var(--color-bg)',
            border: `1px solid ${uyari ? 'color-mix(in srgb, var(--color-warning) 18%, transparent)' : 'var(--color-border)'}`,
          }}
        >
          {belge.aksiyonMetni}
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

function BelgeGrubu({ baslik, sayi, sayiRenk, belgeler, soluk = false }: { baslik: string; sayi?: string; sayiRenk?: string; belgeler: Belge[]; soluk?: boolean }) {
  return (
    <div>
      <SectionHeader title={baslik} meta={sayi} />
      <div className="flex flex-col gap-2">
        {belgeler.map(b => (
          <BelgeItem key={b.id} belge={b} soluk={soluk} />
        ))}
      </div>
      {sayi && sayiRenk && <div className="hidden" style={{ color: sayiRenk }} />}
    </div>
  )
}

export function DosyamPage() {
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="text-[22px] font-bold tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Ogretmen Dosyasi
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text2)' }}>
          Hazir belgeler, eksikler ve manuel eklenebilir alanlar
        </p>
      </div>

      <div
        className="page-hero relative overflow-hidden"
        style={{
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          padding: '18px',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          }}
        />
        <div className="flex justify-between items-start gap-4 mb-4 mt-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-1" style={{ color: 'var(--color-text3)' }}>
              Birincil Gorev
            </p>
            <p className="text-[28px] font-bold leading-none" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)', letterSpacing: '-.03em' }}>
              14
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-text2)' }}>
              Toplam belge - Son guncelleme bugun
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {[
              { metin: 'Yillik plan hazir', renk: 'var(--color-success)' },
              { metin: '3 ZHA tutanagi', renk: 'var(--color-success)' },
              { metin: '5 veli gorusmesi', renk: 'var(--color-success)' },
              { metin: 'Nobet eksik', renk: 'var(--color-warning)' },
            ].map(item => (
              <span key={item.metin} className="text-[11px] font-semibold" style={{ color: item.renk }}>
                {item.metin}
              </span>
            ))}
          </div>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-all active:scale-[0.97]"
          style={{
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-accent)',
            boxShadow: 'var(--shadow-sm)',
            border: 'none',
          }}
        >
          <Download size={16} /> Tum Dosyayi Indir - PDF
        </button>
      </div>

      <div className="section-stack">
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 28%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 7%, var(--color-surface))',
            boxShadow: 'var(--shadow-xs)',
            padding: '16px',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',
                color: 'var(--color-warning)',
              }}
            >
              <FileCheck2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-1" style={{ color: 'var(--color-warning)' }}>
                Bugunun onceligi
              </p>
              <p className="text-[15px] font-bold mb-1" style={{ color: 'var(--color-text1)' }}>
                Nobet Dokumu eksik
              </p>
              <p className="text-xs leading-5" style={{ color: 'var(--color-text2)' }}>
                Ogretmen dosyasini eksiksiz tutmak icin once bu belgeyi tamamlayin. Sonrasinda tum dosyayi tek parca indirebilirsiniz.
              </p>
            </div>
          </div>
          <button
            className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 text-sm font-bold"
            style={{
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-warning)',
              color: '#ffffff',
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Nobet Dokumunu tamamla
            <ArrowRight size={15} />
          </button>
        </div>

        <div
          className="flex items-center gap-2 px-3.5 py-2.5"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
          }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <p className="text-[12px] font-semibold" style={{ color: 'var(--color-warning)' }}>
            1 eksik belge var. Once Nobet Dokumu tamamlanirsa dosya butunu guclenir.
          </p>
        </div>

        <BelgeGrubu baslik="Hazir Belgeler" sayi="4 odak belge" belgeler={otomatikBelgeler} />
        <BelgeGrubu baslik="Tamamlanmasi Gereken" sayi="1 eksik" sayiRenk="var(--color-warning)" belgeler={eksikBelgeler} />
        <BelgeGrubu baslik="Manuel Eklenebilir" belgeler={manuelBelgeler} soluk />
      </div>
    </div>
  )
}
