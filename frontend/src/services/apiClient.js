import axios from 'axios'

/**
 * Set VITE_API_BASE_URL and VITE_USE_MOCKS=false in frontend/.env once the
 * backend exists (see .env.example). Until then every service defaults to
 * its mock implementation.
 */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// Attaches the auth token from register/login to every request, once real
// auth is wired in (see authService.js).
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ridenow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function persistSession({ token }) {
  if (token) localStorage.setItem('ridenow_token', token)
}

export default apiClient
