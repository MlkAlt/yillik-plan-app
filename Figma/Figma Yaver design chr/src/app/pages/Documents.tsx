import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  Download,
  FileText,
  Lock,
  Crown,
  Search,
  CheckCircle,
  School,
  User,
  Users,
  Sparkles,
  FileSpreadsheet,
  FileCheck,
  ClipboardList,
  BookOpen,
  GraduationCap,
  PenLine,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  category: string;
  icon: React.ElementType;
  tags?: string[];
}

interface AppSettings {
  teacherName: string;
  schoolName: string;
  principalName: string;
  committeeTeachers: string[];
}

const documents: Document[] = [
  // Planlar
  { id: "daily-plan", name: "Günlük Ders Planı", description: "Günlük ders akışı ve kazanım planı", isPremium: false, category: "plans", icon: BookOpen, tags: ["Hazır", "Kişiselleştirilmiş"] },
  { id: "weekly-plan", name: "Haftalık Plan", description: "Haftalık ders planlama tablosu", isPremium: false, category: "plans", icon: ClipboardList, tags: ["Hazır"] },
  { id: "unit-plan", name: "Ünite Planı", description: "Ünite bazlı detaylı plan ve değerlendirme", isPremium: true, category: "plans", icon: BookOpen },
  { id: "annual-plan", name: "Yıllık Plan (Hazır)", description: "MEB formatında yıllık plan belgesi", isPremium: false, category: "plans", icon: FileSpreadsheet, tags: ["Yeni"] },

  // Kulüp
  { id: "club-annual", name: "Kulüp Yıllık Planı", description: "Kulüp etkinlikleri yıllık plan şablonu", isPremium: false, category: "club", icon: ClipboardList },
  { id: "club-attendance", name: "Kulüp Yoklama Tutanağı", description: "Haftalık yoklama listesi", isPremium: false, category: "club", icon: FileCheck },
  { id: "club-activity", name: "Kulüp Etkinlik Raporu", description: "Her etkinlik için detaylı rapor", isPremium: true, category: "club", icon: FileText },
  { id: "club-full", name: "Kulüp Dosyası (Tam Set)", description: "Tüm kulüp evraklarını tek pakette", isPremium: true, category: "club", icon: FileCheck, tags: ["Paket"] },
  { id: "club-request", name: "Kulüp Kurma Dilekçesi", description: "Yeni kulüp kurma resmi dilekçesi", isPremium: false, category: "club", icon: PenLine },

  // Rehberlik
  { id: "guidance-annual", name: "Rehberlik Yıllık Planı", description: "Sınıf rehberliği yıllık çalışma planı", isPremium: false, category: "guidance", icon: ClipboardList },
  { id: "student-tracking", name: "Öğrenci Takip Formu", description: "Bireysel öğrenci gelişim takip formu", isPremium: true, category: "guidance", icon: User },
  { id: "parent-meeting", name: "Veli Görüşme Tutanağı", description: "Veli görüşmesi kayıt ve imza formu", isPremium: false, category: "guidance", icon: FileCheck },
  { id: "behavior-form", name: "Davranış Gözlem Formu", description: "Öğrenci davranış değerlendirme", isPremium: true, category: "guidance", icon: FileText },
  { id: "guidance-report", name: "Rehberlik Çalışma Raporu", description: "Dönem sonu rehberlik raporu", isPremium: true, category: "guidance", icon: FileSpreadsheet },

  // Zümre
  { id: "committee-meeting", name: "Zümre Toplantı Tutanağı", description: "Resmi zümre toplantı kayıt formu", isPremium: false, category: "committee", icon: ClipboardList, tags: ["Popüler"] },
  { id: "committee-data", name: "Veri Toplama Formu", description: "Zümre akademik veri toplama tablosu", isPremium: true, category: "committee", icon: FileSpreadsheet },
  { id: "exam-analysis", name: "Sınav Analiz Raporu", description: "Sınav sonuçları detaylı analiz formu", isPremium: true, category: "committee", icon: FileText },
  { id: "committee-annual", name: "Zümre Yıllık Planı", description: "Zümre çalışmaları yıllık planlama", isPremium: false, category: "committee", icon: BookOpen },

  // Sınav
  { id: "exam-questions", name: "Sınav Soruları Oluştur", description: "AI destekli yazılı sınav sorusu üretimi", isPremium: true, category: "exam", icon: Sparkles, tags: ["AI"] },
  { id: "exam-template", name: "Sınav Kağıdı Şablonu", description: "MEB onaylı boş sınav şablonu", isPremium: false, category: "exam", icon: FileText },
  { id: "grade-sheet", name: "Not Dökümü Tablosu", description: "Öğrenci not takip ve analiz tablosu", isPremium: false, category: "exam", icon: FileSpreadsheet },
  { id: "answer-key", name: "Cevap Anahtarı Şablonu", description: "Yazılı cevap anahtarı formu", isPremium: false, category: "exam", icon: FileCheck },
  { id: "rubric", name: "Değerlendirme Rubriği", description: "Performans değerlendirme rubriği", isPremium: true, category: "exam", icon: ClipboardList },

  // Materyal
  { id: "activity-material", name: "Sınıf İçi Etkinlikler", description: "Hazır sınıf etkinliği materyalleri", isPremium: true, category: "material", icon: Sparkles },
  { id: "worksheet", name: "Çalışma Kağıdı", description: "Konuya özel öğrenci çalışma kağıtları", isPremium: true, category: "material", icon: FileText },
  { id: "visual-material", name: "Görsel Sunum", description: "PowerPoint sunum şablonları", isPremium: true, category: "material", icon: FileSpreadsheet },

  // Öğretmen Dosyası
  { id: "teacher-file-full", name: "Öğretmen Dosyası (Tam Set)", description: "Tüm bürokratik evraklar tek pakette", isPremium: true, category: "teacher", icon: GraduationCap, tags: ["Paket", "Popüler"] },
  { id: "course-info", name: "Ders Bilgi Formu", description: "Ders tanıtım ve kapsam bilgi formu", isPremium: false, category: "teacher", icon: FileText },
  { id: "lesson-observation", name: "Ders Gözlem Formu", description: "Mesleki rehberlik gözlem raporu", isPremium: true, category: "teacher", icon: FileCheck },
  { id: "self-evaluation", name: "Öz Değerlendirme Formu", description: "Öğretmen öz değerlendirme formu", isPremium: false, category: "teacher", icon: User },
];

const categories = [
  { id: "all", label: "Tümü", icon: FileText },
  { id: "plans", label: "Planlar", icon: BookOpen },
  { id: "club", label: "Kulüp", icon: Users },
  { id: "guidance", label: "Rehberlik", icon: User },
  { id: "committee", label: "Zümre", icon: Users },
  { id: "exam", label: "Sınav", icon: GraduationCap },
  { id: "material", label: "Materyal", icon: Sparkles },
  { id: "teacher", label: "Öğretmen Dosyası", icon: School },
];

export function Documents() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("appSettings");
    if (s) setSettings(JSON.parse(s));
    const t = localStorage.getItem("teacherData");
    if (t && !s) {
      const td = JSON.parse(t);
      setSettings({ teacherName: td.name, schoolName: "", principalName: "", committeeTeachers: [] });
    }
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchCat = selectedCategory === "all" || doc.category === selectedCategory;
    const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDownload = async (doc: Document) => {
    if (doc.isPremium) {
      setPreviewDoc(doc);
      return;
    }
    setDownloadingId(doc.id);
    await new Promise((r) => setTimeout(r, 1200));
    setDownloadingId(null);
    toast.success(`${doc.name} başarıyla indirildi!`, {
      description: settings?.schoolName ? `${settings.schoolName} için hazırlandı.` : "Okul bilgilerini Ayarlar'dan ekleyin.",
    });
  };

  const premiumCount = documents.filter((d) => d.isPremium).length;
  const freeCount = documents.length - premiumCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Evrak Merkezi
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {freeCount} ücretsiz + {premiumCount} premium evrak
          </p>
        </div>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 gap-2 h-10">
          <Crown className="w-4 h-4" />
          Premium'a Geç
        </Button>
      </div>

      {/* School Info Banner */}
      {settings?.schoolName ? (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-emerald-800" style={{ fontWeight: 600 }}>Evraklar otomatik doldurulacak: </span>
            <span className="text-emerald-700">{settings.schoolName}</span>
            {settings.principalName && <span className="text-emerald-600"> • Müdür: {settings.principalName}</span>}
          </div>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <School className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm flex-1">
            <span className="text-amber-800" style={{ fontWeight: 600 }}>Okul bilgilerini ekleyin: </span>
            <span className="text-amber-700">Evraklar okul adı ve müdür adıyla otomatik doldurulur.</span>
          </div>
          <a href="/settings">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 h-8 text-xs">
              Ayarlar
            </Button>
          </a>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Category Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="relative mb-3 lg:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Evrak ara..."
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="sticky top-4">
            <CardContent className="p-3">
              <p className="text-xs text-slate-400 px-2 py-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Kategoriler
              </p>
              <div className="space-y-0.5">
                {categories.map((cat) => {
                  const count = cat.id === "all"
                    ? documents.length
                    : documents.filter((d) => d.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all ${
                        selectedCategory === cat.id
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <cat.icon className={`w-4 h-4 flex-shrink-0 ${selectedCategory === cat.id ? "text-white" : "text-slate-400"}`} />
                      <span className="text-sm flex-1" style={{ fontWeight: 500 }}>
                        {cat.label}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Document Grid */}
        <div className="flex-1 min-w-0">
          {/* Search (desktop) */}
          <div className="relative mb-4 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Evrak adı veya açıklama ara..."
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredDocs.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Arama kriterlerine uygun evrak bulunamadı</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredDocs.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card
                      className={`h-full flex flex-col transition-all hover:shadow-md ${
                        doc.isPremium ? "border-amber-200" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              doc.isPremium ? "bg-amber-100" : "bg-blue-100"
                            }`}
                          >
                            <doc.icon className={`w-5 h-5 ${doc.isPremium ? "text-amber-600" : "text-blue-600"}`} />
                          </div>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {doc.isPremium && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs gap-0.5">
                                <Crown className="w-2.5 h-2.5" />
                                Premium
                              </Badge>
                            )}
                            {doc.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <CardTitle className="text-sm leading-snug">{doc.name}</CardTitle>
                        <CardDescription className="text-xs">{doc.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-0">
                        <Button
                          onClick={() => handleDownload(doc)}
                          className={`w-full h-9 text-sm gap-2 ${
                            doc.isPremium
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          disabled={downloadingId === doc.id}
                        >
                          {downloadingId === doc.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                              />
                              Hazırlanıyor...
                            </>
                          ) : doc.isPremium ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Premium'a Geç
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              İndir
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Premium CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white border-0 overflow-hidden">
              <CardContent className="py-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                      <Crown className="w-6 h-6" />
                      <h3 className="text-white" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                        Premium ile Zamanınızı Kazanın
                      </h3>
                    </div>
                    <p className="text-orange-100 text-sm max-w-md">
                      AI destekli soru üretimi, tam evrak paketleri, detaylı analiz raporları ve tüm premium
                      içeriklere sınırsız erişim.
                    </p>
                  </div>
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 gap-2 flex-shrink-0 h-11">
                    <Sparkles className="w-4 h-4" />
                    Premium'a Geç — ₺99/ay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Premium Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-center">Premium Evrak</DialogTitle>
            <DialogDescription className="text-center">
              "<span style={{ fontWeight: 600 }}>{previewDoc?.name}</span>" premium pakette yer almaktadır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            {["Sınırsız evrak indirme", "AI destekli sınav sorusu üretimi", "Tam evrak paketleri", "Öncelikli destek"].map(
              (feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              )
            )}
          </div>
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-11 gap-2">
            <Crown className="w-4 h-4" />
            Premium'a Yükselt — ₺99/ay
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
