'use client'

import { FormControl, FormLabel, FormHelperText, TextField, Box } from '@mui/material'
import type { RangeFilter } from '@/types'

export interface ReposFilterProps {
  value: RangeFilter
  onChange: (range: RangeFilter) => void
  className?: string
}

export function ReposFilter({ value, onChange, className }: ReposFilterProps) {
  const { min, max } = value

  // 유효성 검증: min <= max
  const isInvalid = min !== undefined && max !== undefined && min > max

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value === '' ? undefined : Number(e.target.value)
    onChange({
      ...(newMin !== undefined && { min: newMin }),
      ...(max !== undefined && { max }),
    })
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value === '' ? undefined : Number(e.target.value)
    onChange({
      ...(min !== undefined && { min }),
      ...(newMax !== undefined && { max: newMax }),
    })
  }

  return (
    <FormControl fullWidth className={className}>
      <FormLabel id="repos-filter-label">리포지토리 수</FormLabel>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField
          id="repos-min"
          label="최소 리포지토리"
          type="number"
          value={min ?? ''}
          onChange={handleMinChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': '최소 리포지토리',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
        <TextField
          id="repos-max"
          label="최대 리포지토리"
          type="number"
          value={max ?? ''}
          onChange={handleMaxChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': '최대 리포지토리',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
      </Box>
      {isInvalid ? (
        <FormHelperText error>최소값은 최대값보다 작거나 같아야 합니다</FormHelperText>
      ) : (
        <FormHelperText>리포지토리 수로 필터링</FormHelperText>
      )}
    </FormControl>
  )
}
