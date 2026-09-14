/**
 * Landing page — first screen in the user journey
 * (Landing → Login/Signup → Home Dashboard → ...).
 * This is a placeholder confirming the scaffold (routing, Tailwind theme,
 * folder structure) works end to end. Real landing content comes next.
 */
function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="rounded-full border border-border-default bg-bg-card px-4 py-1 text-sm text-accent-teal-light">
        Scaffold OK
      </span>
      <h1 className="text-3xl font-semibold text-text-primary">RideNow AI</h1>
      <p className="max-w-md text-text-secondary">
        Intelligent and Safety-Aware Ride Recommendation System — frontend
        scaffold. Routing, Tailwind theme, and folder structure are wired up.
      </p>
    </main>
  )
}

export default LandingPage
