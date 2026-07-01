import { useState, useEffect, useRef } from 'react'

const DEBOUNCE_DELAY = 300

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = `gantt_${key}`
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(prefixedKey)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${prefixedKey}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(prefixedKey, JSON.stringify(storedValue))
      } catch (error) {
        console.error(`Error setting localStorage key "${prefixedKey}":`, error)
      }
    }, DEBOUNCE_DELAY)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [prefixedKey, storedValue])

  return [storedValue, setStoredValue]
}
