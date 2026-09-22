const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toISODate(d)
}

export function localDateFromISO(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

/** "2026-09-22" or Date -> "22 Sep 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = typeof value === 'string' ? localDateFromISO(value) : value
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** ISO timestamptz -> "22 Sep 2026, 10:30 AM" */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const date = formatDate(d)
  return `${date}, ${hours}:${minutes} ${ampm}`
}

/** "14:30:00" -> "2:30 PM" */
export function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h)) return value
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  const minutes = String(m ?? 0).padStart(2, '0')
  return `${hour}:${minutes} ${ampm}`
}

export function isToday(value: string): boolean {
  return value === todayISO()
}

export function isTomorrow(value: string): boolean {
  return value === tomorrowISO()
}

export function isPast(value: string): boolean {
  return value < todayISO()
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}