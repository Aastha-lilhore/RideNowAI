/**
 * Status badge (docs/DESIGN_REFERENCE.md -> Status badges): a small pill
 * with a colored dot indicator, e.g. "RIDE IN PROGRESS", "SAFETY MODE
 * ACTIVE". Reused wherever a screen needs to show its current state.
 */
const DOT_COLORS = {
  amber: 'bg-accent-amber',
  success: 'bg-success-DEFAULT',
  danger: 'bg-danger-DEFAULT',
}

function StatusBadge({ label, tone = 'amber', pulse = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-bg-card px-3 py-1 text-[11px] font-medium tracking-wide text-text-secondary">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}

export default StatusBadge
