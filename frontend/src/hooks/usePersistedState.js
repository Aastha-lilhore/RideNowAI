import { useEffect, useState } from 'react'

/**
 * useState that survives a page refresh by mirroring itself to
 * localStorage. Used for settings that have no backend endpoint yet
 * (Safety Mode, trusted contacts) so they don't silently reset. Falls
 * back to the initial value if storage is unavailable or corrupted.
 */
export default function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or blocked — keep working in memory
    }
  }, [key, value])

  return [value, setValue]
}
