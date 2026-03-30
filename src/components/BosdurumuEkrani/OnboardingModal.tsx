import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BRANCHES, type Branch } from '../../lib/branchConfig'
import { buildPlan } from '../../lib/planBuilder'
import { getYilSecenekleri } from '../../lib/dersSinifMap'
import type { PlanEntry } from '../../types/planEntry'
import { Button } from '../Button'
import { Search, ChevronDown } from 'lucide-react'

interface OnboardingModalProps {
  onTamamla: (entries: PlanEntry[]) => void
}

export function OnboardingModal({ onTamamla }: OnboardingModalProps) {
  const [query, setQuery] = useState('')
  const [acikBrans, setAcikBrans] = useState<string | null>(null)
  const [seciliSiniflar, setSeciliSiniflar] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const yil = getYilSecenekleri()[0]

  const filtered = query
    ? BRANCHES.filter(b => b.label.toLowerCase().includes(query.toLowerCase()))
    : BRANCHES

  const popular = filtered.filter(b => b.popular)
  const rest = filtered.filter(b => !b.popular)

  function handleBransToggle(branch: Branch) {
    if (acikBrans === branch.id) {
      setAcikBrans(null)
      setSeciliSiniflar([])
    } else {
      setAcikBrans(branch.id)
      setSeciliSiniflar([branch.classes[0]])
    }
  }

  function handleSinifToggle(sinif: string) {
    setSeciliSiniflar(prev =>
      prev.includes(sinif)
        ? prev.length > 1 ? prev.filter(s => s !== sinif) : prev
        : [...prev, sinif]
    )
  }

  function handleOlustur() {
    const branch = BRANCHES.find(b => b.id === acikBrans)
    if (!branch || seciliSiniflar.length === 0) return
    setLoading(true)
    try {
      const entries: PlanEntry[] = seciliSiniflar.map(sinif => {
        const { plan } = buildPlan(branch.lessonId, sinif, yil)
        return { sinif, ders: branch.lessonId, yil, tip: 'meb' as const, plan, rows: null }
      })
      setTimeout(() => onTamamla(entries), 400)
    } catch {
      setLoading(false)
    }
  }

  const seciliBrans = BRANCHES.find(b => b.id === acikBrans)

  const modal = (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-[0_-4px_32px_rgba(0,0,0,0.15)] animate-fade-in flex flex-col max-h-[92vh]">
        {/* Tutamaç */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Başlık */}
        <div className="px-5 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1C1917]">Branşını seç</h2>
          <p className="text-sm text-gray-400 mt-0.5">Sınıflarını belirle, planın hazır olsun.</p>
        </div>

        {/* Arama */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Branş ara..."
              value={query}
              onChange={e => { setQuery(e.target.value); setAcikBrans(null); setSeciliSiniflar([]) }}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/30 focus:border-[#2D5BE3] text-sm text-[#1C1917] placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Branş listesi */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {!query && popular.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Popüler</p>
              <BransList
                branches={popular}
                acikBrans={acikBrans}
                seciliSiniflar={seciliSiniflar}
                onBransToggle={handleBransToggle}
                onSinifToggle={handleSinifToggle}
              />
            </div>
          )}

          {rest.length > 0 && (
            <div>
              {!query && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Diğer Branşlar</p>}
              <BransList
                branches={query ? filtered : rest}
                acikBrans={acikBrans}
                seciliSiniflar={seciliSiniflar}
                onBransToggle={handleBransToggle}
                onSinifToggle={handleSinifToggle}
              />
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-10">"{query}" için sonuç bulunamadı</p>
          )}
        </div>

        {/* CTA — branş seçilince görünür */}
        {acikBrans && seciliBrans && (
          <div className="px-5 pb-8 pt-3 border-t border-[#E7E5E4] flex-shrink-0 bg-white">
            <Button
              onClick={handleOlustur}
              disabled={loading || seciliSiniflar.length === 0}
              loading={loading}
              variant="primary"
              className="w-full text-base shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
            >
              {seciliSiniflar.length === 1
                ? `${seciliBrans.label} · ${seciliSiniflar[0]} için Plan Oluştur →`
                : `${seciliBrans.label} · ${seciliSiniflar.length} sınıf için Plan Oluştur →`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function BransList({
  branches, acikBrans, seciliSiniflar, onBransToggle, onSinifToggle,
}: {
  branches: Branch[]
  acikBrans: string | null
  seciliSiniflar: string[]
  onBransToggle: (b: Branch) => void
  onSinifToggle: (s: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      {branches.map(branch => (
        <BransItem
          key={branch.id}
          branch={branch}
          isOpen={acikBrans === branch.id}
          seciliSiniflar={seciliSiniflar}
          onToggle={() => onBransToggle(branch)}
          onSinifToggle={onSinifToggle}
        />
      ))}
    </div>
  )
}

function BransItem({
  branch, isOpen, seciliSiniflar, onToggle, onSinifToggle,
}: {
  branch: Branch
  isOpen: boolean
  seciliSiniflar: string[]
  onToggle: () => void
  onSinifToggle: (s: string) => void
}) {
  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${isOpen ? 'border-[#2D5BE3] bg-[#2D5BE3]/3' : 'border-[#E7E5E4] bg-white'}`}>
      {/* Branş satırı */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 transition-colors"
      >
        <span className="text-xl flex-shrink-0">{branch.icon}</span>
        <span className={`text-sm font-semibold flex-1 ${isOpen ? 'text-[#2D5BE3]' : 'text-[#1C1917]'}`}>
          {branch.label}
        </span>
        <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} />
          </span>
      </button>

      {/* Sınıf seçimi — accordion */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-[#E7E5E4]/60">
          <p className="text-xs text-gray-400 mb-2.5">Hangi sınıflar için?</p>
          <div className="flex flex-wrap gap-2">
            {branch.classes.map(sinif => (
              <button
                key={sinif}
                onClick={() => onSinifToggle(sinif)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all active:scale-95 ${
                  seciliSiniflar.includes(sinif)
                    ? 'bg-[#2D5BE3] text-white border-[#2D5BE3]'
                    : 'bg-white text-gray-500 border-[#E7E5E4] hover:border-gray-300'
                }`}
              >
                {sinif}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
