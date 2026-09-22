import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))
  return (
    <div className="mb-5 flex items-center gap-2">
      <button
        type="button"
        onClick={handleBack}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 truncate text-lg font-bold text-slate-900">{title}</h1>
      {right}
    </div>
  )
}