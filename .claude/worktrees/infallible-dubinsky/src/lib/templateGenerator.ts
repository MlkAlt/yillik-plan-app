import * as XLSX from 'xlsx'
import { planOlustur } from './takvimUtils'

const AY_ADLARI: Record<number, string> = {
    1: 'Ocak', 2: 'Şubat', 3: 'Mart', 4: 'Nisan',
    5: 'Mayıs', 6: 'Haziran', 7: 'Temmuz', 8: 'Ağustos',
    9: 'Eylül', 10: 'Ekim', 11: 'Kasım', 12: 'Aralık',
}

function formatTarih(isoTarih: string): string {
    const d = new Date(isoTarih)
    const gun = String(d.getDate()).padStart(2, '0')
    const ay = AY_ADLARI[d.getMonth() + 1].slice(0, 3)
    return `${gun} ${ay}`
}

export function sablonIndir(yil: string, ders: string, sinif: string): void {
    const plan = planOlustur(yil)

    // Başlık satırı
    const rows: (string | number)[][] = [
        [`${ders} - ${sinif} - ${yil} Yıllık Plan`],
        [],
        ['Ay', 'Hafta No', 'Dönem', 'Tarih Aralığı', 'Kazanım', 'Notlar'],
    ]

    for (const hafta of plan.haftalar) {
        const baslangicAy = new Date(hafta.baslangicTarihi).getMonth() + 1
        const tatilNotu = hafta.tatilMi ? `(${hafta.tatilAdi})` : ''

        rows.push([
            AY_ADLARI[baslangicAy],
            hafta.haftaNo,
            `${hafta.donem}. Dönem`,
            `${formatTarih(hafta.baslangicTarihi)} - ${formatTarih(hafta.bitisTarihi)}`,
            tatilNotu, // Tatil haftalarına otomatik not
            '',
        ])
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)

    // Sütun genişlikleri
    ws['!cols'] = [
        { wch: 10 }, // Ay
        { wch: 10 }, // Hafta No
        { wch: 12 }, // Dönem
        { wch: 20 }, // Tarih Aralığı
        { wch: 60 }, // Kazanım
        { wch: 20 }, // Notlar
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Yıllık Plan')

    const dosyaAdi = `yillik-plan-${ders}-${sinif}-${yil}.xlsx`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[şğüöıç]/g, (c) =>
            ({ ş: 's', ğ: 'g', ü: 'u', ö: 'o', ı: 'i', ç: 'c' }[c] ?? c)
        )

    XLSX.writeFile(wb, dosyaAdi)
}