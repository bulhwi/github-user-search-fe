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
      label="위치"
      value={value}
      onChange={handleChange}
      placeholder="예: 서울, 샌프란시스코"
      helperText="위치로 검색 (도시, 국가 등)"
      fullWidth
      className={className}
      inputProps={{
        'aria-label': '위치',
      }}
    />
  )
}
