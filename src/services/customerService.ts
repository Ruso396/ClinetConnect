import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { todayISO, toISODate, tomorrowISO } from '../utils/date'
import { normalizePhone } from '../utils/phone'
import type { Customer, CustomerInput, CustomerStatus, CustomerType } from '../types'

export const DUPLICATE_PHONE_MESSAGE = 'Customer with this phone number already exists.'

export interface CustomerFilters {
  search?: string
  status?: CustomerStatus | null
  type?: CustomerType | null
  followUp?: 'today' | 'overdue' | 'upcoming' | null
  dateAdded?: 'today' | 'week' | 'month' | null
}

const DATE_ADDED_LIMITS: Record<string, number> = {
  today: 1,
  week: 7,
  month: 30,
}

function buildQuery(client: SupabaseClient, filters: CustomerFilters) {
  let query = client.from('customers').select('*', { count: 'exact' })

  const term = filters.search?.trim()
  if (term) {
    const escaped = term.replace(/'/g, "''")
    query = query.or(
      `name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%,company.ilike.%${escaped}%,address.ilike.%${escaped}%`,
    )
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.type) {
    query = query.eq('customer_type', filters.type)
  }
  if (filters.followUp === 'today') {
    query = query.eq('follow_up_date', todayISO())
  } else if (filters.followUp === 'overdue') {
    query = query.lt('follow_up_date', todayISO())
  } else if (filters.followUp === 'upcoming') {
    query = query.gt('follow_up_date', todayISO())
  }
  if (filters.dateAdded) {
    const days = DATE_ADDED_LIMITS[filters.dateAdded]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    cutoff.setHours(0, 0, 0, 0)
    query = query.gte('created_at', cutoff.toISOString())
  }
  return query
}

export async function fetchCustomers(
  filters: CustomerFilters,
  range: { from: number; to: number } = { from: 0, to: 49 },
): Promise<{ data: Customer[]; count: number }> {
  const from = Math.max(0, range.from)
  const to = Math.max(from, range.to)
  const { data, count, error } = await buildQuery(supabase, filters)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error('Could not load customers. Please try again.')
  return { data: (data ?? []) as Customer[], count: count ?? 0 }
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error('Could not load this customer. Please try again.')
  if (!data) throw new Error('Customer not found.')
  return data as Customer
}

export async function hasCustomerWithPhone(phone: string, excludeId?: string): Promise<boolean> {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) return false

  let query = supabase
    .from('customers')
    .select('id')
    .eq('normalized_phone', normalizedPhone)
    .limit(1)

  if (excludeId) query = query.neq('id', excludeId)

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error('Could not validate the phone number. Please try again.')
  return Boolean(data)
}

export async function createCustomer(input: CustomerInput, userId: string): Promise<Customer> {
  const normalizedPhone = normalizePhone(input.phone)
  const { data, error } = await supabase
    .from('customers')
    .insert([
      {
        name: input.name.trim(),
        phone: input.phone.trim(),
        normalized_phone: normalizedPhone,
        alternate_phone: input.alternate_phone.trim() || null,
        email: input.email.trim() || null,
        company: input.company.trim() || null,
        address: input.address.trim() || null,
        customer_type: input.customer_type,
        notes: input.notes.trim() || null,
        follow_up_date: input.follow_up_date || null,
        follow_up_time: input.follow_up_time || null,
        status: input.status,
        created_by: userId,
      },
    ])
    .select()
    .single()

  if (error?.code === '23505' && error.message.includes('normalized_phone')) {
    throw new Error(DUPLICATE_PHONE_MESSAGE)
  }
  if (error) throw new Error('Could not add the customer. Please try again.')
  return data as Customer
}

export async function updateCustomer(
  id: string,
  input: Partial<Omit<CustomerInput, 'follow_up_date' | 'follow_up_time'>> & {
    follow_up_date?: string | null
    follow_up_time?: string | null
    status?: CustomerStatus
  },
): Promise<Customer> {
  const normalizedPhone = input.phone === undefined ? undefined : normalizePhone(input.phone)
  const update = {
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.phone !== undefined && { phone: input.phone.trim() }),
    ...(normalizedPhone !== undefined && { normalized_phone: normalizedPhone }),
    ...(input.alternate_phone !== undefined && { alternate_phone: input.alternate_phone.trim() || null }),
    ...(input.email !== undefined && { email: input.email.trim() || null }),
    ...(input.company !== undefined && { company: input.company.trim() || null }),
    ...(input.address !== undefined && { address: input.address.trim() || null }),
    ...(input.customer_type !== undefined && { customer_type: input.customer_type }),
    ...(input.notes !== undefined && { notes: input.notes.trim() || null }),
    ...(input.follow_up_date !== undefined && { follow_up_date: input.follow_up_date || null }),
    ...(input.follow_up_time !== undefined && { follow_up_time: input.follow_up_time || null }),
    ...(input.status !== undefined && { status: input.status }),
  }
  const { data, error } = await supabase
    .from('customers')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error?.code === '23505' && error.message.includes('normalized_phone')) {
    throw new Error(DUPLICATE_PHONE_MESSAGE)
  }
  if (error) throw new Error('Could not update the customer. Please try again.')
  return data as Customer
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error('Could not delete this customer. Please try again.')
}

export async function getCustomerCounts(): Promise<{
  total: number
  newLeads: number
  followUps: number
  converted: number
}> {
  const count = async (query: any): Promise<number> => {
    const { count, error } = await query
    return error ? 0 : (count ?? 0)
  }

  const [total, newLeads, followUps, converted] = await Promise.all([
    count(supabase.from('customers').select('id', { count: 'exact', head: true })),
    count(
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new_lead'),
    ),
    count(
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'follow_up'),
    ),
    count(
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'converted'),
    ),
  ])

  return { total, newLeads, followUps, converted }
}

export async function getRecentCustomers(limit = 5): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error('Could not load recent customers.')
  return (data ?? []) as Customer[]
}

export async function getTodayFollowUps(): Promise<Customer[]> {
  const today = todayISO()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('follow_up_date', today)
    .order('follow_up_time', { ascending: true, nullsFirst: false })
    .limit(20)

  if (error) throw new Error('Could not load today\u2019s follow-ups.')
  return (data ?? []) as Customer[]
}

export async function getFollowUpSections(): Promise<{
  today: Customer[]
  tomorrow: Customer[]
  upcoming: Customer[]
  overdue: Customer[]
}> {
  const today = todayISO()
  const tomorrow = tomorrowISO()
  const end = new Date()
  end.setDate(end.getDate() + 30)
  const endISO = toISODate(end)

  const base = () => supabase.from('customers').select('*')

  const [todayRes, tomorrowRes, upcomingRes, overdueRes] = await Promise.all([
    base().eq('follow_up_date', today).order('follow_up_time', { ascending: true }),
    base().eq('follow_up_date', tomorrow).order('follow_up_time', { ascending: true }),
    base()
      .gt('follow_up_date', tomorrow)
      .lte('follow_up_date', endISO)
      .order('follow_up_date', { ascending: true }),
    base().lt('follow_up_date', today).order('follow_up_date', { ascending: false }).limit(50),
  ])

  return {
    today: (todayRes.data ?? []) as Customer[],
    tomorrow: (tomorrowRes.data ?? []) as Customer[],
    upcoming: (upcomingRes.data ?? []) as Customer[],
    overdue: (overdueRes.data ?? []) as Customer[],
  }
}

