import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar as CalendarUI } from "../components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Plus,
  Bell,
  CalendarDays,
  Trash2,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Users,
  Megaphone,
  ClipboardList,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { format, isBefore, isToday, addDays, isFuture, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

interface ImportantDate {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "exam" | "meeting" | "event" | "deadline" | "other";
}

const categoryConfig = {
  exam: {
    label: "Sınav",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: GraduationCap,
    bg: "bg-red-50",
    border: "border-red-200",
    badgeBg: "bg-red-600",
  },
  meeting: {
    label: "Toplantı",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: Users,
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeBg: "bg-blue-600",
  },
  event: {
    label: "Etkinlik",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: Megaphone,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-600",
  },
  deadline: {
    label: "Son Tarih",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    icon: ClipboardList,
    bg: "bg-orange-50",
    border: "border-orange-200",
    badgeBg: "bg-orange-600",
  },
  other: {
    label: "Diğer",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: Bell,
    bg: "bg-slate-50",
    border: "border-slate-200",
    badgeBg: "bg-slate-500",
  },
};

const defaultDates: ImportantDate[] = [
  { id: "default-1", title: "1. Dönem Sonu", description: "Birinci yarıyıl sonu", date: "2026-01-23", category: "deadline" },
  { id: "default-2", title: "2. Dönem Başlangıcı", description: "İkinci yarıyıl başlangıcı", date: "2026-02-02", category: "event" },
  { id: "default-3", title: "Zümre Toplantısı", description: "Dönem sonu zümre değerlendirme", date: "2026-06-15", category: "meeting" },
  { id: "default-4", title: "1. Yazılı Sınavlar", description: "Birinci dönem yazılı sınavları", date: "2026-11-11", category: "exam" },
];

function getDaysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

export function Calendar() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [newDate, setNewDate] = useState({
    title: "",
    description: "",
    date: new Date(),
    category: "other" as ImportantDate["category"],
  });

  useEffect(() => {
    const saved = localStorage.getItem("importantDates");
    if (saved) {
      setDates(JSON.parse(saved));
    } else {
      setDates(defaultDates);
      localStorage.setItem("importantDates", JSON.stringify(defaultDates));
    }
  }, []);

  useEffect(() => {
    // Notifications
    dates.forEach((date) => {
      if (isToday(new Date(date.date))) {
        toast.info(`Bugün: ${date.title}`, { description: date.description });
      } else if (getDaysUntil(date.date) === 1) {
        toast.warning(`Yarın: ${date.title}`, { description: date.description });
      }
    });
  }, []);

  const addDate = () => {
    if (!newDate.title) { toast.error("Lütfen bir başlık girin"); return; }
    const entry: ImportantDate = {
      id: Date.now().toString(),
      title: newDate.title,
      description: newDate.description,
      date: format(newDate.date, "yyyy-MM-dd"),
      category: newDate.category,
    };
    const updated = [...dates, entry];
    setDates(updated);
    localStorage.setItem("importantDates", JSON.stringify(updated));
    toast.success("Tarih eklendi");
    setIsDialogOpen(false);
    setNewDate({ title: "", description: "", date: new Date(), category: "other" });
  };

  const deleteDate = (id: string) => {
    const updated = dates.filter((d) => d.id !== id);
    setDates(updated);
    localStorage.setItem("importantDates", JSON.stringify(updated));
    toast.success("Tarih silindi");
  };

  const upcoming = dates
    .filter((d) => !isBefore(new Date(d.date), new Date()) || isToday(new Date(d.date)))
    .filter((d) => filterCategory === "all" || d.category === filterCategory)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = dates
    .filter((d) => isBefore(new Date(d.date), new Date()) && !isToday(new Date(d.date)))
    .filter((d) => filterCategory === "all" || d.category === filterCategory)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedDateEvents = dates.filter(
    (d) => selectedDate && format(new Date(d.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const eventDateStrings = new Set(dates.map((d) => d.date));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Takvim
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Önemli tarihleri takip edin, bildirim alın</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-10">
              <Plus className="w-4 h-4" />
              Tarih Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Önemli Tarih</DialogTitle>
              <DialogDescription>Takviminize yeni bir önemli tarih ekleyin</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Başlık</Label>
                <Input
                  placeholder="Örn: Zümre Toplantısı"
                  value={newDate.title}
                  onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Açıklama (İsteğe bağlı)</Label>
                <Textarea
                  placeholder="Detaylı açıklama..."
                  rows={2}
                  value={newDate.description}
                  onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
                    const cfg = categoryConfig[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setNewDate({ ...newDate, category: key })}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          newDate.category === key
                            ? `${cfg.bg} ${cfg.border} text-slate-800`
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                        style={{ fontWeight: newDate.category === key ? 600 : 400 }}
                      >
                        <cfg.icon className="w-4 h-4 mx-auto mb-1" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tarih</Label>
                <CalendarUI
                  mode="single"
                  selected={newDate.date}
                  onSelect={(date) => date && setNewDate({ ...newDate, date })}
                  locale={tr}
                  className="rounded-lg border"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">İptal</Button>
              <Button onClick={addDate} className="flex-1 bg-blue-600 hover:bg-blue-700">Ekle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Alerts */}
      {upcoming.filter((d) => getDaysUntil(d.date) >= 0 && getDaysUntil(d.date) <= 7).length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {upcoming
            .filter((d) => getDaysUntil(d.date) >= 0 && getDaysUntil(d.date) <= 7)
            .map((date) => {
              const cfg = categoryConfig[date.category];
              const daysLeft = getDaysUntil(date.date);
              return (
                <div
                  key={date.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>
                    {date.title}
                  </span>
                  <Badge className={`${cfg.badgeBg} text-white border-0 text-xs`}>
                    {daysLeft === 0 ? "Bugün!" : `${daysLeft} gün kaldı`}
                  </Badge>
                </div>
              );
            })}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">
                {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: tr }) : "Takvim"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={tr}
              className="w-full"
              modifiers={{
                hasEvent: (date) => eventDateStrings.has(format(date, "yyyy-MM-dd")),
              }}
              modifiersClassNames={{
                hasEvent: "relative font-bold text-blue-700 after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-blue-500",
              }}
            />

            {/* Selected Date Events */}
            {selectedDateEvents.length > 0 && (
              <div className="mt-4 space-y-2 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 px-1" style={{ fontWeight: 600 }}>
                  {selectedDate && format(selectedDate, "d MMMM", { locale: tr })} tarihindeki etkinlikler
                </p>
                {selectedDateEvents.map((ev) => {
                  const cfg = categoryConfig[ev.category];
                  return (
                    <div key={ev.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                      <cfg.icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 600 }}>{ev.title}</p>
                        {ev.description && <p className="text-xs text-slate-500 truncate">{ev.description}</p>}
                      </div>
                      <Badge className={`${cfg.color} border text-xs flex-shrink-0`}>{cfg.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <p className="text-xl text-blue-600" style={{ fontWeight: 700 }}>{upcoming.length}</p>
                <p className="text-xs text-slate-500">Yaklaşan</p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <p className="text-xl text-slate-700" style={{ fontWeight: 700 }}>{past.length}</p>
                <p className="text-xs text-slate-500">Geçmiş</p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <p className="text-xl text-emerald-600" style={{ fontWeight: 700 }}>{dates.length}</p>
                <p className="text-xs text-slate-500">Toplam</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Kategori filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full h-9">
              <TabsTrigger value="upcoming" className="flex-1 text-xs">
                Yaklaşan ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1 text-xs">
                Geçmiş ({past.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-3 space-y-2">
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Yaklaşan tarih yok</p>
                </div>
              ) : (
                <AnimatePresence>
                  {upcoming.map((date, idx) => {
                    const cfg = categoryConfig[date.category];
                    const daysLeft = getDaysUntil(date.date);
                    return (
                      <motion.div
                        key={date.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`flex gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} group`}
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
                          <span className="text-xs text-slate-500 leading-none">
                            {format(new Date(date.date), "MMM", { locale: tr })}
                          </span>
                          <span className="text-slate-800 leading-none" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                            {format(new Date(date.date), "d")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 600 }}>
                              {date.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              onClick={() => deleteDate(date.id)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                          {date.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{date.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Badge className={`${cfg.color} border text-xs`}>{cfg.label}</Badge>
                            {daysLeft === 0 ? (
                              <Badge className="bg-red-600 text-white border-0 text-xs">Bugün!</Badge>
                            ) : daysLeft === 1 ? (
                              <Badge className="bg-orange-500 text-white border-0 text-xs">Yarın</Badge>
                            ) : daysLeft <= 7 ? (
                              <Badge className="bg-amber-500 text-white border-0 text-xs">{daysLeft} gün</Badge>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-3 space-y-2">
              {past.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Geçmiş tarih yok</p>
                </div>
              ) : (
                past.slice(0, 10).map((date, idx) => {
                  const cfg = categoryConfig[date.category];
                  return (
                    <motion.div
                      key={date.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 opacity-70 group hover:opacity-100 transition-opacity"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate" style={{ fontWeight: 500 }}>{date.title}</p>
                        <p className="text-xs text-slate-400">{format(new Date(date.date), "d MMMM yyyy", { locale: tr })}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteDate(date.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
