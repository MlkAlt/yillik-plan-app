import { useState, useCallback, useMemo } from 'react'
import type { OnemliTarih } from '../types/onemliTarih'
import {
  getOnemliTarihler,
  saveOnemliTarih,
  deleteOnemliTarih,
  getMebTakvimi,
  hesaplaYakinlik,
} from '../lib/onemliTarihlerService'

export function useOnemliTarihler() {
  const [tarihler, setTarihler] = useState<OnemliTarih[]>(() => getOnemliTarihler())

  const ekle = useCallback((tarih: OnemliTarih) => {
    saveOnemliTarih(tarih)
    setTarihler(getOnemliTarihler())
  }, [])

  const sil = useCallback((id: string) => {
    deleteOnemliTarih(id)
    setTarihler(getOnemliTarihler())
  }, [])

  const mebTakviminiYukle = useCallback((yil: string) => {
    const mebTarihleri = getMebTakvimi(yil)
    const mevcut = getOnemliTarihler()
    const mevcutIdler = new Set(mevcut.map(t => t.id))
    // Sadece henüz eklenmemiş MEB tarihlerini ekle
    mebTarihleri.forEach(t => {
      if (!mevcutIdler.has(t.id)) saveOnemliTarih(t)
    })
    setTarihler(getOnemliTarihler())
  }, [])

  const bugunStr = new Date().toISOString().split('T')[0]

  // Bugün veya gelecekteki tarihlerin sayısı (bildirim badge için)
  const yaklasanSayisi = useMemo(() => {
    return tarihler.filter(t => {
      const yakinlik = hesaplaYakinlik(t.tarih, bugunStr)
      return yakinlik !== 'gecmis'
    }).length
  }, [tarihler, bugunStr])

  // Tarihleri yakınlığa göre sıralı döndür
  const siraliTarihler = useMemo(() => {
    return [...tarihler].sort((a, b) => a.tarih.localeCompare(b.tarih))
  }, [tarihler])

  return { tarihler: siraliTarihler, yaklasanSayisi, ekle, sil, mebTakviminiYukle }
}
