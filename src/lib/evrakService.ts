import type { EvrakSablon, EvrakKategori } from '../types/evrak'
import type { OgretmenAyarlari } from '../types/ogretmenAyarlari'

const PREMIUM_KATEGORILER: EvrakKategori[] = ['kulup-evraklari', 'sinif-rehberlik']

const SABLONLAR: EvrakSablon[] = [
  // Öğretmen Dosyası
  { id: 'yillik-plan', kategori: 'ogretmen-dosyasi', ad: 'Yıllık Plan', aciklama: 'MEB formatında yıllık ders planı', premium: false, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
  { id: 'gunluk-plan', kategori: 'ogretmen-dosyasi', ad: 'Günlük Plan Örnekleri', aciklama: 'Son 5 hafta günlük planları', premium: false, zorunluAlanlar: ['adSoyad'], templatePath: '' },
  // Zümre Tutanakları
  { id: 'zha-tutanak', kategori: 'zumre-tutanaklari', ad: 'ZHA Toplantı Tutanağı', aciklama: 'Zümre hazırlık/değerlendirme tutanağı', premium: false, zorunluAlanlar: ['adSoyad', 'okulAdi', 'mudurAdi', 'zumreOgretmenleri'], templatePath: '' },
  { id: 'veli-gorusme', kategori: 'ogretmen-dosyasi', ad: 'Veli Görüşme Tutanağı', aciklama: 'Veli görüşme kayıt formu', premium: false, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
  { id: 'nobet-dokum', kategori: 'ogretmen-dosyasi', ad: 'Nöbet Dökümü', aciklama: 'Aylık nöbet çizelgesi', premium: false, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
  // Genel Bürokratik
  { id: 'ders-gozlem', kategori: 'genel-burokratik', ad: 'Ders Gözlem Formu', aciklama: 'Müdür/denetmen ziyareti formu', premium: false, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
  // Premium
  { id: 'kulup-yillik', kategori: 'kulup-evraklari', ad: 'Kulüp Yıllık Planı', aciklama: 'Okul kulübü yıllık çalışma planı', premium: true, zorunluAlanlar: ['adSoyad', 'okulAdi', 'mudurAdi'], templatePath: '' },
  { id: 'kulup-tutanak', kategori: 'kulup-evraklari', ad: 'Kulüp Toplantı Tutanağı', aciklama: 'Kulüp toplantı kayıt formu', premium: true, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
  { id: 'rehberlik-plan', kategori: 'sinif-rehberlik', ad: 'Sınıf Rehberlik Planı', aciklama: 'Dönemlik sınıf rehberlik etkinlikleri', premium: true, zorunluAlanlar: ['adSoyad', 'okulAdi'], templatePath: '' },
]

export function getEvrakSablonlari(): EvrakSablon[] {
  return SABLONLAR
}

export function getEvrakSablonlariByKategori(kategori: EvrakKategori): EvrakSablon[] {
  return SABLONLAR.filter(s => s.kategori === kategori)
}

export function isPremiumKategori(kategori: EvrakKategori): boolean {
  return PREMIUM_KATEGORILER.includes(kategori)
}

export function tespitEksikAlanlar(sablon: EvrakSablon, ayarlar: Partial<OgretmenAyarlari>): string[] {
  return sablon.zorunluAlanlar.filter(alan => {
    const deger = (ayarlar as Record<string, unknown>)[alan]
    if (Array.isArray(deger)) return deger.length === 0
    return !deger || String(deger).trim() === ''
  })
}

export function doldurSablon(sablon: EvrakSablon, ayarlar: Partial<OgretmenAyarlari>): Record<string, unknown> {
  const sonuc: Record<string, unknown> = { sablonId: sablon.id, sablonAdi: sablon.ad }
  for (const alan of sablon.zorunluAlanlar) {
    sonuc[alan] = (ayarlar as Record<string, unknown>)[alan] ?? ''
  }
  return sonuc
}
