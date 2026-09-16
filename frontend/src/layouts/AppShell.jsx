import { NavLink, Outlet } from 'react-router-dom'
import { Search, Clock, Shield, BarChart3 } from 'lucide-react'

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

function AppShell() {
  return (
    <div className="min-h-screen bg-bg-page">
      {/* Desktop: slim top bar */}
      <header className="sticky top-0 z-20 hidden border-b border-border-default bg-bg-page/95 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            RideNow <span className="text-text-secondary font-normal">AI</span>
          </span>
          <NavItems className="flex items-center gap-8" itemClassName="flex items-center gap-2 text-sm transition-colors" />
        </div>
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
