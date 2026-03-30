import { useNavigate } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'
import { Button } from '../components/Button'
import { CalendarDays, TrendingUp, Smartphone, Upload } from 'lucide-react'

const features = [
  {
    icon: CalendarDays,
    title: 'MEB Takvimine Göre Otomatik Plan',
    desc: 'Sınıf ve dersinizi seçin, yıllık planınız saniyeler içinde hazır olsun.',
  },
  {
    icon: TrendingUp,
    title: 'Haftalık İlerleme Takibi',
    desc: 'Her haftanın kazanımlarını görüntüleyin, ilerlemenizi takip edin.',
  },
  {
    icon: Smartphone,
    title: 'Mobil Öncelikli',
    desc: 'Telefonunuzdan kolayca erişin, sınıf defteri yazarken anında başvurun.',
  },
  {
    icon: Upload,
    title: 'Excel & Word Yükleme',
    desc: 'Mevcut planınızı sisteme aktarın, dijital ortamda takip edin.',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-[#1C1917] text-lg tracking-tight">
            Yıllık Plan
          </span>
          <a
            href="#form"
            className="text-sm font-semibold text-[#2D5BE3] bg-[#2D5BE3]/8 hover:bg-[#2D5BE3]/15 px-4 py-2 rounded-lg transition"
          >
            Erken Erişim
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <span className="inline-block bg-[#2D5BE3]/10 text-[#2D5BE3] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
            Öğretmenler için ücretsiz
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1C1917] leading-tight mb-5">
            Yıllık Planınızı<br className="hidden sm:block" /> Dakikalar İçinde Oluşturun
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            MEB takvimine göre otomatik plan oluşturun. Sınıf defteri yazarken telefonunuzdan anında başvurun.
          </p>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 justify-center">
            <Button
              onClick={() => navigate('/app')}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 shadow-lg shadow-[#F59E0B]/25"
            >
              Hemen Başla
            </Button>
            <Button
              onClick={() => navigate('/app/yukle')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              Dosyadan Yükle
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] mb-3">
              Neden Yıllık Plan?
            </h2>
            <p className="text-slate-500 text-base max-w-2xl mx-auto">
              Öğretmenlerin günlük iş yükünü azaltmak ve plan takibini kolaylaştırmak için tasarlandı.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-[#2D5BE3]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#2D5BE3]" />
                </div>
                <h3 className="text-[#1C1917] font-semibold text-sm mb-2 leading-snug">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="form" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto bg-[#2D5BE3] rounded-3xl p-6 sm:p-12 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Erken Erişime Kaydol
            </h2>
            <p className="text-blue-100 text-sm">
              Uygulama tam sürümle yayına girdiğinde sizi ilk haberdar edeceğiz.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md mx-auto">
            <LeadForm embedded />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 px-4 text-center flex flex-col gap-1.5 bg-slate-50">
        <div className="font-semibold text-[#1C1917] text-sm">Yıllık Plan</div>
        <p className="text-slate-400 text-xs">© {new Date().getFullYear()} · Türk öğretmenler için, <span className="text-[#F59E0B] font-semibold">ücretsiz</span>.</p>
      </footer>
    </div>
  )
}
