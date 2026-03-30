import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ilerlemeMetniHesapla } from '../components/IlerlemeGostergesi/IlerlemeGostergesi'

describe('ilerlemeMetniHesapla', () => {
  // Birim testler
  it('toplam 0 iken nötr mesaj döner', () => {
    const metin = ilerlemeMetniHesapla({ tamamlanan: 0, toplam: 0, bitisTarihi: '' })
    expect(metin.length).toBeGreaterThan(0)
  })

  it('tamamlanan >= toplam iken tebrik mesajı döner', () => {
    const metin = ilerlemeMetniHesapla({ tamamlanan: 36, toplam: 36, bitisTarihi: '2026-06-12' })
    expect(metin).toMatch(/🎉|tamamla/i)
  })

  it('normal durumda kalan hafta ve ay bilgisi içerir', () => {
    const metin = ilerlemeMetniHesapla({ tamamlanan: 10, toplam: 36, bitisTarihi: '2026-06-12' })
    expect(metin).toContain('26 hafta kaldı')
    expect(metin).toContain('Haziran')
  })

  it('geçersiz tarihte sadece hafta sayısı döner', () => {
    const metin = ilerlemeMetniHesapla({ tamamlanan: 5, toplam: 36, bitisTarihi: 'gecersiz' })
    expect(metin).toContain('31 hafta kaldı')
  })

  // Property testler
  it('Property 5: ham oran (x/y) formatı içermez', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 35 }),
      fc.integer({ min: 1, max: 36 }),
      (tamamlanan, toplam) => {
        fc.pre(tamamlanan < toplam)
        const metin = ilerlemeMetniHesapla({ tamamlanan, toplam, bitisTarihi: '2026-06-12' })
        return !metin.includes(`${tamamlanan}/${toplam}`)
      }
    ), { numRuns: 100 })
  })

  it('Property 6: toplam 0 iken boş string döndürmez', () => {
    fc.assert(fc.property(
      fc.constant(0),
      (toplam) => {
        const metin = ilerlemeMetniHesapla({ tamamlanan: 0, toplam, bitisTarihi: '' })
        return metin.length > 0
      }
    ), { numRuns: 100 })
  })

  it('Property 7: tamamlanan >= toplam iken tebrik içerir', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 36 }),
      (toplam) => {
        const metin = ilerlemeMetniHesapla({ tamamlanan: toplam, toplam, bitisTarihi: '2026-06-12' })
        return metin.includes('🎉') || metin.toLowerCase().includes('tamamla')
      }
    ), { numRuns: 100 })
  })
})
