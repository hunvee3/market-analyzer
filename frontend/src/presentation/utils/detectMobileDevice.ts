/**
 * Detects whether the current device is a mobile/touch device.
 *
 * Uses `navigator.maxTouchPoints > 0` as the detection signal.
 * Returns true on phones, tablets, and any device with touch input.
 * Returns false on desktop browsers with no touch support.
 */
export function detectMobileDevice(): boolean {
  return navigator.maxTouchPoints > 0
}
