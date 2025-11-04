'use client'

import { Box, Paper, Typography } from '@mui/material'
import { TypeFilter } from '@/features/filters/components/TypeFilter'
import { SearchInFilter } from '@/features/filters/components/SearchInFilter'
import { ReposFilter } from '@/features/filters/components/ReposFilter'
import { LocationFilter } from '@/features/filters/components/LocationFilter'
import { LanguageFilter } from '@/features/filters/components/LanguageFilter'
import { DateRangeFilter } from '@/features/filters/components/DateRangeFilter'
import type { AccountType, SearchInField, RangeFilter, DateRangeFilter as DateRangeFilterType } from '@/types'

export interface FilterPanelProps {
  type: AccountType | null
  onTypeChange: (type: AccountType | null) => void
  searchIn: SearchInField[]
  onSearchInChange: (searchIn: SearchInField[]) => void
  repos: RangeFilter
  onReposChange: (repos: RangeFilter) => void
  location: string
  onLocationChange: (location: string) => void
  language: string
  onLanguageChange: (language: string) => void
  created: DateRangeFilterType
  onCreatedChange: (created: DateRangeFilterType) => void
  className?: string
}

export function FilterPanel({
  type,
  onTypeChange,
  searchIn,
  onSearchInChange,
  repos,
  onReposChange,
  location,
  onLocationChange,
  language,
  onLanguageChange,
  created,
  onCreatedChange,
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
        <ReposFilter value={repos} onChange={onReposChange} />
        <LocationFilter value={location} onChange={onLocationChange} />
        <LanguageFilter value={language} onChange={onLanguageChange} />
        <DateRangeFilter value={created} onChange={onCreatedChange} />
        {/* 추가 필터들이 여기에 들어갈 예정 (Feature #7-#8) */}
      </Box>
    </Paper>
  )
}
