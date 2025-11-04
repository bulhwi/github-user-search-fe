'use client'

import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import type { SortOption } from '@/types'

export interface SortControlProps {
  value: SortOption
  order?: 'asc' | 'desc'
  onChange: (params: { sort: SortOption; order: 'asc' | 'desc' }) => void
  className?: string
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'best-match', label: 'Best Match' },
  { value: 'followers', label: 'Followers' },
  { value: 'repositories', label: 'Repositories' },
  { value: 'joined', label: 'Joined' },
]

export function SortControl({
  value = 'best-match',
  order = 'desc',
  onChange,
  className = '',
}: SortControlProps) {
  const currentSort = value || 'best-match'
  const currentOrder = order || 'desc'
  const isBestMatch = currentSort === 'best-match'

  const handleSortChange = (newSort: SortOption) => {
    onChange({ sort: newSort, order: currentOrder })
  }

  const handleOrderToggle = () => {
    if (isBestMatch) return // Best Match는 order 변경 불가

    const newOrder = currentOrder === 'desc' ? 'asc' : 'desc'
    onChange({ sort: currentSort, order: newOrder })
  }

  return (
    <Box className={className} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {/* Sort Select */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="sort-by-label">Sort by</InputLabel>
        <Select
          labelId="sort-by-label"
          id="sort-by-select"
          value={currentSort}
          label="Sort by"
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Order Toggle Button */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip
          title={
            isBestMatch
              ? 'Order is not available for Best Match'
              : `Click to sort in ${currentOrder === 'desc' ? 'ascending' : 'descending'} order`
          }
        >
          <span>
            <IconButton
              onClick={handleOrderToggle}
              disabled={isBestMatch}
              aria-label={`Sort order: ${currentOrder === 'desc' ? 'Descending' : 'Ascending'}`}
              title={
                isBestMatch
                  ? 'Order is not available for Best Match'
                  : `Sort order: ${currentOrder === 'desc' ? 'Descending' : 'Ascending'}`
              }
            >
              {currentOrder === 'desc' ? (
                <ArrowDownwardIcon />
              ) : (
                <ArrowUpwardIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {currentOrder === 'desc' ? 'Descending' : 'Ascending'}
        </Typography>
      </Box>
    </Box>
  )
}
