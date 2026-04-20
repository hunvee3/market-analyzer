import { describe, it, expect, afterEach } from 'vitest'
import { detectMobileDevice } from '@presentation/utils/detectMobileDevice'

describe('detectMobileDevice', () => {
  afterEach(() => {
    // Reset to default (0 = desktop)
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    })
  })

  it('returns true when maxTouchPoints > 0 (mobile/touch device)', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 2,
      writable: true,
      configurable: true,
    })
    expect(detectMobileDevice()).toBe(true)
  })

  it('returns true when maxTouchPoints is 1 (single-touch device)', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 1,
      writable: true,
      configurable: true,
    })
    expect(detectMobileDevice()).toBe(true)
  })

  it('returns false when maxTouchPoints === 0 (desktop with no touch)', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    })
    expect(detectMobileDevice()).toBe(false)
  })
})
