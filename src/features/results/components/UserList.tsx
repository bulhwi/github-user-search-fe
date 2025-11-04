'use client'

import { Typography, Box, CircularProgress, Button, Alert } from '@mui/material'
import Grid2 from '@mui/material/Grid2'
import RefreshIcon from '@mui/icons-material/Refresh'
import { UserCard } from '@/features/results/components/UserCard'
import { InfiniteScroll } from '@/features/results/components/InfiniteScroll'
import type { GitHubUser, LoadingState } from '@/types'

export interface UserListProps {
  users: GitHubUser[]
  loading: LoadingState
  error: string | null
  hasMore?: boolean
  onLoadMore?: () => void
  totalCount?: number
  incompleteResults?: boolean
  onRetry?: () => void
  className?: string
}

export function UserList({
  users,
  loading,
  error,
  hasMore = false,
  onLoadMore,
  totalCount,
  incompleteResults = false,
  onRetry,
  className,
}: UserListProps) {
  // 초기 로딩 중 (아직 결과가 없을 때)
  if (loading === 'loading' && users.length === 0) {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 에러 상태
  if (error) {
    // Rate Limit 에러인지 확인
    const isRateLimitError =
      error.toLowerCase().includes('rate limit') ||
      error.toLowerCase().includes('403')

    return (
      <Box className={className} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {isRateLimitError ? 'Rate Limit Exceeded' : 'Error'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        {isRateLimitError ? (
          <Typography variant="body2" color="text.secondary">
            Please try again later or check the rate limit indicator above for
            reset time.
          </Typography>
        ) : (
          onRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          )
        )}
      </Box>
    )
  }

  // 결과 없음
  if (users.length === 0) {
    return (
      <Box className={className} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No results found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search query or filters
        </Typography>
      </Box>
    )
  }

  // 결과 표시 + 무한 스크롤
  return (
    <Box className={className} data-testid="user-list">
      {/* Incomplete results 경고 */}
      {incompleteResults && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Incomplete results: The search results may be partial due to server
          load or rate limiting. Please try again later for complete results.
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {totalCount !== undefined ? totalCount : users.length} 결과
      </Typography>

      <InfiniteScroll
        onLoadMore={onLoadMore || (() => {})}
        hasMore={hasMore}
        isLoading={loading === 'loading'}
        loadingMessage="Loading more users..."
        endMessage="All users loaded"
      >
        <Grid2 container spacing={3}>
          {users.map((user) => (
            <Grid2 key={user.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <UserCard user={user} />
            </Grid2>
          ))}
        </Grid2>
      </InfiniteScroll>
    </Box>
  )
}
