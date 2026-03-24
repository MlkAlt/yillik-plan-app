import { useNavigate } from 'react-router-dom'
import { PlanSelector } from '../components/PlanSelector'
import type { PlanEntry } from '../types/planEntry'
import { getYilSecenekleri } from '../lib/dersSinifMap'

interface PlanOlusturPageProps {
  onPlanEkle: (entries: PlanEntry[]) => void
}

export function PlanOlusturPage({ onPlanEkle }: PlanOlusturPageProps) {
  const navigate = useNavigate()
  const yil = getYilSecenekleri()[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-6 pb-16">
        <div className="bg-[#FAFAF9] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] p-6">
          <h1 className="text-2xl font-bold text-[#1C1917] mb-1">Yıllık Plan Oluştur</h1>
          <p className="text-gray-400 text-sm mb-6">
            MEB takvimine göre otomatik oluşturulur.
          </p>
          <PlanSelector
            yil={yil}
            onComplete={entries => {
              onPlanEkle(entries)
              navigate('/plan')
            }}
            onCancel={() => navigate('/app')}
          />
        </div>
      </div>
    </div>
  )
}
