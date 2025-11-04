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
      <FormLabel id="followers-filter-label">Followers Count</FormLabel>
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <TextField
          id="followers-min"
          label="Min Followers"
          type="number"
          value={min ?? ''}
          onChange={handleMinChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': 'Min Followers',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
        <TextField
          id="followers-max"
          label="Max Followers"
          type="number"
          value={max ?? ''}
          onChange={handleMaxChange}
          inputProps={{
            min: 0,
            step: 1,
            'aria-label': 'Max Followers',
          }}
          error={isInvalid}
          fullWidth
          size="small"
        />
      </Box>
      {isInvalid ? (
        <FormHelperText error>Min must be less than or equal to Max</FormHelperText>
      ) : (
        <FormHelperText>Filter by follower count</FormHelperText>
      )}
    </FormControl>
  )
}
