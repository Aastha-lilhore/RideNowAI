/**
 * Auth service layer (docs/API_CONTRACT.md -> ### Auth).
 *
 * PLACEHOLDER: the backend isn't ready yet, so these functions resolve
 * with mock data instead of calling the real endpoints. The request/response
 * shape matches the contract exactly:
 *   POST /api/auth/register  { name, email, phone, password, gender } -> { user, token }
 *   POST /api/auth/login     { email, password }                     -> { user, token } | { error }
 * so swapping the mock body for a real axios call is a change inside this
 * file only — nothing that imports these functions needs to change.
 */

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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!name || !email || !password) {
        reject({ error: 'Name, email and password are required.' })
        return
      }
      resolve({ user: mockUser({ name, email, phone, gender }), token: 'mock-token' })
    }, MOCK_DELAY_MS)
  })
}

export function login({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) {
        reject({ error: 'Email and password are required.' })
        return
      }
      resolve({ user: mockUser({ name: 'Demo User', email }), token: 'mock-token' })
    }, MOCK_DELAY_MS)
  })
}

/**
 * PLACEHOLDER: Google sign-in (docs/REQUIREMENTS.md -> Authentication ->
 * "Optional Google sign-in"). No real OAuth flow exists yet — there's no
 * backend to exchange a Google token with — so this just mocks a
 * successful sign-in after a short delay. Swapping in the real Google
 * Identity Services flow later only touches this function.
 */
export function loginWithGoogle() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ user: mockUser({ name: 'Google User', email: 'demo.user@gmail.com' }), token: 'mock-token' })
    }, MOCK_DELAY_MS)
  })
}
