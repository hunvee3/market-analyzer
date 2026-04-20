/**
 * PORT: BarcodeDecoderPort
 *
 * Defines the contract for client-side barcode decoding from a device camera.
 * Implementations: ZxingBarcodeDecoder (infrastructure — wraps @zxing/browser).
 *
 * Scope: 1D retail barcodes only (EAN-13, EAN-8, UPC-A, UPC-E).
 * QR codes are explicitly out of scope and must not be detected.
 *
 * Lives at the application layer — zero framework or infrastructure dependencies.
 */

/**
 * The result of a successful barcode scan.
 */
export interface BarcodeDetectionResult {
  /** The decoded barcode value (e.g., '0012000161155' for UPC-A). */
  code: string

  /**
   * The barcode format that was detected.
   * One of: 'ean_13', 'ean_8', 'upc_a', 'upc_e'
   */
  format: string
}

/**
 * A handle to an active scanning session.
 * Call stop() to release the camera and clean up quagga2.
 */
export interface BarcodeDecoderSession {
  /**
   * Stop the active scanning session and release the camera resource.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  stop(): void
}

/**
 * Options for starting a barcode decoder session.
 */
export interface BarcodeDecoderStartOptions {
  /**
   * The DOM element into which the camera preview will be rendered.
   * Must be mounted in the DOM before calling start().
   */
  targetElement: HTMLElement

  /**
   * Called once when the first barcode is successfully detected.
   * The session does NOT auto-stop — caller is responsible for calling session.stop()
   * after receiving this callback.
   */
  onDetected: (result: BarcodeDetectionResult) => void

  /**
   * Called if the camera stream cannot be initialised.
   * Common causes:
   *   - NotAllowedError: user denied camera permission
   *   - NotFoundError: no camera hardware available
   *   - Other browser/OS-level errors
   * The session is invalid after this callback — do not call start() again on the same
   * instance; obtain a new session from the port.
   */
  onError: (error: Error) => void

  /**
   * Called when the camera stream is interrupted *after* a successful start.
   * Common causes: another application taking over the camera, OS-level hardware
   * revocation, or browser tab losing camera access mid-session.
   * Distinct from onError which covers initialisation failures only.
   * After this callback fires, call session.stop() to release resources.
   */
  onStreamError?: (error: Error) => void
}

/**
 * Port interface for client-side barcode decoding from the device camera.
 *
 * @example
 * const session = await decoder.start({
 *   targetElement: divRef.current,
 *   onDetected: ({ code }) => handleBarcode(code),
 *   onError: (err) => handleFallback(err),
 * })
 * // later:
 * session.stop()
 */
export interface BarcodeDecoderPort {
  /**
   * Start a barcode scanning session.
   * Renders a live camera preview into targetElement and begins decoding.
   * Resolves with a session handle when the scanner is initialised.
   * Rejects (or calls onError) if the camera cannot be accessed.
   */
  start(options: BarcodeDecoderStartOptions): Promise<BarcodeDecoderSession>
}
