/**
 * One color per vehicle type, reused everywhere a vehicle is shown
 * (Results, Ride Details, Insights' breakdown) so the same type always
 * reads the same way — not decoration, a real visual category system.
 */
export const VEHICLE_COLORS = {
  bike: { dot: 'bg-info-DEFAULT', text: 'text-info-DEFAULT', bar: 'bg-info-DEFAULT' },
  auto: { dot: 'bg-success-DEFAULT', text: 'text-success-DEFAULT', bar: 'bg-success-DEFAULT' },
  sedan: { dot: 'bg-accent-amber', text: 'text-accent-amber-light', bar: 'bg-accent-amber' },
  suv: { dot: 'bg-warning-DEFAULT', text: 'text-warning-DEFAULT', bar: 'bg-warning-DEFAULT' },
}
