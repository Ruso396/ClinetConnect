import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, KeyRound, LogOut, ShieldCheck, Mail, Phone } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'
import { updatePassword, updateProfile } from '../services/profileService'

export function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone])

  const saveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      await updateProfile({ full_name: fullName.trim() || 'User', phone: phone.trim() || null })
      await refreshProfile()
      success('Profile updated.')
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async () => {
    setPasswordError('')
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setPasswordError('Passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword(password)
      success('Password updated successfully.')
      setPassword('')
      setConfirm('')
      setPasswordOpen(false)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Could not update the password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      showError('Could not log out. Please try again.')
      setSigningOut(false)
      setLogoutOpen(false)
    }
  }

  const roleLabel = profile?.role === 'marketing' ? 'Marketing' : profile?.role ?? 'User'

  return (
    <div className="space-y-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account.</p>
      </header>

      <section className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <Avatar name={profile?.full_name ?? user?.email ?? 'U'} size="xl" src={profile?.avatar_url} />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900">{profile?.full_name ?? 'User'}</h2>
          <p className="flex items-center gap-1 truncate text-sm text-slate-500">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {profile?.email ?? user?.email}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" /> {roleLabel}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-brand-500" /> My Profile
        </h3>
        <div className="mt-4 space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leading={<Phone className="h-4 w-4" />}
          />
          <Button onClick={saveProfile} loading={savingProfile} fullWidth>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <KeyRound className="h-4 w-4 text-brand-500" /> Change Password
        </h3>
        <p className="mt-1 text-xs text-slate-500">Reset your login password.</p>
        <div className="mt-4">
          <Button variant="outline" fullWidth onClick={() => setPasswordOpen(true)}>
            Change Password
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-900">Logout</h3>
        <p className="mt-1 text-xs text-slate-500">Sign out of Ruso Bros on this device.</p>
        <div className="mt-4">
          <Button variant="danger" fullWidth onClick={() => setLogoutOpen(true)}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </section>

      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change Password">
        <div className="space-y-4 p-5">
          <Input
            label="New Password"
            type="password"
            name="new_password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirm_password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={passwordError}
          />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={savePassword} loading={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={logoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        destructive
        loading={signingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}