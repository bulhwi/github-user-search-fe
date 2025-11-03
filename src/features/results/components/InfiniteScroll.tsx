'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

export interface InfiniteScrollProps {
  children?: ReactNode
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  loadingMessage?: string
  endMessage?: string
  className?: string
  rootMargin?: string
  threshold?: number
}

/**
 * 무한 스크롤 컴포넌트
 * Sentinel 요소를 사용하여 스크롤 끝을 감지하고 추가 데이터 로드
 *
 * @example
 * ```tsx
 * <InfiniteScroll
 *   onLoadMore={handleLoadMore}
 *   hasMore={pagination.hasMore}
 *   isLoading={loading === 'loading'}
 *   loadingMessage="Loading more users..."
 *   endMessage="No more users to load"
 * >
 *   {users.map(user => <UserCard key={user.id} user={user} />)}
 * </InfiniteScroll>
 * ```
 */
export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  loadingMessage = 'Loading more...',
  endMessage = 'No more results to load',
  className,
  rootMargin = '100px',
  threshold = 0,
}: InfiniteScrollProps) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    rootMargin,
    threshold,
  })

  return (
    <Box className={className}>
      {/* Children content */}
      {children}

      {/* Loading indicator */}
      {isLoading && hasMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress aria-label="Loading more results" />
          {loadingMessage && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {loadingMessage}
            </Typography>
          )}
        </Box>
      )}

      {/* End message */}
      {!hasMore && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {endMessage}
          </Typography>
        </Box>
      )}

      {/* Sentinel element for IntersectionObserver */}
      <div
        ref={sentinelRef}
        data-testid="infinite-scroll-sentinel"
        style={{
          height: '1px',
          visibility: 'hidden',
        }}
        aria-hidden="true"
      />
    </Box>
  )
}
