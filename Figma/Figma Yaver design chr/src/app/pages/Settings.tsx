import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import {
  Save,
  User,
  School,
  Users,
  Trash2,
  AlertCircle,
  Plus,
  GraduationCap,
  Bell,
  Shield,
  BookOpen,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

interface TeacherData {
  name: string;
  branch: string;
  grades: string[];
}

interface AppSettings {
  teacherName: string;
  schoolName: string;
  principalName: string;
  vicePrincipalName: string;
  schoolDistrict: string;
  schoolCity: string;
  committeeTeachers: string[];
  notifyUpcoming: boolean;
  notifyToday: boolean;
  academicYear: string;
}

const branches = [
  "Matematik", "Türkçe", "İngilizce", "Fen Bilimleri", "Sosyal Bilgiler",
  "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Din Kültürü ve Ahlak Bilgisi",
  "Teknoloji ve Tasarım", "Bilişim Teknolojileri", "Türk Dili ve Edebiyatı",
  "Tarih", "Coğrafya", "Felsefe", "Fizik", "Kimya", "Biyoloji",
];

const grades = [
  "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf",
  "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf",
  "11. Sınıf", "12. Sınıf",
];

const defaultSettings: AppSettings = {
  teacherName: "",
  schoolName: "",
  principalName: "",
  vicePrincipalName: "",
  schoolDistrict: "",
  schoolCity: "",
  committeeTeachers: [],
  notifyUpcoming: true,
  notifyToday: true,
  academicYear: "2025-2026",
};

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [newTeacher, setNewTeacher] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const td = localStorage.getItem("teacherData");
    if (td) {
      const parsed: TeacherData = JSON.parse(td);
      setTeacherData(parsed);
      setSettings((prev) => ({ ...prev, teacherName: parsed.name }));
    }
    const s = localStorage.getItem("appSettings");
    if (s) {
      setSettings((prev) => ({ ...prev, ...JSON.parse(s) }));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    if (teacherData) {
      const updated = { ...teacherData, name: settings.teacherName };
      localStorage.setItem("teacherData", JSON.stringify(updated));
      setTeacherData(updated);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Ayarlar kaydedildi!", {
      description: "Tüm değişiklikler başarıyla uygulandı.",
    });
  };

  const updateBranch = (branch: string) => {
    if (!teacherData) return;
    const updated = { ...teacherData, branch };
    localStorage.setItem("teacherData", JSON.stringify(updated));
    setTeacherData(updated);
    toast.success("Branş güncellendi");
  };

  const toggleGrade = (grade: string) => {
    if (!teacherData) return;
    const grades = teacherData.grades.includes(grade)
      ? teacherData.grades.filter((g) => g !== grade)
      : [...teacherData.grades, grade];
    const updated = { ...teacherData, grades };
    localStorage.setItem("teacherData", JSON.stringify(updated));
    setTeacherData(updated);
  };

  const addCommitteeTeacher = () => {
    if (!newTeacher.trim()) { toast.error("Öğretmen adı girin"); return; }
    if (settings.committeeTeachers.includes(newTeacher.trim())) { toast.error("Bu öğretmen zaten ekli"); return; }
    setSettings({ ...settings, committeeTeachers: [...settings.committeeTeachers, newTeacher.trim()] });
    setNewTeacher("");
    toast.success("Zümre öğretmeni eklendi");
  };

  const removeCommitteeTeacher = (name: string) => {
    setSettings({ ...settings, committeeTeachers: settings.committeeTeachers.filter((t) => t !== name) });
  };

  const resetAll = () => {
    localStorage.clear();
    toast.success("Tüm veriler sıfırlandı");
    navigate("/");
  };

  const initials = teacherData?.name
    ? teacherData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ÖA";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Ayarlar
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Profil, okul ve uygulama tercihlerinizi yönetin</p>
        </div>
        <Button
          onClick={saveSettings}
          className={`gap-2 h-10 transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Kaydedildi!" : "Kaydet"}
        </Button>
      </div>

      {/* Profile Overview Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-blue-600 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-white" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                  {teacherData?.name || "Öğretmen"}
                </p>
                <p className="text-blue-200 text-sm">{teacherData?.branch || "Branş belirtilmemiş"}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {teacherData?.grades.map((g) => (
                    <Badge key={g} className="bg-white/20 text-white border-0 text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-1.5"
                  onClick={() => document.getElementById("profile-tab")?.click()}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Düzenle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4 h-10">
          <TabsTrigger id="profile-tab" value="profile" className="text-xs sm:text-sm gap-1.5">
            <User className="w-3.5 h-3.5 hidden sm:block" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="school" className="text-xs sm:text-sm gap-1.5">
            <School className="w-3.5 h-3.5 hidden sm:block" />
            Okul
          </TabsTrigger>
          <TabsTrigger value="committee" className="text-xs sm:text-sm gap-1.5">
            <Users className="w-3.5 h-3.5 hidden sm:block" />
            Zümre
          </TabsTrigger>
          <TabsTrigger value="app" className="text-xs sm:text-sm gap-1.5">
            <Bell className="w-3.5 h-3.5 hidden sm:block" />
            Uygulama
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Kişisel Bilgiler</CardTitle>
                  <CardDescription className="text-xs">Ad soyad evraklarda kullanılır</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Ad Soyad</Label>
                <Input
                  placeholder="Örn: Ayşe Yılmaz"
                  value={settings.teacherName}
                  onChange={(e) => setSettings({ ...settings, teacherName: e.target.value })}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Branş ve Sınıflar</CardTitle>
                  <CardDescription className="text-xs">Plan ve evrak oluşturmada kullanılır</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Branş</Label>
                <Select value={teacherData?.branch || ""} onValueChange={updateBranch}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Branş seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sınıflar</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {grades.map((grade) => {
                    const isSelected = teacherData?.grades.includes(grade);
                    return (
                      <button
                        key={grade}
                        onClick={() => toggleGrade(grade)}
                        className={`p-2.5 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        }`}
                        style={{ fontWeight: isSelected ? 700 : 500 }}
                      >
                        {grade.replace(". Sınıf", "")}. Sınıf
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400">
                  {teacherData?.grades.length || 0} sınıf seçili
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Tab */}
        <TabsContent value="school" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <School className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Okul Bilgileri</CardTitle>
                  <CardDescription className="text-xs">Tüm evraklara otomatik eklenir</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Okul Adı</Label>
                  <Input
                    placeholder="Örn: Atatürk İlkokulu"
                    value={settings.schoolName}
                    onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Akademik Yıl</Label>
                  <Select
                    value={settings.academicYear}
                    onValueChange={(v) => setSettings({ ...settings, academicYear: v })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Müdür Adı Soyadı</Label>
                  <Input
                    placeholder="Örn: Mehmet Demir"
                    value={settings.principalName}
                    onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Müdür Yardımcısı</Label>
                  <Input
                    placeholder="Örn: Fatma Kaya"
                    value={settings.vicePrincipalName}
                    onChange={(e) => setSettings({ ...settings, vicePrincipalName: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>İlçe</Label>
                  <Input
                    placeholder="Örn: Kadıköy"
                    value={settings.schoolDistrict}
                    onChange={(e) => setSettings({ ...settings, schoolDistrict: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>İl</Label>
                  <Input
                    placeholder="Örn: İstanbul"
                    value={settings.schoolCity}
                    onChange={(e) => setSettings({ ...settings, schoolCity: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {settings.schoolName && (
                <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-600 mb-2" style={{ fontWeight: 600 }}>
                    Önizleme — Evraklarda Görünecek:
                  </p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span style={{ fontWeight: 600 }}>Okul:</span> {settings.schoolName}
                    </p>
                    {settings.principalName && (
                      <p>
                        <span style={{ fontWeight: 600 }}>Müdür:</span> {settings.principalName}
                      </p>
                    )}
                    {settings.schoolDistrict && settings.schoolCity && (
                      <p>
                        <span style={{ fontWeight: 600 }}>Adres:</span> {settings.schoolDistrict}/{settings.schoolCity}
                      </p>
                    )}
                    <p>
                      <span style={{ fontWeight: 600 }}>Dönem:</span> {settings.academicYear} Eğitim-Öğretim Yılı
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Committee Tab */}
        <TabsContent value="committee" className="mt-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Zümre Öğretmenleri</CardTitle>
                  <CardDescription className="text-xs">Zümre toplantı tutanaklarında otomatik eklenir</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Öğretmen adı ve soyadı"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCommitteeTeacher()}
                  className="h-10"
                />
                <Button onClick={addCommitteeTeacher} className="bg-blue-600 hover:bg-blue-700 gap-2 h-10 flex-shrink-0">
                  <Plus className="w-4 h-4" />
                  Ekle
                </Button>
              </div>

              {settings.committeeTeachers.length > 0 ? (
                <div className="space-y-2">
                  {settings.committeeTeachers.map((teacher, idx) => (
                    <motion.div
                      key={teacher}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                            {teacher[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700" style={{ fontWeight: 500 }}>
                          {teacher}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => removeCommitteeTeacher(teacher)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                  <p className="text-xs text-slate-400 pt-1">{settings.committeeTeachers.length} öğretmen kayıtlı</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Henüz zümre öğretmeni eklenmedi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Tab */}
        <TabsContent value="app" className="mt-5 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <CardTitle className="text-base">Bildirim Ayarları</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                    Yaklaşan Tarih Bildirimleri
                  </p>
                  <p className="text-xs text-slate-500">3 gün öncesinden bildirim al</p>
                </div>
                <Switch
                  checked={settings.notifyUpcoming}
                  onCheckedChange={(v) => setSettings({ ...settings, notifyUpcoming: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>
                    Günlük Hatırlatmalar
                  </p>
                  <p className="text-xs text-slate-500">Bugünkü etkinlikler için bildirim</p>
                </div>
                <Switch
                  checked={settings.notifyToday}
                  onCheckedChange={(v) => setSettings({ ...settings, notifyToday: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base text-red-700">Tehlikeli Bölge</CardTitle>
                  <CardDescription className="text-xs">Bu işlemler geri alınamaz</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Tüm Verileri Sıfırla
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tüm verileri silmek istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Yıllık planlarınız, ders programınız, önemli tarihleriniz ve tüm
                      ayarlarınız kalıcı olarak silinecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={resetAll} className="bg-red-600 hover:bg-red-700">
                      Evet, Tümünü Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pb-4">
        <Button
          onClick={saveSettings}
          size="lg"
          className={`gap-2 h-11 px-8 transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Kaydedildi!" : "Ayarları Kaydet"}
        </Button>
      </div>
    </div>
  );
}
