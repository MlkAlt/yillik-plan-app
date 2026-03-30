export interface IlerlemeGostergesiProps {
  tamamlanan: number
  toplam: number
  bitisTarihi: string // ISO
  planDonemiDisi?: boolean
  sonrakiHaftaBaslangic?: string // ISO — plan dönemi dışındaysa
}

export function ilerlemeMetniHesapla(props: IlerlemeGostergesiProps): string {
  const { tamamlanan, toplam, bitisTarihi, planDonemiDisi, sonrakiHaftaBaslangic } = props

  if (toplam === 0) return 'Planın hazır, haftaları takip etmeye başla'

  if (tamamlanan >= toplam) return '🎉 Tüm haftaları tamamladın!'

  if (planDonemiDisi && sonrakiHaftaBaslangic) {
    const d = new Date(sonrakiHaftaBaslangic)
    const tarih = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    return `Yeni dönem ${tarih}'de başlıyor`
  }

  const kalan = toplam - tamamlanan

  let bitisAyi = ''
  try {
    const d = new Date(bitisTarihi)
    if (!isNaN(d.getTime())) {
      bitisAyi = d.toLocaleDateString('tr-TR', { month: 'long' })
    }
  } catch { /* geçersiz tarih */ }

  if (bitisAyi) {
    return `${kalan} hafta kaldı · ${bitisAyi}'da tamamlanır`
  }
  return `${kalan} hafta kaldı`
}

export function IlerlemeGostergesi(props: IlerlemeGostergesiProps) {
  const metin = ilerlemeMetniHesapla(props)
  const { tamamlanan, toplam } = props
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0
  const tamamlandi = toplam > 0 && tamamlanan >= toplam

  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      {/* Mini progress bar */}
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ease-out ${tamamlandi ? 'bg-[#059669]' : 'bg-[#F59E0B]'}`}
          style={{ width: `${yuzde}%` }}
        />
      </div>
      <span className={`text-xs font-semibold whitespace-nowrap ${tamamlandi ? 'text-[#059669]' : 'text-gray-400'}`}>
        {metin}
      </span>
    </div>
  )
}
