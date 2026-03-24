export const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

export const SINIF_OGRETMENI_SINIFLAR = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf']

export const SINIF_OGRETMENI_DERSLER = [
  'Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri',
  'Sosyal Bilgiler', 'İngilizce', 'Müzik', 'Görsel Sanatlar', 'Beden Eğitimi',
]

export const DERS_SECENEKLERI = [
  'Sınıf Öğretmeni',
  'Fen Bilimleri', 'Matematik', 'Türkçe', 'Hayat Bilgisi', 'Sosyal Bilgiler',
  'İngilizce', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya',
  'Fizik', 'Kimya', 'Biyoloji',
  'Din Kültürü ve Ahlak Bilgisi', 'Almanca', 'Fransızca',
  'Beden Eğitimi', 'Müzik', 'Görsel Sanatlar', 'Felsefe', 'Psikoloji', 'Sosyoloji',
  'Mantık', 'Matematik Uygulamaları',
  'Bilişim Teknolojileri', 'Trafik ve İlk Yardım', 'Sağlık Bilgisi',
  'DKAB', 'Meslek Dersi', 'Diğer',
]

/**
 * Mevcut akademik yılı hesaplar.
 * 18 Ağustos ve sonrasında bir sonraki yılı da seçenek olarak gösterir.
 * 2024-2025 ve öncesi artık listelenmez.
 */
export function getYilSecenekleri(): string[] {
  const bugun = new Date()
  const ay = bugun.getMonth() + 1 // 1=Ocak
  const gun = bugun.getDate()
  const yil = bugun.getFullYear()

  // Eylül başından itibaren yeni akademik yıl
  const mevcutBaslangic = ay >= 9 ? yil : yil - 1
  const mevcutYil = `${mevcutBaslangic}-${mevcutBaslangic + 1}`

  // Ağustos 18+ → sonraki yılı da göster (öğretmenler planlamaya başlar)
  if (ay === 8 && gun >= 18) {
    const sonrakiYil = `${mevcutBaslangic + 1}-${mevcutBaslangic + 2}`
    return [mevcutYil, sonrakiYil]
  }
  return [mevcutYil]
}

export const DERS_SINIF_MAP: Record<string, string[]> = {
  'Hayat Bilgisi': ['1. Sınıf', '2. Sınıf', '3. Sınıf'],
  'Fen Bilimleri': ['3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Matematik': SINIF_SEVIYELERI,
  'Beden Eğitimi': SINIF_SEVIYELERI,
  'Müzik': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'Görsel Sanatlar': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`),
  'İngilizce': SINIF_SEVIYELERI,
  'Din Kültürü ve Ahlak Bilgisi': SINIF_SEVIYELERI,
  'Türk Dili ve Edebiyatı': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Tarih': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Coğrafya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Fizik': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Kimya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Biyoloji': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
}
