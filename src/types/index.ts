export type CustomerType = 'lead' | 'customer' | 'business' | 'other'

export type CustomerStatus =
  | 'new_lead'
  | 'contacted'
  | 'follow_up'
  | 'interested'
  | 'converted'
  | 'not_interested'

export type ActivityType =
  | 'created'
  | 'note'
  | 'call'
  | 'meeting'
  | 'whatsapp'
  | 'follow_up'
  | 'status_change'
  | 'edited'

export interface Profile {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  role: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  normalized_phone: string
  alternate_phone: string | null
  email: string | null
  company: string | null
  address: string | null
  customer_type: CustomerType
  status: CustomerStatus
  notes: string | null
  follow_up_date: string | null
  follow_up_time: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CustomerInput {
  name: string
  phone: string
  alternate_phone: string
  email: string
  company: string
  address: string
  customer_type: CustomerType
  status: CustomerStatus
  notes: string
  follow_up_date: string
  follow_up_time: string
}

export interface CustomerActivity {
  id: string
  customer_id: string
  user_id: string | null
  activity_type: ActivityType
  description: string | null
  created_at: string
}