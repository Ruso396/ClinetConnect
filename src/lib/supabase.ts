import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error(
    'Supabase environment variables are missing. Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})