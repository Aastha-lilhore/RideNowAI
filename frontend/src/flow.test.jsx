import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

/**
 * The main happy path end to end, against the mock services:
 * sign up -> dashboard -> search -> ranked results -> pick a ride -> confirm.
 */
describe('core ride flow', () => {
  it('signs up, searches, picks a ride and confirms it', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/auth?tab=signup']}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )

    // sign up
    await user.type(screen.getByLabelText('Full name'), 'Asha Kumar')
    await user.type(screen.getByLabelText('Email'), 'asha@example.com')
    await user.type(screen.getByLabelText('Password'), 'pw12345')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    // dashboard greets the new user; enter a route
    expect(await screen.findByText(/Good to see you, Asha Kumar/, {}, { timeout: 4000 })).toBeTruthy()
    await user.type(screen.getByLabelText('Pickup location'), 'MG Road')
    await user.type(screen.getByLabelText('Destination'), 'Central Station')
    await user.click(screen.getByRole('button', { name: 'Find a Ride' }))

    // search page is prefilled from the dashboard; run the search
    // (the Dashboard stays on screen until the lazy Search chunk loads, so wait
    // for a heading that only exists on the Search page)
    expect(await screen.findByRole('heading', { name: 'Find a ride' })).toBeTruthy()
    expect(screen.getByDisplayValue('MG Road')).toBeTruthy()
    expect(screen.getByDisplayValue('Central Station')).toBeTruthy()
    await user.click(await screen.findByRole('button', { name: 'Search Rides' }))

    // ranked results, with exactly one AI top pick
    expect(await screen.findByText('Ride options', {}, { timeout: 4000 })).toBeTruthy()
    expect(screen.getAllByText('AI TOP PICK')).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Select' })).toHaveLength(4)

    // pick one -> ride details with the driver and a confirm button
    await user.click(screen.getAllByRole('button', { name: 'Select' })[0])
    expect(await screen.findByText('Confirm your ride')).toBeTruthy()
    expect(screen.getByText(/Estimated fare/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Confirm Ride' })).toBeTruthy()
  }, 20000)
})
