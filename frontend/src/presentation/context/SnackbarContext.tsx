import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { Snackbar, Alert } from '@mui/material'

interface SnackbarContextType {
  showError: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType>({
  showError: () => undefined,
})

export function useSnackbar() {
  return useContext(SnackbarContext)
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const showError = useCallback((msg: string) => {
    setMessage(msg)
    setOpen(true)
  }, [])

  return (
    <SnackbarContext.Provider value={{ showError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setOpen(false)} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}
