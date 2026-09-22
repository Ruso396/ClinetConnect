import { supabase } from '../lib/supabase'
import type { ActivityType, CustomerActivity } from '../types'

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'edited', label: 'Edited' },
]

export async function addActivity(
  customerId: string,
  activityType: ActivityType,
  description?: string,
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('You must be signed in.')

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('created_by', user.id)
    .maybeSingle()
  if (customerError || !customer) throw new Error('Customer not found.')

  const { error } = await supabase.from('customer_activities').insert({
    customer_id: customerId,
    user_id: user.id,
    activity_type: activityType,
    description: description ?? null,
  })
  if (error) throw new Error('Could not save the activity.')
}

export async function listActivities(customerId: string): Promise<CustomerActivity[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('You must be signed in.')

  const { data, error } = await supabase
    .from('customer_activities')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error('Could not load activity history.')
  return (data ?? []) as CustomerActivity[]
}