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

### Veri Akışı: Plan Oluşturma

```
Kullanıcı ders+sınıf seçer
  → buildPlan(ders, sinif, yil)         [src/lib/planBuilder.ts]
    → getMufredat(ders, sinif)          [mufredatRegistry.ts]
        → ilkokulMufredatiniDonustur()  ← ilkokul formatı (1-4. sınıf)
        veya doğrudan MufredatJson      ← ortaokul/lise formatı (5-12. sınıf)
      → mufredatliPlanOlustur(yil, json)[takvimUtils.ts]
    veya planOlustur(yil)               [takvimUtils.ts] ← müfredat yoksa
      → meb-takvim.json                [src/data/]
→ PlanEntry olarak tum-planlar'a kaydedilir
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
`src/lib/takvimUtils.ts` — `MufredatJson`, `MufredatHafta`, `IlkokulMufredatJson`, `IlkokulUnite`, `IlkokulKazanim`, `planOlustur()`, `mufredatliPlanOlustur()`, `ilkokulMufredatiniDonustur()`
`src/lib/mufredatRegistry.ts` — `getMufredat(ders, sinif)`: tüm müfredat JSON'larını import edip döndürür
`src/lib/planBuilder.ts` — `buildPlan(ders, sinif, yil)`: müfredat varlığına göre `mufredatliPlanOlustur` veya `planOlustur` çağırır; `AppHomeScreen` ve `AppSettingsScreen` tarafından kullanılır

## Dikkat Edilmesi Gerekenler

- **Yıl seçeneği:** `getYilSecenekleri()` (`src/lib/dersSinifMap.ts`) mevcut tarihe göre akademik yılı dinamik hesaplar; 18 Ağustos'tan itibaren bir sonraki yılı da seçenek olarak ekler. Legacy handler'lar (`App.tsx`) ve onboarding (`AppHomeScreen.tsx`) artık `getYilSecenekleri()[0]` kullanır. `guessDate()` içinde yıl hâlâ hardcode'dur — yüklenen planlar için ay-tarih dönüşümünde kullanılır.
- **Sınıf öğretmeni composite key:** `PlanEntry.sinif` alanında `"3. Sınıf—Türkçe"` formatı kullanılır (em dash `—`). Bu anahtarı ayrıştırırken veya oluştururken em dash karakterine dikkat et.
- **Merkezi DERS_SINIF_MAP:** `src/lib/dersSinifMap.ts` — `AppHomeScreen`, `AppSettingsScreen`, `PlanOlusturPage` buradan import eder. Yeni branş veya sınıf aralığı eklenince **sadece bu dosya** güncellenir.

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
