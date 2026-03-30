# Tasarım Belgesi: UX Yeniden Tasarım

## Genel Bakış

Bu belge, Yıllık Plan uygulamasının kapsamlı UX yeniden tasarımının teknik mimarisini tanımlar. Onboarding akışı, ana ekran hiyerarşisi, ilerleme göstergesi, boş durum, bildirim sistemi, navigasyon, dil, tek el kullanımı, auth motivasyonu ve renk sistemi olmak üzere 10 gereksinim ele alınmaktadır.

Mevcut teknik yığın: **React + TypeScript + Tailwind CSS + Vite**, Supabase auth/sync, localStorage, React Router.

### Tasarım Hedefleri

- Öğretmenin uygulamayı ilk açışından itibaren değer görmesi
- Tüm geri bildirimlerin tek bir merkezi sistemden yönetilmesi
- Birincil aksiyonların başparmak erişim bölgesinde konumlandırılması
- Teknik jargonun tamamen kaldırılması
- Renk sisteminin anlamlı ve tutarlı hale getirilmesi

---

## Mimari

### Bileşen Ağacı (Güncel → Hedef)

```
Mevcut:
App
├── AppLayout (header + bottom nav)
│   ├── AppHomeScreen (onboarding + dashboard)
│   ├── AppSettingsScreen
│   ├── PlanPage
│   └── HaftaDetayPage

Hedef:
App
├── ToastProvider (yeni — merkezi bildirim sistemi)
├── AppLayout (header + bottom nav — sadeleştirilmiş)
│   ├── AppHomeScreen (yeniden yapılandırılmış hiyerarşi)
│   │   ├── BuHaftaKarti (birincil içerik — üstte)
│   │   ├── IlerlemeGostergesi (bağlamsal metin)
│   │   └── BosdurumuEkrani (değer önerisi + sosyal kanıt)
│   ├── AppSettingsScreen
│   ├── PlanPage
│   └── HaftaDetayPage
└── OnboardingFlow (yeniden yapılandırılmış — değer önce)
    ├── DegerOnizleme (yeni adım)
    ├── BransSecim
    └── SinifSecim
```

### Veri Akışı

```
localStorage ←→ App (state) ←→ Supabase
                    ↓
              ToastProvider (context)
                    ↓
              Tüm bileşenler useToast() hook'u ile bildirim gönderir
```

---

## Bileşenler ve Arayüzler

### 1. ToastProvider ve useToast Hook'u (Gereksinim 5)

Mevcut durumda bildirimler dağınık: `AppHomeScreen`'de inline sync mesajı, `HaftaDetayPage`'de `notKaydedildi` state'i, `AppSettingsScreen`'de `kaydedildi` state'i ayrı ayrı yönetiliyor. Bunların tümü tek bir sisteme taşınacak.

```typescript
// src/lib/toast.tsx
type ToastTipi = 'basari' | 'hata' | 'bilgi' | 'uyari'

interface Toast {
  id: string
  tip: ToastTipi
  mesaj: string
  sure?: number // ms, varsayılan 3000
}

interface ToastContextValue {
  goster: (mesaj: string, tip?: ToastTipi, sure?: number) => void
  kapat: (id: string) => void
}
```

**Kural:** Aynı anda yalnızca bir toast görünür. Yeni toast geldiğinde önceki hemen kapanır.

**Konum:** Ekranın alt-ortası (`bottom-20` — alt nav'ın hemen üstü), `fixed` konumlandırma.

**Süre:** Minimum 3 saniye (Gereksinim 5.6).

### 2. OnboardingFlow Yeniden Yapılandırması (Gereksinim 1)

Mevcut `AppHomeScreen` içindeki onboarding, doğrudan form adımlarıyla başlıyor. Yeni akış:

```
Adım 0: DegerOnizleme (YENİ)
  - Örnek plan kartı (statik/mock veri)
  - "Dakikalar içinde yıllık planın hazır" başlığı
  - "Başla →" butonu
  - Zorunlu form alanı YOK

Adım 1: BransSecim (mevcut BranchStep)
Adım 2: SinifSecim (mevcut ClassStep / LessonClassStep)
Adım 3: Tamamlandı → /app/plan'a yönlendir
```

**localStorage anahtarı:** `onboarding-tamamlandi` — mevcut anahtar korunur.

**Geri tuşu davranışı:** Her adımda `onGeri` callback'i ile önceki adıma dönülür; tarayıcı history'ye push yapılmaz.

### 3. AppHomeScreen İçerik Hiyerarşisi (Gereksinim 2)

Mevcut sıra: Karşılama başlığı → BuHaftaKarti → Hızlı Erişim

Yeni sıra:
```
1. BuHaftaKarti          ← birincil içerik, fold üstünde
2. IlerlemeGostergesi    ← bağlamsal metin (Gereksinim 3)
3. Karşılama mesajı      ← ikincil, küçük font
4. Hızlı Erişim butonları
```

Karşılama mesajı (`h1` → `p` veya küçük `h2`) görsel ağırlığını kaybeder; `BuHaftaKarti` sayfanın odak noktası olur.

### 4. IlerlemeGostergesi Bileşeni (Gereksinim 3)

```typescript
interface IlerlemeGostergesiProps {
  tamamlanan: number
  toplam: number
  baslangicTarihi: string // ISO
  bitisTarihi: string     // ISO
}
```

**Hesaplama mantığı:**

```typescript
function ilerlemeMetniHesapla(props: IlerlemeGostergesiProps): string {
  if (props.toplam === 0) return 'Plan verisi yükleniyor...'
  if (props.tamamlanan >= props.toplam) return '🎉 Tüm haftaları tamamladın!'
  
  const kalan = props.toplam - props.tamamlanan
  const bitisAyi = new Date(props.bitisTarihi)
    .toLocaleDateString('tr-TR', { month: 'long' })
  
  return `${kalan} hafta kaldı · ${bitisAyi}'da tamamlanır`
}
```

**Plan dönemi dışı:** Sonraki aktif haftanın başlangıç tarihini gösterir.

**Veri yoksa:** "Planın hazır, haftaları takip etmeye başla" gibi nötr mesaj.

### 5. BosdurumuEkrani (Gereksinim 4)

Mevcut boş durum doğrudan `PlanSelector` formunu gösteriyor. Yeni yapı:

```
BosdurumuEkrani
├── DegerOneriKarti
│   ├── İkon + başlık
│   ├── 3 madde: somut fayda listesi
│   └── SosyalKanit (kullanıcı sayısı veya örnek plan önizlemesi)
└── BirincilAksiyonButonu ("Planımı Oluştur →")
    → OnboardingFlow'u tetikler (Gereksinim 1 akışı)
```

Form alanları bu ekranda YOK. Tüm form adımları OnboardingFlow içinde.

### 6. AppLayout — Navigasyon Sadeleştirmesi (Gereksinim 6)

Mevcut 3 sekme: Ana | Planım | Ayarlar

Hedef 3 sekme: Ana | Planım | (Avatar/profil ikonu)

```typescript
const tabs = [
  { name: 'Ana', path: '/app', icon: HomeIcon },
  { name: 'Planım', path: '/app/plan', icon: CalendarIcon },
]
// Üçüncü öğe: avatar butonu → /app/ayarlar
```

**Aktif sekme vurgulama:** Alt sayfalarda (`/app/hafta/:no`) üst sekme (`Planım`) vurgulu kalır — mevcut mantık korunur.

**Aktif sekmeye tekrar tıklama:** `navigate(tab.path, { replace: true })` ile kök sayfaya döner.

### 7. AuthModal Güçlendirmesi (Gereksinim 9)

```typescript
interface AuthModalProps {
  onClose: () => void
  mode?: 'default' | 'prompt'
  planBaglami?: {  // YENİ — kişiselleştirilmiş mesaj için
    ders: string
    sinif: string
  }
}
```

**Motivasyon içeriği (prompt modunda):**

```
☁️ Planını güvende tut

✓ Telefon değişse de planların kaybolmaz
✓ Geçen yılın planını bir tıkla tekrar kullan  
✓ Meslektaşlarınla kolayca paylaş

[planBaglami varsa]: "Az önce oluşturduğun {ders} planını kaydet"
```

Form, motivasyon içeriğinin **altında** gösterilir.

**"Şimdi değil" butonu:** Her zaman görünür, kullanıcıyı zorla giriş yaptırmaz (Gereksinim 9.5).

### 8. Renk Sistemi Token'ları (Gereksinim 10)

Mevcut durumda `#2D5BE3` (mavi) hem başlık, hem link, hem aktif durum için kullanılıyor.

**Yeni token yapısı (Tailwind CSS custom colors):**

```javascript
// tailwind.config.js
colors: {
  'aksiyon': '#2D5BE3',      // Tıklanabilir öğeler, butonlar, linkler
  'aktif': '#F59E0B',        // Aktif/seçili durum, navigasyon vurgusu
  'basari': '#059669',       // Tamamlandı, başarı durumu
  'icerik': '#1C1917',       // Başlık ve etiket metinleri
  'ikincil': '#6B7280',      // Yardımcı metin, açıklama
  'sinir': '#E7E5E4',        // Kenarlık, ayırıcı
  'zemin': '#FAFAF9',        // Kart arka planı
}
```

**Kural:** Başlık/etiket metinleri `icerik` rengi kullanır. Tıklanabilir öğeler `aksiyon` rengi kullanır. Aktif durum `aktif` rengi kullanır. Aynı renk iki farklı anlam için kullanılmaz.

**Renk körü desteği (Gereksinim 10.4):** Tıklanabilir öğelerde renk dışında en az bir ek ipucu:
- Butonlar: dolgu arka plan + köşe yuvarlama
- Linkler: alt çizgi veya ok ikonu
- Aktif sekme: nokta göstergesi (mevcut) + kalın yazı

---

## Veri Modelleri

### Toast Veri Modeli

```typescript
// src/lib/toast.tsx
interface Toast {
  id: string           // crypto.randomUUID() veya Date.now().toString()
  tip: 'basari' | 'hata' | 'bilgi' | 'uyari'
  mesaj: string
  sure: number         // ms, varsayılan 3000 (min 3000 — Gereksinim 5.6)
}
```

### Onboarding Adım Modeli

```typescript
// AppHomeScreen içinde
type OnboardingAdim = 'deger-onizleme' | 'brans' | 'sinif' | 'tamamlandi'
```

### İlerleme Hesaplama Modeli

```typescript
interface IlerlemeVerisi {
  tamamlanan: number
  toplam: number        // tatil haftaları hariç
  tahminibitisTarihi: string  // ISO — son hafta bitiş tarihi
  planDonemiDisi: boolean
  sonrakiHaftaBaslangic?: string  // plan dönemi dışındaysa
}
```

### Renk Token Referansı

```typescript
// src/lib/renkTokenlari.ts
export const RENKLER = {
  AKSIYON: 'text-aksiyon bg-aksiyon',
  AKTIF: 'text-aktif bg-aktif',
  BASARI: 'text-basari bg-basari',
  ICERIK: 'text-icerik',
  IKINCIL: 'text-ikincil',
} as const
```

---

## Doğruluk Özellikleri

*Bir özellik (property), sistemin tüm geçerli çalışmalarında doğru olması gereken bir karakteristik veya davranıştır — temelde sistemin ne yapması gerektiğine dair biçimsel bir ifadedir. Özellikler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasındaki köprüyü oluşturur.*

### Özellik 1: Onboarding tamamlandı bilgisi kalıcı olarak kaydedilir

*Her* onboarding akışı tamamlandığında, `localStorage`'da `onboarding-tamamlandi` anahtarı `'1'` değeriyle yazılmış olmalı ve uygulama yeniden açıldığında onboarding tekrar gösterilmemelidir.

**Doğrular: Gereksinim 1.4**

### Özellik 2: Onboarding geri tuşu önceki adıma döner

*Her* onboarding adımında (değer önizleme hariç ilk adım) geri tuşuna basıldığında, akış bir önceki adıma dönmeli; uygulamadan çıkılmamalı ve adım sayacı azalmalıdır.

**Doğrular: Gereksinim 1.5**

### Özellik 3: Toast bildirimi minimum 3 saniye görünür kalır

*Her* toast bildirimi gösterildiğinde, kullanıcı manuel olarak kapatmadıkça en az 3000ms ekranda kalmalıdır.

**Doğrular: Gereksinim 5.6**

### Özellik 4: Aynı anda yalnızca bir bildirim görünür

*Her* yeni toast bildirimi gösterildiğinde, önceki toast kaldırılmış olmalı; ekranda aynı anda birden fazla çakışan bildirim bulunmamalıdır.

**Doğrular: Gereksinim 5.5**

### Özellik 5: İlerleme metni bağlamsal ve motivasyon odaklı

*Her* geçerli plan verisi için (`toplam > 0` ve `tamamlanan < toplam`), `ilerlemeMetniHesapla` fonksiyonu ham sayısal oran (`tamamlanan/toplam` formatı) içermeyen, kalan hafta sayısı ve tahmini bitiş ayını içeren bir metin döndürmelidir.

**Doğrular: Gereksinim 3.1, 3.4**

### Özellik 6: Plan verisi yokken ilerleme göstergesi nötr mesaj gösterir

*Her* `toplam === 0` durumunda `ilerlemeMetniHesapla` fonksiyonu boş string veya hata mesajı yerine uzunluğu sıfırdan büyük nötr bir durum metni döndürmelidir.

**Doğrular: Gereksinim 3.5**

### Özellik 7: Tüm haftalar tamamlandığında tebrik mesajı gösterilir

*Her* `tamamlanan >= toplam` (`toplam > 0`) koşulunda `ilerlemeMetniHesapla` fonksiyonu tebrik içeren bir metin döndürmelidir.

**Doğrular: Gereksinim 3.2**

### Özellik 8: Auth modalı motivasyon içeriği formdan önce gelir

*Her* `prompt` modunda açılan `AuthModal` için, motivasyon içeriği (fayda listesi) DOM sırasında form alanlarından önce render edilmelidir.

**Doğrular: Gereksinim 9.4**

---

## Hata Yönetimi

### Toast Hata Bildirimleri

Tüm hata durumları `useToast().goster(mesaj, 'hata')` üzerinden iletilir. Teknik hata mesajları kullanıcıya gösterilmez; bunun yerine eylem odaklı Türkçe mesajlar kullanılır:

| Teknik Hata | Kullanıcıya Gösterilen |
|---|---|
| `Invalid login credentials` | E-posta veya şifre hatalı. |
| `User already registered` | Bu e-posta zaten kayıtlı. |
| `Network error` | Bağlantı sorunu. Lütfen tekrar dene. |
| `localStorage quota exceeded` | Depolama alanı dolu. Eski planları sil. |

### Onboarding Hata Durumları

- Müfredat verisi bulunamazsa: Toast ile bildirim + onboarding tamamlanmış sayılır (kullanıcı bloklanmaz)
- localStorage yazma hatası: Sessiz hata, kullanıcı akışa devam eder

### İlerleme Hesaplama Hata Durumları

- `toplam === 0`: Nötr mesaj gösterilir, sıfıra bölme yapılmaz
- Geçersiz tarih: `tahminibitisTarihi` hesaplanamıyorsa ay bilgisi gösterilmez

---

## Test Stratejisi

### Birim Testler (Örnek Tabanlı)

Belirli örnekler, kenar durumlar ve hata koşulları için:

- **Onboarding akışı:** Değer önizleme adımında zorunlu form alanı olmadığı; "Başla" butonuna tıklandığında branş adımına geçildiği
- **Boş durum ekranı:** `planlar.length === 0` olduğunda değer önerisi, sosyal kanıt ve birincil aksiyon butonunun render edildiği; form alanlarının içerikten sonra geldiği
- **AuthModal prompt modu:** En az 2 somut fayda maddesinin render edildiği; `planBaglami` verildiğinde ders adının motivasyon metninde geçtiği; "Şimdi değil" butonunun her zaman görünür olduğu
- **Navigasyon yapısı:** Alt navigasyonun en fazla 3 öğe içerdiği; `/app/hafta/:no` rotasında "Planım" sekmesinin aktif göründüğü; aktif sekmeye tıklandığında kök path'e navigate edildiği
- **Toast konumu:** Toast bileşeninin `fixed` CSS sınıfına sahip olduğu; farklı tiplerin farklı renk sınıflarıyla render edildiği
- **Sistem mesajları:** Sync mesajının "Supabase" kelimesi içermediği; hata mesajlarının teknik kod içermediği
- **Renk token dosyası:** `src/lib/renkTokenlari.ts` dosyasının mevcut olduğu ve gerekli token'ları export ettiği

### Özellik Tabanlı Testler (Property-Based Testing)

**Kütüphane:** `fast-check` (TypeScript için)

**Konfigürasyon:** Her özellik testi minimum 100 iterasyon çalıştırır.

**Etiket formatı:** `// Feature: ux-yeniden-tasarim, Property {N}: {özellik_metni}`

#### Özellik Testi 1 — Onboarding kalıcılığı
```typescript
// Feature: ux-yeniden-tasarim, Property 1: onboarding tamamlandi kalici kaydedilir
fc.assert(fc.property(fc.constant(null), () => {
  localStorage.clear()
  simulateOnboardingComplete()
  expect(localStorage.getItem('onboarding-tamamlandi')).toBe('1')
  // Yeniden render → onboarding adımı gösterilmemeli
  const { queryByTestId } = render(<AppHomeScreen ... />)
  expect(queryByTestId('onboarding-deger-onizleme')).toBeNull()
}), { numRuns: 100 })
```

#### Özellik Testi 2 — Onboarding geri tuşu
```typescript
// Feature: ux-yeniden-tasarim, Property 2: onboarding geri tusu onceki adima doner
fc.assert(fc.property(
  fc.integer({ min: 1, max: 2 }), // adım indeksi (0 = değer önizleme, geri tuşu yok)
  (adimIndeksi) => {
    const { result } = renderHook(() => useOnboardingAdim(adimIndeksi))
    act(() => result.current.geriGit())
    expect(result.current.adim).toBe(adimIndeksi - 1)
  }
), { numRuns: 100 })
```

#### Özellik Testi 3 — Toast minimum süre
```typescript
// Feature: ux-yeniden-tasarim, Property 3: toast minimum 3 saniye gorunur
fc.assert(fc.property(
  fc.string({ minLength: 1 }),
  fc.constantFrom('basari' as const, 'hata' as const, 'bilgi' as const, 'uyari' as const),
  (mesaj, tip) => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.goster(mesaj, tip))
    // 2999ms sonra hâlâ görünür olmalı
    jest.advanceTimersByTime(2999)
    expect(result.current.aktifToast).not.toBeNull()
  }
), { numRuns: 100 })
```

#### Özellik Testi 4 — Tek toast kuralı
```typescript
// Feature: ux-yeniden-tasarim, Property 4: ayni anda tek toast gorunur
fc.assert(fc.property(
  fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
  (mesajlar) => {
    const { result } = renderHook(() => useToast())
    mesajlar.forEach(m => act(() => result.current.goster(m)))
    // Ekranda yalnızca 1 toast olmalı
    expect(result.current.toastListesi.length).toBeLessThanOrEqual(1)
  }
), { numRuns: 100 })
```

#### Özellik Testi 5 — İlerleme metni bağlamsal (ham oran içermez)
```typescript
// Feature: ux-yeniden-tasarim, Property 5: ilerleme metni ham oran icermez
fc.assert(fc.property(
  fc.integer({ min: 0, max: 35 }),
  fc.integer({ min: 1, max: 36 }),
  fc.string(), // bitiş tarihi
  (tamamlanan, toplam, bitisTarihi) => {
    fc.pre(tamamlanan < toplam)
    const metin = ilerlemeMetniHesapla({ tamamlanan, toplam, bitisTarihi, planDonemiDisi: false })
    // "tamamlanan/toplam" formatı içermemeli
    return !metin.includes(`${tamamlanan}/${toplam}`)
  }
), { numRuns: 100 })
```

#### Özellik Testi 6 — Veri yokken nötr mesaj (boş string döndürmez)
```typescript
// Feature: ux-yeniden-tasarim, Property 6: veri yokken notr mesaj dondurur
fc.assert(fc.property(fc.constant(0), (toplam) => {
  const metin = ilerlemeMetniHesapla({ tamamlanan: 0, toplam, bitisTarihi: '', planDonemiDisi: false })
  return metin.length > 0
}), { numRuns: 100 })
```

#### Özellik Testi 7 — Tamamlandı tebrik mesajı
```typescript
// Feature: ux-yeniden-tasarim, Property 7: tamamlandi tebrik mesaji gosterilir
fc.assert(fc.property(
  fc.integer({ min: 1, max: 36 }),
  fc.string(),
  (toplam, bitisTarihi) => {
    const metin = ilerlemeMetniHesapla({ tamamlanan: toplam, toplam, bitisTarihi, planDonemiDisi: false })
    return metin.includes('🎉') || metin.toLowerCase().includes('tamamla')
  }
), { numRuns: 100 })
```
