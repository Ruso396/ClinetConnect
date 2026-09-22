import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Phone, MessageCircle, Eye, Check } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import { getFollowUpSections, updateCustomer } from '../services/customerService'
import { addActivity } from '../services/activityService'
import { formatDate, formatTime } from '../utils/date'
import { waLink, telLink } from '../utils/phone'
import type { Customer } from '../types'

interface Sections {
  today: Customer[]
  tomorrow: Customer[]
  upcoming: Customer[]
  overdue: Customer[]
}

const SECTION_META: { key: keyof Sections; label: string; accent: string }[] = [
  { key: 'today', label: 'Today', accent: 'text-emerald-600' },
  { key: 'tomorrow', label: 'Tomorrow', accent: 'text-sky-600' },
  { key: 'upcoming', label: 'Upcoming', accent: 'text-brand-600' },
  { key: 'overdue', label: 'Overdue', accent: 'text-red-600' },
]

function FollowUpCard({
  customer,
  onCompleted,
  completing,
}: {
  customer: Customer
  onCompleted: (c: Customer) => Promise<void>
  completing: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar name={customer.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{customer.name}</p>
          <p className="truncate text-xs text-slate-500">
            {customer.phone}
            {customer.company && <> · {customer.company}</>}
          </p>
        </div>
        <Badge color={STATUS_COLORS[customer.status] ?? 'slate'}>{STATUS_LABELS[customer.status]}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
        {customer.follow_up_date && (
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(customer.follow_up_date)}
          </span>
        )}
        {customer.follow_up_time && <span>{formatTime(customer.follow_up_time)}</span>}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <a
          href={telLink(customer.phone)}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-600"
        >
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
        <a
          href={waLink(customer.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-50 text-xs font-semibold text-brand-600"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
        <button
          type="button"
          onClick={() => navigate(`/customers/${customer.id}`)}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-50 text-xs font-semibold text-slate-600"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>
        <button
          type="button"
          onClick={() => onCompleted(customer)}
          disabled={completing}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> Done
        </button>
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, 'blue' | 'sky' | 'amber' | 'violet' | 'green' | 'red'> = {
  new_lead: 'blue',
  contacted: 'sky',
  follow_up: 'amber',
  interested: 'violet',
  converted: 'green',
  not_interested: 'red',
}

const STATUS_LABELS: Record<string, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  follow_up: 'Follow Up',
  interested: 'Interested',
  converted: 'Converted',
  not_interested: 'Not Interested',
}

export function FollowUps() {
  const { success, error: showError } = useToast()
  const [sections, setSections] = useState<Sections | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getFollowUpSections()
      setSections(data)
    } catch {
      showError('Could not load follow-ups.')
    }
  }, [showError])

  useEffect(() => {
    void load()
  }, [load])

  const handleCompleted = async (customer: Customer) => {
    setCompletingId(customer.id)
    try {
      await updateCustomer(customer.id, {
        follow_up_date: null,
        follow_up_time: null,
        status: customer.status === 'converted' ? 'converted' : 'contacted',
      })
      await addActivity(customer.id, 'follow_up', 'Follow-up completed.')
      success('Follow-up marked as completed.')
      await load()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not update the follow-up.')
    } finally {
      setCompletingId(null)
    }
  }

  const total = sections
    ? sections.today.length + sections.tomorrow.length + sections.upcoming.length + sections.overdue.length
    : 0

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500">Stay on top of your customer follow-up schedule.</p>
      </header>

      {!sections && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-slate-200" />
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {sections && total === 0 && (
        <EmptyState
          icon={<CalendarClock className="h-6 w-6" />}
          title="No follow-ups scheduled"
          description="Set a follow-up date on a customer to see it here."
        />
      )}

      {sections &&
        SECTION_META.map((meta) => {
          const items = sections[meta.key]
          if (items.length === 0) return null
          return (
            <section key={meta.key}>
              <h2 className={`mb-3 flex items-center gap-2 text-base font-semibold ${meta.accent}`}>
                {meta.label}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                  {items.length}
                </span>
              </h2>
              <div className="space-y-3">
                {items.map((c) => (
                  <FollowUpCard
                    key={c.id}
                    customer={c}
                    completing={completingId === c.id}
                    onCompleted={handleCompleted}
                  />
                ))}
              </div>
            </section>
          )
        })}
    </div>
  )
}