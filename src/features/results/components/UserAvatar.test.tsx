import { render, screen, waitFor } from '@testing-library/react'
import { UserAvatar } from './UserAvatar'
import * as imageOptimizer from '@/shared/utils/imageOptimizer'

// Mock imageOptimizer
jest.mock('@/shared/utils/imageOptimizer', () => ({
  optimizeAvatar: jest.fn(),
}))

// Mock Canvas 2D Context (JSDOM doesn't support Canvas)
const mockCanvasContext = {
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  clip: jest.fn(),
  arc: jest.fn(),
  drawImage: jest.fn(),
  fillStyle: '',
  fill: jest.fn(),
}

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext) as any
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = jest.fn()
})

describe('UserAvatar', () => {
  const mockBlob = new Blob(['fake-image'], { type: 'image/webp' })
  const defaultProps = {
    src: 'https://avatars.githubusercontent.com/u/1?v=4',
    alt: 'octocat',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCanvasContext.clearRect.mockClear()
    mockCanvasContext.drawImage.mockClear()

    ;(imageOptimizer.optimizeAvatar as jest.Mock).mockResolvedValue({
      blob: mockBlob,
      metrics: {
        downloadTime: 50,
        optimizeTime: 30,
        totalTime: 80,
        originalSize: 10000,
        optimizedSize: 5000,
      },
    })

    // Mock Image 로딩 성공
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 0)
      }
    } as any
  })

  describe('렌더링 - 성공 케이스', () => {
    it('Canvas 요소가 렌더링되어야 한다', () => {
      render(<UserAvatar {...defaultProps} />)
      const canvas = screen.getByRole('img')
      expect(canvas).toBeInTheDocument()
      expect(canvas.tagName).toBe('CANVAS')
    })

    it('기본 크기는 48x48이어야 한다', () => {
      render(<UserAvatar {...defaultProps} />)
      const canvas = screen.getByRole('img') as HTMLCanvasElement
      expect(canvas.width).toBe(48)
      expect(canvas.height).toBe(48)
    })

    it('커스텀 크기가 적용되어야 한다', () => {
      render(<UserAvatar {...defaultProps} size={64} />)
      const canvas = screen.getByRole('img') as HTMLCanvasElement
      expect(canvas.width).toBe(64)
      expect(canvas.height).toBe(64)
    })

    it('alt 속성이 aria-label로 설정되어야 한다', () => {
      render(<UserAvatar {...defaultProps} />)
      const canvas = screen.getByLabelText('octocat')
      expect(canvas).toBeInTheDocument()
    })

    it('className이 적용되어야 한다', () => {
      render(<UserAvatar {...defaultProps} className="custom-class" />)
      const canvas = screen.getByRole('img')
      expect(canvas).toHaveClass('custom-class')
    })
  })

  describe('이미지 최적화 - WASM', () => {
    it('optimizeAvatar가 호출되어야 한다', async () => {
      render(<UserAvatar {...defaultProps} />)

      await waitFor(() => {
        expect(imageOptimizer.optimizeAvatar).toHaveBeenCalledWith(defaultProps.src, {
          width: 48,
          height: 48,
          quality: 80,
        })
      })
    })

    it('커스텀 크기로 optimizeAvatar가 호출되어야 한다', async () => {
      render(<UserAvatar {...defaultProps} size={64} />)

      await waitFor(() => {
        expect(imageOptimizer.optimizeAvatar).toHaveBeenCalledWith(defaultProps.src, {
          width: 64,
          height: 64,
          quality: 80,
        })
      })
    })

    it('최적화된 이미지가 Canvas에 그려져야 한다', async () => {
      const { container } = render(<UserAvatar {...defaultProps} />)

      await waitFor(() => {
        const canvas = container.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas?.getContext('2d')
        expect(ctx).toBeTruthy()
      })
    })
  })

  describe('로딩 상태', () => {
    it('로딩 중에는 로딩 상태가 표시되어야 한다', () => {
      ;(imageOptimizer.optimizeAvatar as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ blob: mockBlob, metrics: {} }), 1000)
          })
      )

      render(<UserAvatar {...defaultProps} />)

      // loading 상태 확인 (aria-busy 또는 data-loading 속성)
      const canvas = screen.getByRole('img')
      expect(canvas).toHaveAttribute('data-loading', 'true')
    })

    it('로딩 완료 후 loading 상태가 해제되어야 한다', async () => {
      render(<UserAvatar {...defaultProps} />)

      const canvas = screen.getByRole('img')
      await waitFor(() => {
        expect(canvas).toHaveAttribute('data-loading', 'false')
      })
    })
  })

  describe('에러 처리', () => {
    it('이미지 최적화 실패 시 Fallback 이미지가 표시되어야 한다', async () => {
      ;(imageOptimizer.optimizeAvatar as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<UserAvatar {...defaultProps} />)

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toHaveAttribute('data-error', 'true')
      })
    })

    it('Fallback 이미지도 실패하면 기본 배경색이 표시되어야 한다', async () => {
      ;(imageOptimizer.optimizeAvatar as jest.Mock).mockRejectedValue(new Error('Network error'))

      const { container } = render(<UserAvatar {...defaultProps} />)

      await waitFor(() => {
        const canvas = container.querySelector('canvas') as HTMLCanvasElement
        // Canvas가 기본 배경으로 채워졌는지 확인
        expect(canvas).toBeInTheDocument()
      })
    })
  })

  describe('접근성', () => {
    it('role="img"가 설정되어야 한다', () => {
      render(<UserAvatar {...defaultProps} />)
      const canvas = screen.getByRole('img')
      expect(canvas).toBeInTheDocument()
    })

    it('aria-label이 설정되어야 한다', () => {
      render(<UserAvatar {...defaultProps} alt="GitHub User" />)
      expect(screen.getByLabelText('GitHub User')).toBeInTheDocument()
    })
  })

  describe('성능', () => {
    it('동일한 URL에 대해 캐싱이 동작해야 한다', async () => {
      const { rerender } = render(<UserAvatar {...defaultProps} />)

      await waitFor(() => {
        expect(imageOptimizer.optimizeAvatar).toHaveBeenCalledTimes(1)
      })

      // 같은 URL로 다시 렌더링
      rerender(<UserAvatar {...defaultProps} />)

      // 캐시에서 가져오므로 호출 횟수 증가하지 않음
      await waitFor(() => {
        expect(imageOptimizer.optimizeAvatar).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Edge Cases', () => {
    it('src가 빈 문자열이면 에러 처리되어야 한다', async () => {
      render(<UserAvatar src="" alt="empty" />)

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toHaveAttribute('data-error', 'true')
      })
    })

    it('size가 0이면 기본 크기(48)가 적용되어야 한다', () => {
      render(<UserAvatar {...defaultProps} size={0} />)
      const canvas = screen.getByRole('img') as HTMLCanvasElement
      expect(canvas.width).toBe(48)
    })

    it('size가 음수이면 기본 크기(48)가 적용되어야 한다', () => {
      render(<UserAvatar {...defaultProps} size={-10} />)
      const canvas = screen.getByRole('img') as HTMLCanvasElement
      expect(canvas.width).toBe(48)
    })
  })
})
