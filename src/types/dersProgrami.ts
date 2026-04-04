export type Gun = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma'

export interface DersSaati {
  gun: Gun
  saat: number          // 1-8 (ders saati sırası)
  sinif: string | null  // null = boş saat
  ders?: string         // sinif varsa otomatik doldurulur
}

export interface DersProgrami {
  id: string
  ogretmenId: string    // Supabase user id veya 'local'
  haftaBaslangic: string // ISO date — hangi haftadan itibaren geçerli
  saatler: DersSaati[]
  olusturmaTarihi: string
  guncellemeTarihi: string
}
