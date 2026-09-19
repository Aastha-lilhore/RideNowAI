/**
 * Ride search + AI scoring service.
 *
 * Every formula here is a deliberate stand-in for a future ML model,
 * exactly as docs/AI_FORMULAS.md specifies — same inputs/outputs, so
 * swapping in the real model later doesn't change anything that calls
 * this file. Do not invent alternate weights; docs/AI_FORMULAS.md is the
 * source of truth.
 */

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Bike', baseFare: 20, perKm: 6, perMin: 1, capacity: 1, driverRatingBase: 4.5, ecoBase: 92, routeSafetyBase: 76, historyBase: 88 },
  { id: 'auto', label: 'Auto', baseFare: 30, perKm: 9, perMin: 1.2, capacity: 3, driverRatingBase: 4.3, ecoBase: 80, routeSafetyBase: 80, historyBase: 85 },
  { id: 'sedan', label: 'Sedan', baseFare: 60, perKm: 13, perMin: 1.5, capacity: 4, driverRatingBase: 4.7, ecoBase: 55, routeSafetyBase: 90, historyBase: 92 },
  { id: 'suv', label: 'SUV', baseFare: 90, perKm: 17, perMin: 1.8, capacity: 6, driverRatingBase: 4.6, ecoBase: 40, routeSafetyBase: 92, historyBase: 90 },
]

/** Deterministic hash so the same pickup/destination always mocks the same trip. */
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

/** Small deterministic pseudo-random in [0,1), seeded by a hash + salt. */
function seededRandom(seed, salt) {
  const x = Math.sin(seed + salt) * 10000
  return x - Math.floor(x)
}

function timeOfDayMultiplier() {
  const hour = new Date().getHours()
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)
  return isPeak ? 1.15 : 1.0
}

/**
 * Fare prediction (docs/AI_FORMULAS.md -> Fare prediction).
 * Stand-in for a Random Forest Regressor over the same feature set:
 * distance, duration, vehicle type, time of day, traffic, demand, weather.
 */
function predictFare(vehicle, distanceKm, durationMin) {
  const trafficMultiplier = 1.15 // mocked "moderate" traffic; real value from live traffic data later
  const demandMultiplier = 1.0 // mocked "normal" demand
  const weatherMultiplier = 1.0 // mocked "clear" weather
  const base = vehicle.baseFare + vehicle.perKm * distanceKm + vehicle.perMin * durationMin
  const fare = base * trafficMultiplier * demandMultiplier * weatherMultiplier * timeOfDayMultiplier()
  return Math.round(fare)
}

/**
 * Safety score (docs/AI_FORMULAS.md -> Safety score): weighted 0-100.
 * Component scores are mocked deterministically per vehicle/route until
 * the real driver-history and route-risk data sources exist.
 */
function computeSafetyScore(vehicle, seed) {
  const driverRatingScore = (vehicle.driverRatingBase / 5) * 100
  const driverHistoryScore = vehicle.historyBase + seededRandom(seed, 1) * 6 - 3
  const routeSafetyScore = vehicle.routeSafetyBase + seededRandom(seed, 2) * 8 - 4
  const timeOfDayScore = timeOfDayMultiplier() > 1 ? 65 : 90
  const trafficScore = 78 // mocked "moderate" traffic
  const areaRiskScore = 82 + seededRandom(seed, 3) * 10 - 5

  const score =
    driverRatingScore * 0.25 +
    driverHistoryScore * 0.2 +
    routeSafetyScore * 0.25 +
    timeOfDayScore * 0.1 +
    trafficScore * 0.1 +
    areaRiskScore * 0.1

  return Math.round(Math.min(100, Math.max(0, score)))
}

function safetyLabel(score) {
  if (score >= 85) return 'Very Safe'
  if (score >= 70) return 'Safe'
  if (score >= 40) return 'Moderate'
  return 'High Risk'
}

/** Eco score (docs/AI_FORMULAS.md -> Eco score), normalized 0-100 by vehicle type. */
function computeEcoScore(vehicle, seed) {
  return Math.round(Math.min(100, Math.max(0, vehicle.ecoBase + seededRandom(seed, 4) * 6 - 3)))
}

/**
 * Recommendation score (docs/AI_FORMULAS.md -> Recommendation score):
 * 0.40*safety + 0.30*costEfficiency + 0.20*timeEfficiency + 0.10*eco,
 * with cost/time efficiency normalized against the other candidates in
 * this same search. Also builds the plain-English reason string from the
 * real numbers, per the "AI must be explainable" rule.
 */
function rankByRecommendation(rides) {
  const fares = rides.map((r) => r.fare)
  const etas = rides.map((r) => r.etaMin)
  const minFare = Math.min(...fares)
  const maxFare = Math.max(...fares)
  const minEta = Math.min(...etas)
  const maxEta = Math.max(...etas)
  const fastest = rides.find((r) => r.etaMin === minEta)
  const cheapest = rides.find((r) => r.fare === minFare)

  return rides
    .map((ride) => {
      const costEfficiency = maxFare === minFare ? 1 : 1 - (ride.fare - minFare) / (maxFare - minFare)
      const timeEfficiency = maxEta === minEta ? 1 : 1 - (ride.etaMin - minEta) / (maxEta - minEta)
      const recommendationScore =
        0.4 * (ride.safetyScore / 100) + 0.3 * costEfficiency + 0.2 * timeEfficiency + 0.1 * (ride.ecoScore / 100)

      const parts = []
      if (ride.id !== cheapest.id && cheapest.fare < ride.fare) {
        const pct = Math.round(((ride.fare - cheapest.fare) / cheapest.fare) * 100)
        if (pct > 0) parts.push(`only ${pct}% more than the cheapest option`)
      } else if (ride.id === cheapest.id) {
        parts.push('the cheapest option available')
      }
      parts.push(`${ride.safetyScore}/100 safety`)
      if (ride.id === fastest.id) {
        parts.push('the fastest to arrive')
      } else {
        const diff = ride.etaMin - fastest.etaMin
        if (diff > 0) parts.push(`arrives ${diff} min after the fastest option`)
      }

      return {
        ...ride,
        recommendationScore,
        reason: parts.join(', ').replace(/^./, (c) => c.toUpperCase()) + '.',
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}

/**
 * PLACEHOLDER: no backend yet, so pickup/destination don't hit a real
 * geocoding/routing API — distance and duration are mocked (but
 * deterministic per route string) until that service exists.
 */
export function searchRides({ pickup, destination, priority }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const seed = hashString(`${pickup}->${destination}`)
      const distanceKm = 3 + (seed % 1200) / 100 // ~3–15 km
      const baseDurationMin = Math.round(distanceKm * 3.2)

      let rides = VEHICLE_TYPES.map((vehicle, i) => {
        const vSeed = seed + i * 97
        const fare = predictFare(vehicle, distanceKm, baseDurationMin)
        const etaMin = Math.round(baseDurationMin * (1 + i * 0.08) * timeOfDayMultiplier())
        const safetyScore = computeSafetyScore(vehicle, vSeed)
        const ecoScore = computeEcoScore(vehicle, vSeed)
        return {
          id: vehicle.id,
          vehicleLabel: vehicle.label,
          capacity: vehicle.capacity,
          driverRating: vehicle.driverRatingBase,
          fare,
          etaMin,
          distanceKm: Math.round(distanceKm * 10) / 10,
          safetyScore,
          safetyLabel: safetyLabel(safetyScore),
          ecoScore,
        }
      })

      rides = rankByRecommendation(rides)

      if (priority === 'cheapest') {
        rides = [...rides].sort((a, b) => a.fare - b.fare)
      } else if (priority === 'fastest') {
        rides = [...rides].sort((a, b) => a.etaMin - b.etaMin)
      } else if (priority === 'safest') {
        rides = [...rides].sort((a, b) => b.safetyScore - a.safetyScore)
      }
      // 'ai' priority: already sorted by recommendationScore

      resolve({ rides, distanceKm: Math.round(distanceKm * 10) / 10, pickup, destination })
    }, 500)
  })
}

const DRIVER_NAMES = ['Rahul Verma', 'Amit Sharma', 'Sunil Patel', 'Vikram Singh', 'Deepak Joshi', 'Manoj Kumar']
const VEHICLE_MODELS = {
  bike: ['Honda Activa', 'TVS Jupiter'],
  auto: ['Bajaj RE', 'Piaggio Ape'],
  sedan: ['Maruti Dzire', 'Honda City'],
  suv: ['Mahindra XUV300', 'Toyota Innova'],
}
const FUEL_TYPES = { bike: 'Petrol', auto: 'CNG', sedan: 'Petrol', suv: 'Diesel' }

function pick(list, seed) {
  return list[Math.floor(seededRandom(seed, 9) * list.length)]
}

/**
 * PLACEHOLDER: driver/vehicle data mocked until the backend exists, but
 * shaped exactly like docs/API_CONTRACT.md's `drivers` and `vehicles`
 * tables so this is the only function that needs to change later.
 */
export function getDriverForRide(ride) {
  const seed = hashString(ride.id + ride.fare + ride.etaMin)
  return {
    name: pick(DRIVER_NAMES, seed),
    rating: ride.driverRating,
    total_rides: 400 + Math.round(seededRandom(seed, 11) * 3200),
    safety_rating: ride.safetyScore / 20, // 0-100 -> 0-5 scale, matches `drivers.safety_rating`
    verification_status: 'verified',
    vehicle: {
      model: pick(VEHICLE_MODELS[ride.id], seed),
      vehicle_type: ride.vehicleLabel,
      vehicle_number: `MP09 ${String.fromCharCode(65 + Math.floor(seededRandom(seed, 13) * 26))}${String.fromCharCode(65 + Math.floor(seededRandom(seed, 17) * 26))} ${1000 + Math.round(seededRandom(seed, 19) * 8999)}`,
      fuel_type: FUEL_TYPES[ride.id],
      capacity: ride.capacity,
    },
  }
}

// Demo city center (Indore) — no real geocoding backend yet, so pickup/
// destination are mocked as small deterministic offsets from this point.
const CITY_CENTER = { lat: 22.7196, lng: 75.8577 }

export function getRouteCoordinates(pickup, destination) {
  const seed = hashString(`${pickup}::${destination}`)
  const pickupOffset = { lat: (seededRandom(seed, 21) - 0.5) * 0.06, lng: (seededRandom(seed, 22) - 0.5) * 0.06 }
  const destOffset = { lat: (seededRandom(seed, 23) - 0.5) * 0.06, lng: (seededRandom(seed, 24) - 0.5) * 0.06 }
  return {
    pickup: { lat: CITY_CENTER.lat + pickupOffset.lat, lng: CITY_CENTER.lng + pickupOffset.lng },
    destination: { lat: CITY_CENTER.lat + destOffset.lat, lng: CITY_CENTER.lng + destOffset.lng },
  }
}

/**
 * PLACEHOLDER: ride history — no `rides`/`ride_insights` backend tables
 * yet, so this is a fixed mock list shaped like those two tables merged
 * (docs/API_CONTRACT.md), for the Activity and Insights tabs to read.
 */
const RIDE_HISTORY = [
  { id: 'h1', pickup: 'Vijay Nagar Square', destination: 'Rajwada', vehicleLabel: 'Auto', distance: 6.2, actual_duration: 19, actual_fare: 96, safety_score: 88, eco_score: 80, co2_estimate: 0.7, time_saved: 4, completed_at: '2026-09-12' },
  { id: 'h2', pickup: 'MG Road', destination: 'Airport', vehicleLabel: 'Sedan', distance: 11.4, actual_duration: 28, actual_fare: 214, safety_score: 93, eco_score: 55, co2_estimate: 1.9, time_saved: 6, completed_at: '2026-09-10' },
  { id: 'h3', pickup: 'Bhawarkuan', destination: 'Vijay Nagar Square', vehicleLabel: 'Bike', distance: 4.8, actual_duration: 14, actual_fare: 52, safety_score: 81, eco_score: 92, co2_estimate: 0.2, time_saved: 2, completed_at: '2026-09-08' },
  { id: 'h4', pickup: 'Central Station', destination: 'Rajwada', vehicleLabel: 'Auto', distance: 3.1, actual_duration: 11, actual_fare: 48, safety_score: 85, eco_score: 78, co2_estimate: 0.4, time_saved: 3, completed_at: '2026-09-05' },
  { id: 'h5', pickup: 'Airport', destination: 'MG Road', vehicleLabel: 'SUV', distance: 12.0, actual_duration: 31, actual_fare: 289, safety_score: 95, eco_score: 40, co2_estimate: 2.4, time_saved: 8, completed_at: '2026-09-02' },
]

export function getRideHistory() {
  return RIDE_HISTORY
}
