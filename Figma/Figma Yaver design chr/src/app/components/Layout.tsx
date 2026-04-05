import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CalendarDays,
  Clock,
  Settings,
  GraduationCap,
  Menu,
  ChevronRight,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { TooltipProvider } from "./ui/tooltip";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Gösterge Paneli", color: "text-blue-500" },
  { path: "/plans", icon: BookOpen, label: "Yıllık Planlar", color: "text-violet-500" },
  { path: "/documents", icon: FileText, label: "Evrak Merkezi", color: "text-emerald-500" },
  { path: "/calendar", icon: CalendarDays, label: "Takvim", color: "text-amber-500" },
  { path: "/schedule", icon: Clock, label: "Ders Programı", color: "text-rose-500" },
];

interface TeacherData {
  name: string;
  branch: string;
  grades: string[];
}

function SidebarNav({
  location,
  teacherData,
  onClose,
}: {
  location: ReturnType<typeof useLocation>;
  teacherData: TeacherData | null;
  onClose?: () => void;
}) {
  const initials = teacherData?.name
    ? teacherData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ÖA";

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <p className="text-slate-800" style={{ fontWeight: 700 }}>
              Öğretmen
            </p>
            <p className="text-blue-600" style={{ fontWeight: 700 }}>
              Asistan
            </p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0.5">
            Beta
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-slate-400 px-3 py-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
          Menü
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-white" : item.color
                }`}
              />
              <span className="text-sm flex-1" style={{ fontWeight: 500 }}>
                {item.label}
              </span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}

        <div className="pt-3">
          <p className="text-xs text-slate-400 px-3 py-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>
            Hesap
          </p>
          <Link
            to="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              location.pathname === "/settings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings
              className={`w-5 h-5 flex-shrink-0 ${
                location.pathname === "/settings" ? "text-white" : "text-slate-500"
              }`}
            />
            <span className="text-sm flex-1" style={{ fontWeight: 500 }}>
              Ayarlar
            </span>
            {location.pathname === "/settings" && <ChevronRight className="w-4 h-4 opacity-70" />}
          </Link>
        </div>
      </nav>

      {/* Premium Banner */}
      <div className="p-3">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800" style={{ fontWeight: 600 }}>
              Premium'a Geç
            </span>
          </div>
          <p className="text-xs text-amber-700 mb-2">Tüm evraklara sınırsız erişim</p>
          <Button
            size="sm"
            className="w-full h-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Hemen Yükselt
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => {
            navigate("/settings");
            onClose?.();
          }}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
        >
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 600 }}>
              {teacherData?.name || "Öğretmen"}
            </p>
            <p className="text-xs text-slate-500 truncate">{teacherData?.branch || ""}</p>
          </div>
          <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("teacherData");
    if (!data) {
      navigate("/");
      return;
    }
    setTeacherData(JSON.parse(data));
  }, [navigate]);

  const currentNavItem = [...navItems, { path: "/settings", label: "Ayarlar", icon: Settings, color: "" }].find(
    (item) => item.path === location.pathname
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed h-screen z-30 border-r border-slate-200 shadow-sm">
          <SidebarNav location={location} teacherData={teacherData} />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 border-0">
            <SidebarNav location={location} teacherData={teacherData} onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-800" style={{ fontWeight: 700 }}>
                ÖğretmenAsistan
              </span>
            </div>
            {currentNavItem && (
              <span className="ml-auto text-sm text-slate-500" style={{ fontWeight: 500 }}>
                {currentNavItem.label}
              </span>
            )}
          </div>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
