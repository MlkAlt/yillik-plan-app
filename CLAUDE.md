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

## Uygulama Mimarisi

### İki Ayrı UI Katmanı

**Landing katmanı** (`/`, `/olustur`, `/yukle`, `/plan`) — AppLayout olmadan çalışır.

**App katmanı** (`/app/*`) — `AppLayout` wrapper ile, mobil-öncelikli bottom-nav içerir:
- `/app` → `AppHomeScreen` (bu haftaki kazanım + onboarding)
- `/app/plan` → `PlanPage` (tüm haftalar listesi)
- `/app/ayarlar` → `AppSettingsScreen`
- `/app/hafta/:haftaNo` → `HaftaDetayPage` (hafta tamamlama + not)

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

### Dosya Yükleme

`src/lib/fileParser.ts` — `.xlsx/.xls` için `xlsx` paketi, `.docx` için `mammoth` kullanır.
Excel beklenen format: `[Ay, HaftaNo, Dönem, TarihAralığı, Kazanım]` sütunları.

`src/lib/templateGenerator.ts` — `sablonIndir()` ile boş Excel şablonu indirme.

### Müfredat Verisi

`src/data/mufredat/fen-bilimleri-{3..8}.json` — Her dosya `MufredatJson` tipinde:
```ts
{ ders, sinif, toplamHafta, haftalar: MufredatHafta[] }
// MufredatHafta: { haftaNo, unite, uniteAdi, kazanim, kazanimDetay }
```
Müfredat `haftaNo` ile takvim haftaları eşleştirilir → `Hafta.kazanim/kazanimDetay/uniteAdi` alanlarına atanır.

**Dikkat:** `fen-bilimleri-3.json` ve `fen-bilimleri-4.json` dosyaları mevcut ama `buildPlan()` içinde henüz entegre edilmedi — `planOlustur()` fallback'i kullanıyor.

Yeni branş eklerken:
1. `src/data/mufredat/` altına JSON ekle
2. `AppHomeScreen.tsx`'teki `buildPlan()` fonksiyonuna koşul ekle
3. `DERS_SINIF_MAP` içinde sınıf aralığı tanımla

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
`src/lib/takvimUtils.ts` — `MufredatJson`, `MufredatHafta`, `planOlustur()`, `mufredatliPlanOlustur()`

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

### Yapılacaklar
- [ ] Fen Bilimleri 3–4 müfredatı entegrasyonu (JSON hazır, `buildPlan()` güncellenmeli)
- [ ] Tüm branşlar için müfredat
- [ ] Arayüz geçiş animasyonları
- [ ] Kullanıcı kaydı (Supabase Auth)
- [ ] Yazdırma / PDF export
- [ ] Push bildirim
- [ ] Google AdSense entegrasyonu
