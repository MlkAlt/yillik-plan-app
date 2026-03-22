import { ilkokulMufredatiniDonustur, type MufredatJson, type IlkokulMufredatJson } from './takvimUtils'

// Hayat Bilgisi (ilkokul)
import hb1 from '../data/mufredat/hayat-bilgisi-1.json'
import hb2 from '../data/mufredat/hayat-bilgisi-2.json'
import hb3 from '../data/mufredat/hayat-bilgisi-3.json'

// Fen Bilimleri (ilkokul 3-4, ortaokul 5-8)
import fen3 from '../data/mufredat/fen-bilimleri-3.json'
import fen4 from '../data/mufredat/fen-bilimleri-4.json'
import fen5 from '../data/mufredat/fen-bilimleri-5.json'
import fen6 from '../data/mufredat/fen-bilimleri-6.json'
import fen7 from '../data/mufredat/fen-bilimleri-7.json'
import fen8 from '../data/mufredat/fen-bilimleri-8.json'

// Matematik (ilkokul 3-4, ortaokul 5-8, lise 9-12)
import mat3 from '../data/mufredat/matematik-3.json'
import mat4 from '../data/mufredat/matematik-4.json'
import mat5 from '../data/mufredat/matematik-5.json'
import mat6 from '../data/mufredat/matematik-6.json'
import mat7 from '../data/mufredat/matematik-7.json'
import mat8 from '../data/mufredat/matematik-8.json'
import mat9 from '../data/mufredat/matematik-9.json'
import mat10 from '../data/mufredat/matematik-10.json'
import mat11 from '../data/mufredat/matematik-11.json'
import mat12 from '../data/mufredat/matematik-12.json'

// Türkçe (ilkokul 3-4, ortaokul 5-8)
import turkce3 from '../data/mufredat/turkce-3.json'
import turkce4 from '../data/mufredat/turkce-4.json'
import turkce5 from '../data/mufredat/turkce-5.json'
import turkce6 from '../data/mufredat/turkce-6.json'
import turkce7 from '../data/mufredat/turkce-7.json'
import turkce8 from '../data/mufredat/turkce-8.json'

// Sosyal Bilgiler (4-7)
import sosyal4 from '../data/mufredat/sosyal-bilgiler-4.json'
import sosyal5 from '../data/mufredat/sosyal-bilgiler-5.json'
import sosyal6 from '../data/mufredat/sosyal-bilgiler-6.json'
import sosyal7 from '../data/mufredat/sosyal-bilgiler-7.json'

// İngilizce (5-12)
import ing5 from '../data/mufredat/ingilizce-5.json'
import ing6 from '../data/mufredat/ingilizce-6.json'
import ing7 from '../data/mufredat/ingilizce-7.json'
import ing8 from '../data/mufredat/ingilizce-8.json'
import ing9 from '../data/mufredat/ingilizce-9.json'
import ing10 from '../data/mufredat/ingilizce-10.json'
import ing11 from '../data/mufredat/ingilizce-11.json'
import ing12 from '../data/mufredat/ingilizce-12.json'

// Fizik (9-12)
import fizik9 from '../data/mufredat/fizik-9.json'
import fizik10 from '../data/mufredat/fizik-10.json'
import fizik11 from '../data/mufredat/fizik-11.json'
import fizik12 from '../data/mufredat/fizik-12.json'

// Kimya (9-12)
import kimya9 from '../data/mufredat/kimya-9.json'
import kimya10 from '../data/mufredat/kimya-10.json'
import kimya11 from '../data/mufredat/kimya-11.json'
import kimya12 from '../data/mufredat/kimya-12.json'

// Biyoloji (9-12)
import biyoloji9 from '../data/mufredat/biyoloji-9.json'
import biyoloji10 from '../data/mufredat/biyoloji-10.json'
import biyoloji11 from '../data/mufredat/biyoloji-11.json'
import biyoloji12 from '../data/mufredat/biyoloji-12.json'

// Tarih (9-12)
import tarih9 from '../data/mufredat/tarih-9.json'
import tarih10 from '../data/mufredat/tarih-10.json'
import tarih11 from '../data/mufredat/tarih-11.json'
import tarih12 from '../data/mufredat/tarih-12.json'

// Coğrafya (9-12)
import cografya9 from '../data/mufredat/cografya-9.json'
import cografya10 from '../data/mufredat/cografya-10.json'
import cografya11 from '../data/mufredat/cografya-11.json'
import cografya12 from '../data/mufredat/cografya-12.json'

// Türk Dili ve Edebiyatı (9-12)
import tde9 from '../data/mufredat/turk-dili-edebiyat-9.json'
import tde10 from '../data/mufredat/turk-dili-edebiyat-10.json'
import tde11 from '../data/mufredat/turk-dili-edebiyat-11.json'
import tde12 from '../data/mufredat/turk-dili-edebiyat-12.json'

// Ilkokul dosyaları (IlkokulMufredatJson formatında)
const ILKOKUL_MAP: Record<string, IlkokulMufredatJson> = {
  'Hayat Bilgisi-1. Sınıf': hb1 as IlkokulMufredatJson,
  'Hayat Bilgisi-2. Sınıf': hb2 as IlkokulMufredatJson,
  'Hayat Bilgisi-3. Sınıf': hb3 as IlkokulMufredatJson,
  'Fen Bilimleri-3. Sınıf': fen3 as IlkokulMufredatJson,
  'Fen Bilimleri-4. Sınıf': fen4 as IlkokulMufredatJson,
  'Matematik-3. Sınıf': mat3 as IlkokulMufredatJson,
  'Matematik-4. Sınıf': mat4 as IlkokulMufredatJson,
  'Türkçe-3. Sınıf': turkce3 as IlkokulMufredatJson,
  'Türkçe-4. Sınıf': turkce4 as IlkokulMufredatJson,
  'Sosyal Bilgiler-4. Sınıf': sosyal4 as IlkokulMufredatJson,
}

// Ortaokul/lise dosyaları (MufredatJson formatında)
const MUFREDAT_MAP: Record<string, MufredatJson> = {
  'Fen Bilimleri-5. Sınıf': fen5 as MufredatJson,
  'Fen Bilimleri-6. Sınıf': fen6 as MufredatJson,
  'Fen Bilimleri-7. Sınıf': fen7 as MufredatJson,
  'Fen Bilimleri-8. Sınıf': fen8 as MufredatJson,
  'Matematik-5. Sınıf': mat5 as MufredatJson,
  'Matematik-6. Sınıf': mat6 as MufredatJson,
  'Matematik-7. Sınıf': mat7 as MufredatJson,
  'Matematik-8. Sınıf': mat8 as MufredatJson,
  'Matematik-9. Sınıf': mat9 as MufredatJson,
  'Matematik-10. Sınıf': mat10 as MufredatJson,
  'Matematik-11. Sınıf': mat11 as MufredatJson,
  'Matematik-12. Sınıf': mat12 as MufredatJson,
  'Türkçe-5. Sınıf': turkce5 as MufredatJson,
  'Türkçe-6. Sınıf': turkce6 as MufredatJson,
  'Türkçe-7. Sınıf': turkce7 as MufredatJson,
  'Türkçe-8. Sınıf': turkce8 as MufredatJson,
  'Sosyal Bilgiler-5. Sınıf': sosyal5 as MufredatJson,
  'Sosyal Bilgiler-6. Sınıf': sosyal6 as MufredatJson,
  'Sosyal Bilgiler-7. Sınıf': sosyal7 as MufredatJson,
  'İngilizce-5. Sınıf': ing5 as MufredatJson,
  'İngilizce-6. Sınıf': ing6 as MufredatJson,
  'İngilizce-7. Sınıf': ing7 as MufredatJson,
  'İngilizce-8. Sınıf': ing8 as MufredatJson,
  'İngilizce-9. Sınıf': ing9 as MufredatJson,
  'İngilizce-10. Sınıf': ing10 as MufredatJson,
  'İngilizce-11. Sınıf': ing11 as MufredatJson,
  'İngilizce-12. Sınıf': ing12 as MufredatJson,
  'Fizik-9. Sınıf': fizik9 as MufredatJson,
  'Fizik-10. Sınıf': fizik10 as MufredatJson,
  'Fizik-11. Sınıf': fizik11 as MufredatJson,
  'Fizik-12. Sınıf': fizik12 as MufredatJson,
  'Kimya-9. Sınıf': kimya9 as MufredatJson,
  'Kimya-10. Sınıf': kimya10 as MufredatJson,
  'Kimya-11. Sınıf': kimya11 as MufredatJson,
  'Kimya-12. Sınıf': kimya12 as MufredatJson,
  'Biyoloji-9. Sınıf': biyoloji9 as MufredatJson,
  'Biyoloji-10. Sınıf': biyoloji10 as MufredatJson,
  'Biyoloji-11. Sınıf': biyoloji11 as MufredatJson,
  'Biyoloji-12. Sınıf': biyoloji12 as MufredatJson,
  'Tarih-9. Sınıf': tarih9 as MufredatJson,
  'Tarih-10. Sınıf': tarih10 as MufredatJson,
  'Tarih-11. Sınıf': tarih11 as MufredatJson,
  'Tarih-12. Sınıf': tarih12 as MufredatJson,
  'Coğrafya-9. Sınıf': cografya9 as MufredatJson,
  'Coğrafya-10. Sınıf': cografya10 as MufredatJson,
  'Coğrafya-11. Sınıf': cografya11 as MufredatJson,
  'Coğrafya-12. Sınıf': cografya12 as MufredatJson,
  'Türk Dili ve Edebiyatı-9. Sınıf': tde9 as MufredatJson,
  'Türk Dili ve Edebiyatı-10. Sınıf': tde10 as MufredatJson,
  'Türk Dili ve Edebiyatı-11. Sınıf': tde11 as MufredatJson,
  'Türk Dili ve Edebiyatı-12. Sınıf': tde12 as MufredatJson,
}

/**
 * Ders ve sınıf için müfredat verisini döndürür.
 * İlkokul formatını otomatik olarak MufredatJson'a dönüştürür.
 * Müfredat verisi yoksa null döner (planOlustur() kullanılmalı).
 */
export function getMufredat(ders: string, sinif: string): MufredatJson | null {
  const key = `${ders}-${sinif}`

  const ilkokul = ILKOKUL_MAP[key]
  if (ilkokul) return ilkokulMufredatiniDonustur(ilkokul)

  return MUFREDAT_MAP[key] ?? null
}
