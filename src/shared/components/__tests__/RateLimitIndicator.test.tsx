import { render, screen } from '@testing-library/react'
import { RateLimitIndicator } from '../RateLimitIndicator'
import type { RateLimit } from '@/types'

describe('RateLimitIndicator', () => {
  const mockRateLimit: RateLimit = {
    limit: 30,
    remaining: 20,
    reset: Math.floor(Date.now() / 1000) + 300, // 5분 후
    used: 10,
  }

  describe('렌더링 - 성공 케이스', () => {
    it('Rate Limit 정보를 표시해야 한다', () => {
      render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      expect(screen.getByText(/20/)).toBeInTheDocument()
      expect(screen.getByText(/30/)).toBeInTheDocument()
    })

    it('남은 요청 비율을 표시해야 한다', () => {
      render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      // 20/30 = 66.67%
      expect(screen.getByText(/66%|67%/)).toBeInTheDocument()
    })

    it('Reset 시간을 표시해야 한다', () => {
      render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      // AccessTimeIcon이 있는지 확인
      expect(screen.getByTestId('AccessTimeIcon')).toBeInTheDocument()
      // 카운트다운 시간이 표시되는지 확인 (예: "5m 0s")
      expect(screen.getByText(/\d+m \d+s|\d+s/)).toBeInTheDocument()
    })

    it('Progress Bar가 렌더링되어야 한다', () => {
      const { container } = render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('Progress Bar 값이 올바르게 설정되어야 한다', () => {
      const { container } = render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveAttribute('aria-valuenow', '67') // 20/30 = 66.67% -> 67%
    })
  })

  describe('상태별 표시', () => {
    it('ok 상태 (30% 초과)에서 초록색 표시', () => {
      const okRateLimit: RateLimit = {
        ...mockRateLimit,
        remaining: 20, // 66.67%
      }

      const { container } = render(<RateLimitIndicator rateLimit={okRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveClass('MuiLinearProgress-colorSuccess')
    })

    it('warning 상태 (10-30%)에서 노란색 표시', () => {
      const warningRateLimit: RateLimit = {
        ...mockRateLimit,
        remaining: 6, // 20%
      }

      const { container } = render(<RateLimitIndicator rateLimit={warningRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveClass('MuiLinearProgress-colorWarning')
    })

    it('critical 상태 (0-10%)에서 주황색 표시', () => {
      const criticalRateLimit: RateLimit = {
        ...mockRateLimit,
        remaining: 2, // 6.67%
      }

      render(<RateLimitIndicator rateLimit={criticalRateLimit} />)

      expect(screen.getByText(/critical/i)).toBeInTheDocument()
    })

    it('exceeded 상태 (0%)에서 빨간색 경고 표시', () => {
      const exceededRateLimit: RateLimit = {
        ...mockRateLimit,
        remaining: 0, // 0%
      }

      render(<RateLimitIndicator rateLimit={exceededRateLimit} />)

      expect(screen.getByText(/exceeded/i)).toBeInTheDocument()
    })
  })

  describe('카운트다운', () => {
    it('Reset 시간까지 카운트다운을 표시해야 한다', () => {
      const futureReset = Math.floor(Date.now() / 1000) + 150 // 2분 30초 후
      const rateLimit: RateLimit = {
        ...mockRateLimit,
        reset: futureReset,
      }

      render(<RateLimitIndicator rateLimit={rateLimit} />)

      // "2m 30s" 형식으로 표시
      expect(screen.getByText(/2m|2 m/)).toBeInTheDocument()
    })

    it('1분 미만일 때 초만 표시해야 한다', () => {
      const futureReset = Math.floor(Date.now() / 1000) + 30 // 30초 후
      const rateLimit: RateLimit = {
        ...mockRateLimit,
        reset: futureReset,
      }

      render(<RateLimitIndicator rateLimit={rateLimit} />)

      expect(screen.getByText(/\d{1,2}s/)).toBeInTheDocument()
    })
  })

  describe('Rate Limit이 없을 때', () => {
    it('Rate Limit 정보가 없으면 null을 반환해야 한다', () => {
      const { container } = render(<RateLimitIndicator rateLimit={null} />)

      expect(container.firstChild).toBeNull()
    })

    it('Rate Limit 정보가 undefined이면 null을 반환해야 한다', () => {
      const { container } = render(<RateLimitIndicator rateLimit={undefined} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('접근성', () => {
    it('Progress Bar에 aria-label이 설정되어야 한다', () => {
      const { container } = render(<RateLimitIndicator rateLimit={mockRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveAttribute('aria-label')
    })

    it('경고 메시지가 접근 가능해야 한다', () => {
      const exceededRateLimit: RateLimit = {
        ...mockRateLimit,
        remaining: 0,
      }

      render(<RateLimitIndicator rateLimit={exceededRateLimit} />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('limit이 0이면 렌더링하지 않아야 한다', () => {
      const invalidRateLimit: RateLimit = {
        limit: 0,
        remaining: 0,
        reset: 0,
        used: 0,
      }

      const { container } = render(<RateLimitIndicator rateLimit={invalidRateLimit} />)

      expect(container.firstChild).toBeNull()
    })

    it('reset이 과거 시간이면 "now"를 표시해야 한다', () => {
      const pastReset = Math.floor(Date.now() / 1000) - 300 // 5분 전
      const rateLimit: RateLimit = {
        ...mockRateLimit,
        reset: pastReset,
      }

      render(<RateLimitIndicator rateLimit={rateLimit} />)

      expect(screen.getByText(/now/i)).toBeInTheDocument()
    })

    it('remaining이 limit보다 크면 100%로 표시해야 한다', () => {
      const invalidRateLimit: RateLimit = {
        limit: 30,
        remaining: 40, // limit보다 큼
        reset: Math.floor(Date.now() / 1000) + 300,
        used: 0,
      }

      const { container } = render(<RateLimitIndicator rateLimit={invalidRateLimit} />)

      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('커스텀 스타일', () => {
    it('className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <RateLimitIndicator rateLimit={mockRateLimit} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
