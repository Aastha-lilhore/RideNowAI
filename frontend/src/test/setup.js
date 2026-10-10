import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom has no ResizeObserver, which Recharts' ResponsiveContainer needs
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
