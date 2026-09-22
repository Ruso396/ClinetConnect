import { SlidersHorizontal, X } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from '../../lib/constants'
import type { CustomerFilters } from '../../services/customerService'
import type { CustomerStatus, CustomerType } from '../../types'
import { cn } from '../../lib/cn'

export interface FilterDraft {
  status: CustomerStatus | ''
  type: CustomerType | ''
  followUp: '' | 'today' | 'overdue' | 'upcoming'
  dateAdded: '' | 'today' | 'week' | 'month'
}

const FOLLOW_UP_OPTIONS = [
  { value: '', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
] as const

const DATE_ADDED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
] as const

export function draftFromFilters(filters: CustomerFilters): FilterDraft {
  return {
    status: (filters.status as CustomerStatus) ?? '',
    type: (filters.type as CustomerType) ?? '',
    followUp: (filters.followUp ?? '') as FilterDraft['followUp'],
    dateAdded: (filters.dateAdded ?? '') as FilterDraft['dateAdded'],
  }
}

function OptionList<T extends string>({
  options,
  value,
  onChange,
  allLabel,
}: {
  options: readonly { value: T; label: string }[]
  value: T | ''
  onChange: (v: T | '') => void
  allLabel: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('')}
        className={cn(
          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          value === ''
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        )}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === opt.value
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function FilterSheet({
  open,
  onClose,
  draft,
  onChange,
  onReset,
  onApply,
  onClear,
}: {
  open: boolean
  onClose: () => void
  draft: FilterDraft
  onChange: (draft: FilterDraft) => void
  onReset: () => void
  onApply: () => void
  onClear: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filters">
      <div className="space-y-6">
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-700">Status</p>
          <OptionList
            options={CUSTOMER_STATUSES}
            value={draft.status}
            onChange={(v) => onChange({ ...draft, status: v })}
            allLabel="All Statuses"
          />
        </div>

        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-700">Customer Type</p>
          <OptionList
            options={CUSTOMER_TYPES}
            value={draft.type}
            onChange={(v) => onChange({ ...draft, type: v })}
            allLabel="All Types"
          />
        </div>

        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-700">Follow-up</p>
          <OptionList
            options={FOLLOW_UP_OPTIONS}
            value={draft.followUp}
            onChange={(v) => onChange({ ...draft, followUp: v })}
            allLabel="Any"
          />
        </div>

        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-700">Date Added</p>
          <OptionList
            options={DATE_ADDED_OPTIONS}
            value={draft.dateAdded}
            onChange={(v) => onChange({ ...draft, dateAdded: v })}
            allLabel="Any"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onReset}>
            Reset
          </Button>
          <Button fullWidth onClick={onApply}>
            Apply Filters
          </Button>
        </div>

        <button
          type="button"
          onClick={() => {
            onReset()
            onClear?.()
          }}
          className="mx-auto flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" /> Clear all
        </button>
      </div>
      <div className="sr-only">
        <SlidersHorizontal />
      </div>
    </BottomSheet>
  )
}