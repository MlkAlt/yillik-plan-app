# CLAUDE.md — Öğretmen Yaver

> Bu dosya Claude Code'un her oturumda okuduğu tek dosyadır.
> Oturum başında STATUS.md'yi oku, rolünü al, işi yap, STATUS.md'yi güncelle.

---

## Proje Kimliği

**Ad:** Öğretmen Yaver
**URL:** https://ogretmen-yaver.vercel.app
**Repo:** C:\Users\melik\Desktop\yıllık_plan_app
**Stack:** React + Vite + TypeScript + Tailwind + Supabase + Vercel
**Hedef:** v6 tasarımına geçiş — mevcut kod korunur, UI yenilenir

## İlk Yapılacak (Her Oturumda)

```
1. STATUS.md oku → aktif görevi öğren
2. Rol dosyasını oku → .agents/[rol].md
3. İşi yap
4. STATUS.md güncelle → görevi DONE işaretle
5. Bir sonraki görevi NEXT olarak işaretle
```

## Komutlar

```bash
npm run dev      # Geliştirme — localhost:5173
npm run build    # Production build
npm run preview  # Build önizleme
npm run lint     # ESLint
npm run test     # Vitest (12 test mevcut)
vercel --prod    # Deploy
```

## Mevcut Proje Durumu

**Canlı:** https://ogretmen-yaver.vercel.app ✅
**Auth:** Supabase Auth (email + şifre) ✅
**DB:** Supabase — `plans` tablosu ✅
**PWA:** Service worker aktif ✅
**Test:** 12 Vitest testi geçiyor ✅
**Deploy:** Vercel otomatik ✅

## Kritik Dosyalar (Dokunmadan Önce Oku)

| Dosya | Ne yapar |
|---|---|
| `src/App.tsx` | Global state merkezi — dikkatli ol |
| `src/lib/planBuilder.ts` | Plan oluşturma motoru — dokunma |
| `src/lib/mufredatRegistry.ts` | 55+ müfredat JSON — dokunma |
| `src/lib/planSync.ts` | Supabase sync — dokunma |
| `src/lib/storageKeys.ts` | localStorage key'leri — eklerken buraya yaz |
| `supabase_migration.sql` | Mevcut şema — genişlet, silme |

## v6 Tasarım Sistemi

```
Fontlar:   Sora (UI) + Outfit (başlık/sayı)
Primary:   #4F6AF5
Success:   #10b981
Warning:   #f59e0b
Danger:    #f43f5e
Accent:    #7c3aed
BG light:  #f5f5f2
BG dark:   #111113
Radius:    4 / 12 / 16 / 20 / 24 / pill
Tema:      Light + Dark (sistem tercihi)
```

Referans: `ogretmenai-v6.html` (proje klasöründe)

## Mimari Kurallar

- State merkezi `App.tsx`'te — Zustand yok, Context yok
- Her component kendi klasöründe (`ComponentAdi/index.tsx`)
- localStorage key'leri `storageKeys.ts`'ten — magic string yok
- Supabase işlemleri `withSupabaseFallback()` wrapper ile
- Yeni müfredat → `src/data/mufredat/` + `mufredatRegistry.ts`
- Kod test edilmeden PR açılmaz (`npm run test`)

## Vibe Coding Kuralları

- Çalışan kodu kırma — önce test et, sonra değiştir
- Büyük değişiklik öncesi sor: "Bu dosyayı değiştirmek X'i etkiler mi?"
- Her oturum tek bir görev — bitir, STATUS.md güncelle, dur
- Hata görürsen düzelt ama kapsam dışına çıkma
- `console.log` bırakma — her zaman temizle

## Supabase Şeması

### Mevcut (dokunma)
```sql
plans (id, user_id, sinif, ders, yil, tip, plan_json, rows_json, label, sinif_gercek)
```

### v6 için eklenecek (Sprint 2)
```sql
kullanicilar   -- profil, branş, uretim hakki bakiyesi
kullanici_dersler -- seçili dersler + sınıflar
uretim_hakki_islemleri   -- uretim hakki gecmisi
sinavlar          -- üretilen sınavlar
```

## Ajan Sistemi

Her oturumda bir ajan aktif olur. STATUS.md'deki aktif göreve
göre rol belirlenir. Ajan dosyaları `.agents/` klasöründe.

| Ajan | Ne zaman |
|---|---|
| `orchestrator` | Sprint planı, ajan yönlendirme |
| `ux-designer` | v6 tasarım uygulaması, yeni ekran |
| `frontend-dev` | Komponent kodu, ekran implementasyonu |
| `backend-dev` | Supabase, API, migration |
| `ai-engineer` | Claude API entegrasyonu, prompt |
| `qa` | Test, bug tespiti, kalite kontrolü |
| `devops` | Vercel deploy, env, CI |
| `ogrenme-ajani` | Sprint sonu — ne öğrendik |
