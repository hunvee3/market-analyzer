import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mock values ─────────────────────────────────────────────────────

const { MockNotFoundException, MockBarcodeFormat, mockControls, mockDecodeFromConstraints } =
  vi.hoisted(() => {
    class MockNotFoundException extends Error {
      constructor() {
        super('Not found in frame')
        this.name = 'NotFoundException'
      }
    }

    // Mirror ZXing's actual BarcodeFormat enum values (from @zxing/library source)
    const MockBarcodeFormat = { EAN_13: 11, EAN_8: 6, UPC_A: 14, UPC_E: 15 } as const

    const mockControls = { stop: vi.fn() }
    const mockDecodeFromConstraints = vi.fn()

    return { MockNotFoundException, MockBarcodeFormat, mockControls, mockDecodeFromConstraints }
  })

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn(() => ({
    decodeFromConstraints: mockDecodeFromConstraints,
  })),
  BarcodeFormat: MockBarcodeFormat,
}))

vi.mock('@zxing/library', () => ({
  NotFoundException: MockNotFoundException,
  DecodeHintType: { POSSIBLE_FORMATS: 2 },
}))

const { ZxingBarcodeDecoder } = await import('@infrastructure/purchase/ZxingBarcodeDecoder')

// ── Helper: capture the decode callback from the last mockDecodeFromConstraints call ──

type DecodeCallback = (result: unknown, error?: unknown) => void

function captureCallback() {
  const capture: { fn: DecodeCallback } = { fn: () => {} }
  mockDecodeFromConstraints.mockImplementation(
    (_constraints: unknown, _video: unknown, cb: DecodeCallback) => {
      capture.fn = cb
      return Promise.resolve(mockControls)
    },
  )
  return capture
}

// ── Test suite ──────────────────────────────────────────────────────────────

describe('ZxingBarcodeDecoder', () => {
  let decoder: InstanceType<typeof ZxingBarcodeDecoder>
  let targetElement: HTMLDivElement

  beforeEach(() => {
    vi.clearAllMocks()
    decoder = new ZxingBarcodeDecoder()
    targetElement = document.createElement('div')
    document.body.appendChild(targetElement)
    // Default: stream starts successfully
    mockDecodeFromConstraints.mockResolvedValue(mockControls)
  })

  // ── Initialisation ────────────────────────────────────────────────────────

  it('injects a <video> element into the target container', async () => {
    await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })
    expect(targetElement.querySelector('video')).not.toBeNull()
  })

  it('requests rear camera at minimum 640×480 resolution', async () => {
    await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })

    const constraints = mockDecodeFromConstraints.mock.calls[0][0] as MediaStreamConstraints
    const video = constraints.video as MediaTrackConstraints
    expect(video.facingMode).toBe('environment')
    expect((video.width as ConstrainULongRange).min).toBeGreaterThanOrEqual(640)
    expect((video.height as ConstrainULongRange).min).toBeGreaterThanOrEqual(480)
  })

  it('resolves with a session object after the stream starts', async () => {
    const session = await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })
    expect(typeof session.stop).toBe('function')
  })

  it('hints ZXing to use only 1D retail formats (EAN-13, EAN-8, UPC-A, UPC-E)', async () => {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const MockReader = vi.mocked(BrowserMultiFormatReader)

    await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })

    const hintsArg = MockReader.mock.calls[0][0] as Map<number, unknown>
    const formats = hintsArg.get(2 /* DecodeHintType.POSSIBLE_FORMATS */) as number[]
    expect(formats).toContain(MockBarcodeFormat.EAN_13)
    expect(formats).toContain(MockBarcodeFormat.EAN_8)
    expect(formats).toContain(MockBarcodeFormat.UPC_A)
    expect(formats).toContain(MockBarcodeFormat.UPC_E)
    expect(formats).toHaveLength(4)
  })

  // ── Startup failure ───────────────────────────────────────────────────────

  it('calls onError and resolves a no-op session when camera permission is denied', async () => {
    const error = Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
    mockDecodeFromConstraints.mockRejectedValue(error)

    const onError = vi.fn()
    const session = await decoder.start({ targetElement, onDetected: vi.fn(), onError })

    expect(onError).toHaveBeenCalledWith(error)
    expect(session).toBeDefined()
    expect(() => session.stop()).not.toThrow()
  })

  it('calls onError when no camera hardware is available', async () => {
    const error = Object.assign(new Error('NotFoundError'), { name: 'NotFoundError' })
    mockDecodeFromConstraints.mockRejectedValue(error)

    const onError = vi.fn()
    await decoder.start({ targetElement, onDetected: vi.fn(), onError })

    expect(onError).toHaveBeenCalledWith(error)
  })

  // ── Session lifecycle ─────────────────────────────────────────────────────

  it('stop() calls controls.stop() to release the camera', async () => {
    const session = await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })
    session.stop()
    expect(mockControls.stop).toHaveBeenCalledOnce()
  })

  it('stop() is idempotent — calling it twice only releases the camera once', async () => {
    const session = await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn() })
    session.stop()
    session.stop()
    expect(mockControls.stop).toHaveBeenCalledOnce()
  })

  // ── Barcode detection ─────────────────────────────────────────────────────

  it('detects EAN-13 barcode 7790742335500 and maps format to ean_13', async () => {
    const capture = captureCallback()
    const onDetected = vi.fn()
    await decoder.start({ targetElement, onDetected, onError: vi.fn() })

    capture.fn(
      { getText: () => '7790742335500', getBarcodeFormat: () => MockBarcodeFormat.EAN_13 },
      undefined,
    )

    expect(onDetected).toHaveBeenCalledWith({ code: '7790742335500', format: 'ean_13' })
  })

  it('detects UPC-A barcode and maps format to upc_a', async () => {
    const capture = captureCallback()
    const onDetected = vi.fn()
    await decoder.start({ targetElement, onDetected, onError: vi.fn() })

    capture.fn(
      { getText: () => '012000030714', getBarcodeFormat: () => MockBarcodeFormat.UPC_A },
      undefined,
    )

    expect(onDetected).toHaveBeenCalledWith({ code: '012000030714', format: 'upc_a' })
  })

  it('ignores NotFoundException (no barcode in current frame) without calling onDetected', async () => {
    const capture = captureCallback()
    const onDetected = vi.fn()
    await decoder.start({ targetElement, onDetected, onError: vi.fn() })

    capture.fn(undefined, new MockNotFoundException())

    expect(onDetected).not.toHaveBeenCalled()
    expect(mockControls.stop).not.toHaveBeenCalled()
  })

  it('calls onStreamError and stops controls for unexpected decode errors', async () => {
    const capture = captureCallback()
    const onStreamError = vi.fn()
    await decoder.start({ targetElement, onDetected: vi.fn(), onError: vi.fn(), onStreamError })

    const unexpectedError = new Error('ChecksumException')
    capture.fn(undefined, unexpectedError)

    expect(onStreamError).toHaveBeenCalledWith(unexpectedError)
    expect(mockControls.stop).toHaveBeenCalledOnce()
  })

  it('does not call onDetected after session.stop() is called', async () => {
    const capture = captureCallback()
    const onDetected = vi.fn()
    const session = await decoder.start({ targetElement, onDetected, onError: vi.fn() })

    session.stop()

    capture.fn(
      { getText: () => '7790742335500', getBarcodeFormat: () => MockBarcodeFormat.EAN_13 },
      undefined,
    )

    expect(onDetected).not.toHaveBeenCalled()
  })
})
