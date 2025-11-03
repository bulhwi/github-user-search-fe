'use client'

import { Box, Paper, Typography } from '@mui/material'
import { TypeFilter } from '@/features/filters/components/TypeFilter'
import { SearchInFilter } from '@/features/filters/components/SearchInFilter'
import type { AccountType, SearchInField } from '@/types'

export interface FilterPanelProps {
  type: AccountType | null
  onTypeChange: (type: AccountType | null) => void
  searchIn: SearchInField[]
  onSearchInChange: (searchIn: SearchInField[]) => void
  className?: string
}

export function FilterPanel({
  type,
  onTypeChange,
  searchIn,
  onSearchInChange,
  className,
}: FilterPanelProps) {
  return (
    <Paper className={className} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TypeFilter value={type} onChange={onTypeChange} />
        <SearchInFilter value={searchIn} onChange={onSearchInChange} />
        {/* 추가 필터들이 여기에 들어갈 예정 (Feature #3-#8) */}
      </Box>
    </Paper>
  )
}
