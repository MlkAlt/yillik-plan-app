export interface Hafta {
  id: string
  plan_id: string
  hafta_no: number
  baslangic_tarihi: string
  bitis_tarihi: string
}

export interface Kazanim {
  id: string
  hafta_id: string
  gun: 1 | 2 | 3 | 4 | 5 // 1: Pzt, 2: Sal, 3: Çar, 4: Per, 5: Cum
  kazanim_metni: string
  tamamlandi: boolean
  sira_no: number
}
