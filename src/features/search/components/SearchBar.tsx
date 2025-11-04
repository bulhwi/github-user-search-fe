'use client'

import { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
  placeholder?: string
  loading?: boolean
  className?: string
}

export function SearchBar({
  onSearch,
  initialValue = '',
  placeholder = 'Search GitHub users...',
  loading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className={className}
      sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, width: '100%' }}
    >
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        size="medium"
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!query.trim() || loading}
        sx={{
          minWidth: { xs: 80, sm: 120 },
          flexShrink: 0,
        }}
      >
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </Box>
  )
}
