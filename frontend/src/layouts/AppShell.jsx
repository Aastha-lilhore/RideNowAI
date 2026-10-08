import { NavLink, Outlet, Link } from 'react-router-dom'
import { Search, Clock, Shield, BarChart3, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * The ONE canonical navigation for the authenticated app (Dashboard,
 * Search, Activity/history, Safety, Insights) — distinct from
 * MarketingNav, which only appears on the pre-login pages. Per
 * DESIGN_REFERENCE.md: "persistent bottom navigation (Search / Activity /
 * Safety / Insights)". Rendered as a fixed bottom bar on mobile (where a
 * bottom bar is the natural pattern) and a slim top bar on desktop, so
 * there's one implementation, not two competing nav systems.
 */
const TABS = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/activity', label: 'Activity', icon: Clock },
  { to: '/safety', label: 'Safety', icon: Shield },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
]

function NavItems({ className, itemClassName }) {
  return (
    <nav className={className}>
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `${itemClassName} ${isActive ? 'text-accent-amber-light' : 'text-text-secondary hover:text-text-primary'}`
          }
        >
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function ProfileAvatar() {
  const { user } = useAuth()
  const initials = user ? user.name.split(' ').map((n) => n[0]).join('') : null

  return (
    <Link
      to="/profile"
      aria-label="Profile"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-card-alt text-xs font-semibold text-accent-amber-light transition-colors hover:ring-1 hover:ring-accent-amber/60"
    >
      {initials || <User size={16} />}
    </Link>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen bg-bg-page">
      {/* Desktop: slim top bar */}
      <header className="sticky top-0 z-20 hidden border-b border-border-default bg-bg-page/95 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            RideNow <span className="text-text-secondary font-normal">AI</span>
          </span>
          <div className="flex items-center gap-6">
            <NavItems className="flex items-center gap-8" itemClassName="flex items-center gap-2 text-sm transition-colors" />
            <ProfileAvatar />
          </div>
        </div>
      </header>

      {/* Mobile: minimal top strip with wordmark + profile access, since the
          bottom bar is reserved for Search/Activity/Safety/Insights only
          (per DESIGN_REFERENCE.md) — profile needed its own access point */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-default bg-bg-page/95 px-6 py-3 backdrop-blur md:hidden">
        <span className="font-display text-sm font-semibold tracking-tight text-text-primary">
          RideNow <span className="text-text-secondary font-normal">AI</span>
        </span>
        <ProfileAvatar />
      </header>

      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile: fixed bottom bar */}
      <NavItems
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border-default bg-bg-card/95 backdrop-blur md:hidden"
        itemClassName="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors"
      />
    </div>
  )
}

export default AppShell
