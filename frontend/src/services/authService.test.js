import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { register, login } from './authService.js'

async function settle(promise) {
  const result = promise.then(
    (value) => ({ ok: true, value }),
    (error) => ({ ok: false, error }),
  )
  await vi.advanceTimersByTimeAsync(1000)
  return result
}

describe('mock auth service (VITE_USE_MOCKS defaults to true)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('register rejects with the contract error shape when fields are missing', async () => {
    const res = await settle(register({ name: '', email: '', password: '' }))
    expect(res.ok).toBe(false)
    expect(res.error).toEqual({ error: expect.stringContaining('required') })
  })

  it('register returns { user, token } and stores the token', async () => {
    const res = await settle(register({ name: 'Asha K', email: 'asha@example.com', password: 'pw' }))
    expect(res.ok).toBe(true)
    expect(res.value.user.email).toBe('asha@example.com')
    expect(res.value.token).toBeTruthy()
    expect(localStorage.getItem('ridenow_token')).toBe(res.value.token)
  })

  it('login rejects without a password', async () => {
    const res = await settle(login({ email: 'asha@example.com', password: '' }))
    expect(res.ok).toBe(false)
    expect(res.error.error).toBeTruthy()
  })

  it('login returns { user, token }', async () => {
    const res = await settle(login({ email: 'asha@example.com', password: 'pw' }))
    expect(res.ok).toBe(true)
    expect(res.value.user.email).toBe('asha@example.com')
  })
})
