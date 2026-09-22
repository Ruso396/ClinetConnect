const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

console.log('Supabase URL configured:', Boolean(supabaseUrl))
console.log('Supabase key configured:', Boolean(supabaseAnonKey))

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)