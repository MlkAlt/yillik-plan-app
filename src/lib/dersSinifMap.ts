export const SINIF_SEVIYELERI = Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`)

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
