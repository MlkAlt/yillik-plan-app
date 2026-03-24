import { SO_DERSLER, SO_SINIFLAR } from '../../lib/branchConfig'

const TEMEL_DERSLER = ['Türkçe', 'Matematik', 'Hayat Bilgisi', 'Fen Bilimleri', 'Sosyal Bilgiler']

interface LessonClassStepProps {
  selectedClass: string
  selectedLessons: string[]
  onClassSelect: (cls: string) => void
  onLessonToggle: (lesson: string) => void
  onShortcut: (lessons: string[]) => void
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
  success?: boolean
}

export function LessonClassStep({
  selectedClass, selectedLessons,
  onClassSelect, onLessonToggle, onShortcut,
  onConfirm, onBack, loading, success,
}: LessonClassStepProps) {
  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
        >
          ← Geri
        </button>
        <div>
          <p className="font-bold text-[#1C1917] leading-tight">🏫 Sınıf Öğretmenliği</p>
          <p className="text-xs text-gray-400">Sınıfını ve derslerini seç</p>
        </div>
      </div>

      {/* Sınıf seçimi (tek seçim) */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Sınıfın</p>
        <div className="flex gap-2 flex-wrap">
          {SO_SINIFLAR.map(cls => (
            <button
              key={cls}
              onClick={() => onClassSelect(cls)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                selectedClass === cls
                  ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                  : 'bg-white text-gray-500 border-[#E7E5E4] hover:border-gray-300'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Ders kısayolları */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => onShortcut(SO_DERSLER)}
          className="px-3 py-1.5 text-xs font-bold rounded-full border border-[#2D5BE3]/30 text-[#2D5BE3] bg-[#2D5BE3]/5 active:scale-95 transition-all hover:bg-[#2D5BE3]/10"
        >
          Hepsini Seç
        </button>
        <button
          onClick={() => onShortcut(TEMEL_DERSLER)}
          className="px-3 py-1.5 text-xs font-bold rounded-full border border-[#F59E0B]/40 text-[#92400e] bg-[#F59E0B]/10 active:scale-95 transition-all hover:bg-[#F59E0B]/20"
        >
          Temel Dersler
        </button>
        <button
          onClick={() => onShortcut([])}
          className="px-3 py-1.5 text-xs font-bold rounded-full border border-[#E7E5E4] text-gray-400 bg-white active:scale-95 transition-all hover:border-gray-300"
        >
          Temizle
        </button>
      </div>

      {/* Ders pilleri */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
          Dersler <span className="text-gray-300 font-normal normal-case tracking-normal">(birden fazla seç)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SO_DERSLER.map(lesson => (
            <button
              key={lesson}
              onClick={() => onLessonToggle(lesson)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                selectedLessons.includes(lesson)
                  ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                  : 'bg-white text-gray-500 border-[#E7E5E4] hover:border-gray-300'
              }`}
            >
              {lesson}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onConfirm}
        disabled={selectedLessons.length === 0 || loading || success}
        className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${
          success ? 'bg-[#059669] text-white' : 'bg-[#F59E0B] text-white hover:opacity-90'
        }`}
      >
        {loading
          ? <span className="animate-pulse">Oluşturuluyor...</span>
          : success
          ? '✓ Hazır! Planlar oluşturuldu'
          : `${selectedLessons.length} Ders için Plan Oluştur →`}
      </button>
    </div>
  )
}
