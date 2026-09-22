import { Component, lazy, StrictMode } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.tsx'))

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application failed to render', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <StartupErrorScreen message="Something went wrong." />
    }

    return this.props.children
  }
}

function StartupErrorScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-black text-white shadow-lg">
        R
      </div>
      <h1 className="text-lg font-bold text-slate-900">Ruso CRM</h1>
      <p className="text-sm text-slate-500">{message}</p>
      <button
        type="button"
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </main>
  )
}

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const root = document.getElementById('root')

if (!root) {
  throw new Error('React root element was not found.')
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      {hasSupabaseConfig ? (
        <App />
      ) : (
        <StartupErrorScreen message="Supabase configuration is missing." />
      )}
    </AppErrorBoundary>
  </StrictMode>,
)
