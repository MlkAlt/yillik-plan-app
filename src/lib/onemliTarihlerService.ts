import type { OnemliTarih, OnemliTarihKategori } from '../types/onemliTarih'
import { StorageKeys } from './storageKeys'

export type Yakinlik = 'kritik' | 'yaklasan' | 'normal' | 'gecmis'

export function hesaplaYakinlik(tarih: string, bugun: string): Yakinlik {
  const t = new Date(tarih)
  const b = new Date(bugun)
  // Saat farkını yok say, sadece gün farkı
  t.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  const farkMs = t.getTime() - b.getTime()
  const farkGun = Math.ceil(farkMs / (1000 * 60 * 60 * 24))
  if (farkGun < 0) return 'gecmis'
  if (farkGun <= 1) return 'kritik'
  if (farkGun <= 7) return 'yaklasan'
  return 'normal'
}

export function getOnemliTarihler(): OnemliTarih[] {
  try {
    const item = localStorage.getItem(StorageKeys.ONEMLI_TARIHLER)
    if (!item) return []
    return JSON.parse(item) as OnemliTarih[]
  } catch {
    return []
  }
}

export function saveOnemliTarih(tarih: OnemliTarih): void {
  const mevcut = getOnemliTarihler()
  const index = mevcut.findIndex(t => t.id === tarih.id)
  const yeni = index >= 0
    ? mevcut.map((t, i) => i === index ? tarih : t)
    : [...mevcut, tarih]
  localStorage.setItem(StorageKeys.ONEMLI_TARIHLER, JSON.stringify(yeni))
}

export function deleteOnemliTarih(id: string): void {
  const mevcut = getOnemliTarihler()
  localStorage.setItem(StorageKeys.ONEMLI_TARIHLER, JSON.stringify(mevcut.filter(t => t.id !== id)))
}

export function getMebTakvimi(yil: string): OnemliTarih[] {
  // yil: "2025-2026"
  const baslangicYil = parseInt(yil.split('-')[0], 10)
  const bitisYil = baslangicYil + 1

  const tarihler: Array<{ tarih: string; baslik: string; kategori: OnemliTarihKategori }> = [
    { tarih: `${baslangicYil}-09-15`, baslik: 'Okulların Açılışı', kategori: 'tatil' },
    { tarih: `${baslangicYil}-10-29`, baslik: 'Cumhuriyet Bayramı', kategori: 'tatil' },
    { tarih: `${baslangicYil}-11-10`, baslik: 'Atatürk\'ü Anma Günü', kategori: 'diger' },
    { tarih: `${baslangicYil}-12-31`, baslik: '1. Dönem Sonu', kategori: 'not-girisi' },
    { tarih: `${bitisYil}-01-17`, baslik: 'Yarıyıl Tatili Başlangıcı', kategori: 'tatil' },
    { tarih: `${bitisYil}-01-31`, baslik: '2. Dönem Başlangıcı', kategori: 'diger' },
    { tarih: `${bitisYil}-04-23`, baslik: 'Ulusal Egemenlik ve Çocuk Bayramı', kategori: 'tatil' },
    { tarih: `${bitisYil}-05-01`, baslik: 'Emek ve Dayanışma Günü', kategori: 'tatil' },
    { tarih: `${bitisYil}-05-19`, baslik: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', kategori: 'tatil' },
    { tarih: `${bitisYil}-06-06`, baslik: '2. Dönem Sonu / Karne', kategori: 'not-girisi' },
  ]

  return tarihler.map(t => ({
    id: `meb-${t.tarih}`,
    tarih: t.tarih,
    baslik: t.baslik,
    kategori: t.kategori,
    otomatik: true,
    bildirimGonderildi: false,
  }))
}
