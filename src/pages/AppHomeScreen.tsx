
import { useNavigate } from 'react-router-dom';

export function AppHomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto p-4 w-full">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">
          Merhaba 👋
        </h1>
        <p className="text-base mt-2 text-gray-500">
          Bugün hangi dersiniz var?
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4">
        {/* Card 1 */}
        <button
          onClick={() => navigate('/olustur')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-center text-left hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📅</span>
            <div>
              <h2 className="font-semibold text-lg text-[#1e3a5f]">
                Otomatik Plan Oluştur
              </h2>
              <p className="text-sm mt-1 text-gray-500">
                MEB takvimine göre otomatik oluştur
              </p>
            </div>
          </div>
          <span className="text-2xl text-[#1e3a5f]">→</span>
        </button>

        {/* Card 2 */}
        <button
          onClick={() => navigate('/yukle')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-center text-left hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📤</span>
            <div>
              <h2 className="font-semibold text-lg text-[#1e3a5f]">
                Dosyadan Yükle
              </h2>
              <p className="text-sm mt-1 text-gray-500">
                Excel veya Word dosyan var mı?
              </p>
            </div>
          </div>
          <span className="text-2xl text-[#1e3a5f]">→</span>
        </button>
      </div>

      {/* Info Note */}
      <div className="mt-8 text-center text-sm flex items-center justify-center gap-2">
        <span className="text-lg">💡</span>
        <span className="text-[#f97316] font-medium">
          Plan oluşturduktan sonra Planım sekmesinden takip edebilirsiniz.
        </span>
      </div>
    </div>
  );
}

