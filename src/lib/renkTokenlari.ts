/**
 * Renk Token Referansı
 *
 * Kullanım kuralları:
 * - AKSIYON: Tıklanabilir öğeler (buton, link, aksiyon)
 * - AKTIF:   Aktif/seçili durum, navigasyon vurgusu
 * - BASARI:  Tamamlandı, başarı durumu
 * - ICERIK:  Başlık ve etiket metinleri (tıklanamaz)
 * - IKINCIL: Yardımcı metin, açıklama
 * - SINIR:   Kenarlık, ayırıcı
 * - ZEMIN:   Kart arka planı
 *
 * Aynı renk iki farklı anlam için kullanılmaz.
 */
export const RENKLER = {
  AKSIYON: { text: 'text-aksiyon', bg: 'bg-aksiyon', border: 'border-aksiyon', hex: '#2D5BE3' },
  AKTIF:   { text: 'text-aktif',   bg: 'bg-aktif',   border: 'border-aktif',   hex: '#F59E0B' },
  BASARI:  { text: 'text-basari',  bg: 'bg-basari',  border: 'border-basari',  hex: '#059669' },
  ICERIK:  { text: 'text-icerik',  bg: 'bg-icerik',  border: 'border-icerik',  hex: '#1C1917' },
  IKINCIL: { text: 'text-ikincil', bg: 'bg-ikincil', border: 'border-ikincil', hex: '#6B7280' },
  SINIR:   { text: 'text-sinir',   bg: 'bg-sinir',   border: 'border-sinir',   hex: '#E7E5E4' },
  ZEMIN:   { text: 'text-zemin',   bg: 'bg-zemin',   border: 'border-zemin',   hex: '#FAFAF9' },
} as const
