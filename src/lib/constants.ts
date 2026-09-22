export const CUSTOMER_TYPES = [
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Customer' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
] as const

export const CUSTOMER_STATUSES = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'interested', label: 'Interested' },
  { value: 'converted', label: 'Converted' },
  { value: 'not_interested', label: 'Not Interested' },
] as const

export type CustomerTypeValue = (typeof CUSTOMER_TYPES)[number]['value']
export type CustomerStatusValue = (typeof CUSTOMER_STATUSES)[number]['value']

export function customerTypeLabel(value: string): string {
  return CUSTOMER_TYPES.find((t) => t.value === value)?.label ?? value
}

export function customerStatusLabel(value: string): string {
  return CUSTOMER_STATUSES.find((s) => s.value === value)?.label ?? value
}

export const CUSTOMER_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CUSTOMER_TYPES.map((t) => [t.value, t.label]),
)

export const CUSTOMER_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  CUSTOMER_STATUSES.map((s) => [s.value, s.label]),
)