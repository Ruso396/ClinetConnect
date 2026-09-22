import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone, MessageCircle, Pencil, Trash2, Plus, Home,
  Map as MapIcon, ScrollText, CalendarClock, StickyNote,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SkeletonDetails } from '../components/ui/Skeleton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ActivityTimeline } from '../components/customers/ActivityTimeline'
import { AddActivitySheet } from '../components/customers/AddActivitySheet'
import { useToast } from '../components/ui/Toast'
import { deleteCustomer, getCustomerById } from '../services/customerService'
import { addActivity, listActivities } from '../services/activityService'
import { CUSTOMER_STATUS_LABELS, CUSTOMER_TYPE_LABELS } from '../lib/constants'
import { waLink, telLink, mapsLink } from '../utils/phone'
import { formatDate, formatTime } from '../utils/date'
import type { ActivityType, Customer, CustomerActivity } from '../types'

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-50 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value || '—'}</span>
    </div>
  )
}

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [activities, setActivities] = useState<CustomerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [savingActivity, setSavingActivity] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadActivities = useCallback(async (customerId: string) => {
    setActivitiesLoading(true)
    try {
      const data = await listActivities(customerId)
      setActivities(data)
    } catch {
      // keep empty timeline on failure
    } finally {
      setActivitiesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    let active = true
    getCustomerById(id)
      .then((data) => {
        if (!active) return
        setCustomer(data)
        void loadActivities(data.id)
      })
      .catch((e: unknown) => {
        if (active) setLoadError(e instanceof Error ? e.message : 'Could not load customer.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, loadActivities])

  const handleAddActivity = async (type: ActivityType, description: string) => {
    if (!customer) return
    setSavingActivity(true)
    try {
      await addActivity(customer.id, type, description)
      const data = await listActivities(customer.id)
      setActivities(data)
      success('Activity added.')
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not save the activity.')
    } finally {
      setSavingActivity(false)
    }
  }

  const handleDelete = async () => {
    if (!customer) return
    setDeleting(true)
    try {
      await deleteCustomer(customer.id)
      success('Customer deleted.')
      navigate('/customers', { replace: true })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not delete this customer.')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="pb-4">
        <PageHeader title="Customer Details" onBack={() => navigate('/customers')} />
        <SkeletonDetails />
      </div>
    )
  }

  if (loadError || !customer) {
    return (
      <div className="pb-4">
        <PageHeader title="Customer Details" onBack={() => navigate('/customers')} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {loadError || 'Customer not found.'}
        </div>
        <div className="mt-4">
          <Button fullWidth onClick={() => navigate('/customers')}>Back to Customers</Button>
        </div>
      </div>
    )
  }

  const fullAddress = customer.address?.trim() ?? ''

  const actions = [
    {
      label: 'Call',
      icon: <Phone className="h-5 w-5" />,
      href: telLink(customer.phone),
      external: false,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      href: waLink(customer.phone),
      external: true,
      tint: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Map',
      icon: <MapIcon className="h-5 w-5" />,
      href: fullAddress ? mapsLink(fullAddress) : 'https://maps.google.com',
      external: true,
      tint: 'bg-amber-50 text-amber-600',
    },
  ]

  return (
    <div className="space-y-6 pb-4">
      <PageHeader
        title="Customer Details"
        onBack={() => navigate('/customers')}
        right={
          <Button size="sm" variant="outline" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        }
      />

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar name={customer.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-slate-900">{customer.name}</h2>
            {customer.company && <p className="truncate text-sm text-slate-500">{customer.company}</p>}
            <div className="mt-1.5">
              <Badge color={STATUS_COLORS[customer.status] ?? 'slate'}>
                {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold ${action.tint}`}
            >
              <span className="rounded-full bg-white/70 p-2">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-card">
        <h3 className="pt-2 text-sm font-semibold text-slate-900">Customer Information</h3>
        <div className="mt-1">
          <InfoRow label="Phone" value={<a className="text-brand-600" href={telLink(customer.phone)}>{customer.phone}</a>} />
          {customer.alternate_phone && <InfoRow label="Alt Phone" value={customer.alternate_phone} />}
          {customer.email && (
            <InfoRow label="Email" value={<a className="text-brand-600" href={`mailto:${customer.email}`}>{customer.email}</a>} />
          )}
          {customer.company && <InfoRow label="Company" value={customer.company} />}
          {customer.address && <InfoRow label="Address" value={customer.address} />}
          {customer.customer_type && (
            <InfoRow label="Type" value={CUSTOMER_TYPE_LABELS[customer.customer_type] ?? customer.customer_type} />
          )}
          <InfoRow label="Status" value={CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status} />
        </div>
      </section>

      {customer.notes && (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <StickyNote className="h-4 w-4 text-brand-500" /> Notes
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{customer.notes}</p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarClock className="h-4 w-4 text-brand-500" /> Follow-up
        </h3>
        {customer.follow_up_date ? (
          <p className="mt-2 text-sm text-slate-600">
            {formatDate(customer.follow_up_date)}
            {customer.follow_up_time && <> at {formatTime(customer.follow_up_time)}</>}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No follow-up scheduled.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ScrollText className="h-4 w-4 text-brand-500" /> Activity History
          </h3>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Activity
          </Button>
        </div>
        {activitiesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <ActivityTimeline activities={activities} />
        )}
      </section>

      <div className="space-y-3">
        <Button variant="outline" fullWidth onClick={() => navigate(`/customers/${customer.id}/edit`)}>
          <Pencil className="h-4 w-4" /> Edit Customer
        </Button>
        <Button variant="danger" fullWidth className="bg-red-50 text-red-600 hover:bg-red-100" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete Customer
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Home className="h-3.5 w-3.5" /> Added {formatDate(customer.created_at)}
      </div>

      <AddActivitySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleAddActivity}
        loading={savingActivity}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Customer?"
        message={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
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