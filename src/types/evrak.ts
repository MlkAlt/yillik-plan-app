export type EvrakKategori =
  | 'ogretmen-dosyasi'
  | 'kulup-evraklari'
  | 'zumre-tutanaklari'
  | 'sinif-rehberlik'
  | 'genel-burokratik'

export interface EvrakSablon {
  id: string
  kategori: EvrakKategori
  ad: string
  aciklama: string
  premium: boolean
  zorunluAlanlar: string[]  // ['okulAdi', 'mudurAdi', ...]
  templatePath: string
}

export interface JetonDurumu {
  bakiye: number
  aylikHak: number        // free: 3, premium: Infinity
  kullanilanBuAy: number
  sonYenileme: string     // ISO date
  isPremium: boolean
}
