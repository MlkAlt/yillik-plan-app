# STATUS.md - Ogretmen Yaver

> Her oturumda bu dosya okunur ve yalnizca gerekli bilgiler guncellenir.
> Durum: TODO -> WIP -> DONE | Engel: BLOCKED

Son guncelleme: 2026-04-04

---

## Aktif Sprint: Sprint 1 - v6 Tasarim Gecisi

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
| 12 | Supabase yeni tablolar migration | backend-dev | **NEXT** | `supabase_v6_migration.sql` | Sprint 2 basi |
| 13 | Sprint 1 QA / tasarim review | qa | TODO | QA raporu | Tum ekranlar bittikten sonra |

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

### 2026-04-04 - UX duzeltme turu
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
