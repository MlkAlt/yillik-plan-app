# Uygulama Planı: Teknik Borç ve Mimari İyileştirmeler

## Genel Bakış

Bu plan, beş bağımsız mimari iyileştirmeyi sıralı adımlarla hayata geçirir. Her adım bir öncekinin üzerine inşa edilir; `storageKeys.ts` tüm diğer görevlerin temelini oluşturduğundan ilk sıradadır.

## Görevler

- [x] 1. `storageKeys.ts` dosyasını oluştur
  - `src/lib/storageKeys.ts` dosyasını oluştur
  - `StorageKeys` nesnesini `as const` ile 9 anahtar içerecek şekilde tanımla: `TUM_PLANLAR`, `AKTIF_SINIF`, `TAMAMLANAN_HAFTALAR`, `HAFTA_NOTLARI`, `ONBOARDING_TAMAMLANDI`, `AUTH_PROMPT_GOSTERILDI`, `OGRETMEN_AYARLARI`, `BILDIRIM_AKTIF`, `BILDIRIM_SON_HAFTA`
  - `StorageKey` union tipini dışa aktar
  - _Gereksinimler: 2.1, 2.2_

  - [ ]* 1.1 `storageKeys.test.ts` birim testini yaz
    - `StorageKeys`'in tam olarak 9 anahtar içerdiğini doğrula
    - Her anahtarın beklenen string değerine sahip olduğunu kontrol et
    - _Gereksinimler: 2.2_

- [x] 2. `planValidator.ts` dosyasını oluştur
  - `src/lib/planValidator.ts` dosyasını oluştur
  - `isPlanEntry(value: unknown): value is PlanEntry` tip koruyucusunu yaz
  - `validatePlanRows(rows: unknown[]): PlanEntry[]` fonksiyonunu yaz; geçersiz satırları `console.error` ile logla ve filtrele
  - _Gereksinimler: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.1 `planValidator.test.ts` birim ve özellik testlerini yaz
    - `isPlanEntry` için geçerli nesneyi kabul eden birim testi
    - `isPlanEntry` için eksik alan içeren nesneyi reddeden birim testi
    - **Özellik 1: Geçersiz Supabase satırları filtrelenir**
    - **Doğrular: Gereksinimler 5.3, 5.4**
    - `fast-check` ile `validPlanEntryArb` ve `invalidRowArb` arbitrarylerini tanımla; `validatePlanRows` çıktısının her elemanının `isPlanEntry`'yi geçtiğini doğrula (100 çalıştırma)
    - **Özellik 2: Plan gidiş-dönüş tutarlılığı**
    - **Doğrular: Gereksinim 5.6**
    - `fast-check` ile geçerli `PlanEntry` üret; Supabase satırına dönüştürüp geri okuyunca `sinif`, `ders`, `yil`, `tip` alanlarının korunduğunu doğrula (100 çalıştırma)
    - _Gereksinimler: 5.2, 5.3, 5.4, 5.6_

- [x] 3. `planSync.ts`'i `planValidator` ile güncelle
  - `planValidator.ts`'den `validatePlanRows`'u içe aktar
  - `fetchPlansFromSupabase` içindeki `data.map(...)` sonucunu `validatePlanRows` ile sar
  - `plan_json` ve `rows_json` için `as unknown as object` cast'lerini kaldır
  - `syncPlansToSupabase` içindeki `as unknown as object` cast'lerini kaldır
  - _Gereksinimler: 5.3, 5.4, 5.5_

- [x] 4. `usePlanYonetimi` hook'unu oluştur
  - `src/hooks/usePlanYonetimi.ts` dosyasını oluştur
  - `App.tsx`'ten `planlar`, `aktifSinif`, `yuklendi` state'lerini taşı
  - `handlePlanEkle`, `handlePlanSil`, `handleSinifSec` fonksiyonlarını taşı
  - `authPromptAcik` state'ini ve `setAuthPromptAcik`'i taşı
  - `localStorage` erişimlerinde `StorageKeys` sabitlerini kullan (ham string literal kullanma)
  - `user: User | null` parametresini dışarıdan al (bağımlılık enjeksiyonu)
  - `aktifEntry` hesaplamasını hook içinde yap
  - _Gereksinimler: 2.3, 3.1, 3.2, 3.6_

  - [ ]* 4.1 `usePlanYonetimi.test.ts` birim testini yaz
    - Hook'un `handlePlanEkle`, `handlePlanSil`, `handleSinifSec` fonksiyonlarını döndürdüğünü doğrula
    - `handlePlanEkle` çağrıldığında `planlar` state'inin güncellendiğini test et
    - _Gereksinimler: 3.2_

- [x] 5. `useAuthSync` hook'unu oluştur
  - `src/hooks/useAuthSync.ts` dosyasını oluştur
  - `App.tsx`'ten `user`, `syncing` state'lerini ve `onAuthStateChange` useEffect'ini taşı
  - `tamamlananlar` state'ini ve bulut progress merge mantığını taşı
  - `localStorage` erişimlerinde `StorageKeys` sabitlerini kullan
  - `{ user, syncing, tamamlananlar }` döndür
  - _Gereksinimler: 2.3, 3.3, 3.4, 3.7_

- [x] 6. `App.tsx`'i hook'ları kullanacak şekilde yeniden yaz
  - `usePlanYonetimi` ve `useAuthSync` hook'larını içe aktar ve kullan
  - Taşınan tüm state ve fonksiyonları `App.tsx`'ten kaldır
  - `App.tsx` 80 satırı geçmemeli
  - Eski rotaları (`/olustur`, `/yukle`, `/plan`) `<Navigate>` bileşenleriyle yeni adreslere yönlendir
  - `/app/yukle` rotasını `AppLayout` içinde `YuklemePage` ile ekle
  - `handleYukleLegacy` fonksiyonunu `usePlanYonetimi`'den gelen `handlePlanEkle`'ye bağla
  - _Gereksinimler: 1.1, 1.2, 1.3, 1.4, 1.5, 3.5_

  - [ ]* 6.1 `routing.test.tsx` yönlendirme testlerini yaz
    - `/olustur` → `/app` yönlendirmesini doğrula
    - `/yukle` → `/app/yukle` yönlendirmesini doğrula
    - `/plan` → `/app/plan` yönlendirmesini doğrula
    - `/app/yukle` rotasının `AppLayout` içinde render edildiğini doğrula
    - _Gereksinimler: 1.2, 1.3, 1.4, 4.1, 4.2_

- [x] 7. `YuklemePage`'i `/app/yukle` altında `AppLayout` içine taşı
  - `YuklemePage`'deki dış `<div className="min-h-screen bg-gradient-to-br ...">` wrapper'ını kaldır
  - İçeriği doğrudan `<div className="p-4 max-w-md mx-auto">` ile sar
  - `onYukle` prop'unu `usePlanYonetimi`'den gelen `handlePlanEkle`'ye bağlayacak şekilde `App.tsx`'teki rotayı güncelle
  - _Gereksinimler: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Checkpoint — Tüm testlerin geçtiğinden emin ol
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 9. `HomePage` butonlarını güncelle
  - "Hemen Başla" butonunun hedefini `/olustur`'dan `/app`'e değiştir
  - "Dosyadan Yükle" butonunun hedefini `/yukle`'den `/app/yukle`'ye değiştir
  - _Gereksinimler: 1.6, 1.7_

- [x] 10. Son Checkpoint — Tüm testlerin geçtiğinden emin ol
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır; hızlı MVP için atlanabilir
- Her görev izlenebilirlik için ilgili gereksinimlere referans verir
- Özellik testleri evrensel doğruluk özelliklerini, birim testleri ise belirli örnekleri doğrular
- `storageKeys.ts` tüm diğer görevlerin bağımlılığıdır; önce tamamlanmalıdır
