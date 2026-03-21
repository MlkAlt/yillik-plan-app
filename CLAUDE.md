# Yıllık Plan Uygulaması — CLAUDE.md

## Proje Özeti
Öğretmenler için yıllık ders planı oluşturma ve görüntüleme uygulaması.
- Kullanıcılar kendi planlarını yükleyebilir VEYA MEB takvimine göre otomatik oluşturabilir
- Haftalık / günlük kazanım görünümü (sınıf defteri yazarken referans olarak kullanılır)
- Hedef: Öğretmenler için ücretsiz, lead toplama için de kullanılacak

## Hedef Kitle
- Türk öğretmenler (ilk hedef: lead formu dolduranlar)
- Uygulama sahibi: Melik (kendi kullanımı + lead toplama)

## Tech Stack (Sabit — Değiştirme)

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Frontend | React + Vite | Hızlı, PWA desteği, geniş ekosistem |
| Stil | Tailwind CSS | Hızlı geliştirme, mobil öncelikli |
| Backend / DB | Supabase (free tier) | PostgreSQL + Auth + Storage + Edge Functions |
| Hosting | Vercel (free tier) | CI/CD dahil, sıfır maliyet |
| Reklam | Google AdSense | İleride eklenecek |

**Maliyet hedefi: $0/ay** — Tüm servisler free tier sınırları içinde kalacak.

## Temel Özellikler

### Tamamlanan
- [x] MEB takvimine göre otomatik yıllık plan oluşturma
- [x] Excel/Word yükleme ile plan import
- [x] Haftalık kazanım görünümü (hafta bazlı — günlük değil, ders programı gerekmez)
- [x] Çoklu sınıf desteği (aynı öğretmen 6. ve 7. sınıfa girebilir)
- [x] Onboarding (ana ekranda kart — ayrı sayfa değil)
- [x] Hafta tamamlandı işaretleme + öğretmen notu
- [x] Sınıf başına bağımsız ilerleme takibi
- [x] Ana ekranda bu haftanın kazanım özeti (sınıf sekmeli, SVG halka)
- [x] Fen Bilimleri 5–8. sınıf müfredatı (kazanım + ünite + detay)

### Yapılacaklar
- [ ] Tüm branşlar için müfredat tamamlanması
- [ ] Arayüz geçiş animasyonları
- [ ] Lead toplama formu (ad, soyad, okul, email)
- [ ] Kullanıcı kaydı (Supabase Auth)
- [ ] Yazdırma / PDF export
- [ ] Push bildirim (haftalık kazanım hatırlatması)
- [ ] Google AdSense entegrasyonu

## localStorage Veri Modeli (Supabase öncesi)

Supabase entegre edilene kadar tüm veri localStorage'da tutuluyor.

```
ogretmen-ayarlari   → { ders, siniflar: string[], yil, adSoyad?, okulAdi?, sehir? }
tum-planlar         → PlanEntry[]  (her sınıf için ayrı obje)
aktif-sinif         → string  (şu an görüntülenen sınıf)
onboarding-tamamlandi → "1"
tamamlanan-haftalar → Record<sinif, number[]>  — örn: { "6. Sınıf": [1,2,3] }
hafta-notlari       → Record<sinif, Record<string, string>>
```

`PlanEntry` tipi (`src/types/planEntry.ts`):
```
{ sinif, ders, yil, tip: 'meb'|'yukle', plan: OlusturulmusPlan|null, rows: ParsedRow[]|null }
```

### Supabase Tabloları (ileride)
```
users, yillik_planlar, haftalar, kazanimlar, leads
```

## Klasör Yapısı
```
src/
  components/     → Tekrar kullanılabilir UI bileşenleri
  pages/          → Sayfa bileşenleri (router'a bağlı)
  hooks/          → Custom React hooks
  lib/            → Supabase client, yardımcı fonksiyonlar
  data/           → MEB takvimi JSON dosyaları, statik veri
  types/          → TypeScript tip tanımları
```

## Kodlama Kuralları

- **Dil:** Türkçe değişken/fonksiyon isimleri YASAK — İngilizce kullan (evrensel)
- **Yorumlar:** Türkçe yorum satırları kabul edilebilir
- **Componentler:** Her bileşen kendi klasöründe (Component/index.tsx + Component.tsx)
- **TypeScript:** Zorunlu — `any` kullanma
- **Async:** async/await kullan, .then() zinciri yapma
- **Error handling:** Her Supabase çağrısında try/catch
- **Stil:** Tailwind class'ları, custom CSS sadece zorunluluk halinde

## Yapılmaması Gerekenler
- ❌ Ücretli API veya servis ekleme (free tier dışına çıkma)
- ❌ Karmaşık state management (Redux vs) — Zustand yeterli olursa o, yoksa React Context
- ❌ SSR (Server Side Rendering) — Static + client-side yeterli
- ❌ Birden fazla dil desteği — Sadece Türkçe UI
- ❌ `console.log` bırakma production'da

## Ortam Değişkenleri (.env.local)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Komutlar
```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run preview    # Build önizleme
npm run lint       # ESLint kontrol
```

## Önemli Notlar
- Uygulama PWA olacak → Öğretmenler ana ekrana ekleyebilsin
- Mobil öncelikli tasarım (öğretmenler telefonda kullanacak)
- MEB takvim verisi src/data/ altında JSON olarak tutulacak (API'ye gerek yok)
- Supabase Row Level Security (RLS) mutlaka aktif olacak

## Alınan Tasarım Kararları
- **Hafta bazlı takip** — günlük değil. Ders programı girmek gerekmez, kazanımlar haftaya bağlı.
- **Onboarding ana ekranda kart** — ayrı /onboarding sayfası değil, uygulama görünür kalır.
- **Çoklu sınıf** — `sinif` (tek) yerine `siniflar: string[]`. Her sınıf ayrı `PlanEntry`.
- **Ana ekran kazanım kartı** — sınıf sekmeli, tek kart. Kazanıma tıklanınca yıllık plana gider.
- **Renk paleti** — koyu mavi `#1e3a5f`, turuncu `#f97316`. Değiştirme.
