# STATUS.md - Ogretmen Yaver

> Her oturumda bu dosya okunur ve yalnizca gerekli bilgiler guncellenir.
> Durum: TODO -> WIP -> DONE | Engel: BLOCKED

Son guncelleme: 2026-04-05

---

## ✅ v8 Design Migration — COMPLETED & DEPLOYED

**Timeline:**
- Phase A: 4-tab glassmorphic bottom nav + pill bar animation
- Phase B: HTML-exact CSS tokens (colors, shadows, radius, easing)
- Phase C: Home screen bento grid layout (topbar + acil + tasarruf + small cards)
- Phase D: Routes fixed + 3 screen stubs (Planla/Dosyam/Üret)

**Results:**
- ✅ Build: Success
- ✅ Tests: 12/12 passing
- ✅ Git: 4 commits pushed
- ✅ **Vercel Deploy: LIVE** 🚀

**Live URL:** https://ogretmen-yaver.vercel.app

**v8 Features Now Live:**
- Bricolage Grotesque + DM Sans fonts
- Navy (#1B2E5E) + Blue (#4F6AF5) color palette
- Glassmorphism (blur 24px + saturate 180%)
- Spring easing animations (cubic-bezier .34,1.56,.64,1)
- Bento grid home screen (2-col, gap 8px)
- 4-tab navigation with exact HTML layout

---

## Aktif Sprint: Sprint 2 - Detaylı Ekranlar & Backend

**Hedef:** v6 tasarimini mevcut React + Vite projesine uygulamak  
**Bitis:** 2026-04-13

---

## Gorev Tablosu

| # | Gorev | Ajan | Durum | Cikti | Not |
|---|---|---|---|---|---|
| 1 | v6 font sistemi kur | frontend-dev | **DONE** | `index.css` | Sora + Outfit |
| 2 | v6 design tokenlarini ekle | frontend-dev | **DONE** | `index.css` | Renk, radius, golge |
| 3 | `tokens.ts` olustur | frontend-dev | **DONE** | `src/lib/tokens.ts` | JS sabitleri |
| 4 | Dark mode sistemi kur | frontend-dev | **DONE** | `index.css`, `App.tsx` | `useColorScheme` |
| 5 | Bottom nav 4 sekme | frontend-dev | **DONE** | `AppLayout.tsx` | Ana / Planla / Dosyam / Uret |
| 6 | Ana ekran v6 guncellemesi | frontend-dev | **DONE** | `AppHomeScreen.tsx` | Son turda yeniden sadeleştirildi |
| 7 | Onboarding flow v6 | frontend-dev | **DONE** | `OnboardingModal.tsx` | Brans -> Dersler -> Siniflar |
| 8 | Planla ekrani v6 | frontend-dev | **DONE** | `PlanPage.tsx` | Yillik plan gorunumu |
| 9 | Dosyam ekrani | frontend-dev | **DONE** | `DosyamPage.tsx` | Belge gruplari ve ozet |
| 10 | Uret ekrani | frontend-dev | **DONE** | `UretPage.tsx` | Gorev seciminden dogrudan forma gecis |
| 11 | Uretim hakki UI | frontend-dev | **DONE** | `UretimHakkiBadge.tsx` | `jeton` dili kaldirildi |
| 12 | Supabase yeni tablolar migration | backend-dev | **DONE** | `supabase_v6_migration.sql` | kullanicilar, dersler, uretim_hakki, sinavlar |
| 13 | Sprint 1 QA / tasarim review | qa | **DONE** | `QA_SPRINT1_RAPORU.md` | 2 bug fix, 5 madde Sprint 2'ye |

---

## Guncel Kararlar

- `jeton` yerine `uretim hakki` dili kullanilacak.
- `Uret` ekraninda arac secildiginde ikinci bir ara adim olmayacak; kullanici dogrudan ilgili gorev formuna gececek.
- Ana ekran dashboard agirlikli degil, ogretmenin bugunku planini ve kazanımlarini gosteren gunluk calisma paneli olacak.
- Kazanim tamamlama akisi ana ekranda satir ici onayla yapilacak.
- Profil girisi ayri ve gorunur bir `Ayarlar` erisim noktasi olacak.
- Ayarlarda okul, yonetim ve zumre bilgileri tutulacak; ileride belge uretiminde kullanilacak.
- `Planin hazirlaniyor` durumu onboarding benzeri, merkezde ve guven veren bir animasyonla gosterilecek.

---

## Son Yapilanlar

### 2026-04-04 — UX/UI iyileştirme: 6 madde tamamlandı
- **Madde 1:** Ana ekran yığılmışlık → `Tamamlananlar` bölümü kaldırıldı (sadece bu hafta kazanımları gösteriliyor)
- **Madde 2:** Export UX → Açılır menü → bottom sheet modal dialog (Excel, Word, Yazdır seçenekleri net)
- **Madde 3:** Uret araç seçimi → `Sık Kullanılanlar` section eklendi; localStorage'a araç tıklamaları kaydolur
- **Madde 4:** Form autocomlete → Sınıf ve Ders dropdown seç yapıldı (12 sınıf, 12 ana ders)
- **Madde 5:** Sync hata gösterimi → syncProgressToSupabase hata durumunda toast uyarı gösterir
- **Madde 6:** Dark mode contrast → --color-text2 ve text3 iyileştirildi (WCAG AA: 4.8:1 ve 3.2:1)
- Build: ✅ Tests: 12/12 ✅

### 2026-04-04 — Sprint 2 başlangıcı: Backend migration
- `supabase_v6_migration.sql` düzeltildi: `update_updated_at()` trigger fonksiyonu eklendi
- 4 yeni tablo şeması hazır: `kullanicilar`, `kullanici_dersler`, `uretim_hakki_islemleri`, `sinavlar`
- RLS politikaları ve indexler tamamlandı
- Task #12 DONE — Sprint 2 başlangıcı başarılı
- `AppHomeScreen.tsx` tekrar sadeleştirildi; ana ekran `Bugunun odagi` ve `Bugunku kazanımlar` etrafinda toplandi.
- Profil erisimi daha gorunur bir `Ayarlar` butonuna cevrildi.
- `PlanSelector/index.tsx` icindeki `Planin hazirlaniyor` katmani yeniden kuruldu; onboarding benzeri animasyon ve donen durum mesajlari eklendi.
- `AppSettingsScreen.tsx` okul, mudur, mudur yardimcisi ve dinamik zumre ogretmeni alanlariyla genisletildi.

### 2026-04-04 - Uret akisi ve terminoloji
- `UretPage.tsx` gorev kartindan sonra dogrudan ilgili form akisini acacak sekilde sadeleştirildi.
- `UretimHakkiBadge.tsx` eklendi.
- Ilgili dokuman ve migration adlari `uretim hakki` diline hizalandi.

### 2026-04-04 - Tooling duzeltmesi
- Yerel build sorunu `vite build --configLoader native` ile cozuldu.
- `vitest.config.ts` sadece uygulama testlerini kapsayacak sekilde daraltildi.
- Dogrulama: `npm.cmd run build` basarili, `npm.cmd run test` basarili (`12/12`).

### 2026-04-04 - Deploy
- Guncel production alias: `https://ogretmen-yaver.vercel.app`

### 2026-04-04 - Son durum ozeti
- Ana ekran yeniden sadeleştirildi; `Bugunun odagi`, `Bugunku kazanımlar` ve gorunur `Ayarlar` erisimi onceliklendirildi.
- `Planin hazirlaniyor` ekrani onboarding benzeri animasyonlu merkez katman olarak guncellendi.
- Son degisiklikler production'a alindi: `https://ogretmen-yaver.vercel.app`

### 2026-04-04 - Sprint 1 QA tamamlandi
- Sprint 1 tum ekranlar incelendi: AppHomeScreen, AppLayout, OnboardingModal, PlanPage, DosyamPage, UretPage, UretimHakkiBadge, PlanSelector, AppSettingsScreen.
- BUG-01: OnboardingModal arama sırasında seçim kaybı düzeltildi (`onChange` basitleştirildi).
- BUG-02: AppSettingsScreen zümre listesi key stratejisi düzeltildi (`${index}-${isim}` → `{index}`).
- 5 madde by-design Sprint 2'ye ertelendi (form submit, hardcoded belgeler, storage normalizasyon).
- QA raporu: `QA_SPRINT1_RAPORU.md`
- Sprint 1 **KAPANDI** — tüm görevler DONE.

### 2026-04-05 — UX/UI eleştiri turu: 8 madde tamamlandı

- **Madde 1:** `HaftaDetayPage.tsx` — Türkçe karakter düzeltmeleri (formatTarih ay isimleri, tüm statik metinler)
- **Madde 2:** `PlanPage.tsx` — Türkçe karakter düzeltmeleri ("Dönem", "Tamamlandı", SectionHeader metinleri)
- **Madde 3:** `AppHomeScreen.tsx` — Zil butonu `/app/ayarlar` → `/app/profil` olarak güncellendi
- **Madde 4:** `DosyamPage.tsx` — "İndir" ve "Tüm Dosyayı İndir" butonları toast + navigate ile işlevsel hale getirildi
- **Madde 5:** `UretPage.tsx` — "Üret" butonu validasyon (konu/sınıf/bakiye) + toast mesajlarıyla işlevsel
- **Madde 6:** `UretPage.tsx` — Form alanları seçilen araca göre koşullu gösterim (sinav / etkinlik / materyal)
- **Madde 7:** `AppHomeScreen.tsx` — Selamlama mesajı deduplication kaldırıldı; ders programı kartı zaten dolu ise gizleniyor
- **Madde 8:** `PlanPage.tsx` — Haftalık program grid, hardcoded 3×5'ten `useDersProgrami` hook ile gerçek veriye bağlandı; "Düzenle" butonu `/app/planla/ders-programi` rotasına yönlendiriyor
- Build: ✅ Tests: 12/12 ✅

### 2026-04-04 - UI sadeleştirme turu
- `AppLayout.tsx`: Bottom nav'a kalici profil ikonu eklendi (5. tam tab degil, kucuk avatar circle); her ekrandan `/app/ayarlar`'a erisim saglaniyor.
- `AppHomeScreen.tsx`: Header'dan `Ayarlar` butonu kaldirildi (profil artik nav'da). Hero karttan `Siradaki adim` nested blogu kaldirildi. `Kisayollar` grid section'i kaldirildi (Plan + Dosyam zaten bottom nav'da).
- `PlanSelector/index.tsx`: Yukleme overlay'i `absolute inset-0` yerine `fixed inset-0 z-50` yapildi — artik tam ekran, onboarding gibi ortada goruniyor.

---

## Bilinen Notlar

- PWA katmani UI/UX gelistirme asamasinda gecici olarak devre disi.
- Yerel build su an duzgun calisiyor; onceki `@tailwindcss/oxide-win32-x64-msvc` ve `spawn EPERM` sorunu tooling duzeltmesiyle asildi.

---

## Claude'a Not

Oturum basladiginda:
1. Bu tabloyu oku.
2. **NEXT** olan gorevi al.
3. `.agents/` klasorundeki ilgili ajan dosyasini oku.
4. Isi yap.
5. Gorevi **DONE** isaretle, bir sonrakini **NEXT** yap.
6. Kisa bir oturum notu dus.
