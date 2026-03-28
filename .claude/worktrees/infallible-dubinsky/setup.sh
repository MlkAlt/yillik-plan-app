#!/bin/bash
# Yıllık Plan Uygulaması - Klasör Yapısı Kurulum Scripti
# Çalıştır: bash setup.sh

echo "📁 Klasör yapısı oluşturuluyor..."

# src altındaki klasörler
mkdir -p src/components/Layout
mkdir -p src/components/PlanViewer
mkdir -p src/components/WeekView
mkdir -p src/components/DayView
mkdir -p src/components/LeadForm
mkdir -p src/components/UploadPlan
mkdir -p src/components/UI
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/data/meb
mkdir -p src/types
mkdir -p src/store

echo "📄 Temel dosyalar oluşturuluyor..."

# .env.local
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=buraya_supabase_url_gelecek
VITE_SUPABASE_ANON_KEY=buraya_anon_key_gelecek
EOF

# Supabase client
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOF

# TypeScript tip tanımları
cat > src/types/index.ts << 'EOF'
export interface User {
  id: string
  email: string
  ad: string
  soyad: string
  okul: string
  sinif: string
  ders: string
  created_at: string
}

export interface YillikPlan {
  id: string
  user_id: string
  yil: number
  ders: string
  sinif_seviyesi: string
  kaynak: 'meb' | 'yukle'
  created_at: string
}

export interface Hafta {
  id: string
  plan_id: string
  hafta_no: number
  baslangic_tarihi: string
  bitis_tarihi: string
}

export interface Kazanim {
  id: string
  hafta_id: string
  gun: 'pazartesi' | 'sali' | 'carsamba' | 'persembe' | 'cuma'
  kazanim_metni: string
  tamamlandi: boolean
  sira_no: number
}

export interface Lead {
  id: string
  ad: string
  soyad: string
  email: string
  okul: string
  telefon?: string
  created_at: string
}
EOF

# MEB takvimi örnek veri
cat > src/data/meb/2024-2025.json << 'EOF'
{
  "yil": "2024-2025",
  "donem1": {
    "baslangic": "2024-09-09",
    "bitis": "2025-01-17",
    "tatiller": [
      { "ad": "Cumhuriyet Bayramı", "tarih": "2024-10-29" },
      { "ad": "Yarıyıl Tatili", "baslangic": "2025-01-20", "bitis": "2025-01-31" }
    ]
  },
  "donem2": {
    "baslangic": "2025-02-03",
    "bitis": "2025-06-06",
    "tatiller": [
      { "ad": "Nevruz", "tarih": "2025-03-21" },
      { "ad": "Ramazan Bayramı", "baslangic": "2025-03-28", "bitis": "2025-03-31" },
      { "ad": "Kurban Bayramı", "baslangic": "2025-06-06", "bitis": "2025-06-09" }
    ]
  }
}
EOF

# pages
cat > src/pages/HomePage.tsx << 'EOF'
// Ana sayfa - Lead formu + uygulama tanıtımı
export default function HomePage() {
  return (
    <div>
      <h1>Yıllık Plan Uygulaması</h1>
      {/* TODO: LeadForm bileşeni buraya gelecek */}
    </div>
  )
}
EOF

cat > src/pages/PlanPage.tsx << 'EOF'
// Plan oluşturma sayfası
export default function PlanPage() {
  return (
    <div>
      {/* TODO: Plan oluşturma formu */}
    </div>
  )
}
EOF

cat > src/pages/ViewerPage.tsx << 'EOF'
// Haftalık/günlük kazanım görüntüleme sayfası
export default function ViewerPage() {
  return (
    <div>
      {/* TODO: Haftalık ve günlük görünüm */}
    </div>
  )
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules
dist
.env.local
.env
.DS_Store
*.log
EOF

echo ""
echo "✅ Klasör yapısı hazır!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. npm create vite@latest . -- --template react-ts"
echo "2. npm install"
echo "3. npm install @supabase/supabase-js tailwindcss @tailwindcss/vite react-router-dom"
echo "4. Supabase hesabı aç → .env.local dosyasını doldur"
echo "5. Claude Code'da: claude (CLAUDE.md otomatik okunur)"
