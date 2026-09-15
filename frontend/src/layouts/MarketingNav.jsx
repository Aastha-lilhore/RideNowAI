import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Button from '../components/Button.jsx'
import { NAV_LINKS } from '../data/landingContent.js'

/**
 * Flat, restrained nav per the redesign brief — no floating pill container,
 * no marketing-site link sprawl. Only navigation relevant to a ride
 * comparison + safety product. This is the single marketing nav; the
 * authenticated app uses its own bottom nav (see DESIGN_REFERENCE.md).
 */
function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border-default/70 bg-bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            RideNow <span className="text-text-secondary font-normal">AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#login"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Log in
          </a>
          <Button className="px-4 py-2">Get Started</Button>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-primary md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border-default px-6 pb-5 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2.5 text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#login"
              className="rounded-md px-2 py-2.5 text-sm text-text-secondary hover:text-text-primary"
              onClick={() => setOpen(false)}
            >
              Log in
            </a>
          </nav>
          <Button className="mt-3 w-full">Get Started</Button>
        </div>
      )}
    </header>
  )
}

export default MarketingNav
