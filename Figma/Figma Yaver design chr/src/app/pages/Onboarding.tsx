import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Users,
  CheckCircle2,
  FileText,
  CalendarDays,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const branches = [
  "Matematik", "Türkçe", "İngilizce", "Fen Bilimleri", "Sosyal Bilgiler",
  "Görsel Sanatlar", "Müzik", "Beden Eğitimi", "Din Kültürü ve Ahlak Bilgisi",
  "Teknoloji ve Tasarım", "Bilişim Teknolojileri", "Türk Dili ve Edebiyatı",
  "Tarih", "Coğrafya", "Felsefe", "Fizik", "Kimya", "Biyoloji",
];

// Maps each branch to the grade levels it's taught at (Turkish curriculum)
const branchGradeMap: Record<string, string[]> = {
  "Matematik": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Türkçe": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "İngilizce": ["2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Fen Bilimleri": ["3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "Sosyal Bilgiler": ["4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf"],
  "Görsel Sanatlar": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "Müzik": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "Beden Eğitimi": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Din Kültürü ve Ahlak Bilgisi": ["4. Sınıf", "5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf", "9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Teknoloji ve Tasarım": ["6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "Bilişim Teknolojileri": ["5. Sınıf", "6. Sınıf", "7. Sınıf", "8. Sınıf"],
  "Türk Dili ve Edebiyatı": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Tarih": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Coğrafya": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Felsefe": ["10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Fizik": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Kimya": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
  "Biyoloji": ["9. Sınıf", "10. Sınıf", "11. Sınıf", "12. Sınıf"],
};

const features = [
  { icon: CalendarDays, label: "Yıllık Plan", desc: "Otomatik müfredat planı" },
  { icon: FileText, label: "Evrak Merkezi", desc: "Tek tıkla tüm belgeler" },
  { icon: Clock, label: "Ders Programı", desc: "Haftalık çizelge" },
  { icon: Users, label: "Zümre Evrakları", desc: "Toplantı tutanakları" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    grades: [] as string[],
  });
  const [branchSearch, setBranchSearch] = useState("");
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setBranchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBranches = branches.filter((b) =>
    b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const availableGrades = formData.branch
    ? (branchGradeMap[formData.branch] ?? [])
    : [];

  const handleNext = () => {
    if (step === 1 && formData.name.trim()) setStep(2);
    else if (step === 2 && formData.branch) setStep(3);
  };

  const handleFinish = () => {
    if (formData.grades.length > 0) {
      localStorage.setItem("teacherData", JSON.stringify(formData));
      navigate("/dashboard");
    }
  };

  const toggleGrade = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade],
    }));
  };

  const selectBranch = (branch: string) => {
    setFormData({ ...formData, branch, grades: [] });
    setBranchSearch(branch);
    setBranchDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white leading-none" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
                Öğretmen
                <span className="text-blue-400">Asistan</span>
              </p>
              <p className="text-blue-300 text-xs mt-0.5">Zamanınızı size geri veriyoruz</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Features Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block lg:col-span-2"
          >
            <div className="space-y-3 mb-6">
              {features.map((f, idx) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08 }}
                  className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-violet-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>{f.label}</p>
                    <p className="text-slate-400 text-xs">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-2xl border border-blue-500/20">
              <Sparkles className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>
                Yapay Zeka Destekli
              </p>
              <p className="text-slate-400 text-xs">
                Branşınıza özel yıllık plan ve tüm bürokratik evraklar otomatik hazırlanır.
              </p>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-6 sm:p-8">
                {/* Steps Indicator */}
                <div className="flex items-center gap-0 mb-8">
                  {[1, 2, 3].map((s, idx) => (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          s < step
                            ? "bg-emerald-500"
                            : s === step
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      >
                        {s < step ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className={`text-xs ${s === step ? "text-white" : "text-slate-500"}`} style={{ fontWeight: 700 }}>
                            {s}
                          </span>
                        )}
                      </div>
                      {idx < 2 && (
                        <div
                          className={`flex-1 h-0.5 transition-all ${
                            s < step ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Name */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: "1.375rem" }}>
                          Hoş Geldiniz!
                        </h2>
                        <p className="text-slate-500 text-sm">Başlamak için adınızı girin</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700">Ad Soyad</Label>
                        <Input
                          id="name"
                          placeholder="Örn: Ayşe Yılmaz"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleNext()}
                          className="h-12 text-base"
                          autoFocus
                        />
                      </div>
                      <Button
                        onClick={handleNext}
                        disabled={!formData.name.trim()}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 gap-2 text-base"
                      >
                        Devam Et
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Branch */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-violet-600" />
                        </div>
                        <h2 className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: "1.375rem" }}>
                          Branşınızı Seçin
                        </h2>
                        <p className="text-slate-500 text-sm">
                          Merhaba <span className="text-slate-700" style={{ fontWeight: 600 }}>{formData.name.split(" ")[0]}</span>! Hangi dersi okutuyorsunuz?
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">Branş</Label>
                        <div ref={branchRef} className="relative">
                          <div className="relative">
                            <Input
                              placeholder="Branş ara veya seçin..."
                              value={branchSearch}
                              onChange={(e) => {
                                setBranchSearch(e.target.value);
                                setBranchDropdownOpen(true);
                                if (formData.branch && e.target.value !== formData.branch) {
                                  setFormData({ ...formData, branch: "", grades: [] });
                                }
                              }}
                              onFocus={() => setBranchDropdownOpen(true)}
                              className="h-12 text-base pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              onClick={() => setBranchDropdownOpen((v) => !v)}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${branchDropdownOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {branchDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                            >
                              {filteredBranches.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-400 text-center">Sonuç bulunamadı</div>
                              ) : (
                                filteredBranches.map((branch) => (
                                  <button
                                    key={branch}
                                    type="button"
                                    onClick={() => selectBranch(branch)}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-center justify-between ${
                                      formData.branch === branch ? "bg-violet-50 text-violet-700" : "text-slate-700"
                                    }`}
                                    style={{ fontWeight: formData.branch === branch ? 600 : 400 }}
                                  >
                                    {branch}
                                    {formData.branch === branch && (
                                      <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                    )}
                                  </button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {formData.branch && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-violet-50 rounded-xl border border-violet-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-violet-600" />
                          <span className="text-sm text-violet-700">
                            <span style={{ fontWeight: 600 }}>{formData.branch}</span> branşı için yıllık plan hazırlanacak
                          </span>
                        </motion.div>
                      )}

                      <div className="flex gap-3">
                        <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">
                          Geri
                        </Button>
                        <Button
                          onClick={handleNext}
                          disabled={!formData.branch}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          Devam Et
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Grades */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-slate-800 mb-1" style={{ fontWeight: 700, fontSize: "1.375rem" }}>
                          Sınıflarınızı Seçin
                        </h2>
                        <p className="text-slate-500 text-sm">
                          <span style={{ fontWeight: 600 }}>{formData.branch}</span> dersini hangi sınıflara veriyorsunuz?
                        </p>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableGrades.map((grade) => {
                          const isSelected = formData.grades.includes(grade);
                          return (
                            <button
                              key={grade}
                              onClick={() => toggleGrade(grade)}
                              className={`relative p-3 rounded-xl border text-sm transition-all ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                              }`}
                              style={{ fontWeight: isSelected ? 700 : 500 }}
                            >
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </motion.div>
                              )}
                              {grade.replace(". Sınıf", "")}. Sınıf
                            </button>
                          );
                        })}
                      </div>

                      {formData.grades.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap gap-1.5"
                        >
                          {formData.grades.map((g) => (
                            <Badge key={g} className="bg-blue-100 text-blue-700 border-blue-200">
                              {g}
                            </Badge>
                          ))}
                        </motion.div>
                      )}

                      <div className="flex gap-3">
                        <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">
                          Geri
                        </Button>
                        <Button
                          onClick={handleFinish}
                          disabled={formData.grades.length === 0}
                          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Başla!
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
