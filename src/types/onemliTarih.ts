export type OnemliTarihKategori =
  | 'zha'
  | 'not-girisi'
  | 'veli-toplantisi'
  | 'sinav'
  | 'tatil'
  | 'diger'

export interface OnemliTarih {
  id: string
  tarih: string           // ISO date
  baslik: string
  kategori: OnemliTarihKategori
  aciklama?: string
  otomatik: boolean       // MEB takviminden mi geldi?
  bildirimGonderildi: boolean
}
