import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  BookOpen,
  FileText,
  Clock,
  CalendarDays,
  Download,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Bell,
  Star,
  Zap,
  ChevronRight,
  BookMarked,
  Users,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TeacherData {
  name: string;
  branch: string;
  grades: string[];
}

interface UpcomingDate {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  exam: "bg-red-100 text-red-700",
  meeting: "bg-blue-100 text-blue-700",
  event: "bg-green-100 text-green-700",
  deadline: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

const categoryLabels: Record<string, string> = {
  exam: "Sınav",
  meeting: "Toplantı",
  event: "Etkinlik",
  deadline: "Son Tarih",
  other: "Diğer",
};

function getWeeklyOutcomes(branch: string, week: number): string[] {
  const map: Record<string, string[][]> = {
    Matematik: [
      ["Doğal sayıları tanır ve karşılaştırır", "Toplama ve çıkarma işlemi yapar", "Problem çözme stratejilerini uygular"],
      ["Çarpma tablosunu kullanır", "Bölme işlemi gerçekleştirir", "İşlem önceliğini bilir"],
      ["Kesirleri tanır ve gösterir", "Kesirlerle toplama ve çıkarma yapar", "Denkdeğer kesirleri bulur"],
      ["Ondalık sayıları tanır", "Ondalık sayıları sıralar", "Ondalık sayılarla toplama yapar"],
      ["Yüzdeleri anlar ve hesaplar", "Yüzde problemlerini çözer", "Oran ve orantı kurar"],
      ["Cebrik ifadeleri tanır", "Birinci dereceden denklem kurar ve çözer", "Denklem problemleri yapar"],
      ["Geometrik şekilleri tanır", "Alan ve çevre formüllerini uygular", "Simetri ve dönüşüm yapar"],
      ["Veri toplar ve düzenler", "Tablo ve grafik okur", "İstatistik hesaplamaları yapar"],
    ],
    Türkçe: [
      ["Sesli ve sessiz harfleri tanır", "Hece ve kelime yazar", "Büyük harf kurallarını uygular"],
      ["Paragraf anlar ve yorumlar", "Ana fikri belirler", "Anahtar kelimeleri tespit eder"],
      ["Yazım kurallarını uygular", "Noktalama işaretlerini doğru kullanır", "İmla hatalarını düzeltir"],
      ["Ad, sıfat ve zamiri ayırt eder", "Fiil çekimlerini yapar", "Cümle ögelerini belirler"],
      ["Hikâye ve masal yazar", "Yaratıcı yazarlık tekniklerini kullanır", "Kompozisyon planlar"],
      ["Şiiri sesli okur ve yorumlar", "Ölçü ve kafiye bilgisini gösterir", "Şiir yazar"],
      ["Gazete ve makale okur", "Eleştirel düşünür", "Görüş ve kanıt ayrımını yapar"],
      ["Sözlü anlatım yapar", "Sunum hazırlar ve sunar", "Dinleme becerilerini geliştirir"],
    ],
    İngilizce: [
      ["Alphabet ve phonics bilgisini kullanır", "Selamlama ifadelerini söyler", "Kendini tanıtır"],
      ["Present Simple Tense kullanır", "Daily routine kelimelerini bilir", "Soru ve cevap oluşturur"],
      ["Aile üyelerini tanıtır", "There is / there are yapısını kullanır", "Possession ifade eder"],
      ["Meslekleri listeler", "Jobs vocabulary kullanır", "Can / Can't yapısını kullanır"],
      ["Food and drink vocabulary bilir", "Yemek siparişi verir", "Countable/Uncountable ayrımını yapar"],
      ["Past Simple Tense kullanır", "Geçmiş olayları anlatır", "Regular/Irregular verbs bilir"],
      ["Health vocabulary kullanır", "Symptoms ve feelings ifade eder", "Should / Shouldn't kullanır"],
      ["Future plans için will kullanır", "Seyahat konuşmaları yapar", "Yön tarif eder"],
    ],
    "Fen Bilimleri": [
      ["Maddenin özelliklerini açıklar", "Katı, sıvı, gaz halleri karşılaştırır", "Hal değişimini gözlemler"],
      ["Canlıların temel özelliklerini sıralar", "Hücre yapısını şematize eder", "Canlı ve cansız farkını belirler"],
      ["Besin zinciri oluşturur", "Ekosistem kavramını açıklar", "Biyoçeşitliliğin önemini savunur"],
      ["Işığın yansıma ve kırılmasını açıklar", "Ayna ve merceği karşılaştırır", "Renk oluşumunu açıklar"],
      ["Ses kaynakları listeler", "Sesin yayılmasını açıklar", "Ses şiddetini ölçer"],
      ["Kuvvet ve hareketi ilişkilendirir", "Newton'un yasalarını açıklar", "Sürtünme kuvvetini hesaplar"],
      ["Basit devre kurar", "İletken ve yalıtkanı ayırt eder", "Elektrik güvenliğini açıklar"],
      ["Dünya'nın yapısını açıklar", "Kayaç türlerini sınıflandırır", "Yer kabuğu hareketlerini açıklar"],
    ],
  };

  const outcomes = map[branch];
  if (!outcomes) {
    return [
      "Konunun temel kavramlarını açıklar",
      "Konu ile ilgili problemleri çözer",
      "Öğrendiklerini günlük hayatla ilişkilendirir",
    ];
  }
  const idx = (week - 1) % outcomes.length;
  return outcomes[idx];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [currentWeek] = useState(18);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);
  const [hasPlans, setHasPlans] = useState(false);
  const [docCount] = useState(3);

  useEffect(() => {
    const data = localStorage.getItem("teacherData");
    if (!data) {
      navigate("/");
      return;
    }
    setTeacherData(JSON.parse(data));

    const savedDates = localStorage.getItem("importantDates");
    if (savedDates) {
      const parsed = JSON.parse(savedDates);
      const upcoming = parsed
        .filter((d: UpcomingDate) => new Date(d.date) >= new Date())
        .sort((a: UpcomingDate, b: UpcomingDate) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingDates(upcoming);
    }

    const plans = localStorage.getItem("yearlyPlans");
    setHasPlans(!!plans);
  }, [navigate]);

  if (!teacherData) return null;

  const weeklyOutcomes = getWeeklyOutcomes(teacherData.branch, currentWeek);
  const planProgress = Math.round((currentWeek / 36) * 100);
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: tr });

  const statsCards = [
    {
      label: "Branş",
      value: teacherData.branch,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-200",
      textColor: "text-blue-50",
    },
    {
      label: "Sınıf Sayısı",
      value: `${teacherData.grades.length} Sınıf`,
      icon: Users,
      color: "from-violet-500 to-violet-600",
      iconColor: "text-violet-200",
      textColor: "text-violet-50",
    },
    {
      label: "Mevcut Hafta",
      value: `${currentWeek}. Hafta`,
      icon: CalendarDays,
      color: "from-emerald-500 to-emerald-600",
      iconColor: "text-emerald-200",
      textColor: "text-emerald-50",
    },
    {
      label: "Yıllık İlerleme",
      value: `%${planProgress}`,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      iconColor: "text-amber-200",
      textColor: "text-amber-50",
    },
  ];

  const quickActions = [
    {
      icon: BookMarked,
      label: "Yıllık Plan",
      desc: "Görüntüle & İndir",
      path: "/plans",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconBg: "bg-blue-600",
    },
    {
      icon: FileText,
      label: "Evrak Oluştur",
      desc: "Tek tıkla hazırla",
      path: "/documents",
      color: "bg-violet-50 hover:bg-violet-100 border-violet-200",
      iconBg: "bg-violet-600",
    },
    {
      icon: CalendarDays,
      label: "Takvim",
      desc: "Önemli tarihler",
      path: "/calendar",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      iconBg: "bg-emerald-600",
    },
    {
      icon: Clock,
      label: "Ders Programı",
      desc: "Haftalık çizelge",
      path: "/schedule",
      color: "bg-amber-50 hover:bg-amber-100 border-amber-200",
      iconBg: "bg-amber-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-6 sm:p-8 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white" />
            <div className="absolute -bottom-4 right-24 w-48 h-48 rounded-full bg-white" />
            <div className="absolute top-2 left-1/2 w-16 h-16 rounded-full bg-white" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">{today}</p>
              <h2 className="text-2xl sm:text-3xl text-white mb-1">
                {getGreeting()}, {teacherData.name.split(" ")[0]}! 👋
              </h2>
              <p className="text-blue-100">
                {teacherData.branch} branşı • {teacherData.grades.join(", ")}
              </p>
            </div>
            <div className="flex gap-3">
              {!hasPlans && (
                <Link to="/plans">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50 h-10 px-4 text-sm gap-2">
                    <Sparkles className="w-4 h-4" />
                    Plan Oluştur
                  </Button>
                </Link>
              )}
              <Link to="/documents">
                <Button variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white h-10 px-4 text-sm gap-2">
                  <Download className="w-4 h-4" />
                  Evrak İndir
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card className={`bg-gradient-to-br ${card.color} border-0 text-white overflow-hidden`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs ${card.textColor}`} style={{ fontWeight: 500 }}>
                    {card.label}
                  </p>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <p className="text-white" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Weekly Outcomes + Progress */}
        <div className="lg:col-span-2 space-y-5">
          {/* Weekly Outcomes — shown first for quick reference */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Bu Haftanın Kazanımları</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentWeek}. Hafta • {teacherData.branch}
                      </p>
                    </div>
                  </div>
                  <Link to="/plans">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 h-8 gap-1">
                      Tüm Plan <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {weeklyOutcomes.map((outcome, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.08 }}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{outcome}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Plan Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-base">Yıllık Plan İlerlemesi</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                    {currentWeek}/36 Hafta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={planProgress} className="h-2.5 mb-2" />
                <p className="text-sm text-slate-500">
                  Yılın <span className="text-blue-600" style={{ fontWeight: 600 }}>%{planProgress}</span>'i tamamlandı —{" "}
                  {36 - currentWeek} hafta kaldı
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-600" />
                  </div>
                  <CardTitle className="text-base">Hızlı Erişim</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.path} to={action.path}>
                      <div
                        className={`${action.color} border rounded-xl p-3 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 cursor-pointer`}
                      >
                        <div className={`w-9 h-9 ${action.iconBg} rounded-xl flex items-center justify-center`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-800" style={{ fontWeight: 600 }}>
                            {action.label}
                          </p>
                          <p className="text-xs text-slate-500">{action.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Upcoming Events + Grades */}
        <div className="space-y-5">
          {/* Grades Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <CardTitle className="text-base">Sınıflarım</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {teacherData.grades.map((grade, idx) => (
                  <div
                    key={grade}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                          {grade.replace(". Sınıf", "")}
                        </span>
                      </div>
                      <span className="text-sm text-slate-700" style={{ fontWeight: 500 }}>
                        {grade}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs text-slate-500">
                      Aktif
                    </Badge>
                  </div>
                ))}
                <Link to="/plans">
                  <Button variant="ghost" className="w-full mt-2 text-sm text-blue-600 h-8 gap-1">
                    Planları Gör <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-amber-600" />
                    </div>
                    <CardTitle className="text-base">Yaklaşan Tarihler</CardTitle>
                  </div>
                  <Link to="/calendar">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      Hepsi
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingDates.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Yaklaşan tarih yok</p>
                    <Link to="/calendar">
                      <Button variant="ghost" size="sm" className="mt-2 text-xs text-blue-600">
                        Tarih Ekle
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingDates.map((date) => (
                      <div key={date.id} className="flex gap-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs leading-none" style={{ fontWeight: 700 }}>
                            {format(new Date(date.date), "d")}
                          </span>
                          <span className="text-amber-100 text-xs leading-none">
                            {format(new Date(date.date), "MMM", { locale: tr })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 600 }}>
                            {date.title}
                          </p>
                          <Badge
                            className={`text-xs mt-0.5 ${categoryColors[date.category] || "bg-gray-100 text-gray-700"} border-0`}
                          >
                            {categoryLabels[date.category] || date.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Document Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-slate-300" />
                  <p className="text-sm text-slate-300" style={{ fontWeight: 600 }}>
                    Evrak Durumu
                  </p>
                </div>
                <p className="text-2xl text-white mb-1" style={{ fontWeight: 700 }}>
                  {docCount} Evrak
                </p>
                <p className="text-slate-400 text-xs mb-4">Bu dönem oluşturuldu</p>
                <Link to="/documents">
                  <Button
                    size="sm"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-8 gap-1.5"
                  >
                    <Download className="w-3 h-3" />
                    Evrak Merkezi
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}