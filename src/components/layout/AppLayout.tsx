import { Outlet } from 'react-router-dom'
import { Sidebar } from '../navigation/Sidebar'
import { BottomNavigation } from '../navigation/BottomNavigation'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <Sidebar />
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 md:max-w-4xl md:px-8 md:pb-12 md:pt-8 lg:max-w-5xl">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}