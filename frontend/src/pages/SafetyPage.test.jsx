import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import SafetyPage from './SafetyPage.jsx'

const mount = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <SafetyPage />
      </AuthProvider>
    </MemoryRouter>,
  )
const signInAs = (email) => localStorage.setItem('ridenow_user', JSON.stringify({ name: 'T U', email }))

describe('Safety settings', () => {
  it('keeps Safety Mode and a trusted contact after a refresh', async () => {
    signInAs('a@x.com')
    const user = userEvent.setup()
    mount()
    await user.click(screen.getByLabelText(/Women's Safety Mode/))
    await user.type(screen.getByLabelText('Name'), 'Mom')
    await user.type(screen.getByLabelText('Phone number'), '9876543210')
    await user.click(screen.getByRole('button', { name: 'Add contact' }))
    expect(screen.getByText('Mom')).toBeTruthy()

    cleanup() // simulate a refresh: unmount, then mount fresh
    mount()
    expect(screen.getByText('Mom')).toBeTruthy()
    expect(screen.getByText('SAFETY MODE ACTIVE')).toBeTruthy()
    expect(screen.getByText('Add another contact')).toBeTruthy()
  })

  it('supports more than one trusted contact, with the first marked primary', async () => {
    signInAs('a@x.com')
    const user = userEvent.setup()
    mount()
    for (const [name, phone] of [['Mom', '111'], ['Sam', '222']]) {
      if (!screen.queryByLabelText('Name')) await user.click(screen.getByText('Add another contact'))
      await user.type(screen.getByLabelText('Name'), name)
      await user.type(screen.getByLabelText('Phone number'), phone)
      await user.click(screen.getByRole('button', { name: 'Add contact' }))
    }
    expect(screen.getByText('Mom')).toBeTruthy()
    expect(screen.getByText('Sam')).toBeTruthy()
    expect(screen.getAllByLabelText('Primary contact')).toHaveLength(1)
  })

  it('does not leak settings to a different user', async () => {
    signInAs('a@x.com')
    const user = userEvent.setup()
    mount()
    await user.click(screen.getByLabelText(/Women's Safety Mode/))
    cleanup()

    signInAs('b@x.com')
    mount()
    expect(screen.queryByText('SAFETY MODE ACTIVE')).toBeNull()
  })

  it('survives corrupted stored data', () => {
    signInAs('a@x.com')
    localStorage.setItem('ridenow_contacts_a@x.com', '{not json')
    mount()
    expect(screen.getByText('Trusted contacts')).toBeTruthy()
  })
})
