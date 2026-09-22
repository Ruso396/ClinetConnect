import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CustomerFilters } from '../services/customerService'
import { fetchCustomers } from '../services/customerService'
import type { Customer } from '../types'

const PAGE_SIZE = 50
const DEBOUNCE_MS = 350

function useDebouncedSearch(search: string | undefined): string | undefined {
  const [value, setValue] = useState(search)
  useEffect(() => {
    const handler = setTimeout(() => setValue(search), DEBOUNCE_MS)
    return () => clearTimeout(handler)
  }, [search])
  return value
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CustomerFilters>({})
  const hasLoaded = useRef(false)

  const debouncedSearch = useDebouncedSearch(filters.search)

  const effective = useMemo<CustomerFilters>(() => {
    const out: CustomerFilters = { search: debouncedSearch }
    if (filters.status) out.status = filters.status
    if (filters.type) out.type = filters.type
    if (filters.followUp) out.followUp = filters.followUp
    if (filters.dateAdded) out.dateAdded = filters.dateAdded
    return out
  }, [debouncedSearch, filters.status, filters.type, filters.followUp, filters.dateAdded])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchCustomers(effective, { from: 0, to: PAGE_SIZE - 1 })
      setCustomers(res.data)
      setCount(res.count)
      hasLoaded.current = true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [effective])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const loadMore = useCallback(async () => {
    if (loadingMore || customers.length >= count) return
    setLoadingMore(true)
    try {
      const from = customers.length
      const res = await fetchCustomers(effective, { from, to: from + PAGE_SIZE - 1 })
      setCustomers((prev) => [...prev, ...res.data])
      setCount(res.count)
    } catch {
      // ignore load-more failures
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, customers, count, effective])

  const setFilter = useCallback(
    <K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  return {
    customers,
    count,
    loading,
    loadingMore,
    error,
    filters,
    setFilter,
    refresh,
    loadMore,
  }
}