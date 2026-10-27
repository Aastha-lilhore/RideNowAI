import { describe, it, expect } from 'vitest'
import { colorsFor, VEHICLE_COLORS } from './vehicleColors.js'

describe('colorsFor', () => {
  it('finds a vehicle by display label or key, any casing', () => {
    expect(colorsFor('Sedan')).toBe(VEHICLE_COLORS.sedan)
    expect(colorsFor('sedan')).toBe(VEHICLE_COLORS.sedan)
    expect(colorsFor('SUV')).toBe(VEHICLE_COLORS.suv)
  })

  it('falls back to a neutral color instead of crashing for unknown or missing types', () => {
    for (const unknown of ['Rickshaw', undefined, null, '']) {
      expect(colorsFor(unknown).dot).toBe('bg-text-secondary')
    }
  })
})
