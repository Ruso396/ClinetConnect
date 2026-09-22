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
  const { error } = await supabase.from('customer_activities').insert({
    customer_id: customerId,
    user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
    activity_type: activityType,
    description: description ?? null,
  })
  if (error) throw new Error('Could not save the activity.')
}

export async function listActivities(customerId: string): Promise<CustomerActivity[]> {
  const { data, error } = await supabase
    .from('customer_activities')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error('Could not load activity history.')
  return (data ?? []) as CustomerActivity[]
}