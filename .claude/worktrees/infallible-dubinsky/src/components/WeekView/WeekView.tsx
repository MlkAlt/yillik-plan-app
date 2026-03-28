import { useState } from 'react'
import type { Kazanim, Hafta } from '../../types/plan'

interface WeekViewProps {
  hafta?: Hafta
  initialKazanimlar?: Kazanim[]
  onToggleKazanim?: (id: string, yeniDurum: boolean) => Promise<void> | void
}

const GUNLER = [
  { id: 1, ad: 'Pazartesi' },
  { id: 2, ad: 'Salı' },
  { id: 3, ad: 'Çarşamba' },
  { id: 4, ad: 'Perşembe' },
  { id: 5, ad: 'Cuma' },
] as const

// Örnek veri (Props gelmezse UI'da nasıl durduğunu görmek için)
const ORENEK_HAFTA: Hafta = {
  id: 'h1',
  plan_id: 'p1',
  hafta_no: 12,
  baslangic_tarihi: '2024-11-25',
  bitis_tarihi: '2024-11-29',
}

const ORNEK_KAZANIMLAR: Kazanim[] = [
  { id: 'k1', hafta_id: 'h1', gun: 1, kazanim_metni: 'M.5.1.2.1. Kesirleri karşılaştırır ve sıralar.', tamamlandi: true, sira_no: 1 },
  { id: 'k2', hafta_id: 'h1', gun: 1, kazanim_metni: 'Öğrencilerle toplama örneği çözülecek.', tamamlandi: false, sira_no: 2 },
  { id: 'k3', hafta_id: 'h1', gun: 2, kazanim_metni: 'M.5.1.2.2. Bir bütünün istenen basit kesir kadarını bulur.', tamamlandi: false, sira_no: 1 },
  { id: 'k4', hafta_id: 'h1', gun: 4, kazanim_metni: 'M.5.1.2.3. Paydaları eşit veya birinin paydası diğerinin katı olan kesirlerle toplama işlemi yapar.', tamamlandi: false, sira_no: 1 },
  { id: 'k5', hafta_id: 'h1', gun: 5, kazanim_metni: 'Haftalık genel tekrar ve değerlendirme sınavı.', tamamlandi: false, sira_no: 1 },
]

export function WeekView({ hafta = ORENEK_HAFTA, initialKazanimlar = ORNEK_KAZANIMLAR, onToggleKazanim }: WeekViewProps) {
  const [kazanimlar, setKazanimlar] = useState<Kazanim[]>(initialKazanimlar)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (kazanim: Kazanim) => {
    if (loadingId) return

    const yeniDurum = !kazanim.tamamlandi
    setLoadingId(kazanim.id)

    try {
      // Eğer bir onToggle prop'u geçildiyse onu çağır (Supabase işlemleri vs. için)
      if (onToggleKazanim) {
        await onToggleKazanim(kazanim.id, yeniDurum)
      }

      // State'i güncelle
      setKazanimlar(prev =>
        prev.map(k => k.id === kazanim.id ? { ...k, tamamlandi: yeniDurum } : k)
      )
    } catch (error) {
      console.error('Kazanım güncellenirken hata oluştu:', error)
      // Gerçek bir hata durumunda kullanıcıya toast vs. gösterilebilir
    } finally {
      setLoadingId(null)
    }
  }

  // Tarihleri formatla (Örn: 25 Kasım - 29 Kasım 2024)
  const formatTarih = (tarihStr: string) => {
    return new Date(tarihStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Başlık Alanı */}
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E7E5E4] p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[#2D5BE3] font-semibold text-sm mb-1">Haftalık Plan</div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1C1917]">
              {hafta.hafta_no}. Hafta
            </h2>
            <div className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatTarih(hafta.baslangic_tarihi)} - {formatTarih(hafta.bitis_tarihi)}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Önceki
            </button>
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Sonraki
            </button>
          </div>
        </div>

        {/* Günler Izgarası */}
        {/* Mobil: Alt alta yığın (flex-col), Tablet/Masaüstü: 5 kolonlu grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {GUNLER.map(gun => {
            const gununKazanimlari = kazanimlar.filter(k => k.gun === gun.id).sort((a, b) => a.sira_no - b.sira_no)

            return (
              <div key={gun.id} className="bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full">
                {/* Gün Başlığı */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 text-center">
                  <h3 className="font-bold text-slate-700">{gun.ad}</h3>
                </div>

                {/* Kazanım Listesi */}
                <div className="p-4 flex-1 flex flex-col gap-3 bg-slate-50/50">
                  {gununKazanimlari.length > 0 ? (
                    gununKazanimlari.map(kazanim => (
                      <div
                        key={kazanim.id}
                        className={`group relative p-3 rounded-xl border transition-all duration-200 ${
                          kazanim.tamamlandi
                            ? 'bg-[#059669]/10 border-[#059669]/30'
                            : 'bg-white border-[#E7E5E4] hover:border-[#2D5BE3]/30 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox Butonu */}
                          <button
                            onClick={() => handleToggle(kazanim)}
                            disabled={loadingId === kazanim.id}
                            className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              kazanim.tamamlandi
                                ? 'bg-[#059669] border-[#059669] text-white'
                                : 'bg-white border-slate-300 text-transparent hover:border-[#2D5BE3]'
                            } ${loadingId === kazanim.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                            title={kazanim.tamamlandi ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
                          >
                            {loadingId === kazanim.id ? (
                              <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Kazanım Metni */}
                          <p className={`text-sm leading-snug flex-1 transition-all ${
                            kazanim.tamamlandi ? 'text-[#059669] line-through opacity-70' : 'text-[#1C1917]'
                          }`}>
                            {kazanim.kazanim_metni}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Boş Gün Durumu
                    <div className="flex-1 flex flex-col items-center justify-center py-6 px-2 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12H4M8 16l-4-4 4-4" />
                      </svg>
                      <p className="text-xs text-slate-400 font-medium">Bu gün için plan yok</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
