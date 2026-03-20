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

### MVP (İlk Sürüm)
- [ ] MEB takvimine göre otomatik yıllık plan oluşturma
- [ ] Excel/PDF yükleme ile plan import
- [ ] Haftalık ve günlük kazanım görünümü
- [ ] Sınıf / ders seçimi
- [ ] Basit kullanıcı kaydı (Supabase Auth)
- [ ] Lead toplama formu (ad, soyad, okul, email)

### Sonraki Sürümler
- [ ] Kazanımları işaretleme (tamamlandı / yapılmadı)
- [ ] Notlar ekleme
- [ ] Yazdırma / PDF export
- [ ] Push bildirim (günlük kazanım hatırlatması)
- [ ] Google AdSense entegrasyonu

## Veri Yapısı (Supabase Tabloları)

```
users           → id, email, ad, soyad, okul, sinif, ders, created_at
yillik_planlar  → id, user_id, yil, ders, sinif_seviyesi, kaynak (meb|yukle), created_at
haftalar        → id, plan_id, hafta_no, baslangic_tarihi, bitis_tarihi
kazanimlar      → id, hafta_id, gun, kazanim_metni, tamamlandi, sira_no
leads           → id, ad, soyad, email, okul, telefon, created_at
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
