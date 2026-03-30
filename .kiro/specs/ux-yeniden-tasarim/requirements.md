# Gereksinimler Belgesi

## Giriş

Bu belge, Yıllık Plan uygulamasının kapsamlı UX yeniden tasarımını tanımlar. Mevcut uygulamada tespit edilen 10 temel kullanılabilirlik sorunu ele alınmakta; öğretmenlerin uygulamayı daha hızlı, daha kolay ve daha güvenle kullanabilmesi hedeflenmektedir. Teknik yığın: React + TypeScript + Tailwind CSS + Vite, Supabase auth/sync, localStorage, React Router.

---

## Sözlük

- **Uygulama**: Yıllık Plan web uygulaması
- **Onboarding_Akışı**: Yeni kullanıcının ilk kez uygulamayı açtığında geçtiği kurulum süreci
- **Ana_Ekran**: `/app` rotasındaki `AppHomeScreen` bileşeni
- **Bu_Hafta_Kartı**: Ana ekranda aktif haftanın kazanımını gösteren kart bileşeni
- **İlerleme_Göstergesi**: Tamamlanan/toplam hafta bilgisini gösteren UI öğesi
- **Boş_Durum**: Kullanıcının henüz hiç planı olmadığı ekran durumu
- **Bildirim_Sistemi**: Toast, inline mesaj ve geçici metin gibi kullanıcı geri bildirim mekanizmalarının tümü
- **Alt_Navigasyon**: Ekranın altındaki sekme çubuğu (`AppLayout` içindeki `nav` bileşeni)
- **Renk_Sistemi**: Uygulamada kullanılan renk paleti ve anlam eşleştirmeleri
- **Auth_Modalı**: Kullanıcı girişi/kaydı için açılan modal bileşeni (`AuthModal`)
- **Öğretmen**: Uygulamanın birincil kullanıcısı

---

## Gereksinimler

### Gereksinim 1: Onboarding — Değer Önce, Form Sonra

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamaya ilk girdiğimde ne işe yaradığını anlamak istiyorum; böylece form doldurmadan önce uygulamanın bana ne kazandıracağını görebilir ve devam etmeye motive olabilirim.

#### Kabul Kriterleri

1. WHEN kullanıcı uygulamayı ilk kez açtığında, THE Onboarding_Akışı SHALL kullanıcıya örnek bir plan ekranı veya somut değer önerisi göstermelidir; form adımlarını göstermeden önce.
2. WHEN kullanıcı değer önizlemesini gördükten sonra "Başla" veya benzeri bir eyleme tıkladığında, THE Onboarding_Akışı SHALL branş ve sınıf seçim adımlarına geçmelidir.
3. THE Onboarding_Akışı SHALL değer önizleme adımında herhangi bir zorunlu form alanı içermemelidir.
4. WHEN kullanıcı onboarding'i tamamladığında, THE Uygulama SHALL onboarding tamamlandı bilgisini kalıcı olarak kaydetmelidir; böylece sonraki açılışlarda tekrar gösterilmez.
5. IF kullanıcı onboarding sırasında geri tuşuna basarsa, THEN THE Onboarding_Akışı SHALL önceki adıma dönmelidir; uygulamadan çıkmadan.

---

### Gereksinim 2: Ana Ekran İçerik Hiyerarşisi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamayı açtığımda en önemli bilgiyi (bu haftanın kazanımı) hemen görmek istiyorum; böylece karşılama mesajını okumak zorunda kalmadan doğrudan işime odaklanabilirim.

#### Kabul Kriterleri

1. THE Ana_Ekran SHALL Bu_Hafta_Kartını sayfanın görünür alanındaki ilk içerik öğesi olarak konumlandırmalıdır.
2. THE Ana_Ekran SHALL karşılama mesajını (günaydın/iyi günler vb.) Bu_Hafta_Kartının altında veya ikincil bir konumda göstermelidir.
3. WHEN kullanıcı Ana_Ekranı açtığında, THE Bu_Hafta_Kartı SHALL herhangi bir kaydırma yapmadan ekranda görünür olmalıdır.
4. THE Ana_Ekran SHALL birincil içerik (Bu_Hafta_Kartı) ile ikincil içerik (hızlı erişim butonları) arasında görsel hiyerarşiyi net biçimde ortaya koymalıdır.

---

### Gereksinim 3: Anlamlı İlerleme Göstergesi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, yıllık planımda ne kadar ilerlediğimi anlamlı bir bağlamda görmek istiyorum; böylece "23/36 hafta" gibi ham sayılar yerine "13 hafta kaldı, Haziran'da biteceksin" gibi motivasyon verici bilgilerle planlama yapabilirim.

#### Kabul Kriterleri

1. THE İlerleme_Göstergesi SHALL kalan hafta sayısını ve tahmini bitiş ayını metin olarak göstermelidir (örnek: "13 hafta kaldı · Haziran'da tamamlanır").
2. WHEN tüm haftalar tamamlandığında, THE İlerleme_Göstergesi SHALL tebrik mesajı göstermelidir.
3. WHEN plan dönemi dışındayken, THE İlerleme_Göstergesi SHALL bir sonraki aktif haftanın başlangıç tarihini göstermelidir.
4. THE İlerleme_Göstergesi SHALL ham sayısal oran (örn. "23/36") yerine bağlamsal ve motivasyon odaklı dil kullanmalıdır.
5. WHEN ilerleme yüzdesi hesaplanamıyorsa (plan verisi yoksa), THE İlerleme_Göstergesi SHALL boş veya hatalı veri göstermek yerine nötr bir durum mesajı göstermelidir.

---

### Gereksinim 4: Boş Durum — Sosyal Kanıt ve Değer Önerisi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, henüz plan oluşturmadığımda sadece bir form görmek yerine uygulamanın bana ne sağlayacağını anlamak istiyorum; böylece plan oluşturmaya motive olabilirim.

#### Kabul Kriterleri

1. WHEN kullanıcının hiç planı yokken Ana_Ekran açıldığında, THE Boş_Durum SHALL uygulamanın somut faydalarını açıklayan en az bir değer önerisi öğesi göstermelidir.
2. THE Boş_Durum SHALL sosyal kanıt içeriği (örn. kullanıcı sayısı, örnek plan önizlemesi veya kısa bir başarı hikayesi) göstermelidir.
3. THE Boş_Durum SHALL plan oluşturma eylemini başlatan belirgin bir birincil aksiyon butonu içermelidir.
4. WHEN kullanıcı boş durumdaki birincil aksiyon butonuna tıkladığında, THE Onboarding_Akışı SHALL Gereksinim 1'deki değer-önce akışını başlatmalıdır.
5. THE Boş_Durum SHALL yalnızca form alanlarından oluşmamalıdır; içerik ve motivasyon öğeleri form alanlarından önce gelmelidir.

---

### Gereksinim 5: Tutarlı Geri Bildirim Sistemi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, yaptığım işlemlerin sonucunu tutarlı ve anlaşılır biçimde görmek istiyorum; böylece toast, inline mesaj veya kaybolan metin gibi farklı geri bildirim türleri arasında kafam karışmaz.

#### Kabul Kriterleri

1. THE Bildirim_Sistemi SHALL tüm kullanıcı geri bildirimlerini (başarı, hata, bilgi, uyarı) tek bir merkezi bileşen üzerinden yönetmelidir.
2. THE Bildirim_Sistemi SHALL her bildirim türü için tutarlı görsel stil, konum ve süre kullanmalıdır.
3. WHEN bir işlem başarıyla tamamlandığında, THE Bildirim_Sistemi SHALL başarı bildirimini ekranın sabit bir konumunda (örn. üst veya alt orta) göstermelidir.
4. WHEN bir hata oluştuğunda, THE Bildirim_Sistemi SHALL hata bildirimini başarı bildirimiyle aynı konumda ancak farklı renk/ikonla göstermelidir.
5. THE Uygulama SHALL aynı anda birden fazla çakışan bildirim türü (toast + inline + geçici metin) göstermemelidir.
6. WHEN bir bildirim gösterildiğinde, THE Bildirim_Sistemi SHALL bildirimi en az 3 saniye ekranda tutmalıdır; kullanıcı kapatmadan önce.

---

### Gereksinim 6: Sadeleştirilmiş Navigasyon

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulama içinde nerede olduğumu her zaman bilmek ve 2 dokunuştan fazla derinliğe inmeden istediğim içeriğe ulaşmak istiyorum; böylece navigasyonda kaybolmam.

#### Kabul Kriterleri

1. THE Alt_Navigasyon SHALL en fazla 3 sekme içermelidir; "Ana", "Planım" ve profil/ayarlar erişimi.
2. WHILE kullanıcı herhangi bir alt sayfadayken (örn. hafta detayı), THE Alt_Navigasyon SHALL aktif üst sekmeyi vurgulu olarak göstermelidir.
3. THE Uygulama SHALL kullanıcının herhangi bir içeriğe en fazla 2 navigasyon adımında ulaşmasını sağlamalıdır.
4. WHEN kullanıcı Alt_Navigasyondaki aktif sekmeye tekrar tıkladığında, THE Uygulama SHALL o sekmenin kök sayfasına dönmelidir.
5. THE Alt_Navigasyon SHALL profil/ayarlar erişimini avatar veya ikon aracılığıyla sağlamalıdır; ayrı bir sekme yerine.

---

### Gereksinim 7: Öğretmene Uygun Dil

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamada teknik jargon görmek istemiyorum; böylece "Müfredat", "Export", "Supabase sync" gibi yazılım terimleri yerine benim dilimde ifadeler görürüm.

#### Kabul Kriterleri

1. THE Uygulama SHALL kullanıcıya yönelik tüm metin içeriklerinde teknik terimler (örn. "Supabase", "sync", "export", "localStorage", "müfredat") kullanmamalıdır.
2. THE Uygulama SHALL teknik terimlerin yerine öğretmen diline uygun karşılıklar kullanmalıdır (örn. "Supabase sync" → "Buluta kaydediliyor", "Export" → "Dışa aktar" veya "Paylaş", "Müfredat" → "Ders içeriği" veya "Kazanımlar").
3. WHEN sistem durumu mesajları gösterildiğinde (senkronizasyon, yükleme vb.), THE Uygulama SHALL bu mesajları teknik terim içermeyen, öğretmen perspektifinden anlamlı ifadelerle göstermelidir.
4. THE Uygulama SHALL hata mesajlarını teknik hata kodları veya sistem terimleri içermeden, kullanıcının anlayabileceği eylem odaklı dille göstermelidir.

---

### Gereksinim 8: Tek El Kullanımı — Başparmak Erişim Bölgesi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, uygulamayı tek elimle kullanabilmek istiyorum; böylece sık kullandığım butonlara başparmağımla kolayca ulaşabilirim ve ekranın üst kısmına uzanmak zorunda kalmam.

#### Kabul Kriterleri

1. THE Uygulama SHALL birincil aksiyon butonlarını (plan oluştur, hafta tamamla, kaydet) ekranın alt yarısında konumlandırmalıdır.
2. THE Alt_Navigasyon SHALL ekranın en altında sabit konumda kalmalı ve başparmakla kolayca erişilebilir olmalıdır.
3. THE Uygulama SHALL sık kullanılan etkileşim öğelerini (sınıf seçici, hafta geçişi) ekranın alt %60'lık alanında konumlandırmalıdır.
4. WHEN modal veya bottom sheet açıldığında, THE Uygulama SHALL birincil aksiyon butonunu ekranın alt kısmına yerleştirmelidir; klavye açık olsa bile görünür kalacak şekilde.
5. THE Uygulama SHALL yıkıcı eylemler (silme, çıkış) için onay adımını başparmak erişim bölgesinde göstermelidir.

---

### Gereksinim 9: Güçlü Auth Motivasyonu

**Kullanıcı Hikayesi:** Bir öğretmen olarak, neden hesap oluşturmam gerektiğini somut faydalarla anlamak istiyorum; böylece "tüm cihazlarda erişim" gibi genel bir mesaj yerine benim için gerçekten değerli olan nedenleri görürüm.

#### Kabul Kriterleri

1. THE Auth_Modalı SHALL giriş yapmayı teşvik eden mesajda en az iki somut, öğretmene özgü fayda göstermelidir (örn. "Geçen yılın planını tekrar kullan", "Meslektaşlarınla paylaş", "Telefon değişse de planların kaybolmaz").
2. THE Auth_Modalı SHALL "tüm cihazlarda erişim" ifadesini tek başına birincil motivasyon mesajı olarak kullanmamalıdır.
3. WHEN kullanıcı plan oluşturduktan sonra giriş yapmaya yönlendirildiğinde, THE Auth_Modalı SHALL kullanıcının az önce oluşturduğu planı referans alarak kişiselleştirilmiş bir motivasyon mesajı göstermelidir.
4. THE Auth_Modalı SHALL giriş/kayıt formunu motivasyon içeriğinin altında göstermelidir; motivasyon içeriği formdan önce gelmelidir.
5. WHEN kullanıcı Auth_Modalını kapattığında, THE Uygulama SHALL kullanıcının mevcut işlemine devam etmesine izin vermelidir; zorla giriş yaptırmadan.

---

### Gereksinim 10: Anlamlı Renk Sistemi

**Kullanıcı Hikayesi:** Bir öğretmen olarak, hangi öğelerin tıklanabilir olduğunu ve hangi rengin ne anlama geldiğini sezgisel olarak anlamak istiyorum; böylece mavi rengin hem başlık hem link hem de aktif durum için kullanıldığı bir arayüzde kafam karışmaz.

#### Kabul Kriterleri

1. THE Renk_Sistemi SHALL tıklanabilir öğeler (buton, link, aksiyon) için tutarlı ve diğer öğelerden ayırt edilebilir bir renk kullanmalıdır.
2. THE Renk_Sistemi SHALL başlık/etiket metinleri ile tıklanabilir öğeler için farklı renkler kullanmalıdır; aynı rengi her iki amaç için kullanmamalıdır.
3. THE Renk_Sistemi SHALL aktif/seçili durum, tıklanabilir durum ve bilgi metni için birbirinden görsel olarak ayrışan renk veya stil kullanmalıdır.
4. THE Uygulama SHALL renk körü kullanıcılar için renk dışında en az bir ek görsel ipucu (ikon, alt çizgi, kalınlık farkı) sağlamalıdır; tıklanabilir öğeleri ayırt etmek için.
5. THE Renk_Sistemi SHALL bir renk kullanım kılavuzu (tasarım token'ları veya Tailwind sınıf isimlendirme kuralı) tanımlamalıdır; böylece gelecekteki geliştirmelerde tutarlılık korunur.
