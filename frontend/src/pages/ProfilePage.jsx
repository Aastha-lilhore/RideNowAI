import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, ShieldCheck, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'

/**
 * Profile — the ONE account area (AI_FRONTEND_MASTER_PROMPT.md: "Profile/
 * settings belong to one account area"). Previously missing entirely —
 * there was no logout anywhere in the app. Editing is local-only for now:
 * API_CONTRACT.md has no PUT /api/users endpoint yet, so changes update
 * the session in memory/localStorage but won't survive a real backend
 * swap until that endpoint exists (see docs/BACKEND_INTEGRATION.md).
 */
function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || '' })

  if (!user) {
    return (
      <main className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Not signed in</h1>
        <p className="text-sm text-text-secondary">Log in to see your profile.</p>
        <Button to="/auth?tab=login" className="mt-2">
          Log in
        </Button>
      </main>
    )
  }

  function handleSave(e) {
    e.preventDefault()
    updateProfile(form)
    setEditing(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Profile</h1>

      <div className="mt-6 rounded-2xl border border-border-default bg-bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-bg-card-alt font-display text-xl font-semibold text-accent-amber-light">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-text-primary">{user.name}</p>
            <p className="truncate text-sm text-text-secondary">{user.email}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-5 flex flex-col gap-3 border-t border-border-default pt-5">
            <TextField
              id="profile-name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <TextField
              id="profile-phone"
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <TextField
              id="profile-gender"
              label="Gender"
              type="text"
              placeholder="Optional"
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            />
            <div className="mt-1 flex gap-2">
              <Button type="submit" className="flex-1">
                Save
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex items-center justify-between border-t border-border-default pt-5 text-sm">
            <div className="text-text-secondary">
              <p>{user.phone || 'No phone number added'}</p>
              {user.gender && <p className="mt-0.5">{user.gender}</p>}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-accent-amber-light hover:underline"
            >
              <Pencil size={13} /> Edit
            </button>
          </div>
        )}
      </div>

      <Link
        to="/safety"
        className="mt-4 flex items-center justify-between rounded-2xl border border-border-default bg-bg-card p-5 transition-colors hover:border-accent-amber/60"
      >
        <span className="flex items-center gap-2 text-sm text-text-primary">
          <ShieldCheck size={16} className="text-success-DEFAULT" /> Safety settings
        </span>
        <span className="text-xs text-text-secondary">Manage →</span>
      </Link>

      <Button variant="outlineDanger" className="mt-6 w-full" onClick={handleLogout}>
        <LogOut size={16} className="mr-2" /> Log out
      </Button>
    </div>
  )
}

export default ProfilePage
