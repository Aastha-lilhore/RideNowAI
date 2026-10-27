
/**
 * Ride search + AI scoring service.
 */
import apiClient, { USE_MOCKS } from './apiClient.js'

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Bike', baseFare: 20, perKm: 6, perMin: 1, capacity: 1, driverRatingBase: 4.5, ecoBase: 92, routeSafetyBase: 76, historyBase: 88 },
  { id: 'auto', label: 'Auto', baseFare: 30, perKm: 9, perMin: 1.2, capacity: 3, driverRatingBase: 4.3, ecoBase: 80, routeSafetyBase: 80, historyBase: 85 },
  { id: 'sedan', label: 'Sedan', baseFare: 60, perKm: 13, perMin: 1.5, capacity: 4, driverRatingBase: 4.7, ecoBase: 55, routeSafetyBase: 90, historyBase: 92 },
  { id: 'suv', label: 'SUV', baseFare: 90, perKm: 17, perMin: 1.8, capacity: 6, driverRatingBase: 4.6, ecoBase: 40, routeSafetyBase: 92, historyBase: 90 },
]

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function seededRandom(seed, salt) {
  const x = Math.sin(seed + salt) * 10000
  return x - Math.floor(x)
}

function timeOfDayMultiplier() {
  const hour = new Date().getHours()
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20)
  return isPeak ? 1.15 : 1.0
}

function predictFare(vehicle, distanceKm, durationMin) {
  const trafficMultiplier = 1.15
  const demandMultiplier = 1.0
  const weatherMultiplier = 1.0
  const base = vehicle.baseFare + vehicle.perKm * distanceKm + vehicle.perMin * durationMin
  return Math.round(base * trafficMultiplier * demandMultiplier * weatherMultiplier * timeOfDayMultiplier())
}

function safetyLabel(score) {
  if (score >= 85) return 'Very Safe'
  if (score >= 70) return 'Safe'
  if (score >= 40) return 'Moderate'
  return 'High Risk'
}

function computeSafetyScore(vehicle, seed) {
  const driverRatingScore = (vehicle.driverRatingBase / 5) * 100
  const driverHistoryScore = vehicle.historyBase + seededRandom(seed, 1) * 6 - 3
  const routeSafetyScore = vehicle.routeSafetyBase + seededRandom(seed, 2) * 8 - 4
  const timeOfDayScore = timeOfDayMultiplier() > 1 ? 65 : 90
  const trafficScore = 78
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

function computeEcoScore(vehicle, seed) {
  return Math.round(Math.min(100, Math.max(0, vehicle.ecoBase + seededRandom(seed, 4) * 6 - 3)))
}

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
        0.4 * (ride.safetyScore / 100) +
        0.3 * costEfficiency +
        0.2 * timeEfficiency +
        0.1 * (ride.ecoScore / 100)

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
 * Search rides through the backend or local mock service.
 */
export function searchRides({ pickup, destination, priority }) {
  if (!USE_MOCKS) {
    const coordinates = getRouteCoordinates(pickup, destination)

    const backendPriority = {
      ai: 'balanced',
      safest: 'safety',
      cheapest: 'cheap',
      fastest: 'fast',
      eco: 'eco',
    }[priority] || 'balanced'

    return apiClient.post('/api/rides/search', {
      pickup: {
        latitude: coordinates.pickup.lat,
        longitude: coordinates.pickup.lng,
      },
      destination: {
        latitude: coordinates.destination.lat,
        longitude: coordinates.destination.lng,
      },
      priority: backendPriority,
    }).then((res) => {
      const data = res.data

      return {
        pickup,
        destination,
        distanceKm: data.estimated_distance_km,
        rides: data.rides.map((ride) => ({
          id: ride.ride_id,
          vehicleLabel: ride.vehicle_type,
          fare: ride.estimated_fare,
          etaMin: ride.estimated_duration,
          distanceKm: ride.distance_km,
          safetyScore: ride.safety_score,
          safetyLabel: ride.safety_score >= 85
            ? 'Very Safe'
            : ride.safety_score >= 70
              ? 'Safe'
              : 'Moderate',
          ecoScore: ride.eco_score,
          capacity: {
            Bike: 1,
            Auto: 3,
            Mini: 4,
            Sedan: 4,
          }[ride.vehicle_type] || 4,
          driverRating: 4.5,
        })),
      }
    })
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const seed = hashString(`${pickup}->${destination}`)
      const distanceKm = 3 + (seed % 1200) / 100
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

      resolve({
        rides,
        distanceKm: Math.round(distanceKm * 10) / 10,
        pickup,
        destination,
      })
    }, 500)
  })
}

const DRIVER_NAMES = [
  'Rahul Verma',
  'Amit Sharma',
  'Sunil Patel',
  'Vikram Singh',
  'Deepak Joshi',
  'Manoj Kumar',
]

const VEHICLE_MODELS = {
  bike: ['Honda Activa', 'TVS Jupiter'],
  auto: ['Bajaj RE', 'Piaggio Ape'],
  sedan: ['Maruti Dzire', 'Honda City'],
  suv: ['Mahindra XUV300', 'Toyota Innova'],
}

const FUEL_TYPES = {
  bike: 'Petrol',
  auto: 'CNG',
  sedan: 'Petrol',
  suv: 'Diesel',
}

function pick(list, seed) {
  return list[Math.floor(seededRandom(seed, 9) * list.length)]
}

/**
 * Generate demo driver and vehicle details.
 */
export function getDriverForRide(ride) {
  const seed = hashString(String(ride.id) + ride.fare + ride.etaMin)

  const vehicleKeyMap = {
    bike: 'bike',
    auto: 'auto',
    mini: 'sedan',
    sedan: 'sedan',
    suv: 'suv',
  }

  const vehicleKey =
    vehicleKeyMap[String(ride.vehicleLabel || '').toLowerCase()] || 'sedan'

  const safetyScore = ride.safetyScore ?? 80

  return {
    name: pick(DRIVER_NAMES, seed),
    rating: ride.driverRating ?? 4.5,
    total_rides: 400 + Math.round(seededRandom(seed, 11) * 3200),
    safety_rating: safetyScore / 20,
    verification_status: 'verified',
    phone: `+91 9${100000000 + Math.floor(seededRandom(seed, 27) * 899999999)}`,
    vehicle: {
      model: pick(VEHICLE_MODELS[vehicleKey], seed),
      vehicle_type: ride.vehicleLabel || 'Sedan',
      vehicle_number: `MP09 ${String.fromCharCode(65 + Math.floor(seededRandom(seed, 13) * 26))}${String.fromCharCode(65 + Math.floor(seededRandom(seed, 17) * 26))} ${1000 + Math.round(seededRandom(seed, 19) * 8999)}`,
      fuel_type: FUEL_TYPES[vehicleKey],
      capacity: ride.capacity ?? 4,
    },
  }
}


/**
 * The driver card shown on Ride Details BEFORE the user confirms.
 * Mock mode: a deterministic preview, same driver the booking returns.
 * Real mode: a driver is only assigned by POST /api/rides/book.
 */
export function previewDriver(ride) {
  if (!USE_MOCKS) return ride.driver || null
  return getDriverForRide(ride)
}

/**
 * Confirm Ride.
 * Resolves { ride, driver } for a successful booking.
 */

/**
 * Book a ride using the selected ride object or ride ID.
 */
export function bookRide(rideOrId) {
  const ride =
    typeof rideOrId === 'object' && rideOrId !== null
      ? rideOrId
      : null

  const rideId = ride ? ride.id : rideOrId

  if (!USE_MOCKS) {
    return apiClient
      .post('/api/rides/book', { ride_id: rideId })
      .then((res) => {
        const data = res.data
        const bookedRide = data.ride || data
        const driver = data.driver || bookedRide.driver

        if (!driver) {
          return Promise.reject({
            error: 'Your ride was booked, but no driver was assigned yet.',
          })
        }

        return {
          ride: ride ? { ...ride, ...bookedRide } : bookedRide,
          driver,
        }
      })
  }

  if (!ride) {
    return Promise.reject(
      new Error('Mock booking requires the selected ride object.')
    )
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ride, driver: getDriverForRide(ride) })
    }, 600)
  })
}


// Demo city center (Indore). Coordinates are mocked, not real geocoding.

const CITY_CENTER = { lat: 22.7196, lng: 75.8577 }

export function getRouteCoordinates(pickup, destination) {
  const seed = hashString(`${pickup}::${destination}`)
  const pickupOffset = {
    lat: (seededRandom(seed, 21) - 0.5) * 0.06,
    lng: (seededRandom(seed, 22) - 0.5) * 0.06,
  }
  const destOffset = {
    lat: (seededRandom(seed, 23) - 0.5) * 0.06,
    lng: (seededRandom(seed, 24) - 0.5) * 0.06,
  }

  return {
    pickup: {
      lat: CITY_CENTER.lat + pickupOffset.lat,
      lng: CITY_CENTER.lng + pickupOffset.lng,
    },
    destination: {
      lat: CITY_CENTER.lat + destOffset.lat,
      lng: CITY_CENTER.lng + destOffset.lng,
    },
  }
}



/**
 * Demo ride history.
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

/**
 * Demo route anomaly detection.
 */
export function getAnomalyPlan(ride) {
  const seed = hashString(`${ride.id}-anomaly`)
  const hasAnomaly = seededRandom(seed, 31) > 0.5

  if (!hasAnomaly) return { hasAnomaly: false }

  const startProgress = 0.35 + seededRandom(seed, 32) * 0.2

  return {
    hasAnomaly: true,
    startProgress,
    endProgress: startProgress + 0.22,
    deviationMeters: 500 + Math.round(seededRandom(seed, 33) * 400),
    deviationMinutes: 2 + Math.round(seededRandom(seed, 34) * 3),
  }
}
