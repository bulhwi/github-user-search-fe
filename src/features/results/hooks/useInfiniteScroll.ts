import { useEffect, useRef } from 'react'

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  rootMargin?: string
  threshold?: number
}

/**
 * 무한 스크롤을 구현하기 위한 Hook
 * IntersectionObserver API를 사용하여 요소가 화면에 나타날 때 onLoadMore 콜백 호출
 *
 * @param options - 무한 스크롤 옵션
 * @returns ref - Sentinel 요소에 attach할 ref
 *
 * @example
 * ```tsx
 * const sentinelRef = useInfiniteScroll({
 *   onLoadMore: handleLoadMore,
 *   hasMore: pagination.hasMore,
 *   isLoading: loading === 'loading',
 *   rootMargin: '100px', // 100px 전에 미리 로드
 * })
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *   </div>
 * )
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '0px',
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false) // 중복 호출 방지

  useEffect(() => {
    // IntersectionObserver 생성
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        // 교차 조건 확인: 화면에 나타남 + 더 로드할 데이터 있음 + 로딩 중 아님 + 이미 로딩 중이 아님
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingRef.current &&
          onLoadMore
        ) {
          isLoadingRef.current = true // 중복 호출 방지 플래그 설정
          onLoadMore()
        }
      },
      {
        root: null, // viewport 기준
        rootMargin,
        threshold,
      }
    )

    observerRef.current = observer

    // 이전 요소가 있으면 unobserve
    const currentSentinel = sentinelRef.current
    if (currentSentinel && observerRef.current) {
      // 기존 관찰 해제
      observerRef.current.disconnect()
    }

    // Sentinel 요소 관찰 시작
    if (currentSentinel) {
      observer.observe(currentSentinel)
    }

    // Cleanup: 언마운트 시 observer 해제
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [onLoadMore, hasMore, isLoading, rootMargin, threshold])

  // isLoading이 false로 변경되면 플래그 초기화
  useEffect(() => {
    if (!isLoading) {
      isLoadingRef.current = false
    }
  }, [isLoading])

  return sentinelRef
}
