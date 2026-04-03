# STATUS.md — Öğretmen Yaver

> Claude Code her oturumda bu dosyayı okur ve günceller.
> Durum: TODO → WIP → DONE | Engel: BLOCKED

Son güncelleme: 2026-04-03

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
| 4 | Dark mode sistemi kur | frontend-dev | **NEXT** | `index.css`, `App.tsx` | `useColorScheme` |
| 5 | Bottom nav → 4 sekme (Ana/Planla/Dosyam/Üret) | frontend-dev | TODO | `AppLayout.tsx` | v6 mockup referans |
| 6 | Ana ekran (Dashboard) v6'ya güncelle | frontend-dev | TODO | `AppHomeScreen.tsx` | Mevcut veriyi koru |
| 7 | Onboarding flow v6'ya güncelle | frontend-dev | TODO | `OnboardingModal.tsx` | Branş→Dersler→Sınıflar |
| 8 | Planla ekranı (yıllık plan görünümü) | frontend-dev | TODO | `PlanPage.tsx` yeni tasarım | |
| 9 | Dosyam ekranı (yeni — öğretmen dosyası) | frontend-dev | TODO | `DosyamPage.tsx` | v6 mockup |
| 10 | Üret ekranı (yeni — sınav wizard) | frontend-dev | TODO | `UretPage.tsx` | Sprint 2 AI bağlantısı |
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

---

## Claude'a Not

Oturum başladığında:
1. Bu tabloyu oku
2. **NEXT** olan görevi al
3. `.agents/` klasöründeki ilgili ajan dosyasını oku
4. İşi yap
5. Görevi **DONE** işaretle, bir sonrakini **NEXT** yap
6. "Oturum Günlüğü"ne kısa not düş
