import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'
import { SectionHeader } from '../components/UI/SectionHeader'
import { UretimHakkiBadge } from '../components/UI/UretimHakkiBadge'

const ARACLAR = [
  { id: 'sinav', ikon: FileText, ad: 'Yazili Sinav', alt: 'Kazanim bazli, cevap anahtarli ve ciktiya hazir sinav seti.', renk: 'var(--color-primary)', etiket: 'En hizli baslangic', varsayilanSure: '40 dakika' },
  { id: 'etkinlik', ikon: Target, ad: 'Sinif Etkinligi', alt: 'Isinma, tekrar ve grup calismasi icin kisa akislar.', renk: 'var(--color-success)', etiket: 'Derste hemen kullan', varsayilanSure: '20 dakika' },
  { id: 'materyal', ikon: BookOpen, ad: 'Ders Materyali', alt: 'Calisma yapragi, ozet notu ve kavram duzeni olustur.', renk: 'var(--color-pop)', etiket: 'PDF odakli', varsayilanSure: '1 ders saati' },
  { id: 'rubrik', ikon: BarChart2, ad: 'Rubrik', alt: 'Performans, sunum ve proje icin sade degerlendirme olcegi.', renk: 'var(--color-warning)', etiket: 'Olcme destegi', varsayilanSure: '1 etkinlik' },
]

const URETIM_HAKKI_BAKIYE = 7
const URETIM_HAKKI_MAKS = 10

interface UretBaglami {
  sinif?: string
  ders?: string
  haftaNo?: number
  kazanim?: string
  kaynak?: string
}

export function UretPage() {
  const location = useLocation()
  const baglam = (location.state as UretBaglami | null) ?? null
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null)
  const [sinif, setSinif] = useState(baglam?.sinif ?? '')
  const [ders, setDers] = useState(baglam?.ders ?? '')
  const [kazanim, setKazanim] = useState(baglam?.kazanim ?? '')
  const [sure, setSure] = useState('')
  const [zorluk, setZorluk] = useState('Orta')

  const selectedTool = useMemo(() => ARACLAR.find(arac => arac.id === selectedToolId) ?? null, [selectedToolId])

  function handleToolSelect(toolId: string) {
    const tool = ARACLAR.find(arac => arac.id === toolId)
    setSelectedToolId(toolId)
    setSure(tool?.varsayilanSure ?? '')
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="section-label">Uret</p>
        <h1 className="text-[28px] font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text1)' }}>
          Uretim Studyosu
        </h1>
        <p className="text-sm leading-6 max-w-[34ch]" style={{ color: 'var(--color-text2)' }}>
          {selectedTool
            ? 'Gereken bilgileri doldurun. Ikinci bir secim ekranina donmeden dogrudan bu gorevin formuna geldiniz.'
            : 'Bir gorev secin ve dogrudan o gorevin olusturma ekranina gecin.'}
        </p>
      </div>

      <div className="section-stack">
        {baglam?.sinif && (
          <section
            style={{
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, var(--color-surface))',
              border: '1px solid color-mix(in srgb, var(--color-primary) 16%, transparent)',
              boxShadow: 'var(--shadow-xs)',
              padding: '16px',
            }}
          >
            <SectionHeader title="Hazir baglam" meta={baglam.kaynak === 'ana-ekran' ? 'Ana ekrandan geldi' : 'Baglamsal giris'} />
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text1)' }}>
              {baglam.sinif}{baglam.ders ? ` - ${baglam.ders}` : ''}{baglam.haftaNo ? ` - ${baglam.haftaNo}. hafta` : ''}
            </p>
            <p className="text-xs leading-5" style={{ color: 'var(--color-text2)' }}>
              {baglam.kazanim || 'Bu baglamla uyumlu bir sinav, etkinlik veya materyal uretebilirsiniz.'}
            </p>
          </section>
        )}

        <UretimHakkiBadge bakiye={URETIM_HAKKI_BAKIYE} maksimum={URETIM_HAKKI_MAKS} aylikHediye={3} />

        {!selectedTool && (
          <section style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '18px' }}>
            <SectionHeader title="Gorev sec" meta="Dogrudan forma gececek" />
            <div className="flex flex-col gap-3">
              {ARACLAR.map(arac => {
                const Icon = arac.ikon
                return (
                  <button
                    key={arac.id}
                    type="button"
                    onClick={() => handleToolSelect(arac.id)}
                    className="w-full text-left transition-all active:scale-[0.99]"
                    style={{ minHeight: 'var(--touch-target)', borderRadius: 'var(--radius-lg)', padding: '14px', backgroundColor: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 flex items-center justify-center shrink-0" style={{ borderRadius: 'var(--radius-md)', backgroundColor: `color-mix(in srgb, ${arac.renk} 10%, transparent)`, color: arac.renk }}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text1)' }}>{arac.ad}</p>
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                            1 hak
                          </span>
                        </div>
                        <p className="text-xs leading-5 mb-1" style={{ color: 'var(--color-text2)' }}>{arac.alt}</p>
                        <p className="text-[11px] font-bold" style={{ color: arac.renk }}>{arac.etiket}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {selectedTool && (
          <section style={{ borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', padding: '18px' }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <SectionHeader title={`${selectedTool.ad} Olustur`} meta="Dogrudan gorev formu" />
              <button type="button" onClick={() => setSelectedToolId(null)} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--color-text2)' }}>
                <ArrowLeft size={14} />
                Gorevlere don
              </button>
            </div>

            <div className="mb-4 px-4 py-4" style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))', border: '1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)' }}>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text1)' }}>{selectedTool.ad} secildi</p>
              <p className="text-xs leading-5" style={{ color: 'var(--color-text2)' }}>
                Ikinci bir ara ekrana gitmeden bu gorev icin gerekli alanlari doldurup dogrudan olusturma akisini baslatabilirsiniz.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Sinif</p>
                <input value={sinif} onChange={e => setSinif(e.target.value)} placeholder="Orn. 6A" className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Ders</p>
                <input value={ders} onChange={e => setDers(e.target.value)} placeholder="Orn. Fen Bilimleri" className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Kazanim / konu</p>
                <textarea value={kazanim} onChange={e => setKazanim(e.target.value)} placeholder="Bu gorevin dayanacagi kazanimi veya konuyu yazin" rows={4} className="w-full p-3 text-sm resize-none" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Sure / kapsam</p>
                  <input value={sure} onChange={e => setSure(e.target.value)} placeholder={selectedTool.varsayilanSure} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text2)' }}>Zorluk</p>
                  <select value={zorluk} onChange={e => setZorluk(e.target.value)} className="w-full p-3 text-sm" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text1)', outline: 'none' }}>
                    <option>Kolay</option>
                    <option>Orta</option>
                    <option>Zor</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" className="w-full min-h-[48px] mt-5 inline-flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-[0.98]" style={{ borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)', border: 'none' }}>
              {selectedTool.ad} olustur
              <ArrowRight size={16} />
            </button>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3">
          <div style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)', padding: '16px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={16} style={{ color: 'var(--color-pop)' }} />
              <p className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: 'var(--color-pop)' }}>Neden hizli?</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {['Gorev seciminden sonra dogrudan ilgili forma gecis', 'Hazir baglam ile daha az elle giris', 'Duzenlenebilir cikti mantigi'].map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                  <span className="text-xs leading-5" style={{ color: 'var(--color-text2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'color-mix(in srgb, var(--color-pop) 7%, var(--color-surface))', border: '1px solid color-mix(in srgb, var(--color-pop) 16%, transparent)', boxShadow: 'var(--shadow-xs)', padding: '16px' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} style={{ color: 'var(--color-pop)' }} />
              <p className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: 'var(--color-pop)' }}>Sprint 2 notu</p>
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text1)' }}>Uretim formu sonraki adimda calisacak</p>
            <p className="text-xs leading-5" style={{ color: 'var(--color-text2)' }}>
              Backend baglantisi geldikten sonra bu formdan dogrudan sinav, etkinlik, materyal ve rubrik ciktilari uretilecek.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
