# Gereksinimler Belgesi

## Giriş

Bu belge, Yıllık Plan uygulamasının mevcut teknik borçlarını ve mimari sorunlarını gidermek amacıyla tanımlanan gereksinimleri içermektedir. Direktör analizi sonucunda tespit edilen 5 temel sorun ele alınmaktadır: iki paralel uygulama akışı, dağınık `localStorage` key'leri, `App.tsx`'in aşırı sorumluluk yükü, `YuklemePage`'in `AppLayout` dışında kalması ve Supabase plan JSON'ının tip güvensizliği.

## Sözlük

- **Router**: React Router v7 tabanlı istemci tarafı yönlendirme sistemi.
- **AppLayout**: Alt navigasyon çubuğu ve başlık içeren uygulama iskelet bileşeni.
- **PlanOlusturPage**: Eski akışta (`/olustur`) kullanılan plan oluşturma sayfası.
- **YuklemePage**: Dosya yükleme işlemini gerçekleştiren sayfa bileşeni.
- **App**: Uygulamanın kök bileşeni (`App.tsx`).
- **StorageKeys**: `localStorage` erişim anahtarlarını merkezi olarak tanımlayan modül.
- **usePlanYonetimi**: Plan ekleme, silme ve sınıf seçimi işlemlerini kapsayan custom hook.
- **useAuthSync**: Kimlik doğrulama durumu ve Supabase senkronizasyonunu yöneten custom hook.
- **PlanValidator**: Supabase'den gelen `plan_json` verisini doğrulayan modül.
- **PlanEntry**: Bir öğretmenin ders planını temsil eden TypeScript tipi.
- **Zod**: TypeScript için çalışma zamanı şema doğrulama kütüphanesi.

---

## Gereksinimler

### Gereksinim 1: Eski Uygulama Akışının Kaldırılması

**Kullanıcı Hikayesi:** Bir geliştirici olarak, uygulamada tek ve tutarlı bir yönlendirme akışı olmasını istiyorum; böylece bakım yükü azalsın ve kullanıcılar tutarsız deneyim yaşamasın.

#### Kabul Kriterleri

1. THE Router SHALL yalnızca `/app` altındaki rotaları uygulama akışı olarak sunmak.
2. WHEN bir kullanıcı `/olustur` adresine erişmeye çalıştığında, THE Router SHALL kullanıcıyı `/app` adresine yönlendirmek.
3. WHEN bir kullanıcı `/yukle` adresine erişmeye çalıştığında, THE Router SHALL kullanıcıyı `/app/yukle` adresine yönlendirmek.
4. WHEN bir kullanıcı `/plan` adresine erişmeye çalıştığında, THE Router SHALL kullanıcıyı `/app/plan` adresine yönlendirmek.
5. THE App SHALL `PlanOlusturPage` bileşenini bağımsız rota olarak kaydetmemek.
6. THE HomePage SHALL "Hemen Başla" düğmesini `/app` adresine yönlendirmek.
7. THE HomePage SHALL "Dosyadan Yükle" düğmesini `/app/yukle` adresine yönlendirmek.

---

### Gereksinim 2: Merkezi `localStorage` Anahtar Yönetimi

**Kullanıcı Hikayesi:** Bir geliştirici olarak, tüm `localStorage` anahtarlarının tek bir yerde tanımlı olmasını istiyorum; böylece yazım hatalarından kaynaklanan veri kayıplarını önleyeyim ve anahtarları kolayca bulabileyim.

#### Kabul Kriterleri

1. THE StorageKeys SHALL `src/lib/storageKeys.ts` dosyasında tanımlanmak.
2. THE StorageKeys SHALL aşağıdaki 9 anahtarı sabit olarak dışa aktarmak: `TUM_PLANLAR`, `AKTIF_SINIF`, `TAMAMLANAN_HAFTALAR`, `HAFTA_NOTLARI`, `ONBOARDING_TAMAMLANDI`, `AUTH_PROMPT_GOSTERILDI`, `OGRETMEN_AYARLARI`, `BILDIRIM_AKTIF`, `BILDIRIM_SON_HAFTA`.
3. WHEN uygulama içinde herhangi bir `localStorage` erişimi gerçekleştiğinde, THE App SHALL yalnızca `StorageKeys` sabitlerini kullanmak; ham string literal kullanmamak.
4. IF `StorageKeys` modülü içe aktarılmadan bir `localStorage` çağrısı yapılırsa, THE uygulama SHALL derleme aşamasında TypeScript hatası vermek.

---

### Gereksinim 3: `App.tsx` Sorumluluklarının Ayrıştırılması

**Kullanıcı Hikayesi:** Bir geliştirici olarak, `App.tsx` dosyasının tek bir sorumluluğa sahip olmasını istiyorum; böylece her endişe ayrı bir modülde yönetilsin ve dosya okunabilirliği artsın.

#### Kabul Kriterleri

1. THE App SHALL plan yönetimi mantığını `usePlanYonetimi` custom hook'una devretmek.
2. THE usePlanYonetimi SHALL plan ekleme (`handlePlanEkle`), plan silme (`handlePlanSil`) ve aktif sınıf seçimi (`handleSinifSec`) işlevlerini kapsamak.
3. THE App SHALL kimlik doğrulama ve Supabase senkronizasyon mantığını `useAuthSync` custom hook'una devretmek.
4. THE useAuthSync SHALL `onAuthStateChange` aboneliğini, bulut planlarının çekilmesini ve ilerleme verilerinin birleştirilmesini kapsamak.
5. WHEN `usePlanYonetimi` ve `useAuthSync` hook'ları ayrıştırıldıktan sonra, THE App SHALL 80 satırı geçmemek.
6. THE usePlanYonetimi SHALL `src/hooks/usePlanYonetimi.ts` dosyasında tanımlanmak.
7. THE useAuthSync SHALL `src/hooks/useAuthSync.ts` dosyasında tanımlanmak.

---

### Gereksinim 4: `YuklemePage`'in `AppLayout` Altına Taşınması

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, dosya yükleme sayfasında da alt navigasyon çubuğunu ve başlığı görmek istiyorum; böylece uygulamanın diğer bölümlerine kolayca geçiş yapabileyim.

#### Kabul Kriterleri

1. THE Router SHALL `YuklemePage`'i `/app/yukle` rotasında `AppLayout` içinde sunmak.
2. WHEN bir kullanıcı `/app/yukle` sayfasındayken, THE AppLayout SHALL alt navigasyon çubuğunu ve başlığı görüntülemek.
3. THE YuklemePage SHALL bağımsız tam ekran arka plan stilini (`min-h-screen bg-gradient-to-br`) kaldırmak; düzen sorumluluğunu `AppLayout`'a bırakmak.
4. IF `/yukle` rotasına erişilirse, THE Router SHALL kullanıcıyı `/app/yukle` adresine yönlendirmek.

---

### Gereksinim 5: Supabase Plan JSON Tip Güvenliği

**Kullanıcı Hikayesi:** Bir geliştirici olarak, Supabase'den gelen plan verisinin çalışma zamanında doğrulanmasını istiyorum; böylece geçersiz veri yapısı nedeniyle oluşabilecek çalışma zamanı hatalarını önleyeyim.

#### Kabul Kriterleri

1. THE PlanValidator SHALL `src/lib/planValidator.ts` dosyasında tanımlanmak.
2. THE PlanValidator SHALL `PlanEntry` tipini doğrulayan bir tip koruyucu (`type guard`) veya Zod şeması içermek.
3. WHEN `fetchPlansFromSupabase` Supabase'den veri aldığında, THE PlanValidator SHALL her satırı `PlanEntry` tipine karşı doğrulamak.
4. IF bir Supabase satırı doğrulamadan geçemezse, THE PlanValidator SHALL o satırı sonuç listesinden çıkarmak ve hatayı konsola kaydetmek.
5. THE planSync SHALL `plan_json` ve `rows_json` alanlarını `as unknown as object` ile cast etmemek; bunun yerine `PlanValidator`'ı kullanmak.
6. FOR ALL geçerli `PlanEntry` nesneleri, `syncPlansToSupabase` ile kaydedip `fetchPlansFromSupabase` ile geri okumak eşdeğer bir nesne üretmek (gidiş-dönüş özelliği).
