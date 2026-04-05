import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { LayoutDashboard, GraduationCap } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div>
          <p className="text-slate-200" style={{ fontSize: "5rem", fontWeight: 800, lineHeight: 1 }}>
            404
          </p>
          <h2 className="text-slate-800 mt-2" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Sayfa Bulunamadı
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <Link to="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Panele Dön
          </Button>
        </Link>
      </div>
    </div>
  );
}
