# Implementation Plan: Öğretmen Yaver UX Redesign

## Overview

Mevcut React 19 + TypeScript + Vite + Tailwind CSS 4 + Supabase stack'i üzerine inşa edilir. Her görev bir öncekinin üzerine ekler; hiçbir kod havada kalmaz. Önce veri katmanı, sonra bileşenler, sonra entegrasyon.

## Tasks

- [x] 1. Veri modeli ve StorageKeys güncellemesi
  - [x] 1.1 `src/lib/storageKeys.ts` dosyasına `DERS_PROGRAMI`, `ONEMLI_TARIHLER`, `GUNLUK_PLANLAR`, `JETON_DURUMU` anahtarlarını ekle
    - Mevcut anahtarlar değiştirilmez; sadece yeni sabitler eklenir
    - _Requirements: 7.3, 8.2_
  - [x] 1.2 `src/types/dersProgrami.ts` dosyasını oluştur: `Gun`, `DersSaati`, `DersProgrami` interface'lerini tanımla
    - Design doc'taki type tanımlarını birebir uygula
    - _Requirements: 7.1, 7.2_
  - [x] 1.3 `src/types/onemliTarih.ts` dosyasını oluştur: `OnemliTarihKategori`, `OnemliTarih` interface'lerini tanımla
    - _Requirements: 8.2_
  - [x] 1.4 `src/types/gunlukPlan.ts` dosyasını oluştur: `GunlukPlan` interface'ini tanımla
    - _Requirements: 1.6, 3.4_
  - [x] 1.5 `src/types/evrak.ts` dosyasını oluştur: `EvrakKategori`, `EvrakSablon`, `JetonDurumu` interface'lerini tanımla
    - _Requirements: 4.1, 6.5, 9.1_
  - [x] 1.6 `src/lib/storageKeys.ts` içindeki `OgretmenAyarlari` interface'ini `src/types/ogretmenAyarlari.ts`'e taşı; `zumreOgretmenleri`, `ilkkeriyeGrubu`, `ilkkeriyeYontemi`, `bildirimTercihleri` alanlarını ekle
    - `AppSettingsScreen` ve `AppHomeScreen` import'larını güncelle
    - _Requirements: 5.2, 5.3_
  - [ ]* 1.7 Property testi: `StorageKeys` round-trip (Property 9, 16, 21)
    - **Property 9: Önemli Tarih Round-Trip** — `OnemliTarih` nesnesi localStorage'a kaydedilip okunduğunda id, tarih, başlık, kategori korunmalı
    - **Property 16: Ayarlar Kaydetme Round-Trip** — `OgretmenAyarlari` nesnesi localStorage'a kaydedilip okunduğunda derin eşit olmalı
    - **Property 21: Ders Programı Kaydetme Round-Trip** — `DersProgrami` nesnesi localStorage'a kaydedilip okunduğunda saatler dizisi eşdeğer olmalı
    - **Validates: Requirements 7.3, 8.2, 5.4**

- [x] 2. Ders programı servisi ve hook'u
  - [x] 2.1 `src/lib/dersProgramiService.ts` dosyasını oluştur: `getDersProgrami`, `saveDersProgrami`, `checkCakisma` fonksiyonlarını yaz
    - `checkCakisma(program, gun, saat)` → boolean
    - localStorage'a yazar; Supabase sync arka planda (auth varsa)
    - _Requirements: 7.3, 7.5_
  - [x] 2.2 `src/hooks/useDersProgrami.ts` hook'unu oluştur
    - State: `program`, `loading`, `error`
    - Actions: `hucreGuncelle(gun, saat, sinif)`, `kaydet()`, `yukle()`
    - `hucreGuncelle` çakışma varsa `error` state'ini set eder
    - _Requirements: 7.1, 7.2, 7.5_
  - [ ]* 2.3 Property testi: çakışma tespiti (Property 20)
    - **Property 20: Ders Programı Çakışma Tespiti** — Aynı (gün, saat) slotuna ikinci sınıf atanmaya çalışıldığında `checkCakisma` her zaman `true` döndürmeli
    - **Validates: Requirements 7.5**

- [x] 3. Önemli tarihler servisi ve hook'u
  - [x] 3.1 `src/lib/onemliTarihlerService.ts` dosyasını oluştur: `getOnemliTarihler`, `saveOnemliTarih`, `deleteOnemliTarih`, `hesaplaYakinlik`, `getMebTakvimi` fonksiyonlarını yaz
    - `hesaplaYakinlik(tarih, bugun)` → `'kritik' | 'yaklasan' | 'normal'` (≤1 gün kritik, ≤7 gün yaklaşan, >7 gün normal)
    - `getMebTakvimi(yil)` → `OnemliTarih[]` (sabit MEB tatil/dönem tarihleri)
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  - [x] 3.2 `src/hooks/useOnemliTarihler.ts` hook'unu oluştur
    - State: `tarihler`, `yaklasanSayisi`
    - Actions: `ekle(tarih)`, `sil(id)`, `mebTakviminiYukle(yil)`
    - `yaklasanSayisi` bugün veya gelecekteki tarihlerin sayısını tutar
    - _Requirements: 8.1, 8.2, 8.5_
  - [ ]* 3.3 Property testleri: tarih yakınlık ve MEB takvimi (Property 8, 10)
    - **Property 8: Tarih Yakınlık Sınıflandırması** — ≤1 gün kritik, ≤7 gün yaklaşan, >7 gün normal kuralı tüm geçerli tarih çiftleri için tutarlı olmalı
    - **Property 10: MEB Takvimi Otomatik Yükleme** — Geçerli öğretim yılı için en az bir tatil/dönem tarihi içeren boş olmayan liste dönmeli
    - **Validates: Requirements 3.8, 8.3, 8.4, 8.5**

- [x] 4. Jeton ve premium servisi
  - [x] 4.1 `src/lib/tokenService.ts` dosyasını oluştur: `getJetonDurumu`, `harcaJeton`, `checkPremiumErisim` fonksiyonlarını yaz
    - `checkPremiumErisim(ozellik, isPremium)` → boolean
    - Free tier: aylık 3 jeton; premium: sınırsız
    - _Requirements: 6.5, 6.6, 9.1, 9.2_
  - [ ]* 4.2 Property testleri: jeton tier limiti ve premium erişim (Property 14, 18, 19)
    - **Property 14: Premium Erişim Kontrolü Tutarlılığı** — `isPremium=true` ise erişime izin, `false` ise reddet; tüm premium özellikler için tutarlı
    - **Property 18: Jeton Maliyeti Görünürlüğü** — Her araç kartındaki jeton maliyeti sıfırdan büyük tam sayı olmalı
    - **Property 19: Jeton Tier Limiti Uygulaması** — Free tier aylık 3 jetonu geçemez; premium sınırsız; abonelik bitince free'ye düşmeli
    - **Validates: Requirements 4.6, 6.5, 6.7, 9.1, 9.2, 9.5**

- [-] 5. Evrak servisi
  - [x] 5.1 `src/lib/evrakService.ts` dosyasını oluştur: `getEvrakSablonlari`, `doldurSablon`, `tespit EksikAlanlar` fonksiyonlarını yaz
    - `tespitEksikAlanlar(sablon, ayarlar)` → `string[]` (eksik alan adları)
    - `doldurSablon(sablon, ayarlar)` → doldurulmuş şablon nesnesi
    - Kategori listesi: `ogretmen-dosyasi`, `kulup-evraklari` (premium), `zumre-tutanaklari`, `sinif-rehberlik` (premium), `genel-burokratik`
    - _Requirements: 4.1, 4.3, 4.4, 4.7_
  - [ ]* 5.2 Property testleri: evrak kategorileme, şablon doldurma, eksik alan tespiti (Property 11, 12, 13)
    - **Property 11: Evrak Kategorileme Tutarlılığı** — Her `EvrakSablon` nesnesi geçerli `EvrakKategori` değeri taşımalı; premium alanı kategoriyle tutarlı olmalı
    - **Property 12: Evrak Şablonu Doldurma Round-Trip** — `OgretmenAyarlari` ve şablon verildiğinde tüm zorunlu alanlar çıktıda bulunmalı
    - **Property 13: Eksik Alan Tespiti Kapsamlılığı** — `zorunluAlanlar` listesindeki tüm eksik alanlar raporlanmalı; hiçbiri atlanmamalı
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.7, 5.6**

- [x] 6. Checkpoint — Servis katmanı tamamlandı
  - Tüm servis ve hook testleri geçmeli. Kullanıcıya soru varsa sor.

- [x] 7. `DersProgramiGrid` bileşeni
  - [x] 7.1 `src/components/DersProgrami/DersProgramiGrid.tsx` bileşenini oluştur
    - 5 sütun (Pzt-Cum) × 8 satır (ders saatleri) ızgara
    - Her hücre tıklanabilir; `onHucreGuncelle(gun, saat, sinif)` callback'i çağırır
    - Çakışma durumunda hücre kırmızı border alır
    - `readOnly` prop'u ile salt okunur mod
    - _Requirements: 7.1, 7.5_
  - [x] 7.2 `src/components/DersProgrami/SinifSeciciSheet.tsx` bileşenini oluştur
    - Mevcut `BottomSheet` bileşenini kullanır
    - Mevcut `planlar` listesinden sınıfları listeler; "Boş" seçeneği de sunar
    - _Requirements: 7.2_
  - [x] 7.3 `src/pages/DersProgramiPage.tsx` sayfasını oluştur
    - `useDersProgrami` hook'unu kullanır
    - `DersProgramiGrid` + `SinifSeciciSheet` + Kaydet butonu
    - Kaydet sonrası toast gösterir
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 7.4 Property testi: ders programı sıralama (Property 3)
    - **Property 3: Ders Programı → Ana Ekran Sıralama Doğruluğu** — Herhangi bir gün için listelenen dersler saat sırasına göre artan düzende olmalı
    - **Validates: Requirements 2.2, 7.4**

- [-] 8. `OnemliTarihlerListesi` bileşeni ve takvim sayfası
  - [x] 8.1 `src/components/Takvim/OnemliTarihlerListesi.tsx` bileşenini oluştur
    - Tarihler yakınlığa göre sıralanır
    - 7 gün içindekiler amber badge, 1 gün içindekiler kırmızı badge alır
    - `onEkle` ve `onSil` callback'leri
    - _Requirements: 8.1, 8.3, 8.4_
  - [x] 8.2 `src/components/Takvim/TarihEkleForm.tsx` bileşenini oluştur
    - `BottomSheet` içinde açılır
    - Tarih, başlık, kategori alanları
    - _Requirements: 8.2_
  - [x] 8.3 `src/pages/OnemliTarihlerPage.tsx` sayfasını oluştur
    - `useOnemliTarihler` hook'unu kullanır
    - MEB takvimini otomatik yükler (ilk açılışta)
    - `OnemliTarihlerListesi` + `TarihEkleForm`
    - _Requirements: 8.1, 8.2, 8.5_
  - [ ]* 8.4 Property testi: bildirim sayısı tutarlılığı (Property 5)
    - **Property 5: Bildirim Sayısı Tutarlılığı** — Bildirim ikonundaki sayı, bugün veya gelecekteki önemli tarih sayısıyla eşit olmalı
    - **Validates: Requirements 2.7**

- [x] 9. `PlanPage` alt sekme navigasyonu
  - [x] 9.1 `src/components/Plan/PlanAltSekmeler.tsx` bileşenini oluştur
    - Üç sekme: "Yıllık Plan" | "Ders Programı" | "Takvim"
    - Aktif sekme vurgulanır; geçiş animasyonu
    - _Requirements: 3.5, 3.7_
  - [x] 9.2 `src/pages/PlanPage.tsx` dosyasını güncelle
    - `PlanAltSekmeler` bileşenini entegre et
    - "Ders Programı" sekmesi → `DersProgramiGrid` (readOnly=false)
    - "Takvim" sekmesi → `OnemliTarihlerListesi`
    - Mevcut yıllık plan görünümü "Yıllık Plan" sekmesine taşınır
    - _Requirements: 3.5, 3.6, 3.7_

- [-] 10. `AppHomeScreen` — BugunDersleri bileşeni
  - [x] 10.1 `src/components/Home/BugunDersleri.tsx` bileşenini oluştur
    - `useDersProgrami` hook'undan bugünün derslerini alır
    - Saat sırasına göre listeler (saat | sınıf | ders)
    - Ders programı yoksa davet kartı gösterir
    - _Requirements: 2.2, 2.6_
  - [x] 10.2 `src/pages/AppHomeScreen.tsx` dosyasını güncelle
    - `BugunDersleri` bileşenini hero alanının altına ekle
    - Bildirim ikonu `useOnemliTarihler`'den `yaklasanSayisi` alır; badge gösterir
    - "Ders Programı Ekle" kartı `DersProgramiPage`'e navigate eder
    - _Requirements: 2.2, 2.5, 2.6, 2.7_

- [-] 11. `OnboardingModal` — "Günlük plan ister misin?" adımı
  - [x] 11.1 `src/components/BosdurumuEkrani/OnboardingModal.tsx` dosyasını güncelle
    - Tebrik ekranına "Günlük plan da oluşturayım mı?" seçeneği ekle (Evet / Hayır / Atla)
    - "Evet" seçilirse `GunlukPlanTaslak` bileşenini göster
    - _Requirements: 1.5, 1.6, 1.7_
  - [x] 11.2 `src/components/Plan/GunlukPlanTaslak.tsx` bileşenini oluştur
    - Kazanım, yöntem (çoklu seçim chip), etkinlikler, materyaller, süre alanları
    - "Kaydet" → `StorageKeys.GUNLUK_PLANLAR`'a yazar; "İndir" → PDF export
    - _Requirements: 1.6, 3.4_
  - [ ]* 11.3 Property testi: günlük plan taslağı oluşturulabilirliği (Property 2)
    - **Property 2: Günlük Plan Taslağı Oluşturulabilirliği** — Geçerli hafta no, sınıf ve ders kombinasyonu için taslak en az kazanım, yöntem ve etkinlik alanlarını içermeli
    - **Validates: Requirements 1.6, 3.4**

- [-] 12. `DosyamPage` — Kategori sistemi ve premium kilit
  - [x] 12.1 `src/components/Evrak/PremiumKilit.tsx` bileşenini oluştur
    - Kilitli kategorilerin üzerine overlay olarak gelir
    - "Premium'a Geç" CTA butonu; `onYukselt` callback'i
    - _Requirements: 4.6, 9.3_
  - [x] 12.2 `src/pages/DosyamPage.tsx` dosyasını güncelle
    - `evrakService.getEvrakSablonlari()` ile gerçek kategori listesini yükle
    - Premium olmayan kategorilere `PremiumKilit` overlay'i ekle
    - `tespitEksikAlanlar` ile eksik bilgi uyarısı göster; Ayarlar'a yönlendir
    - _Requirements: 4.1, 4.4, 4.6, 4.7_

- [-] 13. `AppSettingsScreen` — Zümre listesi ve ilkkeriye alanları
  - [x] 13.1 `src/pages/AppSettingsScreen.tsx` dosyasını güncelle
    - `OgretmenAyarlari` tipini yeni interface'e göre güncelle
    - İlkokul branşı seçilmişse `ilkkeriyeGrubu` ve `ilkkeriyeYontemi` alanlarını göster (koşullu render)
    - `bildirimTercihleri.onemliTarihler` ve `bildirimTercihleri.haftaBaslangici` toggle'larını ekle
    - _Requirements: 5.2, 5.3, 5.4, 5.5_
  - [ ]* 13.2 Property testi: zümre listesi değişmezliği (Property 15)
    - **Property 15: Zümre Listesi Değişmezliği** — Ekleme uzunluğu tam 1 artırmalı; silme tam 1 azaltmalı; liste hiçbir zaman negatif uzunlukta olamaz
    - **Validates: Requirements 5.2**

- [-] 14. `UretPage` — Plan'dan bağlamsal tetikleme
  - [x] 14.1 `src/pages/UretPage.tsx` dosyasını güncelle
    - `location.state` üzerinden gelen `kazanim` ve `sinif` değerlerini form alanlarına otomatik doldur (zaten kısmen mevcut; `ders` alanını da ekle)
    - Jeton bakiyesi `tokenService.getJetonDurumu()` ile gerçek veriden okunur
    - Bakiye 0 ise üretim butonu devre dışı; premium/jeton al modal'ı gösterilir
    - _Requirements: 6.3, 6.5, 6.6_
  - [x] 14.2 `src/pages/HaftaDetayPage.tsx` dosyasını güncelle (veya `PlanPage.tsx`)
    - "Günlük Plan Oluştur" butonu `navigate('/app/uret', { state: { sinif, ders, haftaNo, kazanim } })` ile Üret Ekranı'na yönlendirir
    - _Requirements: 6.3, 3.4_
  - [ ]* 14.3 Property testi: üretim bağlamı aktarımı (Property 17)
    - **Property 17: Üretim Bağlamı Aktarımı** — Hafta + sınıf + ders kombinasyonu Plan'dan Üret'e geçişte form alanlarındaki kazanım ve sınıf değerleri kaynak verilerle eşleşmeli
    - **Validates: Requirements 6.3**

- [x] 15. Route yapısı güncellemesi
  - [x] 15.1 `src/App.tsx` dosyasını güncelle
    - `/app/planla/ders-programi` → `DersProgramiPage` route'unu ekle
    - `/app/planla/takvim` → `OnemliTarihlerPage` route'unu ekle
    - Her iki route da `AppLayout` içinde render edilir
    - _Requirements: 3.5, 3.7_

- [ ] 16. Checkpoint — UI katmanı tamamlandı
  - Tüm sayfalar render edilebilir, navigation çalışır. Kullanıcıya soru varsa sor.

- [ ] 17. Property-based testler — Müfredat ve plan özellikleri
  - [ ]* 17.1 Property testi: branş → sınıf listesi tutarlılığı (Property 1)
    - **Property 1: Branş → Sınıf Listesi Tutarlılığı** — Herhangi bir branş seçimi için döndürülen sınıf listesi o branşın geçerli sınıf aralığıyla tam örtüşmeli ve boş olmamalı
    - **Validates: Requirements 1.2**
  - [ ]* 17.2 Property testi: hafta detayı eksiksizliği (Property 6)
    - **Property 6: Hafta Detayı Eksiksizliği** — Yıllık plandaki her hafta için kazanım, ünite adı ve tarih aralığı mevcut olmalı (tatil haftaları için tatil adı yeterli)
    - **Validates: Requirements 3.2**
  - [ ]* 17.3 Property testi: export çıktı geçerliliği (Property 7)
    - **Property 7: Export Çıktı Geçerliliği** — Geçerli `PlanEntry` nesnesi için Excel ve Word export fonksiyonları sıfırdan büyük boyutta dosya üretmeli
    - **Validates: Requirements 3.3**
  - [ ]* 17.4 Property testi: zaman tasarrufu hesaplama monotonluğu (Property 4)
    - **Property 4: Zaman Tasarrufu Hesaplama Monotonluğu** — A ⊆ B görev seti için B'nin tasarrufu A'nın tasarrufundan büyük veya eşit olmalı
    - **Validates: Requirements 2.4**
  - [ ]* 17.5 Property testi: offline veri erişilebilirliği (Property 23)
    - **Property 23: Offline Veri Erişilebilirliği** — localStorage'a kaydedilmiş plan veya evrak verisi ağ bağlantısı olmadan da okunabilir olmalı (undefined veya null döndürmemeli)
    - **Validates: Requirements 10.3**
  - [ ]* 17.6 Property testi: dokunma hedefi boyut invariantı (Property 22)
    - **Property 22: Dokunma Hedefi Boyut Invariantı** — Tüm interaktif UI elementleri hem genişlik hem yükseklik açısından 44px'den küçük olmamalı
    - **Validates: Requirements 10.2**

- [ ] 18. Final checkpoint — Tüm testler geçmeli
  - Tüm testler geçmeli. Kullanıcıya soru varsa sor.

## Notes

- `*` ile işaretli alt görevler isteğe bağlıdır; MVP için atlanabilir
- Her görev önceki görevlerin üzerine inşa edilir; sıra önemlidir
- Property testleri `fast-check` kütüphanesiyle yazılır; her test en az 100 iterasyon çalıştırır
- Tüm yeni bileşenler mevcut `--color-*` ve `--radius-*` CSS custom property'lerini kullanır
- Supabase sync arka planda çalışır; tüm okuma/yazma önce localStorage'a gider
