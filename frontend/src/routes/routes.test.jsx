import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import AppRoutes from './AppRoutes.jsx'

function renderAt(path, { signedIn = false } = {}) {
  if (signedIn) {
    localStorage.setItem('ridenow_user', JSON.stringify({ name: 'Test User', email: 't@x.com' }))
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('route guard', () => {
  it.each(['/dashboard', '/search', '/activity', '/safety', '/insights', '/profile'])(
    'signed out: %s redirects to login',
    async (path) => {
      renderAt(path)
      // "Continue with Google" appears only on the Auth screen
      expect(await screen.findByRole('button', { name: /Continue with Google/ })).toBeTruthy()
      expect(screen.queryByText(/Good to see you/)).toBeNull()
    },
  )

  it('signed in: opens the requested screen', async () => {
    renderAt('/dashboard', { signedIn: true })
    expect(await screen.findByText(/Good to see you, Test User/)).toBeTruthy()
  })
})

describe('404', () => {
  it('shows a not-found page for unknown URLs', () => {
    renderAt('/definitely-not-a-page')
    expect(screen.getByText('404')).toBeTruthy()
  })
})

describe('lazy-loaded screens', () => {
  it.each([
    ['/activity', 'Your recent rides.'],
    ['/insights', 'Fare per ride'],
    ['/safety', "Women's Safety Mode"],
    ['/profile', 'Log out'],
    ['/search', 'Find a ride'],
  ])('%s renders once its code has loaded', async (path, text) => {
    renderAt(path, { signedIn: true })
    expect(await screen.findByText(text, {}, { timeout: 5000 })).toBeTruthy()
  })
})
