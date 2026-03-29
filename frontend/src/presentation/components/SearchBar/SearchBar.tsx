import { TextField } from '@mui/material'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search grocery lists…"
      inputProps={{ 'aria-label': 'Search grocery lists' }}
      size="small"
      fullWidth
    />
  )
}
