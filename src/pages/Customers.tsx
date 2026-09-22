import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, SlidersHorizontal, Users } from 'lucide-react'
import { useCustomers } from '../hooks/useCustomers'
import { SearchBar } from '../components/ui/SearchBar'
import { Button } from '../components/ui/Button'
import { CustomerCard } from '../components/customers/CustomerCard'
import { FilterSheet, draftFromFilters } from '../components/customers/FilterSheet'
import type { FilterDraft } from '../components/customers/FilterSheet'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Select'
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from '../lib/constants'
import type { CustomerStatus, CustomerType } from '../types'

export function Customers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    customers,
    count,
    loading,
    loadingMore,
    error,
    filters,
    setFilter,
    refresh,
    loadMore,
  } = useCustomers()

  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useState<FilterDraft>(draftFromFilters(filters))
  const initialized = useRef(false)

  useEffect(() => {
    const status = searchParams.get('status')
    if (!initialized.current) {
      initialized.current = true
      if (status) setFilter('status', status as CustomerStatus)
    }
  }, [searchParams, setFilter])

  useEffect(() => {
    setFilter('search', search)
  }, [search, setFilter])

  const hasActiveFilters =
    Boolean(filters.search) || Boolean(filters.status) || Boolean(filters.type) ||
    Boolean(filters.followUp) || Boolean(filters.dateAdded)

  const activeFilterCount = [filters.status, filters.type, filters.followUp, filters.dateAdded].filter(Boolean).length

  const openSheet = () => {
    setDraft(draftFromFilters(filters))
    setSheetOpen(true)
  }

  const applyFilters = () => {
    setFilter('status', draft.status || null)
    setFilter('type', draft.type || null)
    setFilter('followUp', draft.followUp || null)
    setFilter('dateAdded', draft.dateAdded || null)
    setSheetOpen(false)
  }

  const resetFilters = () => {
    const empty: FilterDraft = { status: '', type: '', followUp: '', dateAdded: '' }
    setDraft(empty)
    setFilter('status', null)
    setFilter('type', null)
    setFilter('followUp', null)
    setFilter('dateAdded', null)
    setSheetOpen(false)
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your customers and leads.</p>
        </div>
        <Button onClick={() => navigate('/customers/new')} className="shrink-0">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </header>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search name, phone, company..."
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">
          {loading ? 'Searching...' : `${count} customer${count === 1 ? '' : 's'}`}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop compact filters */}
      <div className="hidden gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-card md:flex">
        <div className="flex-1">
          <Select
            aria-label="Status"
            value={filters.status ?? ''}
            onChange={(e) => setFilter('status', (e.target.value as CustomerStatus) || null)}
          >
            <option value="">All Statuses</option>
            {CUSTOMER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <Select
            aria-label="Customer type"
            value={filters.type ?? ''}
            onChange={(e) => setFilter('type', (e.target.value as CustomerType) || null)}
          >
            <option value="">All Types</option>
            {CUSTOMER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <Select
            aria-label="Follow-up"
            value={filters.followUp ?? ''}
            onChange={(e) => setFilter('followUp', (e.target.value as 'today' | 'overdue' | 'upcoming') || null)}
          >
            <option value="">Any follow-up</option>
            <option value="today">Today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            aria-label="Date added"
            value={filters.dateAdded ?? ''}
            onChange={(e) => setFilter('dateAdded', (e.target.value as 'today' | 'week' | 'month') || null)}
          >
            <option value="">Any time</option>
            <option value="today">Added Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </Select>
        </div>
      </div>

      {/* Mobile filter button */}
      <button
        type="button"
        onClick={openSheet}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
      </button>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error} <button onClick={() => refresh()} className="ml-2 font-bold underline">Retry</button>
        </p>
      )}

      {loading && <SkeletonGrid />}

      {!loading && !error && customers.length === 0 && (
        <>
          {hasActiveFilters ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No customers found"
              description="Try changing your search or clearing the filters."
              action={
                <Button variant="outline" onClick={resetFilters}>Clear search & filters</Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No customers yet"
              description="Add your first customer to start managing your leads."
              action={<Button onClick={() => navigate('/customers/new')}><Plus className="h-4 w-4" /> Add Customer</Button>}
            />
          )}
        </>
      )}

      {!loading && customers.length > 0 && (
        <div className="space-y-3">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}

      {!loading && count > customers.length && (
        <Button variant="outline" fullWidth onClick={loadMore} loading={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load more'}
        </Button>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        draft={draft}
        onChange={setDraft}
        onReset={resetFilters}
        onApply={applyFilters}
        onClear={resetFilters}
      />
    </div>
  )
}