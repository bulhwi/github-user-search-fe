'use client'

import { Box, Paper, Typography } from '@mui/material'
import { TypeFilter } from '@/components/molecules/TypeFilter'
import type { AccountType } from '@/types'

export interface FilterPanelProps {
  type: AccountType | null
  onTypeChange: (type: AccountType | null) => void
  className?: string
}

export function FilterPanel({
  type,
  onTypeChange,
  className,
}: FilterPanelProps) {
  return (
    <Paper className={className} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TypeFilter value={type} onChange={onTypeChange} />
        {/* 추가 필터들이 여기에 들어갈 예정 (Feature #2-#8) */}
      </Box>
    </Paper>
  )
}
