# Design Rules

Bu belge, Ogretmen Yaver icin uygulanacak ortak UI/UX kurallarini ozetler.

## 1. Spacing ve ritim

- Mikro spacing `4pt`, makro spacing `8pt` katlari ile kurulur.
- Sayfa yan boslugu varsayilan olarak `16px` tutulur.
- Header ile ilk icerik arasinda `--header-gap`, sectionlar arasinda `--section-gap` kullanilir.
- Kart ic yogunlugu varsayilan olarak `--card-density` civarinda tutulur; tek satirlik kompakt satirlar disinda azaltma yapilmaz.

## 2. Sayfa iskeleti

- Her ana ekran `page header`, `hero/summary`, `primary section`, `secondary section` ritmiyle kurulur.
- Bir ekranda sadece bir tane birincil CTA bulunur.
- Sticky action yalnizca surekli geri donulen araclar icin kullanilir.

## 3. Baslik ve bilgi hiyerarsisi

- Ekran basligi en fazla bir satirlik, net ve gorev odakli olur.
- Hero alaninda o ekrana ait tek ana mesaj verilir.
- Section basliklari kisa olur; yardimci meta etiketi yalnizca baglam sagliyorsa kullanilir.
- Ayni viewport icinde iki adetten fazla yuksek kontrastli vurgu karti kullanilmaz.

## 4. Kart varyantlari

- `Primary card`: ana karar veya ozet icin.
- `Secondary card`: ikincil bilgi, yardimci durum veya bilgi listesi icin.
- `Warning card`: eksik, riskli veya dikkat isteyen durumlar icin.
- `Empty state`: veri yoksa veya akis daha sonra acilacaksa kullanilir; yalnizca bir net sonraki adim sunar.

## 5. CTA sirasi

- Birincil CTA dolu renkli ve tam genislikte olabilir.
- Ikincil CTA outline veya yumuşak zeminli gorunur.
- Iconf-only butonlar yalniz birakilmaz; gorunur label veya yardimci metin eklenir.
- Mobilde tum dokunma alanlari en az `44px` yukseklik hedefler.

## 6. Disclosure pattern

- Ilk adimda sadece en gerekli secimler gosterilir.
- Ileri seviye filtreler, ayarlar veya opsiyonlar ikinci ekran, sheet veya accordion ile acilir.
- Kullanici ilk kararini vermeden once coklu form alanlari gosterilmez.

## 7. Destructive pattern

- Geri donmesi zor islemler tek tip confirm satiri ile korunur.
- Destructive aksiyonlardan once sonuc net dil ile belirtilir.
- Mumkunse iptal veya geri alma yolu kullaniciya acik bicimde sunulur.

## 8. Gorsel yon

- Sicak kagit zemin, murekkep tonlari ve tek keskin turuncu vurgu korunur.
- Liquid glass sadece sheet, floating toolbar ve gecici yuzeylerde kullanilir.
- Ana icerik kartlari okunabilirlik icin opak ve sicak yuzeyde kalir.
- Motion sinirli ama anlamli olur; dikkat dagitan surekli animasyonlardan kacinilir.
