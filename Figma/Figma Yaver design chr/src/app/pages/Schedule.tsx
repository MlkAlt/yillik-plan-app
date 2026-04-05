import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Plus, Trash2, Clock, Download, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface ScheduleEntry {
  day: string;
  period: number;
  grade: string;
  startTime: string;
  endTime: string;
}

interface TeacherData {
  name: string;
  branch: string;
  grades: string[];
}

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
const DAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const DEFAULT_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "08:40" },
  2: { start: "08:50", end: "09:30" },
  3: { start: "09:40", end: "10:20" },
  4: { start: "10:30", end: "11:10" },
  5: { start: "11:20", end: "12:00" },
  6: { start: "13:00", end: "13:40" },
  7: { start: "13:50", end: "14:30" },
  8: { start: "14:40", end: "15:20" },
};

const GRADE_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-pink-500",
];

function getTodayDay(): string {
  const d = new Date().getDay();
  // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  if (d >= 1 && d <= 5) return DAYS[d - 1];
  return DAYS[0];
}

export function Schedule() {
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: string; period: number } | null>(null);
  const [editEntry, setEditEntry] = useState<{
    grade: string;
    startTime: string;
    endTime: string;
  }>({ grade: "", startTime: "", endTime: "" });
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [todayHighlight, setTodayHighlight] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("teacherData");
    if (data) {
      const parsed: TeacherData = JSON.parse(data);
      setTeacherData(parsed);
      setEditEntry((prev) => ({ ...prev, grade: parsed.grades[0] || "" }));
    }
    const saved = localStorage.getItem("weeklySchedule");
    if (saved) setSchedule(JSON.parse(saved));
  }, []);

  const gradeColorMap: Record<string, string> = {};
  teacherData?.grades.forEach((grade, idx) => {
    gradeColorMap[grade] = GRADE_COLORS[idx % GRADE_COLORS.length];
  });

  const getEntry = (day: string, period: number) =>
    schedule.find((s) => s.day === day && s.period === period);

  const openAddDialog = (day: string, period: number) => {
    const existing = getEntry(day, period);
    if (existing) {
      setEditEntry({ grade: existing.grade, startTime: existing.startTime, endTime: existing.endTime });
    } else {
      setEditEntry({
        grade: teacherData?.grades[0] || "",
        startTime: DEFAULT_TIMES[period]?.start || "08:00",
        endTime: DEFAULT_TIMES[period]?.end || "08:40",
      });
    }
    setSelectedCell({ day, period });
    setDialogOpen(true);
  };

  const saveEntry = () => {
    if (!selectedCell || !editEntry.grade) { toast.error("Sınıf seçin"); return; }

    const entry: ScheduleEntry = {
      day: selectedCell.day,
      period: selectedCell.period,
      grade: editEntry.grade,
      startTime: editEntry.startTime,
      endTime: editEntry.endTime,
    };

    const existing = schedule.findIndex((s) => s.day === selectedCell.day && s.period === selectedCell.period);
    let updated;
    if (existing >= 0) {
      updated = [...schedule];
      updated[existing] = entry;
    } else {
      updated = [...schedule, entry];
    }
    setSchedule(updated);
    localStorage.setItem("weeklySchedule", JSON.stringify(updated));
    setDialogOpen(false);
    toast.success("Ders kaydedildi");
  };

  const deleteEntry = (day: string, period: number) => {
    const updated = schedule.filter((s) => !(s.day === day && s.period === period));
    setSchedule(updated);
    localStorage.setItem("weeklySchedule", JSON.stringify(updated));
    toast.success("Ders silindi");
  };

  const totalLessons = schedule.length;
  const todayDay = getTodayDay();
  const todayLessons = schedule.filter((s) => s.day === todayDay).sort((a, b) => a.period - b.period);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Ders Programı
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Haftalık ders çizelgenizi oluşturun</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9"
            onClick={() => toast.success("Program PDF olarak hazırlanıyor...")}
          >
            <Download className="w-4 h-4" />
            PDF İndir
          </Button>
        </div>
      </div>

      {/* Stats & Legend */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700" style={{ fontWeight: 600 }}>
            {totalLessons} Ders
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {teacherData?.grades.map((grade) => (
            <div key={grade} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${gradeColorMap[grade] || "bg-slate-400"}`} />
              <span className="text-xs text-slate-600" style={{ fontWeight: 500 }}>
                {grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Banner */}
      {todayLessons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0">
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-200" />
                <p className="text-blue-100 text-sm" style={{ fontWeight: 600 }}>
                  Bugün ({todayDay}) — {todayLessons.length} Ders
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {todayLessons.map((lesson) => (
                  <div
                    key={`${lesson.day}-${lesson.period}`}
                    className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-white text-xs">{lesson.period}. Saat</span>
                    <Badge className="bg-white/20 text-white border-0 text-xs">{lesson.grade}</Badge>
                    <span className="text-blue-200 text-xs">{lesson.startTime}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Schedule Grid */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Haftalık Çizelge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="w-20 p-3 bg-slate-50 border-b border-r border-slate-200 text-xs text-slate-500 text-center" style={{ fontWeight: 600 }}>
                  Saat
                </th>
                {DAYS.map((day, idx) => {
                  const isToday = day === todayDay;
                  return (
                    <th
                      key={day}
                      className={`p-3 border-b border-slate-200 text-sm text-center ${
                        isToday ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-600"
                      }`}
                      style={{ fontWeight: isToday ? 700 : 600 }}
                    >
                      <span className="hidden sm:block">{day}</span>
                      <span className="sm:hidden">{DAY_SHORT[idx]}</span>
                      {isToday && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} className="border-b border-slate-100 last:border-b-0">
                  <td className="p-2 border-r border-slate-100 bg-slate-50 text-center">
                    <div className="text-xs text-slate-500" style={{ fontWeight: 700 }}>
                      {period}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {DEFAULT_TIMES[period]?.start}
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const entry = getEntry(day, period);
                    const isToday = day === todayDay;
                    const colorClass = entry ? (gradeColorMap[entry.grade] || "bg-blue-500") : "";
                    return (
                      <td
                        key={day}
                        className={`p-1.5 border-r border-slate-100 last:border-r-0 ${
                          isToday ? "bg-blue-50/50" : ""
                        }`}
                        style={{ minHeight: "64px" }}
                      >
                        {entry ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${colorClass} text-white rounded-lg p-2 relative group cursor-pointer h-full min-h-[56px] flex flex-col justify-center`}
                            onClick={() => openAddDialog(day, period)}
                          >
                            <p className="text-xs leading-none truncate" style={{ fontWeight: 700 }}>
                              {entry.grade}
                            </p>
                            <p className="text-xs opacity-80 mt-1">
                              {entry.startTime}–{entry.endTime}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEntry(day, period);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 rounded flex items-center justify-center bg-white/20 hover:bg-white/40"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => openAddDialog(day, period)}
                            className="w-full h-full min-h-[56px] rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-100"
                            style={{ opacity: 1 }}
                          >
                            <Plus className="w-4 h-4 text-slate-300 hover:text-blue-400" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Info */}
      {schedule.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800" style={{ fontWeight: 600 }}>
                Ders programınızı oluşturun
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Hücrelere tıklayarak ders ekleyin. Ders programı, Gösterge Paneli'nde de görüntülenir.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {getEntry(selectedCell?.day || "", selectedCell?.period || 0) ? "Dersi Düzenle" : "Ders Ekle"}
            </DialogTitle>
            <DialogDescription>
              {selectedCell?.day} — {selectedCell?.period}. Ders Saati ({DEFAULT_TIMES[selectedCell?.period || 1]?.start})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {teacherData && (
              <div className="space-y-1.5">
                <Label>Sınıf</Label>
                <div className="grid grid-cols-2 gap-2">
                  {teacherData.grades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setEditEntry({ ...editEntry, grade })}
                      className={`p-2.5 rounded-xl border text-sm transition-all ${
                        editEntry.grade === grade
                          ? `${gradeColorMap[grade]} text-white border-transparent`
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                      style={{ fontWeight: editEntry.grade === grade ? 700 : 500 }}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Başlangıç</Label>
                <Input
                  type="time"
                  value={editEntry.startTime}
                  onChange={(e) => setEditEntry({ ...editEntry, startTime: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bitiş</Label>
                <Input
                  type="time"
                  value={editEntry.endTime}
                  onChange={(e) => setEditEntry({ ...editEntry, endTime: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {getEntry(selectedCell?.day || "", selectedCell?.period || 0) && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  deleteEntry(selectedCell!.day, selectedCell!.period);
                  setDialogOpen(false);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sil
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={saveEntry}>
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
