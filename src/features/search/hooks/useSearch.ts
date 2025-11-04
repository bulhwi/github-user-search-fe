import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { searchUsers, setQuery } from '@/store/slices/searchSlice'

/**
 * Search Feature Hook (Application Layer)
 *
 * 검색 기능의 비즈니스 로직을 캡슐화하는 Custom Hook
 * - Redux 상태 구독
 * - 검색 액션 디스패치
 * - 초기 검색 설정
 */
export function useSearch() {
  const dispatch = useAppDispatch()
  const { query, results, loading, error, pagination, incompleteResults } = useAppSelector(
    (state) => state.search
  )

  // 초기 검색 설정 (followers > 1000)
  useEffect(() => {
    if (!query) {
      dispatch(setQuery('followers:>1000'))
      dispatch(searchUsers({ query: 'followers:>1000', page: 1 }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 실행
  const handleSearch = useCallback(
    (searchQuery: string) => {
      dispatch(setQuery(searchQuery))
      dispatch(searchUsers({ query: searchQuery, page: 1 }))
    },
    [dispatch]
  )

  // 다음 페이지 로드 (무한 스크롤용 - Future)
  const loadMore = useCallback(() => {
    if (pagination.hasMore && loading !== 'loading') {
      // query는 state에서 자동으로 가져옴
      dispatch(searchUsers({ page: pagination.page + 1 }))
    }
  }, [dispatch, pagination.page, pagination.hasMore, loading])

  // 재시도 (Feature #17: Retry button)
  const retry = useCallback(() => {
    if (query) {
      dispatch(searchUsers({ query, page: 1 }))
    }
  }, [dispatch, query])

  return {
    query,
    results,
    loading,
    error,
    pagination,
    incompleteResults,
    handleSearch,
    loadMore,
    retry,
  }
}
