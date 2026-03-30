import { StorageKeys } from './storageKeys'

const BILDIRIM_AYAR_KEY = StorageKeys.BILDIRIM_AKTIF
const BILDIRIM_SON_HAFTA_KEY = StorageKeys.BILDIRIM_SON_HAFTA

export function isBildirimDestekleniyor(): boolean {
  return 'Notification' in window
}

export function getBildirimIzni(): NotificationPermission {
  if (!isBildirimDestekleniyor()) return 'denied'
  return Notification.permission
}

export function isBildirimAktif(): boolean {
  return localStorage.getItem(BILDIRIM_AYAR_KEY) === '1'
}

export function setBildirimAktif(aktif: boolean) {
  localStorage.setItem(BILDIRIM_AYAR_KEY, aktif ? '1' : '0')
}

export async function requestBildirimIzni(): Promise<boolean> {
  if (!isBildirimDestekleniyor()) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showKazanimBildirimi(haftaNo: number, kazanim: string, ders: string) {
  if (!isBildirimDestekleniyor()) return
  if (Notification.permission !== 'granted') return
  if (!isBildirimAktif()) return

  const sonHafta = localStorage.getItem(BILDIRIM_SON_HAFTA_KEY)
  const haftaKey = `${haftaNo}`
  if (sonHafta === haftaKey) return

  // Bugünün haftası için zaten bildirim gösterdik mi?
  localStorage.setItem(BILDIRIM_SON_HAFTA_KEY, haftaKey)

  new Notification(`${ders} — ${haftaNo}. Hafta`, {
    body: kazanim,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `hafta-${haftaNo}`,
  })
}
