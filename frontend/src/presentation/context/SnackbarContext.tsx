import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { clsx } from 'clsx'

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
  const [visible, setVisible] = useState(false)

  const showError = useCallback((msg: string) => {
    setMessage(msg)
    setOpen(true)
    setVisible(false)
    // allow re-mount animation
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => setOpen(false), 5000)
    return () => clearTimeout(timer)
  }, [open])

  return (
    <SnackbarContext.Provider value={{ showError }}>
      {children}
      {open && (
        <div
          role="alert"
          aria-live="assertive"
          className={clsx(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]',
            'flex items-center gap-3',
            'bg-gray-800 border border-red-500/40 text-red-300',
            'rounded-xl shadow-2xl px-4 py-3 text-sm font-medium',
            'transition-all duration-300',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          )}
        >
          <span>{message}</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Dismiss"
            className="ml-1 text-red-400 hover:text-red-200 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </SnackbarContext.Provider>
  )
}
