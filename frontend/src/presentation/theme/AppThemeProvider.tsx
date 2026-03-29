import { createContext, useContext, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './theme'

interface ColorModeContextType {
  toggleColorMode: () => void
  mode: 'light' | 'dark'
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => undefined,
  mode: 'light',
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const colorMode = useMemo<ColorModeContextType>(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode],
  )

  const theme = mode === 'light' ? lightTheme : darkTheme

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
