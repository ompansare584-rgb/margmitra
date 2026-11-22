import { useEffect, useState } from 'react'

// Like useState, but remembers the value in the browser. Storage can fail (private mode), so every call is guarded.
export function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore: saving is optional
    }
  }, [key, value])
  return [value, setValue]
}
