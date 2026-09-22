import { StickyNote, Phone, Users, MessageCircle, CalendarClock, Edit3, UserPlus, ArrowLeftRight, Clock } from 'lucide-react'
import { formatDateTime } from '../../utils/date'
import type { ActivityType, CustomerActivity } from '../../types'
import { cn } from '../../lib/cn'

const ACTIVITY_META: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  created: { icon: <UserPlus className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-600' },
  note: { icon: <StickyNote className="h-4 w-4" />, color: 'bg-sky-100 text-sky-600' },
  call: { icon: <Phone className="h-4 w-4" />, color: 'bg-violet-100 text-violet-600' },
  meeting: { icon: <Users className="h-4 w-4" />, color: 'bg-brand-100 text-brand-600' },
  whatsapp: { icon: <MessageCircle className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-600' },
  follow_up: { icon: <CalendarClock className="h-4 w-4" />, color: 'bg-amber-100 text-amber-600' },
  status_change: { icon: <ArrowLeftRight className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-600' },
  edited: { icon: <Edit3 className="h-4 w-4" />, color: 'bg-slate-100 text-slate-600' },
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  created: 'Created',
  note: 'Note',
  call: 'Call',
  meeting: 'Meeting',
  whatsapp: 'WhatsApp',
  follow_up: 'Follow-up',
  status_change: 'Status Change',
  edited: 'Edited',
}

export function ActivityTimeline({ activities }: { activities: CustomerActivity[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <Clock className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm font-medium text-slate-500">No activity yet.</p>
        <p className="text-xs text-slate-400">Add a note, call or meeting to build the history.</p>
      </div>
    )
  }

  return (
    <ol className="relative ml-2 space-y-5 border-l-2 border-slate-100 pl-5">
      {activities.map((activity) => {
        const meta = ACTIVITY_META[activity.activity_type] ?? ACTIVITY_META.note
        return (
          <li key={activity.id} className="relative">
            <span
              className={cn(
                'absolute -left-[30px] top-0 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white',
                meta.color,
              )}
            >
              {meta.icon}
            </span>
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {ACTIVITY_LABELS[activity.activity_type] ?? activity.activity_type}
                </p>
                <time className="shrink-0 text-xs text-slate-400">
                  {formatDateTime(activity.created_at)}
                </time>
              </div>
              {activity.description && (
                <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {activity.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}