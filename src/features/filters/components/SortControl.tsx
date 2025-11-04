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
  { value: 'best-match', label: '최적 일치' },
  { value: 'followers', label: '팔로워' },
  { value: 'repositories', label: '리포지토리' },
  { value: 'joined', label: '가입일' },
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
    <Box
      className={className}
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 2 },
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* Sort Select */}
      <FormControl sx={{ minWidth: { xs: 150, sm: 200 }, flexShrink: 0 }} size="medium">
        <InputLabel id="sort-by-label">정렬 기준</InputLabel>
        <Select
          labelId="sort-by-label"
          id="sort-by-select"
          value={currentSort}
          label="정렬 기준"
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <Tooltip
          title={
            isBestMatch
              ? '최적 일치에서는 정렬 순서를 사용할 수 없습니다'
              : `클릭하여 ${currentOrder === 'desc' ? '오름차순' : '내림차순'}으로 정렬`
          }
        >
          <span>
            <IconButton
              onClick={handleOrderToggle}
              disabled={isBestMatch}
              aria-label={`정렬 순서: ${currentOrder === 'desc' ? '내림차순' : '오름차순'}`}
              title={
                isBestMatch
                  ? '최적 일치에서는 정렬 순서를 사용할 수 없습니다'
                  : `정렬 순서: ${currentOrder === 'desc' ? '내림차순' : '오름차순'}`
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {currentOrder === 'desc' ? '내림차순' : '오름차순'}
        </Typography>
      </Box>
    </Box>
  )
}
