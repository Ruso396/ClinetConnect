import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './NavItems'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../ui/Avatar'
import { cn } from '../../lib/cn'

export function Sidebar() {
  const { profile, user } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white">
          R
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-slate-900">Ruso Bros</p>
          <p className="text-[11px] text-slate-500">Customer & Marketing</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {getInitials(profile?.full_name ?? user?.email ?? 'U')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {profile?.full_name ?? 'User'}
            </p>
            <p className="truncate text-xs text-slate-500">{profile?.email ?? user?.email}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}