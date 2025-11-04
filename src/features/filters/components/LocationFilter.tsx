'use client'

import { TextField } from '@mui/material'
import { ChangeEvent } from 'react'

export interface LocationFilterProps {
  value: string
  onChange: (location: string) => void
  className?: string
}

export function LocationFilter({
  value,
  onChange,
  className,
}: LocationFilterProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <TextField
      id="location-filter"
      label="Location"
      value={value}
      onChange={handleChange}
      placeholder="e.g. Seoul, San Francisco"
      helperText="Search by location (city, country, etc.)"
      fullWidth
      className={className}
      inputProps={{
        'aria-label': 'Location',
      }}
    />
  )
}
