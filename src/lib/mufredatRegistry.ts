import { ilkokulMufredatiniDonustur, type MufredatJson, type IlkokulMufredatJson } from './takvimUtils'

// Ders-sınıf → dosya adı eşlemesi (dynamic import için)
// İlkokul formatı (IlkokulMufredatJson) ayrı işleniyor
const ILKOKUL_DOSYALAR: Record<string, string> = {
  'Hayat Bilgisi-1. Sınıf': 'hayat-bilgisi-1',
  'Hayat Bilgisi-2. Sınıf': 'hayat-bilgisi-2',
  'Hayat Bilgisi-3. Sınıf': 'hayat-bilgisi-3',
  'Fen Bilimleri-3. Sınıf': 'fen-bilimleri-3',
  'Fen Bilimleri-4. Sınıf': 'fen-bilimleri-4',
  'Matematik-3. Sınıf':     'matematik-3',
  'Matematik-4. Sınıf':     'matematik-4',
  'Türkçe-3. Sınıf':        'turkce-3',
  'Türkçe-4. Sınıf':        'turkce-4',
  'Sosyal Bilgiler-4. Sınıf': 'sosyal-bilgiler-4',
}

const MUFREDAT_DOSYALAR: Record<string, string> = {
  'Fen Bilimleri-5. Sınıf': 'fen-bilimleri-5',
  'Fen Bilimleri-6. Sınıf': 'fen-bilimleri-6',
  'Fen Bilimleri-7. Sınıf': 'fen-bilimleri-7',
  'Fen Bilimleri-8. Sınıf': 'fen-bilimleri-8',
  'Matematik-5. Sınıf':  'matematik-5',
  'Matematik-6. Sınıf':  'matematik-6',
  'Matematik-7. Sınıf':  'matematik-7',
  'Matematik-8. Sınıf':  'matematik-8',
  'Matematik-9. Sınıf':  'matematik-9',
  'Matematik-10. Sınıf': 'matematik-10',
  'Matematik-11. Sınıf': 'matematik-11',
  'Matematik-12. Sınıf': 'matematik-12',
  'Türkçe-5. Sınıf': 'turkce-5',
  'Türkçe-6. Sınıf': 'turkce-6',
  'Türkçe-7. Sınıf': 'turkce-7',
  'Türkçe-8. Sınıf': 'turkce-8',
  'Sosyal Bilgiler-5. Sınıf': 'sosyal-bilgiler-5',
  'Sosyal Bilgiler-6. Sınıf': 'sosyal-bilgiler-6',
  'Sosyal Bilgiler-7. Sınıf': 'sosyal-bilgiler-7',
  'İngilizce-5. Sınıf':  'ingilizce-5',
  'İngilizce-6. Sınıf':  'ingilizce-6',
  'İngilizce-7. Sınıf':  'ingilizce-7',
  'İngilizce-8. Sınıf':  'ingilizce-8',
  'İngilizce-9. Sınıf':  'ingilizce-9',
  'İngilizce-10. Sınıf': 'ingilizce-10',
  'İngilizce-11. Sınıf': 'ingilizce-11',
  'İngilizce-12. Sınıf': 'ingilizce-12',
  'Fizik-9. Sınıf':  'fizik-9',
  'Fizik-10. Sınıf': 'fizik-10',
  'Fizik-11. Sınıf': 'fizik-11',
  'Fizik-12. Sınıf': 'fizik-12',
  'Kimya-9. Sınıf':  'kimya-9',
  'Kimya-10. Sınıf': 'kimya-10',
  'Kimya-11. Sınıf': 'kimya-11',
  'Kimya-12. Sınıf': 'kimya-12',
  'Biyoloji-9. Sınıf':  'biyoloji-9',
  'Biyoloji-10. Sınıf': 'biyoloji-10',
  'Biyoloji-11. Sınıf': 'biyoloji-11',
  'Biyoloji-12. Sınıf': 'biyoloji-12',
  'Tarih-9. Sınıf':  'tarih-9',
  'Tarih-10. Sınıf': 'tarih-10',
  'Tarih-11. Sınıf': 'tarih-11',
  'Tarih-12. Sınıf': 'tarih-12',
  'Coğrafya-9. Sınıf':  'cografya-9',
  'Coğrafya-10. Sınıf': 'cografya-10',
  'Coğrafya-11. Sınıf': 'cografya-11',
  'Coğrafya-12. Sınıf': 'cografya-12',
  'Türk Dili ve Edebiyatı-9. Sınıf':  'turk-dili-edebiyat-9',
  'Türk Dili ve Edebiyatı-10. Sınıf': 'turk-dili-edebiyat-10',
  'Türk Dili ve Edebiyatı-11. Sınıf': 'turk-dili-edebiyat-11',
  'Türk Dili ve Edebiyatı-12. Sınıf': 'turk-dili-edebiyat-12',
}

// Bellek içi önbellek — aynı müfredatı tekrar yüklememek için
const cache = new Map<string, MufredatJson>()

/**
 * Ders ve sınıf için müfredat verisini async olarak yükler.
 * İlk çağrıda JSON dosyasını dinamik import eder, sonraki çağrılarda önbellekten döner.
 * Müfredat verisi yoksa null döner.
 */
export async function getMufredat(ders: string, sinif: string): Promise<MufredatJson | null> {
  const key = `${ders}-${sinif}`

  if (cache.has(key)) return cache.get(key)!

  // İlkokul formatı
  const ilkokulDosya = ILKOKUL_DOSYALAR[key]
  if (ilkokulDosya) {
    try {
      const mod = await import(`../data/mufredat/${ilkokulDosya}.json`)
      const donusturulmus = ilkokulMufredatiniDonustur(mod.default as IlkokulMufredatJson)
      cache.set(key, donusturulmus)
      return donusturulmus
    } catch {
      return null
    }
  }

  // Ortaokul/lise formatı
  const dosya = MUFREDAT_DOSYALAR[key]
  if (!dosya) return null

  try {
    const mod = await import(`../data/mufredat/${dosya}.json`)
    const mufredat = mod.default as MufredatJson
    cache.set(key, mufredat)
    return mufredat
  } catch {
    return null
  }
}

/**
 * Belirli bir ders için tüm sınıf seçeneklerini döndürür.
 */
export function getMufredatSiniflar(ders: string): string[] {
  const tumAnahtarlar = [...Object.keys(ILKOKUL_DOSYALAR), ...Object.keys(MUFREDAT_DOSYALAR)]
  return tumAnahtarlar
    .filter(k => k.startsWith(`${ders}-`))
    .map(k => k.replace(`${ders}-`, ''))
}
