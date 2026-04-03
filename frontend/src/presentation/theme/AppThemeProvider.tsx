import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface ColorModeContextType {
  isDark: boolean
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextType>({
  isDark: true,
  toggleColorMode: () => undefined,
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return (
    <ColorModeContext.Provider
      value={{ isDark, toggleColorMode: () => setIsDark((prev) => !prev) }}
    >
      {children}
    </ColorModeContext.Provider>
  )
}
