import takvimData from '../data/meb-takvim.json'
import type { MebYilTakvim, Hafta, OlusturulmusPlan } from '../types/takvim'

function haftaOlustur(
    baslangic: Date,
    haftaNo: number,
    donem: 1 | 2,
    tatiller: { tarih: string; ad: string }[]
): Hafta {
    const bitis = new Date(baslangic)
    bitis.setDate(bitis.getDate() + 4)

    const haftadakiTatil = tatiller.find((t) => {
        const tatilTarihi = new Date(t.tarih)
        return tatilTarihi >= baslangic && tatilTarihi <= bitis
    })

    return {
        haftaNo,
        donem,
        baslangicTarihi: baslangic.toISOString().split('T')[0],
        bitisTarihi: bitis.toISOString().split('T')[0],
        tatilMi: !!haftadakiTatil,
        tatilAdi: haftadakiTatil?.ad,
    }
}

function pazartesiBul(tarih: Date): Date {
    const gun = tarih.getDay()
    const fark = gun === 0 ? 1 : 1 - gun
    const pzt = new Date(tarih)
    pzt.setDate(pzt.getDate() + fark)
    return pzt
}

export function planOlustur(yil: string): OlusturulmusPlan {
    const yilVerisi = (takvimData.yillar as MebYilTakvim[]).find(
        (y) => y.yil === yil
    )

    if (!yilVerisi) {
        throw new Error(`${yil} icin takvim verisi bulunamadi`)
    }

    const haftalar: Hafta[] = []
    let haftaNo = 1

    const donemler: Array<{ baslangic: string; bitis: string; donem: 1 | 2 }> = [
        { baslangic: yilVerisi.donem1Baslangic, bitis: yilVerisi.donem1Bitis, donem: 1 },
        { baslangic: yilVerisi.donem2Baslangic, bitis: yilVerisi.donem2Bitis, donem: 2 },
    ]

    for (const { baslangic, bitis, donem } of donemler) {
        const cursor = pazartesiBul(new Date(baslangic))
        const bitisDate = new Date(bitis)

        while (cursor <= bitisDate) {
            haftalar.push(haftaOlustur(new Date(cursor), haftaNo, donem, yilVerisi.tatiller))
            cursor.setDate(cursor.getDate() + 7)
            haftaNo++
        }
    }

    return { yil, haftalar }
}

export function aktifYilBul(): string {
    const bugun = new Date()
    const yil = bugun.getFullYear()
    const ay = bugun.getMonth() + 1
    return ay >= 9 ? `${yil}-${yil + 1}` : `${yil - 1}-${yil}`
}

export function mevcutYillar(): string[] {
    return (takvimData.yillar as MebYilTakvim[]).map((y) => y.yil)
}