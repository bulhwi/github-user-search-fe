import { useCallback, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setFilters, searchUsers } from '@/store/slices/searchSlice'
import type { AccountType, SearchInField, RangeFilter, DateRangeFilter } from '@/types'

/**
 * Filters Feature Hook (Application Layer)
 *
 * 필터 기능의 비즈니스 로직을 캡슐화하는 Custom Hook
 * - 필터 상태 구독
 * - 필터 변경 시 자동 검색 실행
 */
export function useFilters() {
  const dispatch = useAppDispatch()
  const { filters, query } = useAppSelector((state) => state.search)

  // 타입 필터 변경 (Feature #1)
  const setType = useCallback(
    (type: AccountType | null) => {
      dispatch(setFilters({ type }))
      // 필터 변경 시 첫 페이지부터 재검색
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  // 검색 필드 필터 변경 (Feature #2)
  const setSearchIn = useCallback(
    (searchIn: SearchInField[]) => {
      dispatch(setFilters({ searchIn }))
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  // 위치 필터 변경 (Feature #4) - Debounced
  const locationTimeoutRef = useRef<NodeJS.Timeout>()
  const setLocation = useCallback(
    (location: string) => {
      dispatch(setFilters({ location }))

      // Debounce: 500ms 후 검색 실행
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current)
      }
      locationTimeoutRef.current = setTimeout(() => {
        dispatch(searchUsers({ query, page: 1 }))
      }, 500)
    },
    [dispatch, query]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current)
      }
    }
  }, [])

  // 언어 필터 변경 (Feature #5 - Future)
  const setLanguage = useCallback(
    (language: string) => {
      dispatch(setFilters({ language }))
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  // 리포지토리 수 필터 변경 (Feature #3)
  const setRepos = useCallback(
    (repos: RangeFilter) => {
      dispatch(setFilters({ repos }))
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  // 계정 생성일 필터 변경 (Feature #6)
  const setCreated = useCallback(
    (created: DateRangeFilter) => {
      dispatch(setFilters({ created }))
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  // 팔로워 수 필터 변경 (Feature #7 - Future)
  const setFollowers = useCallback(
    (min?: number, max?: number) => {
      dispatch(setFilters({ followers: { min, max } }))
      dispatch(searchUsers({ query, page: 1 }))
    },
    [dispatch, query]
  )

  return {
    filters,
    setType,
    setSearchIn,
    setLocation,
    setLanguage,
    setRepos,
    setCreated,
    setFollowers,
  }
}
