# Design Document — Proje Değerlendirme ve Roadmap

## Overview

Öğretmen Yaver, Türk öğretmenler için MEB takvimine uygun yıllık ders planı oluşturan bir PWA'dır. React + Vite + TypeScript ile geliştirilmiş, Supabase backend ve Vercel hosting ile $0/ay maliyetle çalışmaktadır.

Bu tasarım belgesi mevcut mimarinin güçlü ve zayıf yönlerini analiz eder; ardından üç fazlı geliştirme yol haritasını teknik detaylarıyla ortaya koyar:

- **Faz 1**: Onboarding akışı tamamlama + AppHomeScreen UX iyileştirmesi
- **Faz 2**: UI tutarlılığı + teknik borç çözümleri
- **Faz 3**: Auth + Supabase sync iyileştirmeleri + lead toplama

---

## Architecture

### Mevcut Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  State: planlar[], aktifSinif, user, syncing            │
│  Sorumlu: Auth listener, localStorage hydration,        │
│           Supabase sync orchestration                   │
└──────────┬──────────────────────────────────────────────┘
           │ props
    ┌──────┴──────────────────────────────────────────┐
    │              React Router Routes                │
    │                                                 │
    │  /app          → AppHomeScreen                  │
    │  /app/plan     → PlanPage                       │
    │  /app/ayarlar  → AppSettingsScreen              │
    │  /app/hafta/:n → HaftaDetayPage (prop-less!)    │
    └─────────────────────────────────────────────────┘
```

### İki UI Katmanı

**Landing katmanı** (`/`, `/olustur`, `/yukle`, `/plan`): AppLayout olmadan çalışır. Yeni kullanıcı edinimi ve plan oluşturma için.

**App katmanı** (`/app/*`): `AppLayout` wrapper ile, mobil-öncelikli bottom-nav içerir. Günlük kullanım için.

### Veri Akışı

```
localStorage (birincil)
    ↕ hydration/persist
App.tsx state (planlar, aktifSinif, user)
    ↕ props
Page components
    ↕ (HaftaDetayPage hariç — doğrudan localStorage okur)
Supabase (ikincil, login gerektirir)
```

### Mevcut Mimari: İyi Yönler

- **Sıfır bağımlılık state yönetimi**: Zustand/Redux olmadan App.tsx'te merkezi state, küçük uygulama için yeterli ve anlaşılır.
- **Offline-first tasarım**: localStorage birincil, Supabase ikincil. Bağlantısız çalışma doğal olarak destekleniyor.
- **Müfredat kayıt sistemi**: `mufredatRegistry.ts` + `getMufredat()` genişletilebilir bir pattern. Yeni JSON eklemek tek dosya değişikliği.
- **PlanSelector yeniden kullanımı**: Hem onboarding hem `/olustur` sayfasında aynı bileşen kullanılıyor.
- **Tip güvenliği**: `PlanEntry`, `Hafta`, `OlusturulmusPlan` tipleri iyi tanımlanmış.

### Mevcut Mimari: Sorunlu Yönler

1. **HaftaDetayPage prop-less**: localStorage'dan doğrudan okuyor. `aktif-sinif` değiştiğinde stale veri riski var.
2. **Branş verisi iki kaynakta**: `branchConfig.ts` (UI) ve `dersSinifMap.ts` (AppSettings + export) senkronize tutulması gerekiyor.
3. **`guessDate()` hardcode yıl**: `fileParser.ts` içinde 2025/2026 sabit. Yeni akademik yılda bozulacak.
4. **`tamamlananlar` state'i AppHomeScreen'de**: `useState` ile başlatılıyor, Supabase sync sonrası güncellenmez. Stale progress gösterimi riski.
5. **`console.log` ve `any` kullanımı**: Production build'de gürültü ve tip güvensizliği.
6. **Onboarding akışı yarım**: `onboarding-tamamlandi` localStorage anahtarı kaydediliyor ama kontrol edilmiyor — her plan silindiğinde onboarding yeniden gösteriliyor (bu aslında doğru davranış, ama belgelenmemiş).

---

## Components and Interfaces

### Faz 1: Onboarding + AppHomeScreen Değişiklikleri

#### AppHomeScreen Yeniden Yapılandırması

Mevcut `AppHomeScreen` onboarding ve ana ekranı tek bileşende birleştiriyor. Faz 1'de bu ayrım netleştirilecek:

```
AppHomeScreen
├── OnboardingCard          ← planlar.length === 0 iken gösterilir
│   └── PlanSelector        ← mevcut bileşen, değişmez
└── DashboardView           ← planlar.length > 0 iken gösterilir
    ├── BuHaftaKarti        ← mevcut, küçük iyileştirmeler
    ├── SyncIndicator       ← syncing prop'una bağlı
    └── QuickActions        ← "Plan Oluştur" + "Dosya Yükle"
```

**OnboardingCard değişiklikleri:**
- `onboarding-tamamlandi` localStorage anahtarı `onComplete` callback'inde kaydedilmeli (şu an doğru çalışıyor, belgelenmeli)
- Müfredat bulunamadığında `hasMufredat: false` kontrolü eklenecek, uyarı toast gösterilecek

**BuHaftaKarti iyileştirmeleri:**
- `tamamlananlar` state'i `useEffect` ile Supabase sync sonrası yenilenecek (şu an sadece mount'ta okunuyor)
- Hafta sonu + tatil durumları mevcut, korunacak

#### PlanSelector Arama İyileştirmesi

`BranchStep.tsx`'e arama input'u eklenmesi gerekiyor (şu an yok). Tasarım:

```tsx
// BranchStep içinde
const [query, setQuery] = useState('')
const filtered = BRANCHES.filter(b =>
  b.label.toLowerCase().includes(query.toLowerCase())
)
```

Popüler branşlar (`popular: true`) her zaman üstte gösterilecek, arama sonuçlarında da öncelikli.

#### Müfredat Uyarı Mekanizması

`PlanSelector/index.tsx`'te `handleConfirm` sonrası:

```tsx
const eksikMufredat = entries.filter(e => !buildPlan(e.ders, e.sinif, e.yil).hasMufredat)
if (eksikMufredat.length > 0) {
  // Toast veya inline uyarı göster
  setMufredatUyari(`${eksikMufredat.map(e => e.ders).join(', ')} için müfredat bulunamadı, boş plan oluşturuldu.`)
}
```

### Faz 2: Teknik Borç Çözümleri

#### `guessDate()` Dinamik Yıl Hesaplama

`src/lib/fileParser.ts` içindeki hardcode yıl kaldırılacak:

```ts
// Önce (sorunlu)
function guessDate(ay: string, gun: number): string {
  const yil = ay === 'Eylül' || ay === 'Ekim' ? 2025 : 2026
  // ...
}

// Sonra (dinamik)
function guessDate(ay: string, gun: number, akademikYil?: string): string {
  const [baslangicYil] = (akademikYil || aktifYilBul()).split('-').map(Number)
  const yil = ['Eylül', 'Ekim', 'Kasım', 'Aralık'].includes(ay)
    ? baslangicYil
    : baslangicYil + 1
  // ...
}
```

`aktifYilBul()` zaten `takvimUtils.ts`'te mevcut, import edilecek.

#### Branş Verisi Tek Kaynak

`dersSinifMap.ts` → `branchConfig.ts`'e entegre edilecek. `AppSettingsScreen` ve export fonksiyonları `branchConfig.ts`'ten import edecek:

```ts
// branchConfig.ts'e eklenecek
export function getSiniflarForDers(ders: string): string[] {
  const branch = BRANCHES.find(b => b.lessonId === ders)
  return branch?.classes ?? SINIF_SEVIYELERI
}
```

`DERS_SINIF_MAP` ve `DERS_GRUPLARI` `dersSinifMap.ts`'te kalabilir ama `branchConfig.ts`'ten re-export edilecek.

#### HaftaDetayPage Prop Geçişi

`HaftaDetayPage` şu an localStorage'dan doğrudan okuyor. Faz 2'de `aktifEntry` prop olarak geçilecek:

```tsx
// App.tsx route değişikliği
<Route
  path="/app/hafta/:haftaNo"
  element={
    <AppLayout>
      <HaftaDetayPage entry={aktifEntry} />
    </AppLayout>
  }
/>

// HaftaDetayPage props
interface HaftaDetayPageProps {
  entry: PlanEntry | null
}
```

Bu değişiklik `tamamlanan-haftalar` ve `hafta-notlari` için localStorage okumayı etkilemez — bunlar hâlâ localStorage'dan okunabilir (progress verisi global).

### Faz 3: Auth + Supabase Sync İyileştirmeleri

#### Login Sonrası Progress Sync Sorunu

Mevcut `App.tsx`'te login sonrası `fetchProgressFromSupabase` çağrılıyor ve localStorage ile birleştiriliyor. Ancak `AppHomeScreen`'deki `tamamlananlar` state'i bu güncellemeyi almıyor (sadece mount'ta okunuyor).

Çözüm: `tamamlananlar` state'ini App.tsx'e taşımak ve prop olarak geçmek:

```tsx
// App.tsx'e eklenecek
const [tamamlananlar, setTamamlananlar] = useState<Record<string, number[]>>(() => {
  try {
    const item = localStorage.getItem('tamamlanan-haftalar')
    return item ? JSON.parse(item) : {}
  } catch { return {} }
})

// Supabase sync sonrası güncelleme
setTamamlananlar(mergedTamamlanan)
```

#### Supabase Offline Fallback

Mevcut `try/catch` pattern korunacak. Ek olarak network durumu izlenecek:

```ts
// Supabase çağrıları için wrapper
async function withSupabaseFallback<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}
```

#### Lead Form Görünürlük Mantığı

`AppSettingsScreen`'de mevcut `!user` koşulu doğru. Ek olarak lead form gönderildikten sonra gizlenecek:

```tsx
const [leadGonderildi, setLeadGonderildi] = useState(() =>
  localStorage.getItem('lead-gonderildi') === '1'
)

{!user && !leadGonderildi && (
  <LeadForm
    embedded
    onSuccess={() => {
      localStorage.setItem('lead-gonderildi', '1')
      setLeadGonderildi(true)
    }}
  />
)}
```

---

### Faz 4: UX Parlatma

#### Header Action Slot

`AppLayout`'a opsiyonel `headerAction` prop'u eklenerek sayfa bazlı header butonları desteklenecek:

```tsx
interface AppLayoutProps {
  children: ReactNode
  headerAction?: { label: string; onClick: () => void }
}

// Header içinde
{headerAction && (
  <button
    onClick={headerAction.onClick}
    className="text-sm font-bold text-[#2D5BE3] active:scale-95 transition-all"
  >
    {headerAction.label}
  </button>
)}
```

`PlanPage`'deki export/kaydet butonu bu slot'a taşınacak. Sayfa içindeki sticky buton kaldırılacak.

#### BottomSheet Bileşeni

`src/components/UI/BottomSheet.tsx` — yeni evrensel bottom sheet wrapper:

```tsx
interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

// CSS transition ile slide-up animasyonu
// createPortal ile document.body'e render
// Overlay tıklaması onClose tetikler
```

`AppHomeScreen`'de `planlar.length > 0` iken "Yeni Plan Ekle" butonu QuickActions'a eklenir. Tıklandığında `PlanSelector` bu sheet içinde açılır.

#### Auth Prompt Akışı

Plan oluşturma sonrası (`handlePlanEkle`) kullanıcı login değilse 1.5 saniye gecikmeyle `AuthModal` `mode="prompt"` ile açılır. Bu prompt bir kez gösterilir (`auth-prompt-gosterildi` localStorage anahtarı ile kontrol edilir).

```
Plan oluştur → handlePlanEkle → !user && !promptGosterildi
  → setTimeout 1500ms
  → AuthModal mode="prompt" açılır
  → "Şimdi değil" → localStorage.setItem('auth-prompt-gosterildi', '1') + kapat
  → Login/Kayıt → Supabase sync + kapat
```

---

## Data Models

### localStorage Veri Modeli (Mevcut + Değişiklikler)

```
tum-planlar           → PlanEntry[]
aktif-sinif           → string
ogretmen-ayarlari     → OgretmenAyarlari
onboarding-tamamlandi → "1"
tamamlanan-haftalar   → Record<sinif, number[]>
hafta-notlari         → Record<sinif, Record<string, string>>
bildirim-aktif        → '1' | '0'
bildirim-son-hafta    → string
lead-gonderildi       → "1"   ← YENİ (Faz 3)
auth-prompt-gosterildi → "1"  ← YENİ (Faz 4)
```

```ts
interface OgretmenAyarlari {
  ders: string
  siniflar: string[]
  yil: string
  adSoyad?: string
  okulAdi?: string
  sehir?: string
  ogretmenTuru?: 'sinif' | 'brans'
  sinifGercek?: string
}
```

### PlanEntry (Değişmez)

```ts
interface PlanEntry {
  sinif: string          // composite key: "3. Sınıf—Türkçe" veya "5. Sınıf"
  ders: string
  yil: string            // "2025-2026"
  tip: 'meb' | 'yukle'
  plan: OlusturulmusPlan | null
  rows: ParsedRow[] | null
  label?: string         // görüntüleme adı (sınıf öğretmeni için ders adı)
  sinifGercek?: string   // "3. Sınıf" (composite key'den ayrıştırılmış)
}
```

### Supabase Tabloları (Değişmez)

```sql
-- plans: user_id + sinif unique constraint
plans (user_id, sinif, ders, yil, tip, plan_json, rows_json, label, sinif_gercek)

-- user_progress: user_id PK
user_progress (user_id, tamamlanan_json, notlar_json, updated_at)

-- leads: iletişim bilgileri
leads (id, ad, email, created_at)
```

### Müfredat JSON Formatları

**Ortaokul/Lise formatı** (5-12. sınıf):
```ts
interface MufredatJson {
  ders: string
  sinif: string
  toplamHafta: number
  haftalar: Array<{
    haftaNo: number
    unite: number
    uniteAdi: string
    kazanim: string
    kazanimDetay: string
  }>
}
```

**İlkokul formatı** (1-4. sınıf) → `ilkokulMufredatiniDonustur()` ile MufredatJson'a çevrilir:
```ts
interface IlkokulMufredatJson {
  ders: string
  sinif: string
  uniteler: Array<{
    no: number
    ad: string
    kazanimlar: Array<{ kod: string; baslik: string; adimlar: string[] }>
  }>
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Onboarding görünürlük invariantı

*For any* `AppHomeScreen` render'ı, eğer `planlar` dizisi boşsa onboarding kartı görünür olmalı; `planlar` dizisi en az bir eleman içeriyorsa onboarding kartı görünmemeli ve `BuHaftaKarti` render edilmeli.

**Validates: Requirements 1.1, 1.3**

---

### Property 2: Onboarding tamamlama round-trip

*For any* geçerli `PlanEntry[]` dizisi ile `PlanSelector.onComplete` çağrıldığında, `localStorage.getItem('onboarding-tamamlandi')` değeri `'1'` olmalı ve `onPlanEkle` callback'i çağrılmış olmalı.

**Validates: Requirements 1.2**

---

### Property 3: Müfredat bulunamadığında boş plan invariantı

*For any* branş ve sınıf kombinasyonu için `buildPlan()` çağrıldığında, `getMufredat()` null döndürse bile sonuç `OlusturulmusPlan` geçerli bir nesne olmalı (`haftalar` dizisi boş olmamalı).

**Validates: Requirements 1.6, 3.4**

---

### Property 4: Müfredat kayıt round-trip

*For any* `mufredatRegistry.ts`'e kayıtlı branş/sınıf kombinasyonu için `getMufredat(ders, sinif)` non-null döndürmeli.

**Validates: Requirements 3.5**

---

### Property 5: İlkokul müfredat dönüşüm invariantı

*For any* geçerli `IlkokulMufredatJson` nesnesi için `ilkokulMufredatiniDonustur()` çağrıldığında, sonuç `MufredatJson`'un `haftalar` dizisi boş olmamalı ve her `haftaNo` benzersiz, sıralı (1'den başlayan) olmalı.

**Validates: Requirements 3.6**

---

### Property 6: `guessDate()` yıl hesaplama doğruluğu

*For any* akademik yıl string'i ve ay adı için `guessDate()` çağrıldığında, Eylül-Aralık ayları için başlangıç yılı, Ocak-Ağustos ayları için bitiş yılı döndürülmeli.

**Validates: Requirements 5.1**

---

### Property 7: Bulut-yerel merge stratejisi

*For any* yerel `PlanEntry[]` ve bulut `PlanEntry[]` kombinasyonu için merge işlemi sonucunda, aynı `sinif` key'ine sahip çakışmalarda bulut versiyonu korunmalı; yalnızca yerelde olan planlar ise sonuç dizisinde yer almalı.

**Validates: Requirements 7.2**

---

### Property 8: Çıkış sonrası localStorage korunması

*For any* oturum açık durumda `signOut()` çağrıldığında, `localStorage.getItem('tum-planlar')` değeri `null` olmamalı (önceden plan varsa).

**Validates: Requirements 7.6**

---

### Property 9: Export fonksiyonları hata fırlatmama invariantı

*For any* geçerli `PlanEntry` nesnesi için `exportPlanToExcel()`, `exportPlanToWord()` ve `exportPlanToPrint()` fonksiyonları exception fırlatmamalı.

**Validates: Requirements 8.1, 8.2, 8.3**

---

### Property 10: Lead form zorunlu alan validasyonu

*For any* form gönderimi için, `ad` veya `email` alanı boş/whitespace-only ise submit reddedilmeli; her ikisi de dolu ise submit kabul edilmeli.

**Validates: Requirements 6.3**

---

## Error Handling

### Supabase Erişilemezlik

Tüm Supabase çağrıları `try/catch` ile sarılı. Hata durumunda:
- Kullanıcıya hata gösterilmez (sessiz fallback)
- localStorage verisi korunur
- `syncing` state `false`'a döner

```ts
// App.tsx pattern (mevcut, korunacak)
try {
  const bulutPlanlar = await fetchPlansFromSupabase(newUser.id)
  // merge...
} catch {
  // Supabase erişilemiyorsa localStorage'a devam et
} finally {
  setSyncing(false)
}
```

### localStorage Okuma Hataları

Tüm `localStorage.getItem` + `JSON.parse` çağrıları `try/catch` ile sarılı. Parse hatası durumunda varsayılan değer kullanılır.

### Müfredat Bulunamama

`getMufredat()` null döndürdüğünde `buildPlan()` `planOlustur()` ile boş plan oluşturur. Kullanıcıya `mufredatUyari` state üzerinden bilgi verilir.

### Form Validasyon Hataları

`LeadForm` ve `AuthModal` inline hata mesajları gösterir. Supabase auth hataları Türkçe'ye çevrilir:
- `Invalid login credentials` → "E-posta veya şifre hatalı"
- `User already registered` → "Bu e-posta zaten kayıtlı"

---

## Testing Strategy

### Dual Testing Approach

Hem unit testler hem property-based testler kullanılacak. Unit testler belirli örnekleri ve edge case'leri kapsar; property testler evrensel özellikleri tüm girdiler üzerinde doğrular.

### Test Altyapısı

**Test framework**: Vitest (Vite ile native entegrasyon)
**Property-based testing**: fast-check (TypeScript desteği güçlü)
**Component testing**: @testing-library/react

```bash
npm install -D vitest @testing-library/react fast-check
```

`vite.config.ts`'e eklenecek:
```ts
test: {
  environment: 'jsdom',
  globals: true,
}
```

### Unit Test Kapsamı

Kritik iş mantığı fonksiyonları için belirli örnekler:

```ts
// buildPlan() — müfredat var/yok durumları
describe('buildPlan', () => {
  it('müfredat varsa hasMufredat: true döner', () => {
    const result = buildPlan('Matematik', '5. Sınıf', '2025-2026')
    expect(result.hasMufredat).toBe(true)
    expect(result.plan.haftalar.length).toBeGreaterThan(0)
  })
  it('müfredat yoksa hasMufredat: false, plan yine de geçerli', () => {
    const result = buildPlan('Bilinmeyen Ders', '5. Sınıf', '2025-2026')
    expect(result.hasMufredat).toBe(false)
    expect(result.plan.haftalar.length).toBeGreaterThan(0)
  })
})
```

### Property-Based Test Kapsamı

Her property için minimum 100 iterasyon. Her test, tasarım belgesindeki property'ye referans verir.

```ts
import fc from 'fast-check'

// Feature: proje-degerlendirme-ve-roadmap, Property 3: Müfredat bulunamadığında boş plan invariantı
test('buildPlan her zaman geçerli plan döner', () => {
  fc.assert(
    fc.property(
      fc.string(), // rastgele ders adı
      fc.constantFrom('5. Sınıf', '6. Sınıf', '9. Sınıf', '1. Sınıf'),
      fc.constantFrom('2025-2026', '2026-2027'),
      (ders, sinif, yil) => {
        const result = buildPlan(ders, sinif, yil)
        return result.plan.haftalar.length > 0
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: proje-degerlendirme-ve-roadmap, Property 5: İlkokul müfredat dönüşüm invariantı
test('ilkokulMufredatiniDonustur haftaNo sıralı ve benzersiz', () => {
  fc.assert(
    fc.property(
      fc.record({
        ders: fc.string(),
        sinif: fc.string(),
        uniteler: fc.array(
          fc.record({
            no: fc.nat(),
            ad: fc.string(),
            kazanimlar: fc.array(
              fc.record({
                kod: fc.string(),
                baslik: fc.string(),
                adimlar: fc.array(fc.string()),
              }),
              { minLength: 1 }
            ),
          }),
          { minLength: 1 }
        ),
      }),
      (json) => {
        const result = ilkokulMufredatiniDonustur(json)
        const haftaNolar = result.haftalar.map(h => h.haftaNo)
        const benzersiz = new Set(haftaNolar).size === haftaNolar.length
        const sirali = haftaNolar.every((n, i) => i === 0 || n === haftaNolar[i - 1] + 1)
        return benzersiz && sirali && result.haftalar.length > 0
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: proje-degerlendirme-ve-roadmap, Property 7: Bulut-yerel merge stratejisi
test('merge işleminde bulut planı öncelikli', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ sinif: fc.string(), ders: fc.string() })),
      fc.array(fc.record({ sinif: fc.string(), ders: fc.string() })),
      (yerel, bulut) => {
        // Çakışan sinif key'leri için bulut versiyonu kazanmalı
        const merged = mergePlans(yerel, bulut)
        return bulut.every(b =>
          merged.find(m => m.sinif === b.sinif)?.ders === b.ders
        )
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: proje-degerlendirme-ve-roadmap, Property 6: guessDate yıl hesaplama
test('guessDate Eylül-Aralık için başlangıç yılı döner', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('Eylül', 'Ekim', 'Kasım', 'Aralık'),
      fc.integer({ min: 1, max: 28 }),
      fc.constantFrom('2025-2026', '2026-2027'),
      (ay, gun, akademikYil) => {
        const [baslangicYil] = akademikYil.split('-').map(Number)
        const tarih = guessDate(ay, gun, akademikYil)
        return new Date(tarih).getFullYear() === baslangicYil
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: proje-degerlendirme-ve-roadmap, Property 10: Lead form validasyonu
test('boş/whitespace ad veya email reddedilir', () => {
  fc.assert(
    fc.property(
      fc.oneof(fc.constant(''), fc.string().filter(s => s.trim() === '')),
      fc.string().filter(s => s.includes('@')),
      (bosAd, gecerliEmail) => {
        const result = validateLeadForm({ ad: bosAd, email: gecerliEmail })
        return result.valid === false
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test Öncelik Sırası

1. `buildPlan()` + `getMufredat()` — en kritik iş mantığı
2. `ilkokulMufredatiniDonustur()` — veri dönüşümü
3. `planOlustur()` + `mufredatliPlanOlustur()` — takvim hesaplama
4. Merge stratejisi — Supabase sync doğruluğu
5. Export fonksiyonları — hata fırlatmama garantisi
