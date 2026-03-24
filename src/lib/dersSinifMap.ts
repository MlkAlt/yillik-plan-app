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

// Branş öğretmeni için sınıf seçenekleri.
// İlkokul (1-4) ana dersler sınıf öğretmeni tarafından okutulur;
// yalnızca Yabancı Dil (2. sınıftan) ve DKAB (4. sınıftan) zorunlu branştır.
// Hayat Bilgisi tamamen sınıf öğretmeni dersidir, branş öğretmeni yoktur.
export const DERS_SINIF_MAP: Record<string, string[]> = {
  // Ortaokul branş dersleri (5'ten başlar)
  'Fen Bilimleri': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Matematik': Array.from({ length: 8 }, (_, i) => `${i + 5}. Sınıf`), // 5-12
  // İlkokul + ortaokul + lise branş dersleri
  'İngilizce': Array.from({ length: 11 }, (_, i) => `${i + 2}. Sınıf`), // 2-12
  'Din Kültürü ve Ahlak Bilgisi': Array.from({ length: 9 }, (_, i) => `${i + 4}. Sınıf`), // 4-12
  // İlkokulda isteğe bağlı branş olabilir (okul kadrosuna göre)
  'Müzik': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`), // 1-8
  'Görsel Sanatlar': Array.from({ length: 8 }, (_, i) => `${i + 1}. Sınıf`), // 1-8
  'Beden Eğitimi': SINIF_SEVIYELERI, // 1-12
  // Lise branş dersleri
  'Türk Dili ve Edebiyatı': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Tarih': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Coğrafya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Fizik': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Kimya': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
  'Biyoloji': ['9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf'],
}
