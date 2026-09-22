import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('You must be signed in.')
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return null
  return (data as Profile) ?? null
}

export async function ensureProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  const existing = await getProfile()
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: user.email?.split('@')[0] ?? 'User',
      email: user.email ?? null,
      role: 'marketing',
    })
    .select()
    .single()

  if (error) return null
  return (data as Profile) ?? null
}

export async function updateProfile(
  input: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>,
): Promise<Profile> {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...input }, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(error.message || 'Could not update your profile.')
  return data as Profile
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error('Could not update the password. Your password must be at least 6 characters.')
}