export interface ResmiTatil {
    tarih: string
    ad: string
}

export interface MebYilTakvim {
    yil: string
    donem1Baslangic: string
    donem1Bitis: string
    donem2Baslangic: string
    donem2Bitis: string
    tatiller: ResmiTatil[]
}

export interface Hafta {
    haftaNo: number
    donem: 1 | 2
    baslangicTarihi: string
    bitisTarihi: string
    tatilMi: boolean
    tatilAdi?: string
    kazanim?: string
    kazanimDetay?: string
    uniteAdi?: string
}

export interface OlusturulmusPlan {
    yil: string
    haftalar: Hafta[]
}