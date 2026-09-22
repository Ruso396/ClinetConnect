import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white shadow-lg">
        R
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
      <p className="text-sm font-medium text-slate-500">Loading...</p>
    </div>
  )
}