import MarketingNav from '../layouts/MarketingNav.jsx'
import Button from '../components/Button.jsx'
import RideComparisonMap from '../components/RideComparisonMap.jsx'
import NightCityScene from '../components/NightCityScene.jsx'
import { HERO } from '../data/landingContent.js'

/**
 * Landing page — navbar -> hero (illustrated night-city scene + the
 * interactive route map) -> footer. No stat blocks, no feature-card grid,
 * no second CTA banner. First stop in the product journey
 * (Landing -> Auth -> Dashboard -> ... per PROJECT_MEMORY.md).
 */
function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-bg-page">
      <MarketingNav />

      <section
        id="find-a-ride"
        className="relative isolate mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 md:flex-row md:items-center md:gap-16 md:py-28"
      >
        <NightCityScene />
        <div className="flex-1 text-center md:text-left">
          <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-card px-3 py-1 text-xs font-medium tracking-wide text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" />
            {HERO.eyebrow}
          </span>
          <h1
            className="animate-fade-in-up mt-4 font-display text-3xl font-semibold leading-tight text-text-primary md:text-4xl"
            style={{ animationDelay: '80ms' }}
          >
            {HERO.headline} <span className="text-accent-highlight">{HERO.headlineAccent}</span>
          </h1>
          <p
            className="animate-fade-in-up mx-auto mt-3 max-w-sm text-base text-text-secondary md:mx-0"
            style={{ animationDelay: '160ms' }}
          >
            {HERO.subheadline}
          </p>

          <div
            className="animate-fade-in-up mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
            style={{ animationDelay: '240ms' }}
          >
            <Button to="/auth?tab=signup">Find a Ride</Button>
            <Button variant="secondary" to="/auth?tab=signup">
              Compare Rides
            </Button>
          </div>
        </div>

        <div id="ride-score" className="flex-1">
          <RideComparisonMap />
        </div>
      </section>

      <footer id="safety" className="border-t border-border-default">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-8 text-center text-xs text-text-secondary md:flex-row md:justify-between md:text-left">
          <span className="text-text-primary">
            RideNow <span className="text-text-secondary font-normal">AI</span>
          </span>
          <span>© {new Date().getFullYear()} RideNow AI — college prototype project.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
