'use client'

import { Autocomplete, TextField } from '@mui/material'
import { POPULAR_LANGUAGES } from '@/features/filters/constants/languages'

export interface LanguageFilterProps {
  value: string
  onChange: (language: string) => void
  className?: string
}

export function LanguageFilter({
  value,
  onChange,
  className,
}: LanguageFilterProps) {
  const handleChange = (_event: unknown, newValue: string | null) => {
    onChange(newValue || '')
  }

  const handleInputChange = (_event: unknown, newInputValue: string) => {
    onChange(newInputValue)
  }

  return (
    <Autocomplete
      freeSolo
      options={POPULAR_LANGUAGES}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      className={className}
      renderInput={(params) => (
        <TextField
          {...params}
          id="language-filter"
          label="언어"
          placeholder="예: JavaScript, Python"
          helperText="프로그래밍 언어로 필터링"
          inputProps={{
            ...params.inputProps,
            'aria-label': '언어',
          }}
        />
      )}
    />
  )
}
