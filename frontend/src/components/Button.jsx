/**
 * Midnight Amber button styling: one restrained copper accent (no rainbow
 * gradient), used with intent on the primary action only.
 */
const VARIANT_CLASSES = {
  primary:
    'bg-accent-amber text-bg-page hover:bg-accent-amber-light hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-6px_rgba(217,130,43,0.5)] active:translate-y-0 active:bg-accent-amber-dark focus-visible:outline-accent-amber-light',
  secondary:
    'border border-border-default text-text-primary hover:border-accent-amber/60 hover:-translate-y-0.5 hover:bg-bg-card-alt/60 active:translate-y-0 active:bg-bg-card-alt focus-visible:outline-border-default',
}

function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 font-display text-sm font-medium
        transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
