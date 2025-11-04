import { render, screen } from '@testing-library/react'
import { InfiniteScroll } from '../InfiniteScroll'

describe('InfiniteScroll', () => {
  // IntersectionObserver Mock
  beforeEach(() => {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: '0px',
      thresholds: [0],
      takeRecords: jest.fn(),
    })) as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('렌더링 - 성공 케이스', () => {
    it('children을 렌더링해야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          <div>Test Content</div>
        </InfiniteScroll>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('sentinel 요소가 렌더링되어야 한다', () => {
      const onLoadMore = jest.fn()
      const { container } = render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      // sentinel 요소 확인 (data-testid 또는 특정 className으로)
      const sentinel = container.querySelector('[data-testid="infinite-scroll-sentinel"]')
      expect(sentinel).toBeInTheDocument()
    })
  })

  describe('로딩 상태', () => {
    it('isLoading이 true일 때 로딩 인디케이터를 표시해야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={true}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      // CircularProgress 또는 loading 텍스트 확인
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('isLoading이 false일 때 로딩 인디케이터를 표시하지 않아야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })

  describe('hasMore 상태', () => {
    it('hasMore가 false일 때 "No more results" 메시지를 표시해야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={false}
          isLoading={false}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(screen.getByText(/no more results/i)).toBeInTheDocument()
    })

    it('hasMore가 true일 때 "No more results" 메시지를 표시하지 않아야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(screen.queryByText(/no more results/i)).not.toBeInTheDocument()
    })
  })

  describe('커스텀 메시지', () => {
    it('커스텀 loadingMessage를 표시할 수 있어야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={true}
          loadingMessage="커스텀 로딩 중..."
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(screen.getByText('커스텀 로딩 중...')).toBeInTheDocument()
    })

    it('커스텀 endMessage를 표시할 수 있어야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={false}
          isLoading={false}
          endMessage="모든 결과를 확인했습니다"
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(screen.getByText('모든 결과를 확인했습니다')).toBeInTheDocument()
    })
  })

  describe('커스텀 스타일', () => {
    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const onLoadMore = jest.fn()
      const { container } = render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
          className="custom-infinite-scroll"
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-infinite-scroll')
    })
  })

  describe('Edge Cases', () => {
    it('children이 없어도 렌더링되어야 한다', () => {
      const onLoadMore = jest.fn()
      const { container } = render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        />
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('children이 null이어도 렌더링되어야 한다', () => {
      const onLoadMore = jest.fn()
      const { container } = render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          {null}
        </InfiniteScroll>
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('children이 배열이어도 렌더링되어야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={false}
        >
          {[
            <div key="1">Item 1</div>,
            <div key="2">Item 2</div>,
            <div key="3">Item 3</div>,
          ]}
        </InfiniteScroll>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('실패 케이스', () => {
    it('onLoadMore가 없어도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onLoadMore
      const { container } = render(
        <InfiniteScroll hasMore={true} isLoading={false}>
          <div>Content</div>
        </InfiniteScroll>
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('로딩 인디케이터가 접근 가능해야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={true}
          isLoading={true}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toBeInTheDocument()
      expect(progressbar).toHaveAccessibleName()
    })

    it('종료 메시지가 읽을 수 있어야 한다', () => {
      const onLoadMore = jest.fn()
      render(
        <InfiniteScroll
          onLoadMore={onLoadMore}
          hasMore={false}
          isLoading={false}
        >
          <div>Content</div>
        </InfiniteScroll>
      )

      const endMessage = screen.getByText(/no more results/i)
      expect(endMessage).toBeInTheDocument()
      expect(endMessage.tagName).toBe('P')
    })
  })
})
