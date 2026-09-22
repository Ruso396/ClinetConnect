import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) return null
  return (data as Profile) ?? null
}

export async function ensureProfile(userId: string, email?: string): Promise<Profile | null> {
  const existing = await getProfile(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: email?.split('@')[0] ?? 'User',
      email: email ?? null,
      role: 'marketing',
    })
    .select()
    .single()

  if (error) return null
  return (data as Profile) ?? null
}

export async function updateProfile(
  userId: string,
  input: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...input }, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(error.message || 'Could not update your profile.')
  return data as Profile
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error('Could not update the password. Your password must be at least 6 characters.')
}