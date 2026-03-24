import { useState } from 'react'
import { BRANCHES, type Branch } from '../../lib/branchConfig'

interface BranchStepProps {
  onSelect: (branch: Branch) => void
}

export function BranchStep({ onSelect }: BranchStepProps) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? BRANCHES.filter(b => b.label.toLowerCase().includes(query.toLowerCase()))
    : BRANCHES

  const popular = filtered.filter(b => b.popular)
  const rest = filtered.filter(b => !b.popular)

  return (
    <div>
      {/* Arama */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          placeholder="Branş ara... (Matematik, Fizik, Müzik...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5BE3]/30 focus:border-[#2D5BE3] text-sm text-[#1C1917] placeholder-gray-400 transition-all"
        />
      </div>

      {/* Popüler */}
      {!query && popular.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Popüler</p>
          <div className="grid grid-cols-2 gap-2">
            {popular.map(b => <BranchCard key={b.id} branch={b} onSelect={onSelect} />)}
          </div>
        </div>
      )}

      {/* Tümü / Arama sonuçları */}
      {(query ? filtered : rest).length > 0 && (
        <div>
          {!query && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Diğer Branşlar</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(query ? filtered : rest).map(b => <BranchCard key={b.id} branch={b} onSelect={onSelect} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">"{query}" için sonuç bulunamadı</p>
      )}
    </div>
  )
}

function BranchCard({ branch, onSelect }: { branch: Branch; onSelect: (b: Branch) => void }) {
  return (
    <button
      onClick={() => onSelect(branch)}
      className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E7E5E4] text-left active:scale-[0.96] transition-all hover:border-[#2D5BE3]/40 hover:shadow-sm group"
    >
      <span className="text-xl flex-shrink-0">{branch.icon}</span>
      <span className="text-sm font-semibold text-[#1C1917] leading-tight group-hover:text-[#2D5BE3] transition-colors">
        {branch.label}
      </span>
    </button>
  )
}
