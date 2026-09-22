import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { ensureProfile } from '../services/profileService'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await ensureProfile(user.id, user.email ?? undefined)
    setProfile(p)
  }, [user])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        ensureProfile(data.session.user.id, data.session.user.email ?? undefined).then((p) => {
          if (active) setProfile(p)
        })
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        ensureProfile(newSession.user.id, newSession.user.email ?? undefined).then((p) => {
          if (active) setProfile(p)
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      throw new Error('Invalid email or password.')
    }
    setSession(data.session)
    setUser(data.session.user)
    const p = await ensureProfile(data.session.user.id, data.session.user.email ?? undefined)
    setProfile(p)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({ user, session, loading, profile, signIn, signOut, refreshProfile }),
    [user, session, loading, profile, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}