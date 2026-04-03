# STATUS.md — Öğretmen Yaver

> Claude Code her oturumda bu dosyayı okur ve günceller.
> Durum: TODO → WIP → DONE | Engel: BLOCKED

Son güncelleme: 2026-04-03 (oturum 2)

---

## Aktif Sprint: Sprint 1 — v6 Tasarım Geçişi

**Hedef:** v6 tasarımını mevcut React+Vite projesine uygula
**Bitiş:** 2026-04-13
**Önce:** Tasarım sistemi → Sonra: Ekranlar → Sonra: Yeni özellikler

---

## Görev Tablosu

| # | Görev | Ajan | Durum | Çıktı | Notlar |
|---|---|---|---|---|---|
| 1 | v6 font sistemi kur (Sora + Outfit) | frontend-dev | **DONE** | `index.css` | Google Fonts CDN |
| 2 | v6 design token'larını Tailwind'e ekle | frontend-dev | **DONE** | `index.css` | Renk, radius, gölge |
| 3 | `tokens.ts` oluştur — JS sabitleri | frontend-dev | **DONE** | `src/lib/tokens.ts` | v6 HTML'den çıkar |
| 4 | Dark mode sistemi kur | frontend-dev | **DONE** | `index.css`, `App.tsx` | `useColorScheme` |
| 5 | Bottom nav → 4 sekme (Ana/Planla/Dosyam/Üret) | frontend-dev | **DONE** | `AppLayout.tsx` | v6 mockup referans |
| 6 | Ana ekran (Dashboard) v6'ya güncelle | frontend-dev | **DONE** | `AppHomeScreen.tsx` | Mevcut veriyi koru |
| 7 | Onboarding flow v6'ya güncelle | frontend-dev | **DONE** | `OnboardingModal.tsx` | Branş→Dersler→Sınıflar |
| 8 | Planla ekranı (yıllık plan görünümü) | frontend-dev | **DONE** | `PlanPage.tsx` yeni tasarım | CSS vars, gradyan kart, dönem collapse |
| 9 | Dosyam ekranı (yeni — öğretmen dosyası) | frontend-dev | **DONE** | `DosyamPage.tsx` | Özet kart, belge grupları, uyarı bandı |
| 10 | Üret ekranı (yeni — sınav wizard) | frontend-dev | **NEXT** | `UretPage.tsx` | Sprint 2 AI bağlantısı |
| 11 | Jeton sistemi UI | frontend-dev | TODO | `JetonBadge.tsx` | Sadece UI, backend S2 |
| 12 | Supabase yeni tablolar migration | backend-dev | TODO | `supabase_v6_migration.sql` | Sprint 2 başında |
| 13 | QA — Sprint 1 tasarım review | qa | TODO | QA raporu | Tüm ekranlar bittikten sonra |

---

## Engeller

*(Şu an yok)*

---

## Sprint 1 Kapsam Dışı

- Claude API entegrasyonu (Sprint 2)
- Gerçek sınav üretimi (Sprint 2)
- Jeton satın alma (Sprint 3)
- Öğretmen Dosyası gerçek belgeler (Sprint 3)
- iOS deploy (Sprint 4)

---

## Tamamlanan (Önceki Çalışma)

| Tarih | Ne | Notlar |
|---|---|---|
| 31.03.2026 | Vercel deploy | https://ogretmen-yaver.vercel.app canlı |
| 31.03.2026 | Supabase Auth | Email + şifre çalışıyor |
| 31.03.2026 | PWA | Service worker aktif |
| 31.03.2026 | 12 Vitest testi | Hepsi geçiyor |
| 31.03.2026 | v1 UX yenileme | Lucide ikonlar, Card/Button bileşeni |

---

## Oturum Günlüğü

### 2026-04-02 — Sistem Kurulumu
- Ajan sistemi kuruldu
- v6 mockup analiz edildi
- Sprint 1 planı oluşturuldu
- Sonraki: Frontend Dev → Görev #1 ile başla

### 2026-04-03 — Görev #1 + #2: Font Sistemi + Design Token'lar
- `index.css`: Plus Jakarta Sans → Sora (UI) + Outfit (display)
- v6 renk token'ları: primary #4F6AF5, success #10b981, warning, danger, accent
- Radius token'ları: sm/md/lg/xl/2xl/pill
- Shadow token'ları: xs/sm/md
- Legacy alias'lar korundu (mevcut componentlar etkilenmedi)
- 12 test geçiyor ✅, build başarılı ✅
- Sonraki: Görev #3 — tokens.ts JS sabitleri

### 2026-04-03 — Görev #3: tokens.ts
- `src/lib/tokens.ts` oluşturuldu — brand/light/dark/radius/shadow/font sabitleri
- `renkTokenlari.ts` dokunulmadı (legacy, çalışıyor)
- TS tip hatası yok, 12 test geçiyor ✅
- Sonraki: Görev #4 — Dark mode sistemi

### 2026-04-03 — Görev #4: Dark mode sistemi
- `StorageKeys.TEMA` eklendi
- `src/hooks/useColorScheme.ts` oluşturuldu — system/light/dark, localStorage override, toggle
- `index.css` — `[data-theme="dark"]` bloğu eklendi, semantic + legacy + shadow override
- `body` / `#root` CSS var kullanımına geçirildi, 0.2s transition
- `App.tsx` — minimal: `useColorScheme()` çağrısı eklendi
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #5 — Bottom nav 4 sekme

### 2026-04-03 — Görev #5: Bottom nav 4 sekme
- `AppLayout.tsx` v6 stiline güncellendi — 72px yükseklik, CSS var renkleri, dark mode uyumlu
- Header: "Öğretmen Yaver" başlığı, Outfit font, v6 renk token'ları
- 4 sekme: Ana / Planla / Dosyam / Üret (Home / CalendarDays / FolderOpen / Sparkles)
- `DosyamPage.tsx` + `UretPage.tsx` placeholder sayfaları oluşturuldu
- `App.tsx`'e `/app/dosyam` + `/app/uret` route'ları eklendi
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #6 — Ana ekran v6 güncelle

### 2026-04-03 — Görev #6: Ana ekran v6
- Topbar: karşılama metni + Outfit font başlık
- BuHaftaKarti: tüm renkler CSS var'a geçirildi (primary, text1/2/3, border, warning)
- ProgressRing: hardcoded hex → CSS var
- Sınıf seçici butonları: CSS var inline style
- Hızlı Erişim grid: v6 kart stili, ikonlu, surface/border token'ları
- Card.tsx: bg-white + hardcoded border → CSS var (dark mode uyumlu)
- Tüm mantık (effects, state, props) korundu
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #7 — Onboarding flow v6

### 2026-04-03 — Görev #7: Onboarding flow v6
- `OnboardingModal.tsx`: tüm hardcoded hex renkleri CSS var'a geçirildi (dark mode uyumlu)
- Sheet arka planı, handle, başlık, arama input, branş item, sınıf chip'leri, CTA border → CSS vars
- Arama input: pill border-radius, focus rengi primary
- `Button.tsx`: VARIANT_STYLES CSS vars'a geçirildi — primary artık `--color-primary` (#4F6AF5)
- Tüm mantık (handleBransToggle, handleSinifToggle, handleOlustur, tebrik flow) korundu
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #8 — Planla ekranı yeni tasarım

### 2026-04-04 — Ana Ekran v6 yeniden yazımı
- `AppHomeScreen.tsx` tamamen v6 mockup'a göre yeniden yazıldı
- Topbar: karşılama + ad Hoca + Bell (bildirim noktası) + User ikonları
- Tasarruf kartı: blue→indigo gradyan şerit, tamamlanan haftadan hesaplanan saat, 3 stat satırı
- Bu Hafta widget: kart başlığı + hafta no + her plan için kazanım satırı (durum noktası)
- Yaklaşan: deadline kartları yatay scroll (Not Girişi, ZHA, Yazılı, Karne)
- Hızlı Erişim: Yeni Plan + Dosya Yükle (list row stili, v6 dp-prompt benzeri)
- Tüm logic korundu (effects, state, BosdurumuEkrani, BottomSheet)
- TS hata yok, 12 test geçiyor ✅, build başarılı ✅

### 2026-04-03 — Görev #9: Dosyam ekranı v6
- `DosyamPage.tsx` sıfırdan yazıldı — v6 mockup referans alındı
- Özet kartı: violet→blue gradyan şerit, belge sayacı, durum listesi, PDF indir butonu (accent renk)
- Uyarı bandı: eksik belge için amber uyarı
- 3 belge grubu: Otomatik Oluşanlar / Tamamlanması Gereken (amber) / Manuel Eklenebilir (soluk)
- `BelgeItem`: ikon (Lucide), renk (blue/green/amber/violet/muted), durum badge (hazir/uyari/ekle/yeni)
- Tüm renkler CSS var — dark mode uyumlu
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #10 — Üret ekranı

### 2026-04-03 — Görev #8: Planla ekranı v6
- `PlanPage.tsx`: tüm hardcoded hex → CSS var (dark mode uyumlu)
- Üst özet: primary renk gradyan kart, progress bar, badge chip'ler
- Araç çubuğu: export dropdown + Yazdır + Bu Hafta — v6 border/surface stilleri
- `DonemGrubu`: collapse başlığı surface/border CSS vars, progress bar primary/success
- Hafta kartları: isBuHafta / isTamamlandi / isTatil durumlarına göre CSS var renkleri
- `Card` import kaldırıldı (artık kullanılmıyor)
- TS hata yok, 12 test geçiyor ✅
- Sonraki: Görev #9 — Dosyam ekranı

---

## Claude'a Not

Oturum başladığında:
1. Bu tabloyu oku
2. **NEXT** olan görevi al
3. `.agents/` klasöründeki ilgili ajan dosyasını oku
4. İşi yap
5. Görevi **DONE** işaretle, bir sonrakini **NEXT** yap
6. "Oturum Günlüğü"ne kısa not düş
