import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './NavItems'
import { cn } from '../../lib/cn'

export function BottomNavigation() {
  const location = useLocation()
  const hideOn = new Set(['/login'])

  if (hideOn.has(location.pathname)) return null

  return (
    <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                  isActive && 'bg-brand-50',
                )}
              >
                <Icon className={cn('h-5 w-5', item.label === 'Add' && 'h-6 w-6 stroke-brand-600')} />
              </span>
              {item.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}