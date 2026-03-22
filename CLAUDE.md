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
- `/app/ayarlar` → `AppSettingsScreen` (öğretmen bilgileri + plan silme/yeniden oluşturma; `onPlanEkle` prop'u alır)
- `/app/hafta/:haftaNo` → `HaftaDetayPage` (hafta tamamlama + not; props almaz, localStorage'dan okur)

### State Yönetimi

Tüm global state **`App.tsx`**'te tutulur ve prop olarak iletilir — Zustand veya Context kullanılmıyor.

```
App.tsx
  planlar: PlanEntry[]          ← tum-planlar (localStorage)
  aktifSinif: string            ← aktif-sinif (localStorage)
```

`HaftaDetayPage` ve `PlanPage` aktif sınıfı ve plan verisini localStorage'dan doğrudan okur (prop almaz).

### Veri Akışı: Plan Oluşturma

```
Kullanıcı ders+sınıf seçer
  → buildPlan(ders, sinif, yil)        [AppHomeScreen.tsx]
    → mufredatliPlanOlustur(yil, json) [takvimUtils.ts]  ← Fen Bilimleri 5-8
    veya planOlustur(yil)              [takvimUtils.ts]  ← diğer dersler
      → meb-takvim.json               [src/data/]
→ PlanEntry olarak tum-planlar'a kaydedilir
```

`PlanEntry.tip === 'meb'` → `plan: OlusturulmusPlan` (hafta bazlı, takvim + müfredat)
`PlanEntry.tip === 'yukle'` → `rows: ParsedRow[]` (Excel/Word'den parse edilmiş)

### Sınıf Öğretmeni Desteği

Sınıf öğretmeni seçildiğinde her ders için ayrı `PlanEntry` oluşturulur. `PlanEntry.sinif` alanı composite key olarak kullanılır: `"3. Sınıf—Türkçe"`. Görüntüleme için `label` (ders adı) ve `sinifGercek` (gerçek sınıf adı, örn. "3. Sınıf") alanları kullanılır.

**Dikkat — isimlendirme tutarsızlığı:** `SINIF_OGRETMENI_DERSLER` listesinde ders adı `'İlkokul Fen Bilimleri'` olarak geçer, ancak `buildPlan()` `'Fen Bilimleri'` string'i kontrol eder. Bu yüzden sınıf öğretmeni modunda Fen Bilimleri müfredat eşleşmesi olmadan `planOlustur()` ile oluşturulur. Yeni branş eklerken bu isim farkına dikkat et.

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

`src/data/mufredat/fen-bilimleri-{3..8}.json` — İki farklı JSON formatı vardır:

**5–8 formatı** (`MufredatJson`): hafta bazlı, `haftaNo` içerir.
```ts
{ ders, sinif, toplamHafta, haftalar: MufredatHafta[] }
// MufredatHafta: { haftaNo, unite, uniteAdi, kazanim, kazanimDetay }
```

**3–4 formatı** (`IlkokulMufredatJson`): ünite/kazanım bazlı, `haftaNo` içermez.
```ts
{ ders, sinif, uniteler: IlkokulUnite[] }
// IlkokulUnite: { no, ad, kazanimlar: IlkokulKazanim[] }
// IlkokulKazanim: { kod, baslik, adimlar: string[] }
```
`ilkokulMufredatiniDonustur()` (`takvimUtils.ts`) bu formatı `MufredatJson`'a çevirir: her kazanım sıralı `haftaNo` alır (1, 2, 3…). **5–8'den farkı:** 5–8'de `haftaNo` takvim haftalarıyla önceden hizalanmış; 3–4'te ise hafta sayısı kazanım sayısına göre belirlenir ve tatil/boş haftalar göz ardı edilebilir. Sonuç `mufredatliPlanOlustur()` ile işlenir.

Müfredat `haftaNo` ile takvim haftaları eşleştirilir → `Hafta.kazanim/kazanimDetay/uniteAdi` alanlarına atanır.

`DERS_SINIF_MAP` yalnızca sınıf aralığı kısıtlaması olan dersler için tanımlanmıştır; bu map'te yer almayan dersler tüm sınıf seviyelerine açılır ve `planOlustur()` ile müfredat eşleşmesi olmadan plan oluşturur.

Yeni branş eklerken:
1. `src/data/mufredat/` altına JSON ekle
2. `AppHomeScreen.tsx`'teki `buildPlan()` fonksiyonuna koşul ekle
3. Gerekiyorsa `DERS_SINIF_MAP` içinde sınıf aralığı tanımla

### Lead Toplama

`src/components/LeadForm/LeadForm.tsx` — Supabase `leads` tablosuna veri gönderir.
- `embedded` prop: `true` → standalone sayfa olmadan sadece form kartını render eder.
- `src/types/lead.ts` — `Lead` ve `LeadFormData` tipleri.
- `src/lib/supabase.ts` — `createClient` ile başlatılmış Supabase istemcisi; env değişkenleri dolu olmalı.

## localStorage Veri Modeli

```
tum-planlar         → PlanEntry[]
aktif-sinif         → string
ogretmen-ayarlari   → { ders, siniflar: string[], yil, adSoyad?, okulAdi?, sehir?, ogretmenTuru?, sinifGercek? }
onboarding-tamamlandi → "1"
tamamlanan-haftalar → Record<sinif, number[]>
hafta-notlari       → Record<sinif, Record<string, string>>
```

**Migration:** `App.tsx` başlangıçta eski `aktif-plan` key'ini yeni `tum-planlar` formatına otomatik çevirir.

## Önemli Tipler

`src/types/takvim.ts` — `OlusturulmusPlan`, `Hafta`, `MebYilTakvim`
`src/types/planEntry.ts` — `PlanEntry` (localStorage'da saklanan birim; `label?` ve `sinifGercek?` opsiyonel)
`src/types/lead.ts` — `Lead`, `LeadFormData`
`src/lib/takvimUtils.ts` — `MufredatJson`, `MufredatHafta`, `IlkokulMufredatJson`, `IlkokulUnite`, `IlkokulKazanim`, `planOlustur()`, `mufredatliPlanOlustur()`, `ilkokulMufredatiniDonustur()`

**Dikkat — eski/kullanılmayan dosyalar:**
- `src/types/plan.ts` — eski Supabase şema tipi (`id`, `plan_id` vb. içerir); mevcut veri modeli ile karıştırılmamalı. Sadece `WeekView` bileşeni kullanır.
- `src/components/WeekView/` — gün bazlı kazanım görünümü prototipi; router'a bağlı değil, aktif kullanımda yok.
- `src/pages/OnboardingPage.tsx` — eski landing katmanı onboarding sayfası; router'a eklenmemiş, yerini `AppHomeScreen` içindeki onboarding aldı.

## Dikkat Edilmesi Gerekenler

- **Hardcoded yıl:** `yil: '2025-2026'` değeri `App.tsx` (legacy handler'lar) ve `AppHomeScreen.tsx` içinde sabitlenmiştir. Yeni öğretim yılına geçişte bu değerlerin güncellenmesi gerekir.
- **Sınıf öğretmeni composite key:** `PlanEntry.sinif` alanında `"3. Sınıf—Türkçe"` formatı kullanılır (em dash `—`). Bu anahtarı ayrıştırırken veya oluştururken em dash karakterine dikkat et.
- **AppSettingsScreen buildPlan() eskidir:** `AppSettingsScreen.tsx` içindeki `buildPlan()` ve `DERS_SINIF_MAP` yalnızca Fen Bilimleri 5–8'i destekler; 3–4 desteği eklenmemiştir. Plan yeniden oluşturulurken bu sayfa da tetiklenebileceğinden (`onPlanEkle` prop'u), Fen Bilimleri 3–4 seçilmişse yeniden oluşturma müfredat olmadan yapılır.

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
```

## Özellik Durumu

### Tamamlanan
- [x] MEB takvimine göre otomatik yıllık plan oluşturma
- [x] Excel/Word yükleme ile plan import
- [x] Excel şablonu indirme (`sablonIndir`)
- [x] Hafta bazlı kazanım görünümü (ders programı gerekmez)
- [x] Çoklu sınıf desteği — her sınıf ayrı `PlanEntry`
- [x] Onboarding (ana ekranda kart)
- [x] Hafta tamamlandı işaretleme + öğretmen notu
- [x] Sınıf başına bağımsız ilerleme takibi (SVG halka)
- [x] Fen Bilimleri 5–8 müfredatı
- [x] Sınıf öğretmeni desteği (composite key, çoklu ders)
- [x] Lead toplama formu (Supabase `leads` tablosu)
- [x] Fen Bilimleri 3–4 müfredatı entegrasyonu (`ilkokulMufredatiniDonustur()` converter ile)

### Yapılacaklar
- [ ] Tüm branşlar için müfredat
- [ ] Arayüz geçiş animasyonları
- [ ] Kullanıcı kaydı (Supabase Auth)
- [ ] Yazdırma / PDF export
- [ ] Push bildirim
- [ ] Google AdSense entegrasyonu
