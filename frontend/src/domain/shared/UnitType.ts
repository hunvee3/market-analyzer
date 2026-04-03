export type UnitType = 'kg' | 'g' | 'L' | 'mL' | 'units'

export const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'mL', label: 'mL' },
  { value: 'units', label: 'units' },
]

export const UNIT_VALUES: UnitType[] = UNIT_OPTIONS.map((o) => o.value)
