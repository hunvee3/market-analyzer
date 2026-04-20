import { useEffect, useRef, useState } from 'react'
import type { BarcodeDecoderPort, BarcodeDecoderSession } from '@application/purchase/ports/BarcodeDecoder.port'
import {
  scanContainer,
  scanPreviewTarget,
  scanLoadingState,
  scanLoadingSpinner,
} from './BarcodeScannerView.styles'

export type FallbackReason = 'permission_denied' | 'no_camera' | 'timeout' | 'error' | 'mid_session_error'

interface BarcodeScannerViewProps {
  decoder: BarcodeDecoderPort
  onDetected: (barcode: string) => void
  onFallback: (reason: FallbackReason) => void
}

const SCAN_TIMEOUT_MS = 8000

function mapErrorToFallbackReason(error: Error): FallbackReason {
  if (error.name === 'NotAllowedError') return 'permission_denied'
  if (error.name === 'NotFoundError') return 'no_camera'
  return 'error'
}

export function BarcodeScannerView({ decoder, onDetected, onFallback }: BarcodeScannerViewProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<BarcodeDecoderSession | null>(null)
  const hasDetectedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout>

    async function startDecoder() {
      if (!targetRef.current) return

      const session = await decoder.start({
        targetElement: targetRef.current,
        onDetected(result) {
          if (hasDetectedRef.current) return
          hasDetectedRef.current = true
          clearTimeout(timeoutId)
          session.stop()
          onDetected(result.code)
        },
        onError(error) {
          if (cancelled) return
          clearTimeout(timeoutId)
          onFallback(mapErrorToFallbackReason(error))
        },
        onStreamError(error) {
          if (cancelled) return
          void error
          clearTimeout(timeoutId)
          session.stop()
          onFallback('mid_session_error')
        },
      })

      if (cancelled) {
        session.stop()
        return
      }

      sessionRef.current = session
      setIsLoading(false)

      timeoutId = setTimeout(() => {
        if (!hasDetectedRef.current) {
          session.stop()
          onFallback('timeout')
        }
      }, SCAN_TIMEOUT_MS)
    }

    void startDecoder()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      sessionRef.current?.stop()
      sessionRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={scanContainer}>
      {isLoading && (
        <div className={scanLoadingState} aria-live="polite">
          <div className={scanLoadingSpinner} aria-hidden="true" />
          <span>Starting camera…</span>
        </div>
      )}

      {/* Always in DOM so quagga2 can render into it; hidden while loading */}
      <div
        ref={targetRef}
        hidden={isLoading}
        className={scanPreviewTarget}
        aria-label="Camera barcode scanner"
      />
    </div>
  )
}
