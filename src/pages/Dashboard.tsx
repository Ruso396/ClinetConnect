import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, UserPlus, CalendarClock, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getCustomerCounts, getRecentCustomers, getTodayFollowUps } from '../services/customerService'
import { greeting } from '../utils/date'
import { SkeletonGrid, SkeletonStats } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import type { Customer } from '../types'

interface Stats {
  total: number
  newLeads: number
  followUps: number
  converted: number
}

const STAT_CARDS: {
  key: keyof Stats
  label: string
  icon: React.ReactNode
  tint: string
  to: string
}[] = [
  { key: 'total', label: 'Total Customers', tint: 'text-brand-600 bg-brand-50', to: '/customers', icon: <Users className="h-5 w-5" /> },
  { key: 'newLeads', label: 'New Leads', tint: 'text-sky-600 bg-sky-50', to: '/customers?status=new_lead', icon: <UserPlus className="h-5 w-5" /> },
  { key: 'followUps', label: 'Follow-ups', tint: 'text-amber-600 bg-amber-50', to: '/follow-ups', icon: <CalendarClock className="h-5 w-5" /> },
  { key: 'converted', label: 'Converted', tint: 'text-emerald-600 bg-emerald-50', to: '/customers?status=converted', icon: <CheckCircle2 className="h-5 w-5" /> },
]

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Record<keyof Stats, number> | null>(null)
  const [todayFollowUps, setTodayFollowUps] = useState<Customer[]>([])
  const [recent, setRecent] = useState<Customer[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      getCustomerCounts(),
      getTodayFollowUps(),
      getRecentCustomers(5),
    ])
      .then(([c, follows, recents]) => {
        if (!active) return
        setStats(c)
        setTodayFollowUps(follows)
        setRecent(recents)
      })
      .catch(() => {
        if (active) setError('Could not load your dashboard data.')
      })
    return () => {
      active = false
    }
  }, [])

  const firstName = (profile?.full_name ?? 'there').split(' ')[0]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s your customer overview.</p>
      </header>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <section aria-label="Statistics">
        {!stats && <SkeletonStats />}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {STAT_CARDS.map((card) => (
              <Link
                key={card.key}
                to={card.to}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition-colors hover:border-brand-200"
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.tint}`}>
                  {card.icon}
                </span>
                <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{stats[card.key]}</p>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Today's follow-ups">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Today&apos;s Follow-ups</h2>
          <Link to="/follow-ups" className="flex items-center gap-0.5 text-xs font-semibold text-brand-600">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {!stats && <SkeletonGrid />}
        {stats && todayFollowUps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-500">No follow-ups scheduled for today.</p>
          </div>
        )}
        {todayFollowUps.length > 0 && (
          <div className="space-y-2.5">
            {todayFollowUps.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-card"
              >
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">{c.phone}</p>
                </div>
                <Badge>Follow Up</Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Recent customers">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Customers</h2>
          <Link to="/customers" className="flex items-center gap-0.5 text-xs font-semibold text-brand-600">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {!stats && <SkeletonGrid />}
        {stats && recent.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-500">No customers yet.</p>
            <p className="text-xs text-slate-400">Add your first customer to start managing your leads.</p>
          </div>
        )}
        {recent.length > 0 && (
          <div className="space-y-2.5">
            {recent.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-card"
              >
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[c.company, c.address].filter(Boolean).join(' · ') || c.phone}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}