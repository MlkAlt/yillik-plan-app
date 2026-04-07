# STATUS.md - Ogretmen Yaver

> Her oturumda bu dosya okunur ve yalnizca gerekli bilgiler guncellenir.
> Durum: TODO -> WIP -> DONE | Engel: BLOCKED

Son guncelleme: 2026-04-06 (Onboarding UX + Atla bug düzeltmesi + Sıradaki Kazanımlar)

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

### 2026-04-05 — Figma tasarım uyarlaması: Faz 1 + Faz 2 tamamlandı

**Faz 1 (Navigasyon Altyapısı):**
- `index.css` — gradient tokenlar + topbar/sidebar boyut değişkenleri eklendi
- `TopBar.tsx` (yeni) — hamburger + ÖğretmenAsistan logo + Beta badge + Bell ikonu
- `SidebarDrawer.tsx` (yeni) — 6 menü item, Premium banner, kullanıcı kartı, slide-in animasyon
- `AppLayout.tsx` — bottom nav kaldırıldı, TopBar + SidebarDrawer entegre edildi

**Faz 2 (Ekran UI Güncellemeleri):**
- `AppHomeScreen.tsx` — gradient welcome banner + 4 stat kartı (Branş/Sınıf/Hafta/İlerleme) + Hızlı Erişim 2×2 grid + Sınıflarım + Yaklaşan Tarihler + Evrak Durumu dark card
- `AppSettingsScreen.tsx` — gradient profil kartı + 4 tab (Profil/Okul/Zümre/Uygulama)
- `DosyamPage.tsx` — Evrak Merkezi rebrand + Premium banner + arama + kategori chips + belge kartı
- `OnemliTarihlerPage.tsx` — ay grid takvim + stat chips + tab switcher (Yaklaşan/Geçmiş) + event kartı sol border
- `DersProgramiPage.tsx` — ders sayısı badge + sınıf renk göstergesi

**Faz 3 — TAMAMLANDI ✅**
- PlanPage boş state + stat kartlar (B2) ✅
- PlanPage ünite kartları — Figma accordion (C2) ✅
- OnemliTarihlerListesi stili (C1) ✅

---

### 2026-04-06 — Şube (şubeye göre sınıf) sistemi + Ana ekran ders programı entegrasyonu

**Yapılanlar:**

#### A — Ana Ekran UX İyileştirmeleri (Figma uyarlama devamı)
- Stat kartları (Branş/Sınıf/Hafta/İlerleme) → 2 karta indirgendi (Hafta + Yıllık İlerleme)
- 4 stat kart banner içine alındı (glassmorphism: `rgba(255,255,255,0.12)`)
- Yıllık İlerleme kartına SVG dairesel progress ring eklendi (`strokeDasharray / strokeDashoffset`)
- Haftanın Kazanımları satırları başına sınıf renk badge'i eklendi
- Hızlı Erişim 4'ten 2'ye indirgendi (Takvim + Ders Programı)
- "Araçlarım" bölümü eklendi — Evrak Oluştur + Üret gradient kartları; öğretmen evrak acısı vurgulu
- Ders programı max saat sayısı 8 → 10 çıkarıldı (`SAAT_SAYISI`)

#### B — Bugünün Dersleri Paneli
- `bugunDersleri()` hook fonksiyonu AppHomeScreen'e entegre edildi
- Ders programı dolu ise ana ekranda o günün ders saatleri + sınıf badge + kazanım + checkbox gösteriliyor
- Checkbox durumu localStorage'a günlük kaydediliyor (`bugun_tamamlanan_${bugunStr}`)
- Ders programı girilmişse → Bugünün Dersleri görünür, "Bu Haftanın Kazanımları" gizlenir
- Ders programı girilmemişse → "Bu Haftanın Kazanımları" görünür (fallback)

#### C — Şube (Bölüm) Sistemi
- `DersSaati` tipine `sube?: string` alanı eklendi
- `hucreGuncelle` ve `guncelle` hook'u `sube` parametresi aldı; mevcut veri geriye dönük uyumlu kaldı
- `SinifSeciciSheet` 2 adımlı akışa dönüştürüldü: Sınıf → Şube (A/B/C/D/E büyük chip'ler) + "Şubesiz devam et"
- `DersProgramiGrid` kompakt etiket: "5. Sınıf" + "A" → **"5A"**, şubesiz → "5."
- `sinifEtiket(sinif, sube?)` yardımcı fonksiyonu hem Grid'de hem AppHomeScreen'de kullanıldı

**Alınan Kararlar:**
- Ders programı girilmişse "Bu Haftanın Kazanımları" bloklanır; yerine günün programına bağlı kazanımlar gösterilir
- Şube isteğe bağlı — şubesiz veri geriye dönük bozulmaz
- Tek dokunuşla şube doldurma (tüm sütunu A ile doldurma) → UX olarak tartışıldı, henüz uygulanmadı; bir sonraki adayda alınabilir
- Evrak & Üret kartları ana ekranda öne çıkarıldı (öğretmenin en büyük acı noktası: evrak yükü)

**Build:** ✅ Tests: 12/12 ✅ Deploy: https://ogretmen-yaver.vercel.app ✅

---

### 2026-04-06 — Onboarding UX + Bug Fixes

- **BUG-FIX:** "Atla" butonu sonsuz döngü düzeltildi — `ONBOARDING_TAMAMLANDI` flag kontrolü eklendi
- **Onboarding:** `setTimeout(2400)` auto-close kaldırıldı; tek CTA: "Hadi Başlayalım! →"
- **Onboarding:** "Günlük Plan Oluştur" adımı kaldırıldı (onboarding sadeleşti)
- **Onboarding:** Progress dots 3→2, adıma göre aktif güncelleniyor
- **Onboarding:** Metinler ısındı — "Merhaba! Branşınızı seçelim", "Hangi sınıflarda ders veriyorsunuz?" vb.
- **Onboarding:** Branş/sınıf chip'leri stagger animasyonuyla giriyor; sınıf seçimi pop-in spring ile açılıyor
- **Ana Ekran:** Ders programı yokken "Sıradaki Kazanımlar" — bu haftadan itibaren tüm planlardan haftaNo sırasıyla max 6 satır
- **Build:** ✅ Tests: 12/12 ✅ Deploy: https://ogretmen-yaver.vercel.app ✅

---

### 2026-04-07 — Kullanıcı Akışı Yeniden Tasarımı: Faz 1+2 (DEVAM EDİYOR)

**Plan dosyası:** `C:\Users\melik\.claude\plans\shimmying-petting-meerkat.md`

**Felsefe:** (1) Tek "Bugün" ekranı, (2) Her CTA bir yere gider — "Yakında" disabled buton yok, (3) Asla iki kez soru sorma.

**Kullanıcı kararları:**
- DosyamPage → statik şablon + auto-fill yolu (Faz 3 sonraki tur)
- UretPage → "Yakında" badge ile bırak (form gizlenir, bottom nav korunur)
- Kapsam → Faz 1+2 bu turda

#### ✅ TAMAMLANAN

**1. OnboardingModal — 3. adım (Okul) eklendi**
- `src/components/BosdurumuEkrani/OnboardingModal.tsx`
- Adım yapısı: 0 (branş+sınıf) → 1 (okul, YENİ) → 2 (tebrik)
- Yeni state: `okulAdi`, `mudurAdi`
- Yeni fonksiyonlar: `handleDevamSinif`, `kaydetOkulBilgisi`, `handleOkulDevam`
- Adım 1 ekranı: School ikonu, "Okulunu tanıyalım" başlık, 2 input (okul zorunlu, müdür opsiyonel), Atla buton (eski davranış: okulsuz plan oluştur)
- Progress dots: 2 → 3 nokta
- `OGRETMEN_AYARLARI` localStorage'a `okulAdi` + `mudurAdi` merge edilir

**2. AppHomeScreen — Sadeleştirme**
- `src/pages/AppHomeScreen.tsx`
- Kaldırılan: "Araçlarım" gradient kartları (Evrak Oluştur + Üret) — bottom nav duplikasyonu
- Kaldırılan: Kullanılmayan state'ler (`uretimHakki`, `eksikAyarlar`)
- Kaldırılan: Kullanılmayan import'lar (`FileText`, `Sparkles`, `getEvrakSablonlari`, `tespitEksikAlanlar`)
- useEffect içindeki kullanılmayan `freeBelgeler`/`belgeSayisi` hesaplaması temizlendi
- Mevcut yapı korundu: welcome banner + Bugünün Dersleri / Sıradaki Kazanımlar (conditional) + ders programı promptu

#### ⏳ DEVAM EDECEK (sıradaki adımlar)

**3. PlanPage tab bar (IN PROGRESS, başlanmadı)**
- `src/pages/PlanPage.tsx`
- Üst başlığın altına 3 tab pill bar: "Üniteler" (default) / "Ders Programı" / "Takvim"
- Local state `aktifTab: 'uniteler' | 'program' | 'takvim'`
- Mevcut "Ders Programı" + "Takvim" buton pair'i (line 163-176) kaldırılır
- Mevcut ünite accordion içeriği `aktifTab === 'uniteler'` koşuluna sarılır

**4. DersProgramiView component'i çıkar**
- Yeni dosya: `src/components/DersProgramiView.tsx`
- Kaynak: `src/pages/DersProgramiPage.tsx` line 47-113 (header hariç render)
- Props: `planlar: PlanEntry[]`, opsiyonel `embedded?: boolean` (header gizlemek için)
- DersProgramiPage wrap eder (legacy route korunur)
- PlanPage `aktifTab === 'program'` iken render eder

**5. OnemliTarihlerView component'i çıkar**
- Yeni dosya: `src/components/OnemliTarihlerView.tsx`
- Kaynak: `src/pages/OnemliTarihlerPage.tsx` (header hariç)
- Aynı pattern: embedded prop + wrapper

**6. DosyamPage temizliği**
- `src/pages/DosyamPage.tsx`
- Premium upsell kartı (line 224-238 — "Premium'a Geç" 👑 + "Yakında" rozetli) tamamen sil
- "İndirme Yakında" buton metni → "Yakında hazır" (line 178)

**7. UretPage "Yakında" stub**
- `src/pages/UretPage.tsx`
- Mevcut form kodu KORUNUR ama görünmez (return early)
- Yeni boş state: 🚧 Construction ikonu + "AI İçerik Üretici çok yakında" başlık + açıklama

**8. Build + test**
- `npm.cmd run build` — 0 hata
- `npm.cmd run test` — 12/12 geçer
- Manual smoke: yeni kullanıcı 3-adım onboarding → AppHome → PlanPage 3 tab geçişi

**Kapsam dışı (sonraki turlar):**
- Faz 3: DosyamPage statik .docx engine + auto-fill (placeholder substitution: okulAdi, mudurAdi, branş)
- Faz 4: UretPage Claude API entegrasyonu
- Faz 5: OnemliTarihlerPage Supabase sync

---

### 2026-04-07 — UX Eleştirisi Uygulaması (Gemini analizi)

Gemini'nin 5 maddelik UX eleştirisi kod üzerinde doğrulandı, geçerli olanlar uygulandı:

- **Fix A:** `DosyamPage` — per-card "Bilgileri Tamamla" butonu kaldırıldı; top banner zaten uyarıyı veriyor (çift sinyal → warning fatigue çözüldü)
- **Fix B:** `DosyamPage` — "👑 Premium — Yakında" disabled butonu kaldırıldı; top-right badge yeterli (premium karmaşası çözüldü)
- **Fix C:** `PlanPage` — "X Hafta" chip (border+bg+padding) → plain text; tıklanamaz elemanın tıklanabilir görünmesi (false affordance) düzeltildi
- **Fix D:** `AppSettingsScreen` — "Düzenle" butonu `6px` → `10px 16px` padding + `minHeight: 44px`; touch target HIG standardına getirildi
- **Fix E:** `AppHomeScreen` — "Araçlarım" kartları subtitle kontrast `rgba(255,255,255,0.7)` → `0.85`
- **Haksız bulunan eleştiriler:** Gökkuşağı etkisi (renkler zaten subdued, `color-mix` %10), Kaydet butonu (zaten kaldırılmıştı)
- **Build:** ✅ Tests: 12/12 ✅

Ek düzeltmeler (aynı oturum, önceki adımlar):
- `PlanPage` scroll to current week (useEffect + scrollIntoView)
- `AppHomeScreen` boş plan CTA → dashed border inline card
- `AppSettingsScreen` `setDegisti` undefined bug fix

---

## Claude'a Not

Oturum basladiginda:
1. Bu tabloyu oku.
2. **NEXT** olan gorevi al.
3. `.agents/` klasorundeki ilgili ajan dosyasini oku.
4. Isi yap.
5. Gorevi **DONE** isaretle, bir sonrakini **NEXT** yap.
6. Kisa bir oturum notu dus.
