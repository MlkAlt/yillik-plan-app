# Implementation Plan: Proje Değerlendirme ve Roadmap

## Overview

Üç fazlı geliştirme planı: Faz 1 temel UX (onboarding + AppHomeScreen), Faz 2 teknik borç ve UI tutarlılığı, Faz 3 auth/sync iyileştirmeleri ve lead toplama.

## Tasks

---

## Faz 1 — Temel UX (Onboarding + AppHomeScreen)

- [x] 1. Test altyapısını kur
  - `vitest`, `@testing-library/react`, `fast-check` paketlerini yükle
  - `vite.config.ts`'e `test: { environment: 'jsdom', globals: true }` ekle
  - `src/test/` dizini oluştur
  - _Requirements: 5.6_

- [x] 2. BranchStep'e arama ve popüler branş desteği ekle
  - [x] 2.1 `BranchStep.tsx`'e `query` state ve arama input'u ekle
    - `BRANCHES.filter(b => b.label.toLowerCase().includes(query.toLowerCase()))` ile filtreleme
    - `popular: true` olan branşları her zaman üstte göster
    - _Requirements: 1.4_
  - [ ]* 2.2 Property testi: Arama filtresi invariantı
    - **Property 1: Onboarding görünürlük invariantı**
    - **Validates: Requirements 1.1, 1.3**

- [x] 3. AppHomeScreen'i OnboardingCard ve DashboardView olarak yeniden yapılandır
  - [x] 3.1 `planlar.length === 0` iken `OnboardingCard` (PlanSelector sarmalayıcı), `planlar.length > 0` iken `DashboardView` render et
    - Mevcut `PlanSelector` bileşenini değiştirme, sadece koşullu render mantığını netleştir
    - `onboarding-tamamlandi` anahtarını `onComplete` callback'inde kaydet
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 3.2 Property testi: Onboarding görünürlük invariantı
    - **Property 1: Onboarding görünürlük invariantı**
    - **Validates: Requirements 1.1, 1.3**
  - [ ]* 3.3 Property testi: Onboarding tamamlama round-trip
    - **Property 2: Onboarding tamamlama round-trip**
    - **Validates: Requirements 1.2**

- [x] 4. Müfredat uyarı mekanizmasını ekle
  - [x] 4.1 `PlanSelector/index.tsx`'te `handleConfirm` sonrası `hasMufredat` kontrolü yap
    - `eksikMufredat` listesi varsa `mufredatUyari` state'ini set et
    - Uyarıyı inline mesaj veya toast olarak göster
    - _Requirements: 1.6, 3.4_
  - [ ]* 4.2 Property testi: Müfredat bulunamadığında boş plan invariantı
    - **Property 3: Müfredat bulunamadığında boş plan invariantı**
    - **Validates: Requirements 1.6, 3.4**

- [x] 5. AppHomeScreen DashboardView bileşenlerini iyileştir
  - [x] 5.1 `BuHaftaKarti`'nda `tamamlananlar` state'ini `useEffect` ile Supabase sync sonrası yenile
    - Mount'ta değil, `syncing` prop'u `false`'a döndüğünde localStorage'dan yeniden oku
    - _Requirements: 2.1, 2.6_
  - [x] 5.2 `SyncIndicator` bileşenini `syncing` prop'una bağla
    - `syncing === true` iken görünür, `false` iken gizle
    - _Requirements: 2.6_
  - [x] 5.3 `QuickActions` bölümüne "Plan Oluştur" ve "Dosya Yükle" butonlarını ekle
    - `/olustur` ve `/yukle` rotalarına yönlendirme
    - _Requirements: 2.5, 2.7_

- [x] 6. Checkpoint — Faz 1 testleri
  - Ensure all tests pass, ask the user if questions arise.

---

## Faz 2 — Teknik Borç + UI Tutarlılığı

- [x] 7. `guessDate()` fonksiyonunu dinamik yıl hesaplamasına geçir
  - [x] 7.1 `src/lib/fileParser.ts`'teki hardcode `2025`/`2026` değerlerini kaldır
    - `aktifYilBul()` fonksiyonunu `takvimUtils.ts`'ten import et
    - `guessDate(ay, gun, akademikYil?)` imzasına `akademikYil` parametresi ekle
    - Eylül-Aralık → başlangıç yılı, Ocak-Ağustos → başlangıç yılı + 1
    - _Requirements: 5.1_
  - [ ]* 7.2 Property testi: `guessDate()` yıl hesaplama doğruluğu
    - **Property 6: `guessDate()` yıl hesaplama doğruluğu**
    - **Validates: Requirements 5.1**

- [x] 8. Branş verisini tek kaynağa (branchConfig.ts) taşı
  - [x] 8.1 `branchConfig.ts`'e `getSiniflarForDers(ders: string): string[]` fonksiyonu ekle
    - `BRANCHES` dizisinden `lessonId` ile eşleştir, `classes` döndür
    - _Requirements: 5.3_
  - [x] 8.2 `dersSinifMap.ts`'teki `DERS_SINIF_MAP` ve `DERS_GRUPLARI`'nı `branchConfig.ts`'ten re-export et
    - `AppSettingsScreen` ve `exportUtils.ts` import'larını `branchConfig.ts`'e yönlendir
    - _Requirements: 5.3_

- [x] 9. `HaftaDetayPage`'i prop tabanlı veri alımına geçir
  - [x] 9.1 `HaftaDetayPage`'e `entry: PlanEntry | null` prop'u ekle
    - `App.tsx` route'unda `aktifEntry` prop olarak geçir
    - `tamamlanan-haftalar` ve `hafta-notlari` localStorage okumalarını koru (progress verisi global)
    - _Requirements: 5.2_

- [x] 10. `console.log` ve `any` kullanımını temizle
  - [x] 10.1 Tüm `src/` altındaki `console.log` ifadelerini kaldır
    - _Requirements: 5.4_
  - [x] 10.2 TypeScript `any` kullanımlarını uygun tiplerle değiştir
    - `exportUtils.ts`, `fileParser.ts` ve `planSync.ts` öncelikli
    - _Requirements: 5.5_

- [x] 11. UI tutarlılık düzenlemeleri
  - [x] 11.1 Tüm kart bileşenlerinde `rounded-2xl`, `shadow-[0_1px_3px_rgba(0,0,0,0.06)]`, `border border-[#E7E5E4]` stillerini uygula
    - `AppHomeScreen`, `PlanPage`, `AppSettingsScreen` kartlarını kontrol et
    - _Requirements: 4.1, 4.3_
  - [x] 11.2 Tüm etkileşimli elemanlara `active:scale-95 transition-all` ekle
    - `Button` bileşeni ve inline butonları kontrol et
    - _Requirements: 4.2_
  - [x] 11.3 Boş durum (empty state) mesajları ve yönlendirme butonlarını ekle
    - `PlanPage` plan yokken, `HaftaDetayPage` entry null iken
    - _Requirements: 4.5_

- [x] 12. `buildPlan()` ve `getMufredat()` için birim testleri yaz
  - [x] 12.1 `buildPlan()` birim testleri
    - Müfredat var → `hasMufredat: true`, `haftalar.length > 0`
    - Müfredat yok → `hasMufredat: false`, plan yine de geçerli
    - _Requirements: 5.6_
  - [ ]* 12.2 Property testi: Müfredat kayıt round-trip
    - **Property 4: Müfredat kayıt round-trip**
    - **Validates: Requirements 3.5**
  - [ ]* 12.3 Property testi: İlkokul müfredat dönüşüm invariantı
    - **Property 5: İlkokul müfredat dönüşüm invariantı**
    - **Validates: Requirements 3.6**

- [x] 13. Checkpoint — Faz 2 testleri
  - Ensure all tests pass, ask the user if questions arise.

---

## Faz 3 — Auth + Lead Toplama

- [x] 14. `tamamlananlar` state'ini App.tsx'e taşı ve prop olarak geç
  - [x] 14.1 `App.tsx`'e `tamamlananlar` state'i ekle, localStorage'dan başlat
    - `useState<Record<string, number[]>>` ile başlat
    - Supabase sync sonrası `setTamamlananlar(mergedTamamlanan)` çağır
    - _Requirements: 7.2, 7.4_
  - [x] 14.2 `AppHomeScreen`'e `tamamlananlar` prop'u geç
    - `BuHaftaKarti` içindeki local state'i kaldır, prop'tan oku
    - _Requirements: 7.2_
  - [ ]* 14.3 Property testi: Bulut-yerel merge stratejisi
    - **Property 7: Bulut-yerel merge stratejisi**
    - **Validates: Requirements 7.2**

- [x] 15. Supabase offline fallback wrapper'ı ekle
  - [x] 15.1 `src/lib/planSync.ts`'e `withSupabaseFallback<T>(fn, fallback)` yardımcı fonksiyonu ekle
    - Tüm Supabase çağrılarını bu wrapper ile sar
    - _Requirements: 7.5_
  - [ ]* 15.2 Property testi: Çıkış sonrası localStorage korunması
    - **Property 8: Çıkış sonrası localStorage korunması**
    - **Validates: Requirements 7.6**

- [x] 16. Lead form görünürlük ve gönderim sonrası gizleme mantığını ekle
  - [x] 16.1 `AppSettingsScreen`'de `leadGonderildi` state'i ekle
    - `localStorage.getItem('lead-gonderildi') === '1'` ile başlat
    - `!user && !leadGonderildi` koşulunda `LeadForm` göster
    - `onSuccess` callback'inde `localStorage.setItem('lead-gonderildi', '1')` kaydet ve state güncelle
    - _Requirements: 6.1, 6.4_
  - [x] 16.2 `LeadForm`'a `validateLeadForm` fonksiyonu ekle
    - `ad` veya `email` boş/whitespace-only ise submit reddet
    - Inline hata mesajı göster
    - _Requirements: 6.3_
  - [ ]* 16.3 Property testi: Lead form zorunlu alan validasyonu
    - **Property 10: Lead form zorunlu alan validasyonu**
    - **Validates: Requirements 6.3**

- [ ] 17. Export fonksiyonları için hata fırlatmama testleri yaz
  - [ ]* 17.1 Property testi: Export fonksiyonları hata fırlatmama invariantı
    - **Property 9: Export fonksiyonları hata fırlatmama invariantı**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 18. Final checkpoint — Tüm testler
  - Ensure all tests pass, ask the user if questions arise.

---

## Faz 4 — UX Parlatma (Header Kaydet + Bottom Sheet + Auth Prompt)

- [x] 19. "Kaydet" butonunu header'a taşı
  - [x] 19.1 `AppLayout.tsx`'e opsiyonel `headerAction?: { label: string; onClick: () => void }` prop'u ekle
    - Header sağ tarafına `headerAction` varsa buton render et (avatar'ın soluna)
    - `PlanPage` ve `HaftaDetayPage`'den `headerAction` prop'u geçilebilir hale getir
    - _Requirements: 4.2, 4.3_
  - [x] 19.2 `PlanPage`'deki mevcut "Kaydet/Export" butonunu `headerAction` olarak geç
    - Sayfa içindeki sticky/floating kaydet butonunu kaldır
    - `AppLayout`'a `headerAction={{ label: 'Kaydet', onClick: handleExport }}` geç
    - _Requirements: 4.2_

- [x] 20. PlanSelector'ı bottom sheet modal olarak aç
  - [x] 20.1 `AppHomeScreen`'e `planSelectorAcik` state'i ekle
    - `planlar.length > 0` iken "Yeni Plan Ekle" butonu göster (QuickActions'a ekle)
    - Butona tıklandığında `planSelectorAcik = true` yap
    - _Requirements: 1.1, 2.5_
  - [x] 20.2 `BottomSheet` wrapper bileşeni oluştur (`src/components/UI/BottomSheet.tsx`)
    - `open`, `onClose`, `children` prop'ları
    - `fixed inset-0 z-50` overlay + `fixed bottom-0 w-full max-w-lg` panel
    - `translate-y-full` → `translate-y-0` CSS transition (300ms ease-out)
    - `createPortal` ile `document.body`'e render et
    - _Requirements: 4.1, 4.2_
  - [x] 20.3 `AppHomeScreen`'de `PlanSelector`'ı `BottomSheet` içinde render et
    - `planSelectorAcik` state'i ile kontrol et
    - `onComplete` callback'inde sheet'i kapat, planı ekle
    - `onCancel` callback'inde sheet'i kapat
    - _Requirements: 1.1, 2.5_

- [x] 21. Plan oluşturma sonrası auth prompt göster
  - [x] 21.1 `App.tsx`'e `authPromptAcik` state'i ekle
    - `handlePlanEkle` içinde `!user` ise `setTimeout(() => setAuthPromptAcik(true), 1500)` ile tetikle
    - `localStorage.getItem('auth-prompt-gosterildi') === '1'` ise gösterme
    - _Requirements: 7.1, 7.3_
  - [x] 21.2 `AuthModal`'a `mode?: 'prompt'` prop'u ekle
    - `mode === 'prompt'` iken başlık: "Planını kaydet", alt metin: "Ücretsiz hesap oluştur, planların tüm cihazlarında erişilebilir olsun."
    - Mevcut giriş/kayıt formu aynı kalır
    - "Şimdi değil" butonu ekle → `onClose` çağırır + `localStorage.setItem('auth-prompt-gosterildi', '1')`
    - _Requirements: 7.1, 7.3_
  - [x] 21.3 `App.tsx`'te `authPromptAcik` state'ini `AuthModal`'a bağla
    - `<AuthModal mode="prompt" onClose={() => setAuthPromptAcik(false)} />` render et
    - Başarılı login/kayıt sonrası `authPromptAcik = false` yap
    - _Requirements: 7.1, 7.3_

- [x] 22. Checkpoint — Faz 4 testleri
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` ile işaretli görevler opsiyoneldir, MVP için atlanabilir
- Her görev ilgili requirements'a referans verir
- Faz 1 → Faz 2 → Faz 3 sırasıyla uygulanmalı; her faz bağımsız olarak teslim edilebilir
- Property testleri `fast-check` ile yazılacak, minimum 100 iterasyon
- Tüm kod örnekleri TypeScript; `any` kullanımı yasak
