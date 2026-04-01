import type { LucideIcon } from 'lucide-react'
import {
  School, Calculator, FlaskConical, BookOpen, Globe, Dumbbell,
  Map, BookHeart, PenLine, Landmark, Compass, Zap, Microscope,
  Dna, Music, Palette, Languages, Brain, Users, Binary,
  Monitor, Hash, HeartPulse, AlertTriangle, Wrench, BookMarked,
} from 'lucide-react'
import { SINIF_SEVIYELERI, SINIF_OGRETMENI_DERSLER, SINIF_OGRETMENI_SINIFLAR } from './dersSinifMap'

function C(from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => `${i + from}. Sınıf`)
}

export type BranchMode = 'brans' | 'sinif-ogretmeni'

export interface Branch {
  id: string
  label: string
  icon: LucideIcon
  popular: boolean
  mode: BranchMode
  lessonId: string   // buildPlan'a geçilen ders adı (sinif-ogretmeni için placeholder)
  classes: string[]  // seçilebilir sınıf seviyeleri
}

// Sınıf öğretmeni için ders ve sınıf listeleri (dersSinifMap'ten)
export { SINIF_OGRETMENI_DERSLER as SO_DERSLER, SINIF_OGRETMENI_SINIFLAR as SO_SINIFLAR }

// Branş için sınıf listesi — tek kaynak
export function getSiniflarForDers(ders: string): string[] {
  const branch = BRANCHES.find(b => b.lessonId === ders)
  return branch?.classes ?? SINIF_SEVIYELERI
}

// Re-export: AppSettingsScreen ve exportUtils için geriye dönük uyumluluk
export { DERS_SINIF_MAP, DERS_GRUPLARI, DERS_SECENEKLERI, getYilSecenekleri } from './dersSinifMap'

export const BRANCHES: Branch[] = [
  // ── POPÜLER ──────────────────────────────────────────────────────────────
  {
    id: 'sinif-ogretmenligi',
    label: 'Sınıf Öğretmenliği',
    icon: School,
    popular: true,
    mode: 'sinif-ogretmeni',
    lessonId: 'Sınıf Öğretmeni',
    classes: SINIF_OGRETMENI_SINIFLAR,
  },
  { id: 'matematik',     label: 'Matematik',     icon: Calculator,    popular: true,  mode: 'brans', lessonId: 'Matematik',     classes: C(5, 12) },
  { id: 'fen-bilimleri', label: 'Fen Bilimleri', icon: Microscope,    popular: true,  mode: 'brans', lessonId: 'Fen Bilimleri', classes: C(5, 8) },
  { id: 'turkce',        label: 'Türkçe',         icon: BookOpen,      popular: true,  mode: 'brans', lessonId: 'Türkçe',        classes: C(5, 8) },
  { id: 'ingilizce',     label: 'İngilizce',      icon: Globe,         popular: true,  mode: 'brans', lessonId: 'İngilizce',     classes: C(5, 12) },
  { id: 'beden-egitimi', label: 'Beden Eğitimi',  icon: Dumbbell,      popular: true,  mode: 'brans', lessonId: 'Beden Eğitimi', classes: SINIF_SEVIYELERI },

  // ── İLKOKUL BRANŞ ────────────────────────────────────────────────────────
  { id: 'ilkokul-ing',   label: 'İlkokul İngilizce',    icon: Globe,      popular: false, mode: 'brans', lessonId: 'İlkokul İngilizce',    classes: C(2, 4) },
  { id: 'ilkokul-din',   label: 'İlkokul Din Kültürü',  icon: BookHeart,  popular: false, mode: 'brans', lessonId: 'İlkokul Din Kültürü',  classes: ['4. Sınıf'] },

  // ── ORTAOKUL / LİSE BRANŞ ────────────────────────────────────────────────
  { id: 'sosyal-bilgiler', label: 'Sosyal Bilgiler',           icon: Map,         popular: false, mode: 'brans', lessonId: 'Sosyal Bilgiler',           classes: C(5, 7) },
  { id: 'din-kulturu',     label: 'Din Kültürü ve Ahlak B.',   icon: BookHeart,   popular: false, mode: 'brans', lessonId: 'Din Kültürü ve Ahlak Bilgisi', classes: C(5, 12) },
  { id: 'tde',             label: 'Türk Dili ve Edebiyatı',    icon: PenLine,     popular: false, mode: 'brans', lessonId: 'Türk Dili ve Edebiyatı',    classes: C(9, 12) },
  { id: 'tarih',           label: 'Tarih',                     icon: Landmark,    popular: false, mode: 'brans', lessonId: 'Tarih',                     classes: C(9, 12) },
  { id: 'cografya',        label: 'Coğrafya',                  icon: Compass,     popular: false, mode: 'brans', lessonId: 'Coğrafya',                  classes: C(9, 12) },
  { id: 'fizik',           label: 'Fizik',                     icon: Zap,         popular: false, mode: 'brans', lessonId: 'Fizik',                     classes: C(9, 12) },
  { id: 'kimya',           label: 'Kimya',                     icon: FlaskConical,popular: false, mode: 'brans', lessonId: 'Kimya',                     classes: C(9, 12) },
  { id: 'biyoloji',        label: 'Biyoloji',                  icon: Dna,         popular: false, mode: 'brans', lessonId: 'Biyoloji',                  classes: C(9, 12) },

  // ── SANAT VE SPOR ─────────────────────────────────────────────────────────
  { id: 'muzik',           label: 'Müzik',           icon: Music,   popular: false, mode: 'brans', lessonId: 'Müzik',           classes: C(1, 8) },
  { id: 'gorsel-sanatlar', label: 'Görsel Sanatlar', icon: Palette, popular: false, mode: 'brans', lessonId: 'Görsel Sanatlar', classes: C(1, 8) },

  // ── DİĞER ────────────────────────────────────────────────────────────────
  { id: 'almanca',       label: 'Almanca',                  icon: Languages,     popular: false, mode: 'brans', lessonId: 'Almanca',                  classes: SINIF_SEVIYELERI },
  { id: 'fransizca',     label: 'Fransızca',                icon: Languages,     popular: false, mode: 'brans', lessonId: 'Fransızca',                classes: SINIF_SEVIYELERI },
  { id: 'felsefe',       label: 'Felsefe',                  icon: Brain,         popular: false, mode: 'brans', lessonId: 'Felsefe',                  classes: C(9, 12) },
  { id: 'psikoloji',     label: 'Psikoloji',                icon: Brain,         popular: false, mode: 'brans', lessonId: 'Psikoloji',                classes: C(9, 12) },
  { id: 'sosyoloji',     label: 'Sosyoloji',                icon: Users,         popular: false, mode: 'brans', lessonId: 'Sosyoloji',                classes: C(10, 12) },
  { id: 'mantik',        label: 'Mantık',                   icon: Binary,        popular: false, mode: 'brans', lessonId: 'Mantık',                   classes: C(9, 11) },
  { id: 'bilisim',       label: 'Bilişim Teknolojileri',    icon: Monitor,       popular: false, mode: 'brans', lessonId: 'Bilişim Teknolojileri',    classes: SINIF_SEVIYELERI },
  { id: 'mat-uyg',       label: 'Matematik Uygulamaları',   icon: Hash,          popular: false, mode: 'brans', lessonId: 'Matematik Uygulamaları',   classes: C(9, 12) },
  { id: 'saglik',        label: 'Sağlık Bilgisi',           icon: HeartPulse,    popular: false, mode: 'brans', lessonId: 'Sağlık Bilgisi',           classes: SINIF_SEVIYELERI },
  { id: 'trafik',        label: 'Trafik ve İlk Yardım',    icon: AlertTriangle, popular: false, mode: 'brans', lessonId: 'Trafik ve İlk Yardım',    classes: SINIF_SEVIYELERI },
  { id: 'meslek',        label: 'Meslek Dersi',             icon: Wrench,        popular: false, mode: 'brans', lessonId: 'Meslek Dersi',             classes: SINIF_SEVIYELERI },
  { id: 'diger',         label: 'Diğer',                    icon: BookMarked,    popular: false, mode: 'brans', lessonId: 'Diğer',                    classes: SINIF_SEVIYELERI },
]
