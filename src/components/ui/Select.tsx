import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

export function Select({ label, error, required, id, className, children, ...props }: SelectProps) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 transition-colors',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
            'pl-3 pr-9',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}