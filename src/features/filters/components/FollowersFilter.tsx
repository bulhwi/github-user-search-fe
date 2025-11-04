'use client'

import { FormControl, FormLabel, FormHelperText, TextField, Box } from '@mui/material'
import type { RangeFilter } from '@/types'

export interface FollowersFilterProps {
  value: RangeFilter
  onChange: (range: RangeFilter) => void
  className?: string
}

export function FollowersFilter({ value, onChange, className }: FollowersFilterProps) {
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
      <FormLabel id="followers-filter-label">팔로워</FormLabel>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField
          id="followers-min"
          label="최소 팔로워"
          type="number"
          value={min ?? ''}
          onChange={handleMinChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': '최소 팔로워',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
        <TextField
          id="followers-max"
          label="최대 팔로워"
          type="number"
          value={max ?? ''}
          onChange={handleMaxChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': '최대 팔로워',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
      </Box>
      {isInvalid ? (
        <FormHelperText error>최소값은 최대값보다 작거나 같아야 합니다</FormHelperText>
      ) : (
        <FormHelperText>팔로워 수로 필터링</FormHelperText>
      )}
    </FormControl>
  )
}
