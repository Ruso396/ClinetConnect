import { cn } from '../../lib/cn'

interface FieldWrapperProps {
  label?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  id?: string
}

export function FieldWrapper({ label, required, error, children, id }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leading?: React.ReactNode
}

export function Input({ label, error, required, leading, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <FieldWrapper label={label} required={required} error={error} id={inputId}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'h-11 w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100',
            leading ? 'pl-9' : 'pl-3',
            'pr-3',
            className,
          )}
          {...props}
        />
      </div>
    </FieldWrapper>
  )
}