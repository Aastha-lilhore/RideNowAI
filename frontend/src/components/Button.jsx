import { Link } from 'react-router-dom'

/**
 * Midnight Amber button styling: one restrained copper accent (no rainbow
 * gradient), used with intent on the primary action only.
 *
 * Polymorphic: pass `to` to render a router Link styled identically to a
 * button (for real navigation, e.g. hero CTAs -> /auth), otherwise it
 * renders a plain <button> for in-page actions / form submits.
 */
const VARIANT_CLASSES = {
  primary:
    'bg-accent-amber text-bg-page hover:bg-accent-amber-light hover:-translate-y-0.5 hover:shadow-[0_10px_26px_-6px_rgba(217,130,43,0.5)] active:translate-y-0 active:bg-accent-amber-dark focus-visible:outline-accent-amber-light',
  secondary:
    'border border-border-default text-text-primary hover:border-accent-amber/60 hover:-translate-y-0.5 hover:bg-bg-card-alt/60 active:translate-y-0 active:bg-bg-card-alt focus-visible:outline-border-default',
  outlineDanger:
    'border border-danger-DEFAULT/50 text-danger-DEFAULT hover:border-danger-DEFAULT hover:bg-danger-DEFAULT/10 focus-visible:outline-danger-DEFAULT',
  danger:
    'bg-danger-DEFAULT text-text-primary hover:bg-danger-dark focus-visible:outline-danger-DEFAULT',
}

function Button({ variant = 'primary', className = '', to, children, ...rest }) {
  const classes = `inline-flex items-center justify-center rounded-md px-5 py-2.5 font-display text-sm font-medium
    transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none
    ${VARIANT_CLASSES[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button
