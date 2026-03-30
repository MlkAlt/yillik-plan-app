# Uygulama Planı: UX Yeniden Tasarım

## Genel Bakış

Öncelik sırasına göre 9 ana görev: ToastProvider (temel bağımlılık) → Navigasyon → Ana ekran hiyerarşisi → İlerleme göstergesi → Onboarding → Boş durum → AuthModal → Dil temizliği → Renk token sistemi.

## Görevler

- [x] 1. ToastProvider — Merkezi Bildirim Sistemi
  - [x] 1.1 `src/lib/toast.tsx` dosyasını oluştur: `Toast` arayüzü, `ToastContext`, `ToastProvider` bileşeni ve `useToast` hook'u
    - `ToastTipi`: `'basari' | 'hata' | 'bilgi' | 'uyari'`
    - `goster(mesaj, tip?, sure?)` ve `kapat(id)` metodları
    - Aynı anda yalnızca 1 toast: yeni toast geldiğinde önceki hemen kapanır
    - Minimum süre 3000ms (Gereksinim 5.6)
    - _Gereksinimler: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 1.2 Özellik testi: Toast minimum 3 saniye görünür kalır
    - **Özellik 3: Toast bildirimi minimum 3 saniye görünür kalır**
    - **Doğrular: Gereksinim 5.6**
    - `fast-check` ile: rastgele mesaj + tip kombinasyonları, 2999ms sonra toast hâlâ mevcut olmalı

  - [ ]* 1.3 Özellik testi: Aynı anda yalnızca bir bildirim görünür
    - **Özellik 4: Aynı anda yalnızca bir toast görünür**
    - **Doğrular: Gereksinim 5.5**
    - `fast-check` ile: 2–10 ardışık `goster()` çağrısı sonrası `toastListesi.length <= 1`

  - [x] 1.4 Toast UI bileşenini `src/lib/toast.tsx` içine ekle
    - `fixed bottom-20` konumlandırma (alt nav üstü)
    - Her tip için farklı renk/ikon (başarı: yeşil ✓, hata: kırmızı ✕, bilgi: mavi ℹ, uyarı: sarı ⚠)
    - Kapatma butonu
    - _Gereksinimler: 5.2, 5.3, 5.4_

  - [x] 1.5 `ToastProvider`'ı `src/App.tsx`'e ekle — tüm route'ları saracak şekilde
    - `AppHomeScreen`, `AppSettingsScreen`, `HaftaDetayPage` içindeki inline bildirim state'lerini (`kaydedildi`, `notKaydedildi`, `syncing` mesajı) `useToast()` çağrılarıyla değiştir
    - _Gereksinimler: 5.1, 5.5_

- [x] 2. Navigasyon Sadeleştirmesi — AppLayout Bottom Nav
  - [x] 2.1 `src/components/AppLayout/AppLayout.tsx` içindeki `tabs` dizisini 2 sekmeye indir: `Ana` ve `Planım`
    - Üçüncü öğeyi avatar butonuna dönüştür → `/app/ayarlar` yönlendirmesi
    - Avatar butonu: mevcut baş harf / 👤 ikonu korunur
    - _Gereksinimler: 6.1, 6.5_

  - [ ]* 2.2 Birim testi: Alt navigasyon en fazla 3 öğe içerir
    - Sekme sayısının `<= 3` olduğunu ve avatar butonunun ayrı sekme olmadığını doğrula
    - _Gereksinimler: 6.1, 6.5_

  - [x] 2.3 Aktif sekmeye tekrar tıklandığında kök path'e dön
    - `navigate(tab.path, { replace: true })` kullan
    - `/app/hafta/:no` rotasında `Planım` sekmesi aktif kalmalı (mevcut mantık korunur)
    - _Gereksinimler: 6.2, 6.4_

- [x] 3. Ana Ekran İçerik Hiyerarşisi — AppHomeScreen
  - [x] 3.1 `src/pages/AppHomeScreen.tsx` içinde içerik sırasını yeniden düzenle
    - Yeni sıra: `BuHaftaKarti` → `IlerlemeGostergesi` → karşılama mesajı (küçültülmüş) → hızlı erişim
    - Karşılama `h1` → `p` veya küçük `h2` olarak görsel ağırlığını kaybeder
    - `BuHaftaKarti` fold üstünde, herhangi bir kaydırma olmadan görünür
    - _Gereksinimler: 2.1, 2.2, 2.3, 2.4_

- [x] 4. IlerlemeGostergesi Bileşeni
  - [x] 4.1 `src/components/IlerlemeGostergesi/IlerlemeGostergesi.tsx` dosyasını oluştur
    - `ilerlemeMetniHesapla(props)` saf fonksiyonunu aynı dosyaya ekle
    - `toplam === 0` → nötr mesaj; `tamamlanan >= toplam` → tebrik; normal → `"{kalan} hafta kaldı · {ay}'da tamamlanır"`
    - Plan dönemi dışı: sonraki aktif haftanın başlangıç tarihini göster
    - _Gereksinimler: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Özellik testi: İlerleme metni ham oran içermez
    - **Özellik 5: İlerleme metni bağlamsal ve motivasyon odaklı**
    - **Doğrular: Gereksinimler 3.1, 3.4**
    - `fast-check` ile: `tamamlanan < toplam` koşulunda metin `"{tamamlanan}/{toplam}"` formatı içermemeli

  - [ ]* 4.3 Özellik testi: Veri yokken nötr mesaj döner
    - **Özellik 6: Plan verisi yokken ilerleme göstergesi nötr mesaj gösterir**
    - **Doğrular: Gereksinim 3.5**
    - `toplam === 0` için `metin.length > 0` olmalı

  - [ ]* 4.4 Özellik testi: Tamamlandı tebrik mesajı
    - **Özellik 7: Tüm haftalar tamamlandığında tebrik mesajı gösterilir**
    - **Doğrular: Gereksinim 3.2**
    - `tamamlanan >= toplam && toplam > 0` için metin `'🎉'` veya `'tamamla'` içermeli

  - [x] 4.5 `IlerlemeGostergesi`'ni `AppHomeScreen`'e entegre et — `BuHaftaKarti`'nın hemen altına
    - Mevcut `{done}/{total} hafta tamamlandı` metnini kaldır
    - _Gereksinimler: 3.1, 3.4_

- [ ] 5. Kontrol Noktası — Tüm testler geçmeli
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

- [x] 6. Onboarding Yeniden Yapılandırması — DegerOnizleme Adımı
  - [x] 6.1 `AppHomeScreen` içindeki onboarding akışına `deger-onizleme` adımını ekle
    - `OnboardingAdim` tipi: `'deger-onizleme' | 'brans' | 'sinif' | 'tamamlandi'`
    - `DegerOnizleme` adımı: örnek plan kartı (statik/mock), "Dakikalar içinde yıllık planın hazır" başlığı, "Başla →" butonu
    - Zorunlu form alanı YOK bu adımda
    - `data-testid="onboarding-deger-onizleme"` ekle
    - _Gereksinimler: 1.1, 1.2, 1.3_

  - [ ]* 6.2 Özellik testi: Onboarding tamamlandı bilgisi kalıcı kaydedilir
    - **Özellik 1: Onboarding tamamlandı bilgisi kalıcı olarak kaydedilir**
    - **Doğrular: Gereksinim 1.4**
    - `fast-check` ile: onboarding tamamlandıktan sonra `localStorage.getItem('onboarding-tamamlandi') === '1'` ve yeniden render'da `onboarding-deger-onizleme` görünmemeli

  - [ ]* 6.3 Özellik testi: Onboarding geri tuşu önceki adıma döner
    - **Özellik 2: Onboarding geri tuşu önceki adıma döner**
    - **Doğrular: Gereksinim 1.5**
    - `fast-check` ile: adım indeksi 1–2 için `geriGit()` sonrası `adim === adimIndeksi - 1`

  - [x] 6.4 Geri tuşu davranışını uygula: her adımda `onGeri` callback'i ile önceki adıma dön
    - Tarayıcı history'ye push yapılmaz
    - İlk adımda (değer önizleme) geri tuşu yok
    - _Gereksinimler: 1.5_

- [x] 7. Boş Durum Ekranı — Değer Önerisi + Sosyal Kanıt
  - [x] 7.1 `AppHomeScreen` içindeki `planlar.length === 0` dalını `BosdurumuEkrani` bileşenine taşı
    - `src/components/BosdurumuEkrani/BosdurumuEkrani.tsx` oluştur
    - İçerik: ikon + başlık, 3 madde somut fayda listesi, sosyal kanıt (örn. "1.000+ öğretmen kullanıyor"), birincil aksiyon butonu "Planımı Oluştur →"
    - Form alanları YOK — buton OnboardingFlow'u tetikler
    - _Gereksinimler: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 7.2 Birim testi: Boş durum ekranı değer önerisi ve sosyal kanıt içerir
    - `planlar.length === 0` durumunda değer önerisi, sosyal kanıt ve birincil aksiyon butonunun render edildiğini doğrula
    - Form alanlarının içerikten sonra geldiğini doğrula
    - _Gereksinimler: 4.1, 4.2, 4.5_

- [x] 8. AuthModal Güçlendirmesi — planBaglami + Motivasyon İçeriği
  - [x] 8.1 `AuthModal` bileşenine `planBaglami?: { ders: string; sinif: string }` prop'u ekle
    - `prompt` modunda en az 2 somut öğretmene özgü fayda göster
    - `planBaglami` varsa: "Az önce oluşturduğun {ders} planını kaydet" kişiselleştirilmiş mesajı
    - Motivasyon içeriği DOM sırasında form alanlarından önce
    - "Şimdi değil" butonu her zaman görünür
    - _Gereksinimler: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 8.2 Özellik testi: Auth modalı motivasyon içeriği formdan önce gelir
    - **Özellik 8: Auth modalı motivasyon içeriği formdan önce gelir**
    - **Doğrular: Gereksinim 9.4**
    - `prompt` modunda motivasyon bölümünün DOM'da form alanlarından önce render edildiğini doğrula

  - [ ]* 8.3 Birim testi: AuthModal prompt modu
    - En az 2 somut fayda maddesinin render edildiğini doğrula
    - `planBaglami` verildiğinde ders adının motivasyon metninde geçtiğini doğrula
    - "Şimdi değil" butonunun her zaman görünür olduğunu doğrula
    - _Gereksinimler: 9.1, 9.3, 9.5_

  - [x] 8.4 `App.tsx` içindeki `AuthModal` çağrısını güncelle — `planBaglami` prop'unu ilet
    - Plan oluşturulduktan sonra gösterilen prompt'ta aktif planın `ders` ve `sinif` bilgisini geç
    - _Gereksinimler: 9.3_

- [x] 9. Dil Temizliği — Teknik Jargon Kaldırma
  - [x] 9.1 Kullanıcıya yönelik tüm metinlerde teknik terimleri öğretmen diline uygun karşılıklarla değiştir
    - `AppHomeScreen`: "Supabase" → yok, sync mesajı → "Planlar buluttan güncelleniyor..."
    - `AppSettingsScreen`: "Müfredat bulunamadı" → "Ders içeriği bulunamadı", "Supabase sync" → "Buluta kaydediliyor"
    - `AuthModal`: "tüm cihazlarda erişim" tek başına birincil mesaj olmamalı
    - Hata mesajları: teknik kod içermeden eylem odaklı Türkçe
    - _Gereksinimler: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.2 Birim testi: Sistem mesajları teknik terim içermez
    - Sync mesajının "Supabase" kelimesi içermediğini doğrula
    - Hata mesajlarının teknik kod içermediğini doğrula
    - _Gereksinimler: 7.1, 7.3_

- [x] 10. Renk Token Sistemi
  - [x] 10.1 `tailwind.config.js` dosyasına özel renk token'larını ekle
    - `aksiyon: '#2D5BE3'`, `aktif: '#F59E0B'`, `basari: '#059669'`, `icerik: '#1C1917'`, `ikincil: '#6B7280'`, `sinir: '#E7E5E4'`, `zemin: '#FAFAF9'`
    - _Gereksinimler: 10.1, 10.2, 10.3, 10.5_

  - [x] 10.2 `src/lib/renkTokenlari.ts` dosyasını oluştur
    - `RENKLER` sabitini export et: `AKSIYON`, `AKTIF`, `BASARI`, `ICERIK`, `IKINCIL` token'ları
    - _Gereksinimler: 10.5_

  - [x] 10.3 `AppLayout`, `AppHomeScreen`, `AppSettingsScreen` içindeki hardcoded renk değerlerini (`#2D5BE3`, `#F59E0B` vb.) Tailwind token sınıflarıyla değiştir
    - Başlık/etiket metinleri: `text-icerik`
    - Tıklanabilir öğeler: `text-aksiyon bg-aksiyon`
    - Aktif durum: `text-aktif bg-aktif`
    - Renk körü desteği: butonlarda dolgu + köşe yuvarlama, aktif sekmede nokta göstergesi + kalın yazı
    - _Gereksinimler: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 10.4 Birim testi: Renk token dosyası mevcut ve gerekli token'ları export ediyor
    - `src/lib/renkTokenlari.ts` dosyasının var olduğunu ve `RENKLER` sabitini export ettiğini doğrula
    - _Gereksinimler: 10.5_

- [x] 11. Son Kontrol Noktası — Tüm testler geçmeli
  - Tüm testlerin geçtiğini doğrula, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır, hızlı MVP için atlanabilir
- Her görev ilgili gereksinim numaralarına referans verir
- Özellik testleri `fast-check` kütüphanesi ile yazılır (minimum 100 iterasyon)
- Kontrol noktaları artımlı doğrulama sağlar
