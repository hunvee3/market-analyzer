import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'
import { DecodeHintType, NotFoundException } from '@zxing/library'
import type {
  BarcodeDecoderPort,
  BarcodeDecoderSession,
  BarcodeDecoderStartOptions,
} from '@application/purchase/ports/BarcodeDecoder.port'

/**
 * Maps ZXing BarcodeFormat enum values to the port's format name strings.
 */
const FORMAT_NAMES = new Map<BarcodeFormat, string>([
  [BarcodeFormat.EAN_13, 'ean_13'],
  [BarcodeFormat.EAN_8, 'ean_8'],
  [BarcodeFormat.UPC_A, 'upc_a'],
  [BarcodeFormat.UPC_E, 'upc_e'],
])

/**
 * Infrastructure adapter: wraps @zxing/browser BrowserMultiFormatReader to implement BarcodeDecoderPort.
 *
 * Restricted to 1D retail symbologies only (EAN-13, EAN-8, UPC-A, UPC-E).
 * QR codes and 2D symbologies are explicitly excluded.
 */
export class ZxingBarcodeDecoder implements BarcodeDecoderPort {
  start(options: BarcodeDecoderStartOptions): Promise<BarcodeDecoderSession> {
    return new Promise((resolve) => {
      const hints = new Map<DecodeHintType, unknown>()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ])

      const reader = new BrowserMultiFormatReader(hints)

      // ZXing requires a <video> element; create one inside the target container
      const video = document.createElement('video')
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;'
      options.targetElement.replaceChildren(video)

      let stopped = false

      void (async () => {
        try {
          const controls = await reader.decodeFromConstraints(
            {
              video: {
                facingMode: 'environment',
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              },
            },
            video,
            (result, error) => {
              if (stopped) return

              if (result) {
                const format = FORMAT_NAMES.get(result.getBarcodeFormat()) ?? 'unknown'
                options.onDetected({ code: result.getText(), format })
              }

              // NotFoundException fires on every frame with no barcode — ignore it
              if (error && !(error instanceof NotFoundException)) {
                stopped = true
                controls.stop()
                options.onStreamError?.(error as unknown as Error)
              }
            },
          )

          // Listen for camera track termination mid-session
          const stream = video.srcObject as MediaStream | null
          stream?.getTracks().forEach((track) => {
            track.addEventListener('ended', () => {
              if (!stopped) {
                stopped = true
                controls.stop()
                options.onStreamError?.(new Error('Camera stream ended'))
              }
            })
          })

          resolve({
            stop() {
              if (stopped) return
              stopped = true
              controls.stop()
            },
          })
        } catch (err) {
          // Stream could not start (NotAllowedError, NotFoundError, etc.)
          options.onError(err as Error)
          resolve({ stop: () => {} })
        }
      })()
    })
  }
}
