'use client'

import { FormControl, FormControlLabel, FormHelperText, Switch } from '@mui/material'

export interface SponsorableFilterProps {
  value: boolean
  onChange: (value: boolean) => void
  className?: string
}

/**
 * SponsorableFilter Component (Feature #8)
 *
 * GitHub API is:sponsorable qualifier 필터
 * - Boolean 스위치로 후원 가능한 사용자만 필터링
 * - ON: is:sponsorable 추가
 * - OFF: qualifier 제거
 */
export function SponsorableFilter({ value, onChange, className }: SponsorableFilterProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked)
  }

  return (
    <FormControl fullWidth className={className}>
      <FormControlLabel
        control={
          <Switch
            checked={value || false}
            onChange={handleChange}
            inputProps={{ 'aria-label': '후원 가능 사용자만' }}
          />
        }
        label="후원 가능 사용자만"
      />
      <FormHelperText>후원 가능한 사용자만 표시</FormHelperText>
    </FormControl>
  )
}
