/**
 * Reusable toggle switch — used by the Safety tab, and anywhere else a
 * boolean setting is needed later, rather than each screen rolling its
 * own checkbox styling.
 */
function Switch({ checked, onChange, label, description, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`h-6 w-11 rounded-full transition-colors ${checked ? 'bg-accent-amber' : 'bg-bg-card-alt border border-border-default'}`}
        />
        <span
          className={`absolute left-0.5 h-5 w-5 rounded-full bg-text-primary transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
    </label>
  )
}

export default Switch
