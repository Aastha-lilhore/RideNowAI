import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import TextField from '../components/TextField.jsx'
import { login, register } from '../services/authService.js'

/**
 * Auth screen — Landing -> Auth -> Dashboard per docs/PROJECT_MEMORY.md.
 * Single screen with a tab switch rather than two routes, since login and
 * signup share the same layout and most of the same fields.
 * Uses the mock authService (see that file) until the real backend exists;
 * the request/response shape already matches docs/API_CONTRACT.md.
 */
function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  const [tab, setTab] = useState(initialTab)

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const action = tab === 'signup' ? register : login
      const { user } = await action(form)
      navigate('/dashboard', { state: { name: user.name } })
    } catch (err) {
      setError(err?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-hero-glow flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            RideNow <span className="text-text-secondary font-normal">AI</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border-default bg-bg-card p-7">
          <div className="mb-6 flex gap-6 border-b border-border-default">
            {['login', 'signup'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`relative pb-3 font-display text-sm font-medium transition-colors ${
                  tab === key ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {key === 'login' ? 'Log in' : 'Sign up'}
                {tab === key && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-amber" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'signup' && (
              <TextField
                id="name"
                label="Full name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={updateField('name')}
                required
              />
            )}

            <TextField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField('email')}
              required
            />

            {tab === 'signup' && (
              <TextField
                id="phone"
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={updateField('phone')}
              />
            )}

            <TextField
              id="password"
              label="Password"
              type="password"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={updateField('password')}
              required
            />

            {error && <p className="text-xs text-danger-DEFAULT">{error}</p>}

            <Button type="submit" className="mt-2 w-full" disabled={submitting}>
              {submitting ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Log in'}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-text-secondary">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
            className="font-medium text-accent-amber-light hover:underline"
          >
            {tab === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
