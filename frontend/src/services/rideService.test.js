import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchRides, getAnomalyPlan, getRouteCoordinates, getDriverForRide } from './rideService.js'

// searchRides simulates network latency with setTimeout
async function search(args) {
  const promise = searchRides(args)
  await vi.advanceTimersByTimeAsync(1000)
  return promise
}

const ROUTE = { pickup: 'MG Road', destination: 'Central Station' }

describe('searchRides', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the four vehicle options with sane scores', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'ai' })
    expect(rides.map((r) => r.id).sort()).toEqual(['auto', 'bike', 'sedan', 'suv'])
    for (const r of rides) {
      expect(r.fare).toBeGreaterThan(0)
      expect(r.etaMin).toBeGreaterThan(0)
      expect(r.safetyScore).toBeGreaterThanOrEqual(0)
      expect(r.safetyScore).toBeLessThanOrEqual(100)
      expect(r.ecoScore).toBeGreaterThanOrEqual(0)
      expect(r.ecoScore).toBeLessThanOrEqual(100)
      expect(r.reason.length).toBeGreaterThan(10)
    }
  })

  it('AI priority sorts by recommendation score, highest first', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'ai' })
    const scores = rides.map((r) => r.recommendationScore)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('cheapest priority sorts by fare ascending', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'cheapest' })
    const fares = rides.map((r) => r.fare)
    expect(fares).toEqual([...fares].sort((a, b) => a - b))
  })

  it('fastest priority sorts by ETA ascending', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'fastest' })
    const etas = rides.map((r) => r.etaMin)
    expect(etas).toEqual([...etas].sort((a, b) => a - b))
  })

  it('safest priority sorts by safety score descending', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'safest' })
    const safety = rides.map((r) => r.safetyScore)
    expect(safety).toEqual([...safety].sort((a, b) => b - a))
  })

  it('gives the same trip for the same route, and a different one for another route', async () => {
    const a = await search({ ...ROUTE, priority: 'ai' })
    const b = await search({ ...ROUTE, priority: 'ai' })
    const c = await search({ pickup: 'Airport', destination: 'Rajwada', priority: 'ai' })
    expect(b.distanceKm).toBe(a.distanceKm)
    expect(c.distanceKm).not.toBe(a.distanceKm)
  })

  it('labels the cheapest ride as such in its explanation', async () => {
    const { rides } = await search({ ...ROUTE, priority: 'cheapest' })
    expect(rides[0].reason.toLowerCase()).toContain('cheapest')
  })
})

describe('anomaly plan and coordinates', () => {
  it('is deterministic per ride and keeps the window inside the trip', () => {
    for (const id of ['bike', 'auto', 'sedan', 'suv']) {
      const plan = getAnomalyPlan({ id })
      expect(getAnomalyPlan({ id })).toEqual(plan)
      if (plan.hasAnomaly) {
        expect(plan.startProgress).toBeGreaterThan(0)
        expect(plan.endProgress).toBeLessThan(1)
        expect(plan.deviationMeters).toBeGreaterThanOrEqual(500) // AI_FORMULAS.md threshold
      }
    }
  })

  it('gives stable coordinates for a route', () => {
    expect(getRouteCoordinates('A', 'B')).toEqual(getRouteCoordinates('A', 'B'))
  })
})

describe('getDriverForRide', () => {
  it('returns a verified driver with a phone number and the right vehicle type', () => {
    const driver = getDriverForRide({ id: 'sedan', fare: 200, etaMin: 15, driverRating: 4.7, safetyScore: 90, vehicleLabel: 'Sedan', capacity: 4 })
    expect(driver.verification_status).toBe('verified')
    expect(driver.phone).toMatch(/^\+91 /)
    expect(driver.vehicle.vehicle_type).toBe('Sedan')
  })
})
