# UX Audit Matrix

Bu belge, `Tasarim Mimari` ilkelerine gore ana ekranlar icin hizli bir UX denetim ozeti sunar.

| Ekran | Amac | Birincil gorev | Ikincil gorev | Karar yuku riski | Surtunme noktasi | Onerilen cozum | Ilgili bilissel ilke |
|---|---|---|---|---|---|---|---|
| Ana | Ogretmenin bugunku durumu hizla gormesi | Aktif plani acmak | Yaklasan isleri taramak, hizli erisim kullanmak | Ayni anda cok fazla vurgulu blok | Acil, bu hafta ve yaklasan alanlarin esit agirlikta yarismasi | Hero karti tek birincil CTA yap, diger bloklari ikincil section yapisina indir | Hick Yasasi, TTFF |
| Planla | Yillik plani takip etmek ve haftaya inmek | Bu haftaya ulasmak | Export, yazdirma, donem tarama | Aksiyonlar ve icerigin ayni hizada rekabet etmesi | Toolbar ile liste akisi arasinda hiyerarsi kaybi | Sticky arac cubugu ve section ayrimi kullan | Miller Yasasi, Fitts Yasasi |
| Hafta Detay | Tek haftayi anlamak ve tamamlamak | Haftayi tamamla | Not ekle, onceki/sonraki haftaya gec | Not, gezinme ve tamamla aksiyonunun ayni seviyede gorunmesi | Gorev sirasinin belirsiz olmasi | Icerik once, tamamla ikinci, not ucuncu, gezinme sonuncu | Progressive Disclosure |
| Dosyam | Belge durumunu hizli taramak | Tum dosyayi indir | Eksikleri gormek, manuel ekleri taramak | Farkli belge tiplerinin tek listede erimesi | Hazir ve eksik belgelerin ayni tonda algilanmasi | Hazir, tamamlanmasi gereken ve manuel kisimlari ayir | Chunking, Signal-to-noise |
| Uret | Arac secimini kolaylastirmak | Bir arac secip devam etmek | Uretim hakki durumunu gormek | Ilk ekranda cok fazla secenek gosterme riski | Wizard detaylarini ilk adimda acma egilimi | Ilk adimi yalnizca arac secimi ile sinirla | Hick Yasasi, Progressive Disclosure |
| Ayarlar | Hesap ve tercihleri yonetmek | Guncel bilgiye erismek veya kaydetmek | Plan ekleme, cikis yapma | Goruntule ve duzenle kiplerinin karismasi | Ayarlar ile hesap islemlerinin ayni blokta toplanmasi | Profil, plan, tercih ve hesap bloklarini net ayir | Mental Models, Chunking |

## Genel Sonuclar

- Her ana ekranda tek bir birincil gorev acik bicimde one cikmali.
- Yuksek vurgu tasiyan kart sayisi ayni viewport icinde iki adedi gecmemeli.
- Kritik kararlar ilk ekranda tam acilmamali; ikincil detaylar alt akis, sheet veya sonraki adim ile acilmali.
- Belge, hafta ve arac secimi gibi tarama gerektiren yuzeylerde 4-7 ogelik gruplama korunmali.
