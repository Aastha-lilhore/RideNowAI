/**
 * Reusable labeled input — consistent form styling across the app
 * (auth now, later screens reuse this rather than each rolling their own).
 */
function TextField({ label, id, error, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-border-default bg-bg-card-alt px-3.5 py-2.5 text-sm text-text-primary
          placeholder:text-text-secondary/60 focus:border-accent-amber focus:outline-none"
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-danger-DEFAULT">{error}</p>}
    </div>
  )
}

export default TextField
