import * as React from 'react'
import type { ThemeName, Density } from '@/types'

export type ThemeContextValue = {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  density: Density
  setDensity: (density: Density) => void
  reduceMotion: boolean
  setReduceMotion: (reduceMotion: boolean) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}

export interface ThemeProviderProps {
  theme?: ThemeName
  density?: Density
  reduceMotion?: boolean
  onThemeChange?: (theme: ThemeName) => void
  onDensityChange?: (density: Density) => void
  children: React.ReactNode
}

export function ThemeProvider({
  theme = 'dark',
  density = 'cozy',
  reduceMotion = false,
  onThemeChange,
  onDensityChange,
  children,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeName>(theme)
  const [currentDensity, setCurrentDensity] = React.useState<Density>(density)
  const [currentReduceMotion, setCurrentReduceMotion] = React.useState<boolean>(reduceMotion)

  React.useEffect(() => {
    document.documentElement.dataset.theme = currentTheme
    document.documentElement.dataset.density = currentDensity
  }, [currentTheme, currentDensity])

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setCurrentReduceMotion(mq.matches)
    mq.addEventListener('change', handleChange)
    setCurrentReduceMotion(mq.matches)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const setTheme = (next: ThemeName) => {
    setCurrentTheme(next)
    onThemeChange?.(next)
  }

  const setDensity = (next: Density) => {
    setCurrentDensity(next)
    onDensityChange?.(next)
  }

  const value: ThemeContextValue = {
    theme: currentTheme,
    setTheme,
    density: currentDensity,
    setDensity,
    reduceMotion: currentReduceMotion,
    setReduceMotion: setCurrentReduceMotion,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
