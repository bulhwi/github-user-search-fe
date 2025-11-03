'use client'

import { useEffect } from 'react'
import { Container, Typography, Box, Grid } from '@mui/material'
import { SearchBar } from '@/components/organisms/SearchBar'
import { FilterPanel } from '@/components/organisms/FilterPanel'
import { UserList } from '@/components/organisms/UserList'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { searchUsers, setQuery, setFilters } from '@/store/slices/searchSlice'
import type { AccountType } from '@/types'

export default function Home() {
  const dispatch = useAppDispatch()
  const { query, filters, results, loading, error } = useAppSelector(
    (state) => state.search
  )

  // Initial search on mount
  useEffect(() => {
    if (!query) {
      // Default search: users with followers > 1000
      dispatch(setQuery('followers:>1000'))
      dispatch(searchUsers({ query: 'followers:>1000', page: 1 }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (searchQuery: string) => {
    dispatch(setQuery(searchQuery))
    dispatch(searchUsers({ query: searchQuery, page: 1 }))
  }

  const handleTypeChange = (type: AccountType | null) => {
    dispatch(setFilters({ type }))
    // Re-search with updated filter
    dispatch(searchUsers({ query, page: 1 }))
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h3" component="h1" gutterBottom>
        GitHub User Search
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Search GitHub users with advanced filters
      </Typography>

      <Box sx={{ mb: 4 }}>
        <SearchBar onSearch={handleSearch} initialValue={query} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FilterPanel type={filters.type} onTypeChange={handleTypeChange} />
        </Grid>

        <Grid item xs={12} md={9}>
          <UserList users={results} loading={loading} error={error} />
        </Grid>
      </Grid>
    </Container>
  )
}