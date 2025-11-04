'use client'

import { Grid, Typography, Box, CircularProgress } from '@mui/material'
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
  className?: string
}

export function UserList({
  users,
  loading,
  error,
  hasMore = false,
  onLoadMore,
  totalCount,
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
    return (
      <Box className={className} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {totalCount !== undefined ? totalCount : users.length} results
      </Typography>

      <InfiniteScroll
        onLoadMore={onLoadMore || (() => {})}
        hasMore={hasMore}
        isLoading={loading === 'loading'}
        loadingMessage="Loading more users..."
        endMessage="All users loaded"
      >
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item key={user.id} xs={12} sm={6} md={4} lg={3}>
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  )
}
