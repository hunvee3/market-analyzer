import { describe, it, expect } from 'vitest'
import { formatPrice } from '@presentation/utils/formatPrice'

describe('formatPrice', () => {
  it('Given a whole number, When formatted, Then returns $ prefix with 2 decimal places', () => {
    expect(formatPrice(1250)).toBe('$1250.00')
  })

  it('Given a decimal number, When formatted, Then returns $ prefix with 2 decimal places', () => {
    expect(formatPrice(19.5)).toBe('$19.50')
  })

  it('Given zero, When formatted, Then returns $0.00', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('Given a number with more than 2 decimals, When formatted, Then rounds to 2 decimal places', () => {
    expect(formatPrice(9.999)).toBe('$10.00')
  })

  it('Given a small decimal, When formatted, Then returns correct format', () => {
    expect(formatPrice(0.1)).toBe('$0.10')
  })
})
