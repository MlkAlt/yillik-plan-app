import { useNavigate } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'

const features = [
  {
    emoji: '📅',
    title: 'MEB Takvimine Göre Otomatik Plan',
    desc: 'Sınıf ve dersinizi seçin, yıllık planınız saniyeler içinde hazır olsun.',
  },
  {
    emoji: '🗓️',
    title: 'Günlük Kazanım Takibi',
    desc: 'Her günün kazanımlarını görüntüleyin, deftere yazmayı unutmayın.',
  },
  {
    emoji: '📱',
    title: 'Mobil Öncelikli',
    desc: 'Telefonunuzdan kolayca erişin, sınıf defteri yazarken anında başvurun.',
  },
  {
    emoji: '✅',
    title: 'Excel & Word Yükleme',
    desc: 'Mevcut planınızı sisteme aktarın, dijital ortamda takip edin.',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#1e3a5f]">
      
      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-black text-[#1e3a5f] text-lg sm:text-xl tracking-tight">
            📋 Yıllık Plan
          </span>
          <a
            href="#form"
            className="text-sm font-semibold text-[#1e3a5f] bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition"
          >
            Erken Erişim
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-white pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <span className="inline-block bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Öğretmenler için ücretsiz
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1e3a5f] leading-tight mb-6">
            Yıllık Planınızı<br className="hidden sm:block" /> Dakikalar İçinde Oluşturun
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            MEB takvimine göre otomatik plan oluşturun. Sınıf defteri yazarken telefonunuzdan anında başvurun.
          </p>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 justify-center">
            <button
              onClick={() => navigate('/olustur')}
              className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-lg px-8 py-4 rounded-xl transition shadow-lg shadow-[#f97316]/30"
            >
              Hemen Başla
            </button>
            <button
              onClick={() => navigate('/yukle')}
              className="w-full sm:w-auto border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-bold text-lg px-8 py-4 rounded-xl transition"
            >
              Dosyadan Yükle
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e3a5f] mb-4">
              Neden Yıllık Plan Uygulaması?
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
              Öğretmenlerin günlük iş yükünü azaltmak ve plan takibini kolaylaştırmak için tasarlandı.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#f97316]/30 transition"
              >
                <div className="text-4xl mb-6">{emoji}</div>
                <h3 className="text-[#1e3a5f] font-black text-lg mb-3">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="form" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto bg-[#1e3a5f] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 text-9xl opacity-10">✨</div>
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl font-black text-white mb-3">
              Erken Erişime Kaydol
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Uygulama tam sürümle yayına girdiğinde sizi ilk haberdar edeceğiz.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 relative z-10 w-full max-w-md mx-auto">
            <LeadForm embedded />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 px-4 text-center items-center flex flex-col gap-2 bg-slate-50">
        <div className="font-black text-[#1e3a5f]">📋 Yıllık Plan</div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tüm hakları saklıdır.</p>
        <p className="text-slate-400 text-xs text-center">Türk öğretmenler için, <span className="text-[#f97316] font-bold">ücretsiz</span>.</p>
      </footer>
    </div>
  )
}