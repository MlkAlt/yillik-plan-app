# Requirements Document

## Giriş

Öğretmen Yaver, Türkiye'deki K-12 öğretmenlerinin bürokratik yükünü azaltmak için tasarlanmış bir mobil-öncelikli web uygulamasıdır. Uygulama halihazırda React + TypeScript + Vite + Supabase stack'i üzerinde çalışmaktadır. Bu spec, mevcut UX/UI'ın iyileştirilmesini ve eksik özelliklerin planlanmasını kapsar.

Temel tasarım felsefesi üç ilkeye dayanır:
- **"30 saniye kuralı"** — Bir görevi tamamlamak 30 saniyeden uzun sürerse kullanıcı uygulamayı kapatır.
- **"Sıfır boş sayfa"** — Her ekran ya dolu gelsin ya da AI taslakla gelsin.
- **"İlk çıktı = bağlılık"** — İlk oturumda somut çıktı almalı.

---

## Sözlük

- **Uygulama**: Öğretmen Yaver mobil-öncelikli web uygulaması.
- **Onboarding_Akışı**: Kullanıcının ilk girişte branş ve sınıf seçtiği, yıllık planın oluşturulduğu kurulum süreci.
- **Ana_Ekran**: Uygulamanın giriş sayfası; bugünün özetini, bu haftanın kazanımlarını ve hızlı erişim kartlarını içerir.
- **Plan_Menüsü**: Yıllık plan, haftalık plan, ders programı ve önemli tarihler takvimini barındıran sekme.
- **Evrak_Merkezi**: Öğretmen dosyası, kulüp evrakları, zümre tutanakları ve diğer bürokratik belgelerin listelendiği ve indirilebildiği ekran.
- **Üret_Ekranı**: Yazılı sınav sorusu, sınıf içi etkinlik materyali ve rubrik üretiminin yapıldığı AI destekli ekran.
- **Ayarlar_Ekranı**: Okul adı, müdür adı, öğretmen adı, zümre öğretmenleri ve diğer kişisel bilgilerin girildiği ekran.
- **Ders_Programı**: Öğretmenin haftanın hangi günü hangi sınıfta ders yaptığını gösteren zaman çizelgesi.
- **Yıllık_Plan**: MEB müfredatına göre otomatik oluşturulan, haftalık kazanımları içeren plan belgesi.
- **Günlük_Plan**: Belirli bir ders saati için hazırlanan, kazanım, yöntem ve etkinlik bilgilerini içeren ders planı.
- **Jeton**: AI destekli üretim araçlarını kullanmak için gereken kredi birimi.
- **Premium**: Ücretli abonelik katmanı; sınırsız üretim ve ek evrak şablonlarına erişim sağlar.
- **Kazanım**: MEB müfredatında tanımlı, haftalık öğretim hedefi.
- **ZHA**: Zümre Hazırlık ve Değerlendirme toplantısı tutanağı.
- **Kulüp_Dosyası**: Öğretmenin yönettiği okul kulübüne ait resmi evrak seti.

---

## Gereksinimler

### Gereksinim 1: Onboarding Akışı — İlk Çıktı Garantisi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamayı ilk açtığımda branşımı ve sınıfımı seçip 30 saniye içinde hazır bir yıllık plan görmek istiyorum; böylece uygulamanın değerini hemen anlayabilirim.

#### Kabul Kriterleri

1. WHEN kullanıcı uygulamayı ilk kez açar, THE Onboarding_Akışı SHALL branş seçim ekranını gösterir.
2. WHEN kullanıcı bir branş seçer, THE Onboarding_Akışı SHALL o branşa ait sınıf seçeneklerini 200ms içinde listeler.
3. WHEN kullanıcı en az bir sınıf seçer ve "Plan Oluştur" butonuna basar, THE Onboarding_Akışı SHALL yıllık planı oluşturma animasyonunu başlatır.
4. WHEN yıllık plan oluşturulur, THE Onboarding_Akışı SHALL kutlama animasyonu (confetti veya benzeri) gösterir ve kullanıcıya "Hazırsınız!" mesajı iletir.
5. WHEN kutlama ekranı gösterilir, THE Onboarding_Akışı SHALL "Günlük plan da oluşturayım mı?" seçeneğini sunar.
6. IF kullanıcı "Günlük plan oluştur" seçeneğini onaylarsa, THEN THE Onboarding_Akışı SHALL ilk haftanın günlük planını taslak olarak oluşturur ve gösterir.
7. THE Onboarding_Akışı SHALL "Atla" seçeneği sunarak kullanıcının onboarding'i tamamlamadan Ana_Ekran'a geçmesine izin verir.
8. WHEN onboarding tamamlanır, THE Uygulama SHALL kullanıcıyı Ana_Ekran'a yönlendirir ve bu haftanın kazanımlarını gösterir.

---

### Gereksinim 2: Ana Ekran — Bugünün Özeti

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamayı her sabah açtığımda o günün derslerini, bu haftanın kazanımlarını ve bekleyen görevleri tek bakışta görmek istiyorum; böylece güne hazırlıklı başlayabilirim.

#### Kabul Kriterleri

1. THE Ana_Ekran SHALL bu haftanın kazanımlarını hero alanında gösterir.
2. WHERE ders programı girilmişse, THE Ana_Ekran SHALL o günün sınıflarını ve ders saatlerini sırasıyla listeler.
3. WHEN bugün için bekleyen evrak veya görev varsa, THE Ana_Ekran SHALL uyarı kartını en üstte gösterir.
4. THE Ana_Ekran SHALL öğretmenin bu ay kazandığı zaman tasarrufunu (saat cinsinden) gösterir.
5. THE Ana_Ekran SHALL "Dosyam", "Jeton" ve "Ders Programı Ekle" hızlı erişim kartlarını içerir.
6. IF ders programı henüz girilmemişse, THEN THE Ana_Ekran SHALL ders programı ekleme davetini belirgin biçimde gösterir.
7. WHILE kullanıcı Ana_Ekran'dayken, THE Uygulama SHALL yaklaşan önemli tarihlere ait bildirimleri bildirim ikonu üzerinde gösterir.

---

### Gereksinim 3: Plan Menüsü — Yıllık ve Haftalık Plan

**Kullanıcı Hikayesi:** Bir öğretmen olarak, yıllık planımı ve bu haftanın kazanımlarını kolayca görmek, haftalık planımı oluşturmak ve planı Excel veya Word olarak indirmek istiyorum; böylece müfettişe veya müdüre hazır belge sunabilirim.

#### Kabul Kriterleri

1. THE Plan_Menüsü SHALL yıllık planı dönem grupları halinde listeler; aktif dönem varsayılan olarak açık gelir.
2. WHEN kullanıcı bir haftaya tıklar, THE Plan_Menüsü SHALL o haftanın kazanımlarını, ünite adını ve tarih aralığını gösterir.
3. THE Plan_Menüsü SHALL yıllık planı Excel ve Word formatlarında indirme seçeneği sunar.
4. WHEN kullanıcı "Günlük Plan Oluştur" butonuna basar, THE Plan_Menüsü SHALL seçili haftanın kazanımına dayalı günlük plan taslağını oluşturur.
5. THE Plan_Menüsü SHALL ders programı girişi için ayrı bir alt sekme içerir.
6. WHERE ders programı girilmişse, THE Plan_Menüsü SHALL haftalık ders programı ızgarasını gösterir.
7. THE Plan_Menüsü SHALL önemli tarihlerin girildiği bir takvim bileşeni içerir.
8. WHEN önemli bir tarih 3 gün veya daha az kalmışsa, THE Uygulama SHALL kullanıcıya push veya in-app bildirim gönderir.
9. IF birden fazla sınıf için plan oluşturulmuşsa, THEN THE Plan_Menüsü SHALL sınıf seçici chip'leri gösterir ve seçilen sınıfın planını yükler.

---

### Gereksinim 4: Evrak Merkezi — Tek Tık İndirme

**Kullanıcı Hikayesi:** Bir öğretmen olarak, öğretmen dosyası, kulüp evrakları, zümre tutanakları ve diğer bürokratik belgeleri tek tıkla indirmek istiyorum; böylece saatlerce uğraşmak yerine dakikalar içinde hazır belgeye sahip olabilirim.

#### Kabul Kriterleri

1. THE Evrak_Merkezi SHALL belgeleri kategorilere göre gruplar: Öğretmen Dosyası, Kulüp Evrakları, Zümre Tutanakları, Sınıf Rehberlik, Genel Bürokratik Evraklar.
2. WHEN kullanıcı bir belgeye tıklar, THE Evrak_Merkezi SHALL belgeyi PDF olarak indirir veya önizleme gösterir.
3. THE Evrak_Merkezi SHALL Ayarlar_Ekranı'ndan alınan okul adı, müdür adı ve öğretmen adını belgelere otomatik doldurur.
4. THE Evrak_Merkezi SHALL eksik bilgi içeren belgeleri uyarı durumunda gösterir ve kullanıcıyı Ayarlar_Ekranı'na yönlendirir.
5. THE Evrak_Merkezi SHALL tüm öğretmen dosyasını tek seferde ZIP veya PDF olarak indirme seçeneği sunar.
6. WHERE premium abonelik aktifse, THE Evrak_Merkezi SHALL ek şablon kategorilerini (kulüp dosyası, sınıf rehberlik) açar.
7. IF belge oluşturmak için gerekli ayar bilgileri eksikse, THEN THE Evrak_Merkezi SHALL hangi alanların eksik olduğunu açıkça belirtir.

---

### Gereksinim 5: Ayarlar Ekranı — Kişiselleştirme

**Kullanıcı Hikayesi:** Bir öğretmen olarak, okul adı, müdür adı, kendi adım, zümre öğretmenleri ve ilkkeriye bilgilerini bir kez girmek istiyorum; böylece tüm evraklar bu bilgilerle otomatik doldurulsun.

#### Kabul Kriterleri

1. THE Ayarlar_Ekranı SHALL okul adı, müdür adı, öğretmen adı ve soyadı alanlarını içerir.
2. THE Ayarlar_Ekranı SHALL zümre öğretmenlerinin ad-soyad listesini girebileceği dinamik bir alan içerir.
3. WHERE ilkokul branşı seçilmişse, THE Ayarlar_Ekranı SHALL ilkkeriye (ilk okuma-yazma) bilgilerini girebileceği ek alanları gösterir.
4. WHEN kullanıcı ayarları kaydeder, THE Ayarlar_Ekranı SHALL değişiklikleri localStorage ve Supabase'e senkronize eder.
5. THE Ayarlar_Ekranı SHALL tema seçimi (açık/koyu) ve bildirim tercihlerini içerir.
6. WHEN ayarlar değiştirilir, THE Uygulama SHALL mevcut evrak şablonlarını yeni bilgilerle günceller.

---

### Gereksinim 6: Üret Ekranı — AI Destekli İçerik Üretimi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, yazılı sınav sorusu, sınıf içi etkinlik materyali ve rubrik üretmek istiyorum; böylece hazırlık sürecimi kısaltabilirim.

#### Kabul Kriterleri

1. THE Üret_Ekranı SHALL yazılı sınav, sınıf etkinliği, ders materyali ve rubrik üretim araçlarını listeler.
2. WHEN kullanıcı bir araç seçer, THE Üret_Ekranı SHALL konu/kazanım, sınıf, zorluk ve soru sayısı alanlarını gösterir.
3. WHERE Plan_Menüsü'nden "Üret" aksiyonu tetiklenirse, THE Üret_Ekranı SHALL ilgili kazanım ve sınıf bilgilerini otomatik doldurur.
4. WHEN üretim tamamlanır, THE Üret_Ekranı SHALL üretilen içeriği önizleme olarak gösterir ve PDF/Word indirme seçeneği sunar.
5. THE Üret_Ekranı SHALL her üretim işleminin kaç jeton harcayacağını işlem öncesinde gösterir.
6. IF jeton bakiyesi sıfırsa, THEN THE Üret_Ekranı SHALL premium yükseltme veya jeton satın alma seçeneğini sunar.
7. WHERE premium abonelik aktifse, THE Üret_Ekranı SHALL jeton limiti olmaksızın tüm araçlara erişim sağlar.

---

### Gereksinim 7: Ders Programı Girişi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, haftalık ders programımı uygulamaya girmek istiyorum; böylece Ana_Ekran'da o günün derslerini sırasıyla görebileyim.

#### Kabul Kriterleri

1. THE Ders_Programı SHALL haftanın 5 günü × en az 8 ders saati için giriş yapılabilen bir ızgara sunar.
2. WHEN kullanıcı bir ders saatine sınıf atar, THE Ders_Programı SHALL o sınıf için mevcut planı otomatik bağlar.
3. THE Ders_Programı SHALL girilen programı localStorage ve Supabase'e kaydeder.
4. WHEN ders programı kaydedilir, THE Ana_Ekran SHALL o günün derslerini sırasıyla gösterecek şekilde güncellenir.
5. IF aynı saate birden fazla sınıf atanmaya çalışılırsa, THEN THE Ders_Programı SHALL çakışma uyarısı gösterir.

---

### Gereksinim 8: Bildirim ve Takvim Sistemi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, önemli tarihleri (ZHA toplantısı, not girişi son günü, vb.) uygulamaya eklemek ve yaklaşınca bildirim almak istiyorum; böylece hiçbir son tarihi kaçırmayayım.

#### Kabul Kriterleri

1. THE Plan_Menüsü SHALL önemli tarihlerin eklendiği bir takvim bileşeni içerir.
2. WHEN kullanıcı yeni bir önemli tarih ekler, THE Uygulama SHALL tarihi, başlığı ve kategoriyi (ZHA, not girişi, veli toplantısı, vb.) kaydeder.
3. WHEN önemli bir tarih 7 gün veya daha az kalmışsa, THE Uygulama SHALL Ana_Ekran'da hatırlatma kartı gösterir.
4. WHEN önemli bir tarih 1 gün kalmışsa, THE Uygulama SHALL in-app bildirim gönderir.
5. THE Uygulama SHALL MEB takvimindeki resmi tatil ve dönem başlangıç/bitiş tarihlerini otomatik olarak takvime ekler.

---

### Gereksinim 9: Premium / Freemium Katmanı

**Kullanıcı Hikayesi:** Bir öğretmen olarak, ücretsiz katmanda temel özellikleri kullanmak, premium katmanda ise sınırsız üretim ve ek evrak şablonlarına erişmek istiyorum; böylece ihtiyacıma göre plan seçebileyim.

#### Kabul Kriterleri

1. THE Uygulama SHALL ücretsiz katmanda yıllık plan oluşturma, temel evrak indirme ve aylık 3 jeton üretim hakkı sunar.
2. THE Uygulama SHALL premium katmanda sınırsız jeton, tüm evrak kategorileri ve öncelikli destek sunar.
3. WHEN kullanıcı premium özelliğe erişmeye çalışır, THE Uygulama SHALL premium avantajlarını açıklayan bir yükseltme ekranı gösterir.
4. THE Uygulama SHALL premium fiyatlandırmayı ve abonelik koşullarını şeffaf biçimde gösterir.
5. IF premium abonelik sona ererse, THEN THE Uygulama SHALL kullanıcıyı bilgilendirir ve ücretsiz katmana geçişi sorunsuz yapar.

---

### Gereksinim 10: Performans ve Erişilebilirlik

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamanın hızlı yüklenmesini ve mobil cihazımda sorunsuz çalışmasını istiyorum; böylece sınıf aralarında bile hızlıca kullanabilirim.

#### Kabul Kriterleri

1. THE Uygulama SHALL ilk anlamlı içeriği (FCP) 3G bağlantıda 3 saniye içinde gösterir.
2. THE Uygulama SHALL tüm dokunma hedeflerini en az 44×44px boyutunda tutar.
3. THE Uygulama SHALL offline modda daha önce yüklenmiş planları ve evrakları gösterir.
4. THE Uygulama SHALL ekran okuyucularla uyumlu ARIA etiketleri kullanır.
5. WHEN ağ bağlantısı kesilir, THE Uygulama SHALL kullanıcıya offline modda olduğunu bildirir ve mevcut içeriği göstermeye devam eder.
