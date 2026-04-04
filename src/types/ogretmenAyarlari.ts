export interface OgretmenAyarlari {
  adSoyad: string
  okulAdi: string
  mudurAdi: string
  mudurYardimcisiAdi?: string
  zumreOgretmenleri: string[]
  ilkkeriyeGrubu?: string
  ilkkeriyeYontemi?: string
  bildirimTercihleri: {
    onemliTarihler: boolean
    haftaBaslangici: boolean
  }
}
