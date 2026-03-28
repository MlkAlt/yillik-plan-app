# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Yıllık Plan Uygulaması

Öğretmenler için yıllık ders planı oluşturma ve görüntüleme uygulaması.
Hedef: Ücretsiz, lead toplama için de kullanılacak.

## Tech Stack (Sabit — Değiştirme)

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React + Vite + TypeScript |
| Stil | Tailwind CSS |
| Backend / DB | Supabase (free tier) |
| Hosting | Vercel (free tier) |

**Maliyet hedefi: $0/ay**

## Komutlar

```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run preview    # Build önizleme
npm run lint       # ESLint kontrol
```

**Test altyapısı yok** — birim veya entegrasyon testi mevcut değil.

## Uygulama Mimarisi

### İki Ayrı UI Katmanı

**Landing katmanı** (`/`, `/olustur`, `/yukle`, `/plan`) — AppLayout olmadan çalışır.

**App katmanı** (`/app/*`) — `AppLayout` wrapper ile, mobil-öncelikli bottom-nav içerir:
- `/app` → `AppHomeScreen` (bu haftaki kazanım + onboarding)
- `/app/plan` → `PlanPage` (tüm haftalar listesi; plan yoksa `/app`'e yönlendirir)
- `/app/ayarlar` → `AppSettingsScreen` (öğretmen bilgileri + plan silme/yeniden oluşturma; `onPlanEkle`, `onPlanSil?`, `planlar`, `user?` prop'larını alır)
- `/app/hafta/:haftaNo` → `HaftaDetayPage` (hafta tamamlama + not; props almaz, localStorage'dan okur)

### State Yönetimi

Tüm global state **`App.tsx`**'te tutulur ve prop olarak iletilir — Zustand veya Context kullanılmıyor.

```
App.tsx
  planlar: PlanEntry[]          ← tum-planlar (localStorage)
  aktifSinif: string            ← aktif-sinif (localStorage)
  user: User | null             ← Supabase Auth oturumu (onAuthStateChange)
```

`HaftaDetayPage` ve `PlanPage` aktif sınıfı ve plan verisini localStorage'dan doğrudan okur (prop almaz).

`AppSettingsScreen`'e `user`, `onPlanEkle`, `onPlanSil?`, `planlar` prop'ları geçilir. `AuthModal` bileşeni (`src/components/AuthModal/AuthModal.tsx`) burada açılır — `onClose` prop'u alır, giriş/kayıt formunu modal olarak sunar.

`AppHomeScreen` ayrıca `syncing: boolean` prop'u alır — Supabase senkronizasyonu devam ederken gösterilir.

### Plan Oluşturma: PlanSelector Bileşeni

`src/components/PlanSelector/` — hem `AppHomeScreen` onboarding'inde hem `/olustur` sayfasında kullanılan ortak seçim bileşeni.

**Adım akışı:**
- **Tek dersli branş** (Matematik, Fizik, İngilizce…): Branş → Sınıf seç → Plan oluştur (2 adım)
- **Sınıf Öğretmenliği**: Branş → Sınıf + dersler → Plan oluştur (2 adım)

```
PlanSelector/
  index.tsx          ← orkestratör; step state, buildPlan çağrısı, ogretmen-ayarlari kaydı
  BranchStep.tsx     ← arama + popüler/tüm branş grid'i
  ClassStep.tsx      ← branş modu: sınıf multi-select + dinamik kısayollar
  LessonClassStep.tsx← sınıf öğretmeni modu: sınıf (tekil) + dersler (çoklu) + kısayollar
```

`PlanSelector` props: `yil`, `onComplete(entries: PlanEntry[])`, `onCancel?`
`onComplete` çağrılmadan önce `ogretmen-ayarlari` localStorage'a kaydedilir. `onboarding-tamamlandi` kaydı parent'ın sorumluluğundadır.

### Veri Akışı: Plan Oluşturma

```
Kullanıcı PlanSelector'dan seçim yapar
  → buildPlan(ders, sinif, yil)         [src/lib/planBuilder.ts]
    → getMufredat(ders, sinif)          [mufredatRegistry.ts]
        → ilkokulMufredatiniDonustur()  ← ilkokul formatı (1-4. sınıf)
        veya doğrudan MufredatJson      ← ortaokul/lise formatı (5-12. sınıf)
      → mufredatliPlanOlustur(yil, json)[takvimUtils.ts]
    veya planOlustur(yil)               [takvimUtils.ts] ← müfredat yoksa
      → meb-takvim.json                [src/data/]
→ PlanEntry[] olarak tum-planlar'a kaydedilir
```

`PlanEntry.tip === 'meb'` → `plan: OlusturulmusPlan` (hafta bazlı, takvim + müfredat)
`PlanEntry.tip === 'yukle'` → `rows: ParsedRow[]` (Excel/Word'den parse edilmiş)

### Sınıf Öğretmeni Desteği

Sınıf öğretmeni seçildiğinde her ders için ayrı `PlanEntry` oluşturulur. `PlanEntry.sinif` alanı composite key olarak kullanılır: `"3. Sınıf—Türkçe"`. Görüntüleme için `label` (ders adı) ve `sinifGercek` (gerçek sınıf adı, örn. "3. Sınıf") alanları kullanılır.

**Sınıf öğretmeni dersleri:** `SINIF_OGRETMENI_DERSLER` = `['Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Müzik', 'Görsel Sanatlar', 'Beden Eğitimi']`. Bu listeye yeni ders eklenince aynı adın `mufredatRegistry.ts` içinde de kayıtlı olduğundan emin ol.

### Dosya Yükleme

`src/lib/fileParser.ts` — `.xlsx/.xls` için `xlsx` paketi, `.docx` için `mammoth` kullanır.
Excel beklenen format: `[Ay, HaftaNo, Dönem, TarihAralığı, Kazanım]` sütunları.

`src/lib/templateGenerator.ts` — `sablonIndir()` ile boş Excel şablonu indirme.

### Export (Excel / Word)

`src/lib/exportUtils.ts` — `PlanPage`'den çağrılır; iki export fonksiyonu içerir:
- `exportPlanToExcel(entry, meta)` — `exceljs` ile (dinamik import) biçimlendirilmiş `.xlsx` oluşturur; ay ve ünite sütunları birleştirilir, tatil satırları renklendirilir.
- `exportPlanToWord(entry, meta)` — HTML-to-doc yaklaşımıyla `.doc` oluşturur (BOM + Word namespace). Her ikisi de `ogretmen-ayarlari`'nden okul adı ve öğretmen adı alır.

**Dikkat:** `guessDate()` içinde yıl `2025`/`2026` hardcode edilmiştir — yüklenen planlar için ay-tarih dönüşümünde kullanılır.

### Müfredat Verisi

`src/data/mufredat/` altında 55+ JSON dosyası bulunur. **İki farklı format** vardır:

**Ortaokul/Lise formatı** (`MufredatJson`): hafta bazlı, `haftaNo` içerir.
```ts
{ ders, sinif, toplamHafta, haftalar: MufredatHafta[] }
// MufredatHafta: { haftaNo, unite, uniteAdi, kazanim, kazanimDetay }
```

**İlkokul formatı** (`IlkokulMufredatJson`): ünite/kazanım bazlı, `haftaNo` içermez.
```ts
{ ders, sinif, uniteler: IlkokulUnite[] }
// IlkokulUnite: { no, ad, kazanimlar: IlkokulKazanim[] }
// IlkokulKazanim: { kod, baslik, adimlar: string[] }
```
`ilkokulMufredatiniDonustur()` (`takvimUtils.ts`) bu formatı `MufredatJson`'a çevirir: her kazanım sıralı `haftaNo` alır (1, 2, 3…). **Lise formatından farkı:** Lisede `haftaNo` takvim haftalarıyla önceden hizalanmış; ilkokulda hafta sayısı kazanım sayısına göre belirlenir, tatil/boş haftalar göz ardı edilebilir.

**Mevcut müfredat kapsamı:**
- Hayat Bilgisi: 1–3 (ilkokul format)
- Fen Bilimleri: 3–4 (ilkokul), 5–8 (lise format)
- Matematik: 3–4 (ilkokul), 5–12 (lise format)
- Türkçe: 3–4 (ilkokul), 5–8 (lise format)
- Sosyal Bilgiler: 4 (ilkokul), 5–7 (lise format)
- İngilizce: 5–12 (lise format)
- Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Türk Dili ve Edebiyatı: 9–12 (lise format)

**Merkezi kayıt:** `src/lib/mufredatRegistry.ts` — tüm JSON dosyaları buraya import edilir. `getMufredat(ders, sinif)` fonksiyonu `MufredatJson | null` döner (ilkokul dönüşümü dahil). `buildPlan()` bu fonksiyonu kullanır; `null` döndüğünde `planOlustur()` ile müfredat olmadan plan oluşturulur.

Müfredat `haftaNo` ile takvim haftaları eşleştirilir → `Hafta.kazanim/kazanimDetay/uniteAdi` alanlarına atanır.

Yeni branş eklerken:
1. `src/data/mufredat/` altına JSON ekle (formatı seç: ilkokul veya lise)
2. `src/lib/mufredatRegistry.ts`'e import et ve ilgili map'e (`ILKOKUL_MAP` veya `MUFREDAT_MAP`) ekle
3. Gerekiyorsa `src/lib/dersSinifMap.ts` içindeki `DERS_SINIF_MAP`'e sınıf aralığını ekle

### Bildirimler

`src/lib/notifications.ts` — Web Notifications API sarmalayıcısı:
- `showKazanimBildirimi(haftaNo, kazanim, ders)` — her hafta bir kez bildirim gönderir (aynı hafta için tekrar göndermez); `AppHomeScreen.tsx`'ten çağrılır.
- `isBildirimDestekleniyor/getBildirimIzni/isBildirimAktif/setBildirimAktif/requestBildirimIzni` — `AppSettingsScreen`'deki toggle tarafından kullanılır.
- localStorage: `bildirim-aktif` (`'1'`/`'0'`), `bildirim-son-hafta` (son bildirilen hafta numarası — tekrar bildirim engeller).

### Lead Toplama

`src/components/LeadForm/LeadForm.tsx` — Supabase `leads` tablosuna veri gönderir.
- `embedded` prop: `true` → standalone sayfa olmadan sadece form kartını render eder.
- `src/types/lead.ts` — `Lead` ve `LeadFormData` tipleri.
- `src/lib/supabase.ts` — `createClient` ile başlatılmış Supabase istemcisi; env değişkenleri dolu olmalı.

### Auth + Supabase Sync

`src/lib/auth.ts` — Supabase Auth sarmalayıcısı: `signUp`, `signIn`, `signOut`, `getSession`, `onAuthStateChange`.

`src/lib/planSync.ts` — Supabase senkronizasyon fonksiyonları:
- `syncPlansToSupabase(userId, planlar)` — upsert; conflict key: `user_id, sinif`
- `fetchPlansFromSupabase(userId)` — kullanıcıya ait planları çeker
- `deletePlanFromSupabase(userId, sinif)` — tek plan siler
- `syncProgressToSupabase(userId, tamamlanan, notlar)` — hafta tamamlama + notları `user_progress` tablosuna upsert eder; `HaftaDetayPage`'den çağrılır
- `fetchProgressFromSupabase(userId)` — tamamlanan hafta ve notları çeker; login sırasında localStorage ile birleştirilir (bulut öncelikli)

**Senkronizasyon akışı (App.tsx):**
1. Login → `fetchPlansFromSupabase` → localStorage ile birleştirilir; **bulut önceliklidir** (çakışmada bulut planı kazanır)
2. Login → `fetchProgressFromSupabase` → tamamlanan haftalar ve notlar localStorage ile birleştirilir (bulut öncelikli)
3. `handlePlanEkle` çağrıldığında kullanıcı login ise `syncPlansToSupabase` da çağrılır (sessiz hata)
4. Login değilse tüm işlemler yalnızca localStorage üzerinden yürür

**Supabase tabloları:**
- `leads` — LeadForm'dan toplanan öğretmen iletişim bilgileri
- `plans` — `user_id, sinif, ders, yil, tip, plan_json, rows_json, label, sinif_gercek`; PK conflict key: `(user_id, sinif)`
- `user_progress` — `user_id, tamamlanan_json, notlar_json, updated_at`; PK: `user_id`

## localStorage Veri Modeli

```
tum-planlar         → PlanEntry[]
aktif-sinif         → string
ogretmen-ayarlari   → { ders, siniflar: string[], yil, adSoyad?, okulAdi?, sehir?, ogretmenTuru?, sinifGercek? }
onboarding-tamamlandi → "1"
tamamlanan-haftalar → Record<sinif, number[]>
hafta-notlari       → Record<sinif, Record<string, string>>
bildirim-aktif      → '1' | '0'
bildirim-son-hafta  → string  (son bildirilen haftaNo; tekrar bildirim engeller)
```

**Migration:** `App.tsx` başlangıçta eski `aktif-plan` key'ini yeni `tum-planlar` formatına otomatik çevirir.

## Önemli Tipler

`src/types/takvim.ts` — `OlusturulmusPlan`, `Hafta`, `MebYilTakvim`
`src/types/planEntry.ts` — `PlanEntry` (localStorage'da saklanan birim; `label?` ve `sinifGercek?` opsiyonel)
`src/types/lead.ts` — `Lead`, `LeadFormData`
`src/lib/takvimUtils.ts` — `MufredatJson`, `MufredatHafta`, `IlkokulMufredatJson`, `IlkokulUnite`, `IlkokulKazanim`, `planOlustur()`, `mufredatliPlanOlustur()`, `ilkokulMufredatiniDonustur()`, `mevcutYillar()`
`src/lib/mufredatRegistry.ts` — `getMufredat(ders, sinif)`: tüm müfredat JSON'larını import edip döndürür
`src/lib/planBuilder.ts` — `buildPlan(ders, sinif, yil)`: müfredat varlığına göre `mufredatliPlanOlustur` veya `planOlustur` çağırır; `PlanSelector` ve `AppSettingsScreen` tarafından kullanılır
`src/lib/branchConfig.ts` — UI branş seçim veri modeli: `Branch`, `BranchMode`, `BRANCHES`, `SO_DERSLER`, `SO_SINIFLAR`

## Dikkat Edilmesi Gerekenler

- **Yıl seçeneği — iki farklı kaynak:** `getYilSecenekleri()` (`src/lib/dersSinifMap.ts`) mevcut tarihe göre dinamik hesaplar; `App.tsx`, `AppHomeScreen.tsx` ve `PlanOlusturPage` bu fonksiyonu kullanır. `mevcutYillar()` (`src/lib/takvimUtils.ts`) ise `meb-takvim.json`'daki yılları döndürür; artık yalnızca takvim içi hesaplamalarda kullanılır. `guessDate()` içinde yıl hâlâ hardcode'dur — yüklenen planlar için ay-tarih dönüşümünde kullanılır.
- **Sınıf öğretmeni composite key:** `PlanEntry.sinif` alanında `"3. Sınıf—Türkçe"` formatı kullanılır (em dash `—`). Bu anahtarı ayrıştırırken veya oluştururken em dash karakterine dikkat et.
- **Branş verisi iki yerde:** `src/lib/branchConfig.ts` UI seçim akışının kaynağıdır (PlanSelector tarafından kullanılır). `src/lib/dersSinifMap.ts` ise `AppSettingsScreen` ve export fonksiyonları için hâlâ kullanılmaktadır. **Yeni branş eklerken her iki dosya da güncellenmeli.**
- **`/olustur` navigasyonu:** `PlanOlusturPage` plan oluşturduktan sonra `/plan`'a yönlendirir (landing katmanı; `/app`'e değil).
- **`PlanSelector` kısayolları:** `ClassStep` branşın sınıf aralığına göre dinamik kısayol gösterir (örn. 9-12 arası branşta sadece "Lise (9–12)" görünür). `LessonClassStep`'te "Temel Dersler" = `['Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri', 'Sosyal Bilgiler']`.

## Git Akışı

Her önemli değişiklikten sonra kullanıcıya sormadan `git commit + git push origin main` yap. Vercel GitHub'a bağlı, push edince otomatik deploy olur.

## Kodlama Kuralları

- **Değişken/fonksiyon isimleri:** İngilizce — Türkçe YASAK
- **Yorumlar:** Türkçe kabul edilebilir
- **TypeScript:** Zorunlu — `any` kullanma
- **Async:** async/await, `.then()` zinciri değil
- **Stil:** Tailwind class'ları; renk paleti: `#2D5BE3` (mavi), `#F59E0B` (turuncu), `#1e3a5f` (koyu mavi). Değiştirme.
- **Componentler:** `Component/index.tsx + Component.tsx` pattern
- `console.log` bırakma

## Yapılmaması Gerekenler
- ❌ Ücretli API veya servis (free tier dışına çıkma)
- ❌ Redux / karmaşık state management
- ❌ SSR
- ❌ Çoklu dil desteği

## Ortam Değişkenleri (.env.local)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   # AdSense yayıncı ID
VITE_ADSENSE_SLOT=XXXXXXXXXX                  # Reklam birimi ID
```

`VITE_ADSENSE_CLIENT` boşsa `AdBanner` bileşeni hiçbir şey render etmez (`null` döner). `loadAdSense()` script'i de yüklenmez.

## Yapılacaklar

- [ ] Arayüz geçiş animasyonları

CLAUDE.md dosyasının sonuna şu bölümü ekle:

## Geliştirme Durumu — 27 Mart 2026

### Tamamlananlar
- MEB Takvimi (2024-2025, 2025-2026 resmi PDF ile doğrulandı)
- App layout — alt tab bar, header, profil avatarı
- AppHomeScreen — kişisel karşılama, aktif plan kartı, bugünün kazanımı, tek tuşla plan oluşturma
- AppSettingsScreen — ders/sınıf/yıl/ad/okul/şehir, localStorage
- PlanPage — hafta kartları, kazanım + ünite badge, tarih formatı
- HaftaDetayPage — Pzt-Cuma günlük not ekleme
- localStorage — plan yenilemede kaybolmuyor
- PWA — ana ekrana ekleme, service worker
- Vercel deploy — canlı
- Müfredat JSON — Fen Bilimleri 5-6-7-8. Sınıf
- Onboarding — AppHomeScreen içinde kart olarak (devam ediyor)

### Sıradaki
1. Onboarding kartını bitir
2. Diğer dersler için müfredat JSON
3. Supabase Auth
4. Admin paneli

## Geliştirme Durumu — 28 Mart 2026 (Faz 2 Tamamlandı)

### Faz 2 — Teknik Borç + UI Tutarlılığı ✅

- `guessDate()` hardcode yıl kaldırıldı → `aktifYilBul()` ile dinamik hesaplama (`exportUtils.ts`)
- Branş verisi tek kaynağa çekildi → `branchConfig.ts`'e `getSiniflarForDers()` eklendi, `DERS_SINIF_MAP`/`DERS_GRUPLARI` re-export edildi
- `HaftaDetayPage` prop tabanlı veri alımına geçirildi → `entry: PlanEntry | null` prop'u eklendi, localStorage plan okuma kaldırıldı (progress okuma korundu)
- `console.log` temizlendi (zaten yoktu), `CellStyle = any` → `Record<string, unknown>` ile değiştirildi
- UI tutarlılığı doğrulandı — tüm kartlar, butonlar, boş durumlar zaten standarda uygun

### Sıradaki (Faz 1 — Temel UX)
1. Test altyapısı kur (vitest + fast-check)
2. BranchStep'e arama input'u ekle
3. AppHomeScreen OnboardingCard/DashboardView ayrımını netleştir
4. Müfredat uyarı mekanizması (PlanSelector'da hasMufredat kontrolü)

## Geliştirme Durumu — 28 Mart 2026 (Faz 1 Tamamlandı)

### Faz 1 — Temel UX ✅

- BranchStep arama zaten mevcuttu, doğrulandı
- AppHomeScreen onboarding/dashboard ayrımı zaten mevcuttu, doğrulandı
- PlanSelector'a müfredat uyarı mekanizması eklendi — `hasMufredat: false` durumunda inline uyarı gösteriliyor
- `tamamlananlar` state'i `syncing` false'a döndüğünde localStorage'dan yenileniyor (Supabase sync sonrası stale veri sorunu giderildi)

### Sıradaki (Faz 3 — Auth + Lead Toplama)
1. `tamamlananlar` state'ini App.tsx'e taşı
2. Supabase offline fallback wrapper
3. Lead form gönderim sonrası gizleme
