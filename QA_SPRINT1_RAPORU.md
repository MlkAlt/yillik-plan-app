# Sprint 1 QA Raporu — Öğretmen Yaver

**Tarih:** 2026-04-04  
**Sprint:** Sprint 1 — v6 Tasarım Geçişi  
**QA Kapsamı:** Görevler 1-11 (UI ekranları, tasarım sistemi, ekran implementasyonları)

---

## Özet

| Kategori | Adet |
|---|---|
| Fixlenen bug | 2 |
| False positive (bug değil) | 1 |
| Sprint 2'ye ertelenen madde | 5 |
| Genel durum | **PASS** |

---

## Fixlenen Buglar

### BUG-01 — OnboardingModal: Arama sırasında branş seçimi kayboluyor
**Dosya:** `src/components/BosdurumuEkrani/OnboardingModal.tsx`  
**Önem:** Orta  
**Sorun:** Arama inputu `onChange` handler'ı her klavye vuruşunda `acikBrans` ve `seciliSiniflar` state'ini sıfırlıyordu. Kullanıcı bir branş seçip sonra arama yaparsa seçimi kayboluyordu.  
**Fix:** `onChange={e => setQuery(e.target.value)}` — filtreleme state'ten bağımsız, seçim korunuyor.  
**Durum:** ✅ Düzeltildi

---

### BUG-02 — AppSettingsScreen: Zümre öğretmeni list key'i fragile
**Dosya:** `src/pages/AppSettingsScreen.tsx`  
**Önem:** Düşük  
**Sorun:** `key={`${index}-${isim}`}` — isim değişince key değişiyor, React yanlış elemanı reconcile edebiliyor. Özellikle yazma sırasında focus kayması riski.  
**Fix:** `key={index}` — index stable, yazma sırasında input focus korunuyor.  
**Durum:** ✅ Düzeltildi

---

## False Positive

### FP-01 — UretimHakkiBadge: `onHakEkle` prop bağlı değil
**Dosya:** `src/components/UI/UretimHakkiBadge.tsx`  
**QA Bulgusu:** Prop'un kullanılmadığı iddia edildi.  
**Gerçek Durum:** Prop line 71'de `onClick={onHakEkle}` olarak doğru şekilde bağlı. Bug yok.

---

## Sprint 2'ye Ertelenen Maddeler

Bunlar bug değil, bilinçli olarak Sprint 2'ye bırakılan by-design eksikler:

| # | Madde | Dosya | Neden Ertelendi |
|---|---|---|---|
| S2-01 | UretPage form submit handler | `UretPage.tsx` | Backend (Claude API) Sprint 2'de bağlanacak |
| S2-02 | DosyamPage hardcoded belgeler | `DosyamPage.tsx` | Supabase migration (Görev 12) sonrası |
| S2-03 | localStorage tamamlananlar format normalizasyonu | `App.tsx`, `AppHomeScreen.tsx`, `PlanPage.tsx` | Büyük refactor, ayrı görev |
| S2-04 | UretPage üretim hakkı gerçek değer | `UretPage.tsx` | `kullanicilar` tablosu Sprint 2'de |
| S2-05 | App.tsx mount loading spinner | `App.tsx` | Minor UX, Sprint 2 polish |

---

## Genel UX Gözlemleri (Aksiyon Gerektirmiyor)

- **PlanPage export menüsü:** Context menu manuel overlay ile kapatılıyor — ileride `<details>` ile iyileştirilebilir.
- **OnboardingModal tebrik ekranı:** 2200ms hardcoded redirect — acceptable, değiştirilmesine gerek yok.
- **AppHomeScreen useEffect:** `tamamlananlarLocal` vs `tamamlananlarProp` mantığı karmaşık ama çalışıyor; refactor S2-03 kapsamında ele alınacak.

---

## Ekran Bazlı Durum

| Ekran | Tasarım | İşlevsellik | Not |
|---|---|---|---|
| AppHomeScreen | ✅ | ✅ | Çalışıyor |
| AppLayout (Bottom Nav) | ✅ | ✅ | Çalışıyor |
| OnboardingModal | ✅ | ✅ | BUG-01 fixlendi |
| PlanPage | ✅ | ✅ | Çalışıyor |
| DosyamPage | ✅ | ⚠️ | Static UI — S2-02 |
| UretPage | ✅ | ⚠️ | Form submit yok — S2-01 |
| UretimHakkiBadge | ✅ | ✅ | Çalışıyor |
| PlanSelector | ✅ | ✅ | Çalışıyor |
| AppSettingsScreen | ✅ | ✅ | BUG-02 fixlendi |

---

## Doğrulama

- `npm run test` → 12/12 geçiyor ✅
- `npm run build` → Hatasız ✅
