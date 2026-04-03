-- Öğretmen Yaver — v6 Sprint 2 Migration
-- Çalıştırmadan önce GATE C onayı gerekli
-- Mevcut 'plans' tablosuna DOKUNMA

-- ═══════════════════════════════════
-- 1. KULLANICILAR
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS kullanicilar (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ad            TEXT,
  soyad         TEXT,
  brans_id      TEXT,
  okul          TEXT,
  il            TEXT,
  jeton         INTEGER DEFAULT 5 CHECK (jeton >= 0),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi profilini yönet" ON kullanicilar
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER kullanicilar_updated_at
  BEFORE UPDATE ON kullanicilar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════
-- 2. KULLANICI DERSLERİ
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS kullanici_dersler (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id  UUID REFERENCES kullanicilar(id) ON DELETE CASCADE NOT NULL,
  ders_id       TEXT NOT NULL,
  ders_ad       TEXT NOT NULL,
  siniflar      TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kullanici_dersler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi derslerini yönet" ON kullanici_dersler
  FOR ALL USING (auth.uid() = kullanici_id)
  WITH CHECK (auth.uid() = kullanici_id);

CREATE INDEX idx_kullanici_dersler_kullanici
  ON kullanici_dersler(kullanici_id);

-- ═══════════════════════════════════
-- 3. JETON İŞLEMLERİ
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS jeton_islemleri (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id  UUID REFERENCES kullanicilar(id) ON DELETE CASCADE NOT NULL,
  miktar        INTEGER NOT NULL, -- pozitif: ekle, negatif: harca
  tip           TEXT NOT NULL CHECK (tip IN (
                  'hosgeldin', 'satin_al',
                  'sinav_uret', 'plan_uret', 'diger'
                )),
  aciklama      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE jeton_islemleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi jeton geçmişini gör" ON jeton_islemleri
  FOR SELECT USING (auth.uid() = kullanici_id);

-- Sistem jeton ekleyebilir (INSERT için service role)
CREATE POLICY "Sistem jeton ekleyebilir" ON jeton_islemleri
  FOR INSERT WITH CHECK (auth.uid() = kullanici_id);

CREATE INDEX idx_jeton_islemleri_kullanici
  ON jeton_islemleri(kullanici_id);

-- ═══════════════════════════════════
-- 4. SINAVLAR
-- ═══════════════════════════════════
CREATE TABLE IF NOT EXISTS sinavlar (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id    UUID REFERENCES kullanicilar(id) ON DELETE CASCADE NOT NULL,
  ders_id         TEXT,
  ders_ad         TEXT,
  sinif           TEXT,
  konu            TEXT NOT NULL,
  soru_sayisi     INTEGER DEFAULT 10,
  zorluk          TEXT DEFAULT 'orta' CHECK (zorluk IN ('kolay', 'orta', 'zor')),
  icerik          JSONB,  -- { sorular: [{soru, secenekler, dogru, aciklama}] }
  jeton_harcandi  INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sinavlar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kendi sınavlarını yönet" ON sinavlar
  FOR ALL USING (auth.uid() = kullanici_id)
  WITH CHECK (auth.uid() = kullanici_id);

CREATE INDEX idx_sinavlar_kullanici
  ON sinavlar(kullanici_id);

CREATE INDEX idx_sinavlar_ders_sinif
  ON sinavlar(kullanici_id, ders_id, sinif);

-- ═══════════════════════════════════
-- 5. DOSYALAR (Sprint 3'te aktif edilecek)
-- ═══════════════════════════════════
-- CREATE TABLE IF NOT EXISTS dosyalar (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   kullanici_id  UUID REFERENCES kullanicilar(id) ON DELETE CASCADE NOT NULL,
--   kategori      TEXT NOT NULL CHECK (kategori IN ('nobet', 'plan', 'form', 'diger')),
--   ad            TEXT NOT NULL,
--   durum         TEXT DEFAULT 'bekliyor' CHECK (durum IN ('tamam', 'eksik', 'bekliyor')),
--   dosya_url     TEXT,
--   created_at    TIMESTAMPTZ DEFAULT now()
-- );
-- Sprint 3'te yorumu kaldır ve çalıştır
