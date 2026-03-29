import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter'
import App from './App.tsx'
import { AppThemeProvider } from '@presentation/theme/AppThemeProvider'
import { SnackbarProvider } from '@presentation/context/SnackbarContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </AppThemeProvider>
  </StrictMode>,
)
