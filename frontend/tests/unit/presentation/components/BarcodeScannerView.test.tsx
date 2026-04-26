import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BarcodeScannerView } from '@presentation/components/BarcodeScannerView/BarcodeScannerView'
import type { BarcodeDecoderPort, BarcodeDecoderSession, BarcodeDecoderStartOptions } from '@application/purchase/ports/BarcodeDecoder.port'

function createMockDecoder(behaviour?: {
  onInit?: (options: BarcodeDecoderStartOptions) => void
}) {
  const mockSession: BarcodeDecoderSession = { stop: vi.fn() }

  const decoder: BarcodeDecoderPort = {
    start: vi.fn((options: BarcodeDecoderStartOptions) => {
      behaviour?.onInit?.(options)
      return Promise.resolve(mockSession)
    }),
  }

  return { decoder, mockSession }
}

describe('BarcodeScannerView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows loading state on mount before decoder resolves', async () => {
    let resolveStart!: (session: BarcodeDecoderSession) => void
    const decoder: BarcodeDecoderPort = {
      start: vi.fn(
        () => new Promise<BarcodeDecoderSession>((r) => { resolveStart = r }),
      ),
    }

    render(
      <BarcodeScannerView
        decoder={decoder}
        onDetected={vi.fn()}
        onFallback={vi.fn()}
      />,
    )

    expect(screen.getByText(/starting camera/i)).toBeInTheDocument()

    // cleanup: resolve to avoid act() warnings
    await act(async () => {
      resolveStart({ stop: vi.fn() })
    })
  })

  it('renders camera preview container once decoder starts', async () => {
    const { decoder } = createMockDecoder()

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={vi.fn()}
        />,
      )
    })

    // After start() resolves, loading ends and the preview is visible
    expect(
      screen.getByLabelText(/camera barcode scanner/i),
    ).not.toHaveAttribute('hidden')
  })

  it('calls onDetected once with the barcode code when decoder fires onDetected', async () => {
    const onDetected = vi.fn()
    let capturedOptions!: BarcodeDecoderStartOptions

    const { decoder } = createMockDecoder({
      onInit: (opts) => { capturedOptions = opts },
    })

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={onDetected}
          onFallback={vi.fn()}
        />,
      )
    })

    act(() => {
      capturedOptions.onDetected({ code: '5901234123457', format: 'ean_13' })
    })
    // Second call should be ignored (deduplication)
    act(() => {
      capturedOptions.onDetected({ code: '5901234123457', format: 'ean_13' })
    })

    expect(onDetected).toHaveBeenCalledOnce()
    expect(onDetected).toHaveBeenCalledWith('5901234123457')
  })

  it('calls session.stop() after barcode is detected', async () => {
    let capturedOptions!: BarcodeDecoderStartOptions
    const { decoder, mockSession } = createMockDecoder({
      onInit: (opts) => { capturedOptions = opts },
    })

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={vi.fn()}
        />,
      )
    })

    act(() => {
      capturedOptions.onDetected({ code: '012345678905', format: 'upc_a' })
    })

    expect(mockSession.stop).toHaveBeenCalledOnce()
  })

  it('calls session.stop() on unmount', async () => {
    const { decoder, mockSession } = createMockDecoder()

    const { unmount } = await act(async () =>
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={vi.fn()}
        />,
      ),
    )

    unmount()
    expect(mockSession.stop).toHaveBeenCalled()
  })

  // T021a — timeout
  it('calls session.stop() and onFallback("timeout") when 8 seconds pass without detection', async () => {
    const onFallback = vi.fn()
    const { decoder, mockSession } = createMockDecoder()

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={onFallback}
        />,
      )
    })

    await act(async () => {
      vi.advanceTimersByTime(8000)
    })

    expect(mockSession.stop).toHaveBeenCalled()
    expect(onFallback).toHaveBeenCalledWith('timeout')
  })

  it('does NOT fire timeout fallback if barcode is detected before 8 seconds', async () => {
    const onFallback = vi.fn()
    let capturedOptions!: BarcodeDecoderStartOptions

    const { decoder } = createMockDecoder({
      onInit: (opts) => { capturedOptions = opts },
    })

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={onFallback}
        />,
      )
    })

    // Detect before timeout fires
    act(() => {
      capturedOptions.onDetected({ code: '123', format: 'ean_13' })
    })

    await act(async () => {
      vi.advanceTimersByTime(8000)
    })

    expect(onFallback).not.toHaveBeenCalledWith('timeout')
  })

  // T022b — mid-session error
  it('calls onFallback("mid_session_error") and session.stop() when onStreamError fires', async () => {
    const onFallback = vi.fn()
    let capturedOptions!: BarcodeDecoderStartOptions

    const { decoder, mockSession } = createMockDecoder({
      onInit: (opts) => { capturedOptions = opts },
    })

    await act(async () => {
      render(
        <BarcodeScannerView
          decoder={decoder}
          onDetected={vi.fn()}
          onFallback={onFallback}
        />,
      )
    })

    act(() => {
      capturedOptions.onStreamError?.(new Error('Stream lost'))
    })

    expect(onFallback).toHaveBeenCalledWith('mid_session_error')
    expect(mockSession.stop).toHaveBeenCalled()
  })
})
