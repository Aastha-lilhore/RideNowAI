import Button from '../components/Button.jsx'

/**
 * Catch-all for unknown URLs — previously React Router rendered nothing
 * at all, leaving a blank page with no way back.
 */
function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-5xl font-semibold text-accent-amber-light">404</p>
      <h1 className="font-display text-xl font-semibold text-text-primary">This route doesn't exist</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        The page you're looking for was moved or never existed.
      </p>
      <Button to="/" className="mt-2">
        Go to home
      </Button>
    </main>
  )
}

export default NotFoundPage
