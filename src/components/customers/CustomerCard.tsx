import { Phone, ChevronRight, Building2, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { CUSTOMER_STATUS_LABELS } from '../../lib/constants'
import type { Customer } from '../../types'

export function CustomerCard({ customer }: { customer: Customer }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/customers/${customer.id}`)}
      className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card transition-colors hover:border-brand-200 hover:bg-brand-50/30 active:bg-brand-50"
    >
      <div className="flex items-start gap-3">
        <Avatar name={customer.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{customer.name}</p>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
          </div>
          {customer.company && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {customer.company}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {customer.phone}
          </p>
          {customer.address && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {customer.address}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Badge color={STATUS_BADGE_COLORS[customer.status] ?? 'slate'}>
          {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
        </Badge>
        {customer.follow_up_date && (
          <span className="text-[11px] font-medium text-amber-600">
            Follow up: {customer.follow_up_date.slice(5).split('-').reverse().join('/')}
          </span>
        )}
      </div>
    </button>
  )
}

const STATUS_BADGE_COLORS: Record<string, 'blue' | 'sky' | 'amber' | 'violet' | 'green' | 'red'> = {
  new_lead: 'blue',
  contacted: 'sky',
  follow_up: 'amber',
  interested: 'violet',
  converted: 'green',
  not_interested: 'red',
}