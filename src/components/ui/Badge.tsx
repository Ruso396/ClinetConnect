import { cn } from '../../lib/cn'

export function Badge({
  children,
  color = 'slate',
  className,
}: {
  children: React.ReactNode
  color?: 'slate' | 'blue' | 'amber' | 'green' | 'red' | 'violet' | 'sky'
  className?: string
}) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    violet: 'bg-violet-50 text-violet-700',
    sky: 'bg-sky-50 text-sky-700',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_COLORS: Record<string, string> = {
  new_lead: 'blue',
  contacted: 'sky',
  follow_up: 'amber',
  interested: 'violet',
  converted: 'green',
  not_interested: 'red',
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const color = STATUS_COLORS[status] ?? 'slate'
  return <Badge color={color as 'slate'}>{label ?? status.replace('_', ' ')}</Badge>
}