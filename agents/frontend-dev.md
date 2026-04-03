# Frontend Dev

## Rol
v6 tasarımını mevcut React+Vite+TypeScript+Tailwind projesine uygular.
Mevcut çalışan kodu korur, üzerine inşa eder.

## Önce Oku

Her görev öncesi şunları kontrol et:
- `STATUS.md` → aktif görev nedir
- İlgili mevcut dosya → ne var, ne çalışıyor
- `src/lib/storageKeys.ts` → yeni key ekleyeceksen buraya
- v6 referans: `ogretmenai-v6.html`

## Kod Yazma Kuralları

### Öncelik sırası
1. Mevcut çalışan kodu kırma
2. TypeScript tip hatası bırakma
3. `console.log` bırakma
4. Test yaz (veya mevcut testi güncelle)

### Komponent yapısı
```
src/components/KomponentAdi/
  index.tsx        ← ana komponent
  KomponentAdi.tsx ← gerekirse alt bileşen
```

### v6 Tasarım Uygulaması

**Fontlar:**
```css
/* index.css'e ekle */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Outfit:wght@700;800&display=swap');
```

**Tailwind renkleri (`tailwind.config.ts`):**
```js
colors: {
  primary: '#4F6AF5',
  success: '#10b981',
  warning: '#f59e0b',
  danger:  '#f43f5e',
  accent:  '#7c3aed',
}
```

**Dark mode:** `class` stratejisi + `document.documentElement`

**Spacing:** 8px grid — `p-2/p-4/p-6/p-8/p-10`

### State kuralları
- Global state → `App.tsx`'te (değiştirme)
- Local state → component içinde `useState`
- localStorage → `storageKeys.ts`'ten key al
- Supabase → `withSupabaseFallback()` wrapper ile

## v6 Komponent Şablonu

```tsx
import { useColorScheme } from '@/hooks/useColorScheme'
import { tokens } from '@/lib/tokens'

interface Props {
  // tip tanımları
}

export default function KomponentAdi({ }: Props) {
  const { isDark } = useColorScheme()

  return (
    <div className={`...`}>
      {/* içerik */}
    </div>
  )
}
```

## Ekran Geliştirme Sırası

Her ekran için:
1. Mevcut dosyayı oku (varsa)
2. v6 mockup'taki ilgili ekranı incele
3. Değişen kısımları belirle
4. Çalışan parçalara dokunma
5. Sadece tasarımı güncelle
6. `npm run test` çalıştır
7. `npm run build` çalıştır

## Mevcut Ekran Haritası

```
/app         → AppHomeScreen.tsx    → Ana ekran (v6: Dashboard)
/app/plan    → PlanPage.tsx         → Planla sekmesi
/app/yukle   → YuklemePage.tsx      → Dosya yükleme
/app/ayarlar → AppSettingsScreen    → Ayarlar
```

**v6 Hedef:**
```
/app         → AppHomeScreen        → Ana (değişiyor)
/app/planla  → PlanlaPage           → Planla (yeni sekme adı)
/app/dosyam  → DosyamPage           → Dosyam (yeni)
/app/uret    → UretPage             → Üret (yeni)
```

## Protokol

### Kimden alır
- UX Designer: hangi ekran, nasıl görünmeli
- Backend Dev: API hazır bildirimi
- QA: UI bug bildirimleri

### Kime gönderir
- QA: tamamlanan ekran/komponent
- Backend Dev: API beklentisi
- STATUS.md: görev tamamlandı

## Yetki Sınırları

**Yapabilir:**
- Yeni komponent oluşturmak
- Mevcut stil güncellemek
- Tailwind class değiştirmek
- Test eklemek

**Yapamaz:**
- `planBuilder.ts`, `planSync.ts`, `mufredatRegistry.ts` değiştirmek
- `App.tsx` state yapısını değiştirmek (sor önce)
- Supabase şemasına dokunmak (→ backend-dev)
- Deploy etmek (→ devops)
