import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import RideDetailsPage from './RideDetailsPage.jsx'
import { previewDriver, bookRide } from '../services/rideService.js'

vi.mock('../services/rideService.js', () => ({
  previewDriver: vi.fn(),
  bookRide: vi.fn(),
}))

const RIDE = {
  id: 'sedan',
  vehicleLabel: 'Sedan',
  fare: 200,
  etaMin: 15,
  distanceKm: 6.4,
  safetyScore: 90,
  ecoScore: 55,
}

const PREVIEW_DRIVER = {
  name: 'Rahul Verma',
  rating: 4.7,
  total_rides: 1200,
  verification_status: 'verified',
  phone: '+91 90000 00000',
  vehicle: { model: 'Maruti Dzire', vehicle_number: 'MP09 AB 1234', fuel_type: 'Petrol', capacity: 4 },
}

// Stands in for Live Ride (which needs a map) and shows what it was handed.
function LiveRideStub() {
  const { state } = useLocation()
  return <p>Tracking {state.driver.name}</p>
}

function renderPage() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/ride-details', state: { ride: RIDE, pickup: 'MG Road', destination: 'Central Station' } }]}
    >
      <Routes>
        <Route path="/ride-details" element={<RideDetailsPage />} />
        <Route path="/live-ride" element={<LiveRideStub />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Ride Details booking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    previewDriver.mockReturnValue(PREVIEW_DRIVER)
  })

  it('books the ride and hands the BOOKED driver (not the preview) to Live Ride', async () => {
    const bookedDriver = { ...PREVIEW_DRIVER, name: 'Meera Joshi' }
    bookRide.mockResolvedValue({ ride: RIDE, driver: bookedDriver })
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Confirm Ride' }))

    expect(bookRide).toHaveBeenCalledWith(RIDE)
    expect(await screen.findByText('Tracking Meera Joshi')).toBeTruthy()
  })

  it('shows the error and lets the user try again when booking fails', async () => {
    bookRide.mockRejectedValueOnce({ error: 'No drivers available nearby.' })
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Confirm Ride' }))

    expect(await screen.findByText('No drivers available nearby.')).toBeTruthy()
    const retry = screen.getByRole('button', { name: 'Confirm Ride' })
    expect(retry.disabled).toBe(false)

    bookRide.mockResolvedValueOnce({ ride: RIDE, driver: PREVIEW_DRIVER })
    await user.click(retry)
    expect(await screen.findByText('Tracking Rahul Verma')).toBeTruthy()
  })

  it('disables the button while the booking is in flight', async () => {
    let finishBooking
    bookRide.mockReturnValue(new Promise((resolve) => { finishBooking = resolve }))
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Confirm Ride' }))

    const pending = screen.getByRole('button', { name: 'Booking your ride…' })
    expect(pending.disabled).toBe(true)

    finishBooking({ ride: RIDE, driver: PREVIEW_DRIVER })
    expect(await screen.findByText('Tracking Rahul Verma')).toBeTruthy()
  })

  it('says the driver is assigned on confirmation when there is no preview driver', () => {
    previewDriver.mockReturnValue(null)
    renderPage()

    expect(screen.getByText(/assigned as soon as you confirm/)).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Call/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Confirm Ride' })).toBeTruthy()
  })
})
