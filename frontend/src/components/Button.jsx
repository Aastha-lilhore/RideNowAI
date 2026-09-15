/**
 * Compact, restrained CTA styling per the redesign brief: no oversized pill
 * buttons, subtle hover/active/focus states, accent used with intent.
 */
const VARIANT_CLASSES = {
  primary:
    'bg-accent-teal text-bg-page hover:bg-accent-teal-light hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-4px_rgba(20,184,166,0.45)] active:translate-y-0 active:bg-accent-teal-dark focus-visible:outline-accent-teal-light',
  secondary:
    'border border-border-default text-text-primary hover:border-text-secondary hover:-translate-y-0.5 hover:bg-bg-card-alt/60 active:translate-y-0 active:bg-bg-card-alt focus-visible:outline-border-default',
}

function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium
        transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
