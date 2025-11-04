'use client'

import { Container, Typography, Box, Grid, IconButton, Tooltip } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useSearch } from '@/features/search/hooks/useSearch'
import { useFilters } from '@/features/filters/hooks/useFilters'
import { setSort, resetSearch, clearFilters, setQuery } from '@/store/slices/searchSlice'
import { SearchBar } from '@/features/search/components/SearchBar'
import { FilterPanel } from '@/features/filters/components/FilterPanel'
import { UserList } from '@/features/results/components/UserList'
import { RateLimitIndicator } from '@/shared/components/RateLimitIndicator'
import { SortControl } from '@/features/filters/components/SortControl'
import { ThemeToggle } from '@/shared/components/ThemeToggle'
import type { SortOption } from '@/types'

/**
 * Home Page (Template Layer)
 *
 * Clean Architecture의 최상위 Presentation Layer
 * - 비즈니스 로직은 Custom Hooks에 위임
 * - 순수하게 컴포넌트 조합과 Layout만 담당
 */
export default function Home() {
  const dispatch = useAppDispatch()

  // Application Layer: 검색 로직
  const { query, results, loading, error, pagination, incompleteResults, handleSearch, loadMore, retry } =
    useSearch()

  // Application Layer: 필터 로직
  const { filters, setType, setSearchIn, setRepos, setLocation, setLanguage, setCreated, setFollowers, setSponsorable } =
    useFilters()

  // Rate Limit 정보 가져오기 (Feature #13)
  const rateLimit = useAppSelector((state) => state.ui.rateLimit)

  // 정렬 정보 가져오기 (Feature #12)
  const sort = useAppSelector((state) => state.search.sort)
  const order = useAppSelector((state) => state.search.order)

  // 정렬 변경 핸들러
  const handleSortChange = (params: { sort: SortOption; order: 'asc' | 'desc' }) => {
    dispatch(setSort(params))
    // 정렬 변경 시 재검색
    if (query) {
      handleSearch(query)
    }
  }

  // 초기화 핸들러
  const handleReset = () => {
    dispatch(resetSearch())
    dispatch(clearFilters())
    dispatch(setQuery('followers:>1000'))
    handleSearch('followers:>1000')
  }

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header: Theme Toggle + Rate Limit Indicator */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <ThemeToggle />
        {rateLimit && <RateLimitIndicator rateLimit={rateLimit} />}
      </Box>

      <Typography variant="h3" component="h1" gutterBottom>
        GitHub User Search
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Search GitHub users with advanced filters
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <SearchBar
          onSearch={handleSearch}
          initialValue={query}
          loading={loading === 'loading'}
        />
        <Tooltip title="초기화">
          <IconButton onClick={handleReset} aria-label="reset filters">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <SortControl value={sort} order={order} onChange={handleSortChange} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FilterPanel
            type={filters.type}
            onTypeChange={setType}
            searchIn={filters.searchIn}
            onSearchInChange={setSearchIn}
            repos={filters.repos}
            onReposChange={setRepos}
            location={filters.location}
            onLocationChange={setLocation}
            language={filters.language}
            onLanguageChange={setLanguage}
            created={filters.created}
            onCreatedChange={setCreated}
            followers={filters.followers}
            onFollowersChange={setFollowers}
            sponsorable={filters.sponsorable}
            onSponsorableChange={setSponsorable}
          />
        </Grid>

        <Grid item xs={12} md={9}>
          <UserList
            users={results}
            loading={loading}
            error={error}
            hasMore={pagination.hasMore}
            onLoadMore={loadMore}
            totalCount={pagination.totalCount}
            incompleteResults={incompleteResults}
            onRetry={retry}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
