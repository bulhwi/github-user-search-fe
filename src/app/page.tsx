'use client'

import { Container, Typography, Box, Grid } from '@mui/material'
import { useSearch } from '@/features/search/hooks/useSearch'
import { useFilters } from '@/features/filters/hooks/useFilters'
import { SearchBar } from '@/features/search/components/SearchBar'
import { FilterPanel } from '@/features/filters/components/FilterPanel'
import { UserList } from '@/features/results/components/UserList'

/**
 * Home Page (Template Layer)
 *
 * Clean Architecture의 최상위 Presentation Layer
 * - 비즈니스 로직은 Custom Hooks에 위임
 * - 순수하게 컴포넌트 조합과 Layout만 담당
 */
export default function Home() {
  // Application Layer: 검색 로직
  const { query, results, loading, error, handleSearch } = useSearch()

  // Application Layer: 필터 로직
  const { filters, setType } = useFilters()

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
          <FilterPanel type={filters.type} onTypeChange={setType} />
        </Grid>

        <Grid item xs={12} md={9}>
          <UserList users={results} loading={loading} error={error} />
        </Grid>
      </Grid>
    </Container>
  )
}
