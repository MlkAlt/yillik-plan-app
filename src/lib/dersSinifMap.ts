export const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

export const SINIF_OGRETMENI_SINIFLAR = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf']

export const SINIF_OGRETMENI_DERSLER = [
  'Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri',
  'Sosyal Bilgiler', 'İngilizce', 'Müzik', 'Görsel Sanatlar', 'Beden Eğitimi',
]

export const DERS_GRUPLARI: { grup: string; dersler: string[] }[] = [
  { grup: 'Sınıf Öğretmenliği', dersler: ['Sınıf Öğretmeni'] },
  { grup: 'İlkokul Branş Dersleri', dersler: ['İlkokul İngilizce', 'İlkokul Din Kültürü'] },
  {
    grup: 'Ortaokul / Lise Branş Dersleri', dersler: [
      'Fen Bilimleri', 'Matematik', 'Türkçe', 'Sosyal Bilgiler',
      'İngilizce', 'Din Kültürü ve Ahlak Bilgisi',
      'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya',
      'Fizik', 'Kimya', 'Biyoloji',
    ],
  },
  { grup: 'Sanat ve Spor', dersler: ['Müzik', 'Görsel Sanatlar', 'Beden Eğitimi'] },
  {
    grup: 'Diğer', dersler: [
      'Almanca', 'Fransızca', 'Felsefe', 'Psikoloji', 'Sosyoloji',
      'Mantık', 'Matematik Uygulamaları', 'Bilişim Teknolojileri',
      'Trafik ve İlk Yardım', 'Sağlık Bilgisi', 'Meslek Dersi', 'Diğer',
    ],
  },
]

export const DERS_SECENEKLERI = DERS_GRUPLARI.flatMap(g => g.dersler)

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
  // İlkokul branş dersleri
  'İlkokul İngilizce': ['2. Sınıf', '3. Sınıf', '4. Sınıf'],
  'İlkokul Din Kültürü': ['4. Sınıf'],
  // Ortaokul branş dersleri (5'ten başlar)
  'Fen Bilimleri': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Sosyal Bilgiler': ['5. Sınıf', '6. Sınıf', '7. Sınıf'],
  'Türkçe': ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'],
  'Matematik': Array.from({ length: 8 }, (_, i) => `${i + 5}. Sınıf`), // 5-12
  'İngilizce': Array.from({ length: 8 }, (_, i) => `${i + 5}. Sınıf`), // 5-12
  'Din Kültürü ve Ahlak Bilgisi': Array.from({ length: 8 }, (_, i) => `${i + 5}. Sınıf`), // 5-12
  // Sanat ve spor (ilkokul dahil branş öğretmeni)
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
