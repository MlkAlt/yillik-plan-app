/**
 * Merkezi localStorage anahtar yönetimi.
 * Tüm localStorage erişimlerinde ham string literal yerine bu sabitler kullanılmalıdır.
 */
export const StorageKeys = {
  // Migration: eski format
  ESKI_AKTIF_PLAN:        'aktif-plan',
  TUM_PLANLAR:            'tum-planlar',
  AKTIF_SINIF:            'aktif-sinif',
  TAMAMLANAN_HAFTALAR:    'tamamlanan-haftalar',
  HAFTA_NOTLARI:          'hafta-notlari',
  ONBOARDING_TAMAMLANDI:  'onboarding-tamamlandi',
  AUTH_PROMPT_GOSTERILDI: 'auth-prompt-gosterildi',
  OGRETMEN_AYARLARI:      'ogretmen-ayarlari',
  BILDIRIM_AKTIF:         'bildirim-aktif',
  BILDIRIM_SON_HAFTA:     'bildirim-son-hafta',
  TEMA:                   'tema',
  // Yeni özellikler
  DERS_PROGRAMI:          'ders-programi',
  ONEMLI_TARIHLER:        'onemli-tarihler',
  GUNLUK_PLANLAR:         'gunluk-planlar',
  JETON_DURUMU:           'jeton-durumu',
} as const

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys]
