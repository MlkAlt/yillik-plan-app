# Requirements Document

## Introduction

Bu spec, Türk öğretmenler için geliştirilmiş yıllık ders planı uygulamasının (Öğretmen Yaver) mevcut durumunu kapsamlı biçimde değerlendirmek ve önceliklendirilmiş bir geliştirme yol haritası ortaya koymak amacıyla hazırlanmıştır.

Uygulama; MEB takvimine uygun haftalık plan oluşturma, müfredat kazanımlarını takip etme, Excel/Word export ve Supabase tabanlı bulut senkronizasyonu sunan, $0/ay maliyetle çalışan bir PWA'dır. Hedef kitle tüm branş öğretmenleridir; öncelik en kalabalık branşlardan başlayarak genişleyecektir. Gelecekte sınav sorusu oluşturma ve anlık ders etkinliği gibi premium özellikler planlanmaktadır.

---

## Glossary

- **App**: Öğretmen Yaver uygulaması (React + Vite + TypeScript PWA)
- **Öğretmen**: Uygulamanın birincil kullanıcısı; Türk ilk/orta/lise öğretmeni
- **Plan**: Bir ders ve sınıf seviyesi için oluşturulmuş yıllık haftalık ders planı (`PlanEntry`)
- **Kazanım**: MEB müfredatındaki haftalık öğrenme hedefi
- **Onboarding**: Yeni kullanıcının ilk plan oluşturma akışı
- **Lead**: Uygulamaya e-posta/ad bırakan potansiyel kullanıcı
- **Admin**: Uygulamayı yöneten geliştirici/işletmeci
- **Branş**: Öğretmenin uzmanlık alanı (Fen Bilimleri, Matematik, Türkçe vb.)
- **PlanSelector**: Branş ve sınıf seçim bileşeni
- **HaftaDetayPage**: Tek hafta için kazanım görüntüleme ve not ekleme sayfası
- **AppHomeScreen**: Uygulamanın ana ekranı; bu haftanın kazanımını ve onboarding'i gösterir
- **Supabase**: Backend-as-a-service; Auth, veritabanı ve senkronizasyon için kullanılır
- **localStorage**: Tarayıcı tarafı kalıcı depolama; offline çalışma için birincil veri katmanı

---

## Requirements

### Requirement 1: Onboarding Akışının Tamamlanması

**User Story:** Bir öğretmen olarak, uygulamayı ilk açtığımda hiç sürtünme olmadan branşımı ve sınıfımı seçip planımı oluşturmak istiyorum; böylece hemen kullanmaya başlayabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı uygulamayı ilk kez açar ve hiç planı yoksa, THE App SHALL `AppHomeScreen` içinde `PlanSelector` bileşenini tam ekran kart olarak göstermeli
2. WHEN kullanıcı `PlanSelector`'da branş ve sınıf seçimini tamamlar, THE App SHALL planı oluşturup `PlanPage`'e yönlendirmeli ve `onboarding-tamamlandi` anahtarını localStorage'a kaydetmeli
3. WHEN onboarding tamamlandıktan sonra kullanıcı uygulamayı yeniden açarsa, THE App SHALL onboarding kartını göstermemeli ve doğrudan `BuHaftaKarti`'nı göstermeli
4. THE PlanSelector SHALL branş seçiminde arama ve popüler branş kısayollarını sunmalı
5. WHEN kullanıcı sınıf öğretmeni branşını seçerse, THE PlanSelector SHALL sınıf ve ders çoklu seçim adımını göstermeli
6. IF onboarding sırasında seçilen branş için müfredat JSON'u bulunamazsa, THEN THE App SHALL kullanıcıya "müfredat bulunamadı, boş plan oluşturuldu" uyarısını göstermeli

---

### Requirement 2: Ana Ekran (AppHomeScreen) UX İyileştirmesi

**User Story:** Bir öğretmen olarak, uygulamayı her açtığımda o haftanın kazanımını ve ilerleme durumumu net biçimde görmek istiyorum; böylece gereksiz tıklama yapmadan bilgiye ulaşabilirim.

#### Acceptance Criteria

1. THE AppHomeScreen SHALL bu haftanın kazanımını, ünite adını ve hafta tarih aralığını tek bir kart içinde göstermeli
2. WHEN birden fazla plan mevcutsa, THE AppHomeScreen SHALL sınıf seçici sekmeleri ve her sınıf için ilerleme yüzdesini göstermeli
3. WHEN hafta sonu ise, THE AppHomeScreen SHALL "Hafta sonu ☕" mesajını göstermeli
4. WHEN aktif hafta tatil haftasıysa, THE AppHomeScreen SHALL tatil adını ve emoji ile göstermeli
5. THE AppHomeScreen SHALL hızlı erişim butonları olarak "Plan Oluştur" ve "Dosya Yükle" seçeneklerini sunmalı
6. WHILE Supabase senkronizasyonu devam ediyorsa, THE AppHomeScreen SHALL senkronizasyon göstergesini görünür tutmalı
7. THE AppHomeScreen SHALL gereksiz bileşen içermemeli; yalnızca bu haftanın kazanımı, ilerleme ve hızlı erişim bölümlerinden oluşmalı

---

### Requirement 3: Müfredat Kapsamının Genişletilmesi

**User Story:** Bir öğretmen olarak, hangi branşta olursam olayım müfredatıma uygun plan oluşturabilmek istiyorum; böylece uygulamayı gerçekten kullanabilirim.

#### Acceptance Criteria

1. THE App SHALL en kalabalık branşlar için öncelikli olarak müfredat JSON'larını içermeli: Matematik (tüm sınıflar), Türkçe (tüm sınıflar), Fen Bilimleri (tüm sınıflar), Sosyal Bilgiler (tüm sınıflar)
2. THE App SHALL orta öncelikli branşlar için müfredat içermeli: İngilizce (tüm sınıflar), Hayat Bilgisi (1-3), Beden Eğitimi, Müzik, Görsel Sanatlar
3. THE App SHALL lise branşları için müfredat içermeli: Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Türk Dili ve Edebiyatı (9-12)
4. IF bir branş için müfredat JSON'u mevcut değilse, THEN THE App SHALL boş hafta planı oluşturmalı ve kullanıcıyı bilgilendirmeli
5. WHEN yeni bir müfredat JSON'u `src/data/mufredat/` dizinine eklenirse, THE mufredatRegistry SHALL bu dosyayı `getMufredat()` fonksiyonu aracılığıyla erişilebilir kılmalı
6. THE App SHALL müfredat JSON formatını (ortaokul/lise formatı ve ilkokul formatı) tutarlı biçimde desteklemeli

---

### Requirement 4: UI Tasarım Tutarlılığı ve Kalitesi

**User Story:** Bir öğretmen olarak, uygulamanın tüm ekranlarında tutarlı ve profesyonel bir görünüm görmek istiyorum; böylece uygulamaya güven duyabilirim.

#### Acceptance Criteria

1. THE App SHALL renk paletini tutarlı biçimde kullanmalı: `#2D5BE3` (birincil mavi), `#F59E0B` (vurgu turuncu), `#1C1917` (metin), `#FAFAF9` (kart arka planı)
2. THE App SHALL tüm etkileşimli elemanlarda `active:scale-95` ve `transition-all` animasyonlarını uygulamalı
3. THE App SHALL kart bileşenlerinde `rounded-2xl`, `shadow-[0_1px_3px_rgba(0,0,0,0.06)]` ve `border border-[#E7E5E4]` stillerini tutarlı biçimde kullanmalı
4. THE App SHALL mobil-öncelikli tasarım ilkesine uygun olarak tüm ekranlarda `max-w-lg mx-auto` ve `pb-24` (alt nav için boşluk) kullanmalı
5. WHEN bir sayfa yüklenirken veri yoksa, THE App SHALL boş durum (empty state) mesajı ve yönlendirme butonu göstermeli
6. THE App SHALL ekranlar arası geçişlerde tutarlı animasyon kullanmalı

---

### Requirement 5: Teknik Borç ve Kod Kalitesi

**User Story:** Bir geliştirici olarak, kodun bakımı kolay ve genişletilebilir olmasını istiyorum; böylece yeni özellikler eklerken mevcut kodu bozmam.

#### Acceptance Criteria

1. THE App SHALL `guessDate()` fonksiyonundaki hardcode yıl değerini (`2025`/`2026`) dinamik hesaplama ile değiştirmeli
2. THE App SHALL `HaftaDetayPage`'in localStorage'dan doğrudan okuması yerine, aktif plan verisini prop veya context aracılığıyla almasını sağlamalı
3. THE App SHALL branş verisinin iki ayrı dosyada (`branchConfig.ts` ve `dersSinifMap.ts`) tutulması sorununu tek kaynak (single source of truth) haline getirmeli
4. THE App SHALL `console.log` ifadelerini production build'den çıkarmalı
5. THE App SHALL TypeScript `any` kullanımını ortadan kaldırmalı
6. WHERE test altyapısı eklenirse, THE App SHALL kritik iş mantığı fonksiyonları için birim testleri içermeli: `buildPlan()`, `getMufredat()`, `planOlustur()`, `mufredatliPlanOlustur()`

---

### Requirement 6: Lead Toplama ve Kullanıcı Büyümesi

**User Story:** Bir işletmeci olarak, uygulamayı kullanan öğretmenlerin iletişim bilgilerini toplayabilmek istiyorum; böylece gelecekteki premium özellikler için potansiyel müşteri tabanı oluşturabilirim.

#### Acceptance Criteria

1. THE App SHALL giriş yapmamış kullanıcılara `AppSettingsScreen`'de lead form göstermeli
2. WHEN bir kullanıcı lead formunu doldurur ve gönderir, THE LeadForm SHALL veriyi Supabase `leads` tablosuna kaydetmeli
3. THE App SHALL lead formunu düşük sürtünmeli tutmalı: yalnızca ad ve e-posta zorunlu olmalı
4. WHEN kullanıcı Supabase Auth ile kayıt olursa, THE App SHALL lead formunu gizlemeli (zaten kayıtlı kullanıcı)
5. THE App SHALL AdSense banner'ını yalnızca `VITE_ADSENSE_CLIENT` ortam değişkeni tanımlıysa göstermeli
6. WHERE AdSense aktifse, THE App SHALL reklam banner'ını `PlanPage`'de hafta listesinin üstünde göstermeli

---

### Requirement 7: Supabase Auth ve Bulut Senkronizasyonu

**User Story:** Bir öğretmen olarak, farklı cihazlardan uygulamaya giriş yapıp planlarıma ve notlarıma erişebilmek istiyorum; böylece verilerimi kaybetmem.

#### Acceptance Criteria

1. THE App SHALL e-posta ve şifre ile kayıt ve giriş işlemlerini `AuthModal` aracılığıyla sunmalı
2. WHEN kullanıcı giriş yaparsa, THE App SHALL Supabase'den planları çekip localStorage ile birleştirmeli; çakışmalarda bulut verisi öncelikli olmalı
3. WHEN kullanıcı yeni plan oluşturursa ve giriş yapmışsa, THE App SHALL planı sessizce Supabase'e senkronize etmeli
4. WHEN kullanıcı hafta tamamlama veya not ekleme işlemi yaparsa ve giriş yapmışsa, THE App SHALL ilerleme verisini Supabase `user_progress` tablosuna senkronize etmeli
5. IF Supabase erişilemez durumdaysa, THEN THE App SHALL yalnızca localStorage üzerinden çalışmaya devam etmeli ve kullanıcıya hata göstermemeli
6. WHEN kullanıcı çıkış yaparsa, THE App SHALL oturumu sonlandırmalı ancak localStorage verisini silmemeli

---

### Requirement 8: Export Özellikleri

**User Story:** Bir öğretmen olarak, yıllık planımı Excel, Word veya PDF olarak indirebilmek istiyorum; böylece okul idaresine sunabilir veya yazdırabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı "Excel" butonuna tıklarsa, THE App SHALL `exportPlanToExcel()` fonksiyonunu çağırıp biçimlendirilmiş `.xlsx` dosyası indirmeli
2. WHEN kullanıcı "Word" butonuna tıklarsa, THE App SHALL `exportPlanToWord()` fonksiyonunu çağırıp `.doc` dosyası indirmeli
3. WHEN kullanıcı "Yazdır/PDF" butonuna tıklarsa, THE App SHALL `exportPlanToPrint()` fonksiyonunu çağırıp tarayıcı yazdırma diyaloğunu açmalı
4. THE Export SHALL öğretmen adı ve okul adını `ogretmen-ayarlari` localStorage anahtarından okumalı
5. THE Export SHALL tatil haftalarını farklı renk/stil ile işaretlemeli
6. THE Export SHALL ay ve ünite sütunlarını birleştirerek okunabilir bir tablo formatı sunmalı

---

### Requirement 9: PWA ve Performans

**User Story:** Bir öğretmen olarak, uygulamayı telefona yükleyip internet bağlantısı olmadan da kullanabilmek istiyorum; böylece sınıfta her zaman erişebilirim.

#### Acceptance Criteria

1. THE App SHALL service worker aracılığıyla temel uygulama dosyalarını önbelleğe almalı
2. THE App SHALL `manifest.json` ile ana ekrana eklenebilir (installable PWA) olmalı
3. WHILE internet bağlantısı yoksa, THE App SHALL localStorage'daki mevcut planları göstermeli ve çalışmaya devam etmeli
4. THE App SHALL ilk yükleme süresini minimize etmek için code splitting ve lazy loading uygulamalı
5. THE App SHALL Lighthouse PWA skorunu 90+ tutmalı

---

### Requirement 10: Gelecek Premium Özellikler (Roadmap)

**User Story:** Bir öğretmen olarak, ders planımdan otomatik sınav sorusu veya etkinlik oluşturabilmek istiyorum; böylece hazırlık sürecimi kısaltabilirim.

#### Acceptance Criteria

1. WHERE otomatik sınav sorusu özelliği eklenirse, THE App SHALL aktif haftanın kazanımını girdi olarak kullanarak soru önerileri üretmeli
2. WHERE anlık ders etkinliği özelliği eklenirse, THE App SHALL kazanıma uygun etkinlik şablonları sunmalı
3. THE App SHALL premium özellikleri yalnızca giriş yapmış kullanıcılara göstermeli
4. THE App SHALL premium özellik geliştirmesini mevcut $0/ay maliyet hedefini aşmadan planlamalı; AI API maliyetleri için kullanıcı başına ücretlendirme modeli değerlendirilmeli

---

## Öncelik Sıralaması

Mevcut duruma ve kullanıcı geri bildirimlerine göre önerilen geliştirme önceliği:

### Faz 1 — Temel Kullanıcı Deneyimi (Hemen)
1. **Onboarding akışını tamamla** (Requirement 1) — Yeni kullanıcı ilk deneyimi kritik
2. **AppHomeScreen UX iyileştirmesi** (Requirement 2) — Ana ekran düzeni netleştirilmeli
3. **UI tutarlılığı** (Requirement 4) — Ekranlar arası geçiş animasyonları

### Faz 2 — İçerik Genişletme (Kısa Vadeli)
4. **Müfredat kapsamı** (Requirement 3) — Eksik branşlar tamamlanmalı
5. **Teknik borç** (Requirement 5) — `guessDate()` hardcode düzeltme, tek kaynak branş verisi

### Faz 3 — Büyüme ve Monetizasyon (Orta Vadeli)
6. **Lead toplama optimizasyonu** (Requirement 6)
7. **Auth ve sync iyileştirmeleri** (Requirement 7)
8. **Export kalitesi** (Requirement 8)

### Faz 4 — Premium Özellikler (Uzun Vadeli)
9. **Sınav sorusu oluşturma** (Requirement 10)
10. **Anlık ders etkinliği** (Requirement 10)
