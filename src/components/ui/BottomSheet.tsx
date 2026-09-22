import { useEffect } from 'react'
import { cn } from '../../lib/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-slate-900/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg animate-slide-up">
        <div className="safe-area-bottom rounded-t-2xl bg-white shadow-xl">
          <div className="flex items-center justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />
          </div>
          {title && (
            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            </div>
          )}
          <div
            className={cn(
              'max-h-[78dvh] overflow-y-auto px-5 pb-6 pt-2',
              'rnw-scrollbar-thin',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}