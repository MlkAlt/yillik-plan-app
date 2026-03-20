import { useNavigate } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'

const features = [
  {
    emoji: '📅',
    title: 'MEB Takvimine Göre Otomatik Plan',
    desc: 'Sınıf ve dersinizi seçin, yıllık planınız saniyeler içinde hazır olsun.',
  },
  {
    emoji: '✅',
    title: 'Günlük Kazanım Takibi',
    desc: 'Her günün kazanımlarını görüntüleyin, tamamlananları işaretleyin.',
  },
  {
    emoji: '📱',
    title: 'Mobil Öncelikli Tasarım',
    desc: 'Telefonunuzdan kolayca erişin, sınıf defteri yazarken anında başvurun.',
  },
  {
    emoji: '📤',
    title: 'Excel / PDF Yükleme',
    desc: 'Mevcut planınızı sisteme aktarın, dijital ortamda kullanmaya devam edin.',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-white border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm sm:text-base">📋 Yıllık Plan</span>
          <a href="#form" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Erken Erişim
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            Öğretmenler için ücretsiz
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Yıllık Plan Hazırlamak
            <br />
            <span className="text-blue-600">Artık Çok Kolay</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
            MEB takvimine göre otomatik plan oluşturun, kazanımlarınızı takip edin.
            Sınıf defteri yazarken telefonunuzdan anında başvurun.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/olustur')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-md shadow-blue-200"
            >
              Hemen Plan Oluştur — Ücretsiz
            </button>
            <button
              onClick={() => navigate('/yukle')}
              className="border border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-medium px-6 py-3 rounded-xl text-sm transition"
            >
              Dosyadan Yükle
            </button>
            <a href="#form" className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-xl text-sm transition">
              Erken Erişime Kaydol
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-blue-600 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          {[
            { value: '%100', label: 'Ücretsiz' },
            { value: '5 sn', label: 'Plan Oluşturma' },
            { value: '12 ay', label: 'Yıllık Görünüm' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold">{value}</div>
              <div className="text-blue-200 text-xs sm:text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Neden Yıllık Plan Uygulaması?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Öğretmenlerin günlük iş yükünü azaltmak için tasarlandı
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-blue-100 transition"
              >
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base mb-1">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
            Nasıl Çalışır?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Kaydol', desc: 'Ücretsiz hesabını oluştur, bilgilerini gir.' },
              { step: '2', title: 'Planı Oluştur', desc: 'Sınıf ve dersini seç, MEB takvimine göre plan hazırla.' },
              { step: '3', title: 'Takip Et', desc: 'Her gün kazanımlarını gör, sınıf defterine yaz.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-md shadow-blue-200">
                  {step}
                </div>
                <div className="font-semibold text-gray-900 mb-1">{title}</div>
                <div className="text-gray-400 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="form" className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erken Erişime Kaydol
          </h2>
          <p className="text-gray-400 text-sm">
            Uygulama yayına girdiğinde sizi ilk haberdar edeceğiz.
          </p>
        </div>
        <LeadForm embedded />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-gray-400 text-xs">
        <p>© {new Date().getFullYear()} Yıllık Plan Uygulaması. Tüm hakları saklıdır.</p>
        <p className="mt-1">Türk öğretmenler için, ücretsiz.</p>
      </footer>
    </div>
  )
}