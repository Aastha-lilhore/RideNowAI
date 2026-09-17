/**
 * Reusable labeled input — consistent form styling across the app.
 * Optional `icon` (a lucide-react component) renders inside the field;
 * existing callers that don't pass one are unaffected.
 */
function TextField({ label, id, error, icon: Icon, className = '', ...rest }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        )}
        <input
          id={id}
          className={`w-full rounded-md border border-border-default bg-bg-card-alt py-2.5 text-sm text-text-primary
            placeholder:text-text-secondary/60 focus:border-accent-amber focus:outline-none
            ${Icon ? 'pl-9 pr-3.5' : 'px-3.5'}`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-DEFAULT">{error}</p>}
    </div>
  )
}

export default TextField
