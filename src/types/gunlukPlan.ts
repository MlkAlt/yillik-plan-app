import type { Gun } from './dersProgrami'

export interface GunlukPlan {
  id: string
  haftaNo: number
  gun: Gun
  sinif: string
  ders: string
  kazanim: string
  yontem: string[]
  etkinlikler: string[]
  materyaller: string[]
  sure: number            // dakika
  notlar?: string
  olusturmaTarihi: string
}
