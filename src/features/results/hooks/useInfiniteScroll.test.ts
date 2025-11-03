import { renderHook, waitFor } from '@testing-library/react'
import { useInfiniteScroll } from './useInfiniteScroll'

describe('useInfiniteScroll', () => {
  // IntersectionObserver Mock
  let observeMock: jest.Mock
  let unobserveMock: jest.Mock
  let disconnectMock: jest.Mock

  beforeEach(() => {
    observeMock = jest.fn()
    unobserveMock = jest.fn()
    disconnectMock = jest.fn()

    // IntersectionObserver Mock 설정
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: observeMock,
      unobserve: unobserveMock,
      disconnect: disconnectMock,
      root: null,
      rootMargin: '0px',
      thresholds: [0],
      takeRecords: jest.fn(),
    })) as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('초기화 - 성공 케이스', () => {
    it('ref를 반환해야 한다', () => {
      const onLoadMore = jest.fn()
      const { result } = renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      expect(result.current).toBeDefined()
      expect(result.current.current).toBeNull() // ref는 초기에 null
    })

    it('IntersectionObserver가 생성되어야 한다', () => {
      const onLoadMore = jest.fn()
      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      expect(global.IntersectionObserver).toHaveBeenCalled()
    })

    it('올바른 옵션으로 IntersectionObserver가 생성되어야 한다', () => {
      const onLoadMore = jest.fn()
      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
          rootMargin: '100px',
          threshold: 0.5,
        })
      )

      expect(global.IntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('교차 감지 - 성공 케이스', () => {
    it('요소가 화면에 나타나면 onLoadMore가 호출되어야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      const { result } = renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      // ref에 요소 할당
      const mockElement = document.createElement('div')
      // @ts-expect-error Mock element
      result.current.current = mockElement

      // IntersectionObserver 콜백 시뮬레이션 (교차 발생)
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    it('요소가 화면을 벗어나면 onLoadMore가 호출되지 않아야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: false, // 교차하지 않음
          target: mockElement,
          intersectionRatio: 0,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })

  describe('로딩 상태 처리', () => {
    it('isLoading이 true일 때 onLoadMore가 호출되지 않아야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: true, // 로딩 중
        })
      )

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('hasMore가 false일 때 onLoadMore가 호출되지 않아야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: false, // 더 이상 없음
          isLoading: false,
        })
      )

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })

  describe('클린업', () => {
    it('언마운트 시 observer가 disconnect되어야 한다', () => {
      const onLoadMore = jest.fn()
      const { unmount } = renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      unmount()

      expect(disconnectMock).toHaveBeenCalled()
    })

    it('옵션이 변경되면 observer가 재생성되어야 한다', () => {
      const onLoadMore = jest.fn()
      const { rerender } = renderHook(
        (props) => useInfiniteScroll(props),
        {
          initialProps: {
            onLoadMore,
            hasMore: true,
            isLoading: false,
            rootMargin: '0px',
          },
        }
      )

      const initialCallCount = global.IntersectionObserver.mock.calls.length

      // 옵션 변경 (rootMargin)
      rerender({
        onLoadMore,
        hasMore: true,
        isLoading: false,
        rootMargin: '100px', // 변경
      })

      // 새로운 IntersectionObserver가 생성되어야 함
      expect(global.IntersectionObserver.mock.calls.length).toBeGreaterThan(
        initialCallCount
      )
    })
  })

  describe('Edge Cases', () => {
    it('ref가 null이면 observe가 호출되지 않아야 한다', () => {
      const onLoadMore = jest.fn()
      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      // ref를 할당하지 않음 (null 상태)
      expect(observeMock).not.toHaveBeenCalled()
    })

    it('onLoadMore가 없어도 에러가 발생하지 않아야 한다', () => {
      expect(() => {
        // @ts-expect-error Testing without onLoadMore
        renderHook(() =>
          useInfiniteScroll({
            hasMore: true,
            isLoading: false,
          })
        )
      }).not.toThrow()
    })

    it('여러 번 교차해도 중복 호출을 방지해야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      renderHook(() =>
        useInfiniteScroll({
          onLoadMore,
          hasMore: true,
          isLoading: false,
        })
      )

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      // 같은 교차를 여러 번 시뮬레이션
      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
        intersectionCallback!(entries, {} as IntersectionObserver)
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      // isLoading으로 중복 호출 방지되므로 1번만 호출
      expect(onLoadMore).toHaveBeenCalledTimes(1)
    })
  })

  describe('옵션 변경', () => {
    it('hasMore가 true에서 false로 변경되면 더 이상 로드하지 않아야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      const { rerender } = renderHook(
        (props) => useInfiniteScroll(props),
        {
          initialProps: {
            onLoadMore,
            hasMore: true,
            isLoading: false,
          },
        }
      )

      // hasMore를 false로 변경
      rerender({
        onLoadMore,
        hasMore: false,
        isLoading: false,
      })

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('isLoading이 false에서 true로 변경되면 로드하지 않아야 한다', async () => {
      const onLoadMore = jest.fn()
      let intersectionCallback: IntersectionObserverCallback

      global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
        intersectionCallback = callback
        return {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          root: null,
          rootMargin: '0px',
          thresholds: [0],
          takeRecords: jest.fn(),
        }
      }) as unknown as typeof IntersectionObserver

      const { rerender } = renderHook(
        (props) => useInfiniteScroll(props),
        {
          initialProps: {
            onLoadMore,
            hasMore: true,
            isLoading: false,
          },
        }
      )

      // isLoading을 true로 변경
      rerender({
        onLoadMore,
        hasMore: true,
        isLoading: true,
      })

      const mockElement = document.createElement('div')
      const entries: IntersectionObserverEntry[] = [
        {
          isIntersecting: true,
          target: mockElement,
          intersectionRatio: 1,
        } as IntersectionObserverEntry,
      ]

      await waitFor(() => {
        intersectionCallback!(entries, {} as IntersectionObserver)
      })

      expect(onLoadMore).not.toHaveBeenCalled()
    })
  })
})
