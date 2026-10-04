/**
 * Auth service layer (docs/API_CONTRACT.md -> ### Auth).
 *
 * Wired for backend swap: with VITE_USE_MOCKS=false (see .env.example)
 * these call the real endpoints exactly as API_CONTRACT.md defines them.
 * Nothing that imports register/login/loginWithGoogle needs to change
 * either way — same request shape in, same `{ user, token }` shape out.
 */
import apiClient, { USE_MOCKS, persistSession } from './apiClient.js'

const MOCK_DELAY_MS = 600

function mockUser({ name, email, phone, gender }) {
  return {
    id: 'mock-user-1',
    name: name || 'Demo User',
    email,
    phone: phone || '',
    gender: gender || '',
    profile_photo: null,
    safety_mode: false,
    created_at: new Date().toISOString(),
  }
}

export function register({ name, email, phone, password, gender }) {
  if (!USE_MOCKS) {
    return apiClient.post('/api/auth/register', { name, email, phone, password, gender }).then((res) => {
      persistSession(res.data)
      return res.data
    })
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!name || !email || !password) {
        reject({ error: 'Name, email and password are required.' })
        return
      }
      const session = { user: mockUser({ name, email, phone, gender }), token: 'mock-token' }
      persistSession(session)
      resolve(session)
    }, MOCK_DELAY_MS)
  })
}

export function login({ email, password }) {
  if (!USE_MOCKS) {
    return apiClient.post('/api/auth/login', { email, password }).then((res) => {
      persistSession(res.data)
      return res.data
    })
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject({ error: 'Email and password are required.' })
        return
      }
      const session = { user: mockUser({ name: 'Demo User', email }), token: 'mock-token' }
      persistSession(session)
      resolve(session)
    }, MOCK_DELAY_MS)
  })
}

/**
 * PLACEHOLDER regardless of USE_MOCKS: Google sign-in needs the actual
 * Google Identity Services SDK wired in separately (docs/REQUIREMENTS.md
 * -> Authentication -> "Optional Google sign-in") — there's no backend
 * endpoint for it in API_CONTRACT.md yet. Add one there first.
 */
export function loginWithGoogle() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = { user: mockUser({ name: 'Google User', email: 'demo.user@gmail.com' }), token: 'mock-token' }
      persistSession(session)
      resolve(session)
    }, MOCK_DELAY_MS)
  })
}
