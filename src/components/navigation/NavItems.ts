import { Home, Users, Plus, CalendarClock, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/dashboard', icon: Home, end: true },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Add', to: '/customers/new', icon: Plus },
  { label: 'Follow-ups', to: '/follow-ups', icon: CalendarClock },
  { label: 'Profile', to: '/profile', icon: User },
]