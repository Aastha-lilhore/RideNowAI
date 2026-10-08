import { createContext, useContext, useEffect, useState } from 'react'

/**
 * The ONE place the current user lives (per AI_FRONTEND_MASTER_PROMPT.md's
 * "Profile/settings belong to one account area" rule) — previously there
 * was no shared session state at all; pages passed fragments of the user
 * object to each other via one-off route state, which broke on refresh
 * or direct navigation. Persists to localStorage so a page refresh
 * doesn't lose the session (mirrors the token apiClient.js already
 * stores).
 */
const AuthContext = createContext(null)

const STORAGE_KEY = 'ridenow_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  function login(sessionUser) {
    setUser(sessionUser)
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('ridenow_token')
  }

  function updateProfile(updates) {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  return <AuthContext.Provider value={{ user, login, logout, updateProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
