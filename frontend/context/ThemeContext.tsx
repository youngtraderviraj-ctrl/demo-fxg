'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (value: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedTheme = (typeof window !== 'undefined' && localStorage.getItem('fxg-theme')) as ThemeMode | null
    if (storedTheme) {
      setTheme(storedTheme)
      setIsReady(true)
      return
    }

    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    document.documentElement.dataset.theme = theme
    localStorage.setItem('fxg-theme', theme)
  }, [theme, isReady])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
