'use client'

import { Box, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import type { DateRangeFilter as DateRangeFilterType } from '@/types'

export interface DateRangeFilterProps {
  value: DateRangeFilterType
  onChange: (value: DateRangeFilterType) => void
  className?: string
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const handleAfterChange = (date: Dayjs | null) => {
    const afterDate = date ? date.format('YYYY-MM-DD') : ''
    onChange({
      ...value,
      after: afterDate,
    })
  }

  const handleBeforeChange = (date: Dayjs | null) => {
    const beforeDate = date ? date.format('YYYY-MM-DD') : ''
    onChange({
      ...value,
      before: beforeDate,
    })
  }

  // Convert string dates to Dayjs objects
  const afterValue = value.after ? dayjs(value.after) : null
  const beforeValue = value.before ? dayjs(value.before) : null

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Filter by creation date
        </Typography>
        <DatePicker
          label="Created After"
          value={afterValue}
          onChange={handleAfterChange}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              id: 'created-after-filter',
              fullWidth: true,
              inputProps: {
                'aria-label': 'Created After',
              },
            },
          }}
        />
        <DatePicker
          label="Created Before"
          value={beforeValue}
          onChange={handleBeforeChange}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              id: 'created-before-filter',
              fullWidth: true,
              inputProps: {
                'aria-label': 'Created Before',
              },
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  )
}
