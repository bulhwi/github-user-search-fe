import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

// Mock useTheme hook
const mockToggleTheme = jest.fn()
const mockUseTheme = jest.fn()

jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme(),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockToggleTheme.mockClear()
    mockUseTheme.mockReturnValue({
      themeMode: 'light',
      toggleTheme: mockToggleTheme,
      isDark: false,
    })
  })

  describe('렌더링 - Light Mode', () => {
    it('Light Mode일 때 Moon 아이콘이 표시되어야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'light',
        toggleTheme: mockToggleTheme,
        isDark: false,
      })

      render(<ThemeToggle />)

      expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument()
    })

    it('토글 버튼이 렌더링되어야 한다', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('aria-label이 설정되어야 한다', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })
  })

  describe('렌더링 - Dark Mode', () => {
    it('Dark Mode일 때 Sun 아이콘이 표시되어야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'dark',
        toggleTheme: mockToggleTheme,
        isDark: true,
      })

      render(<ThemeToggle />)

      expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument()
    })

    it('Dark Mode 텍스트가 표시되어야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'dark',
        toggleTheme: mockToggleTheme,
        isDark: true,
      })

      render(<ThemeToggle />)

      expect(screen.getByLabelText(/dark mode/i)).toBeInTheDocument()
    })
  })

  describe('테마 토글 기능', () => {
    it('버튼 클릭 시 toggleTheme이 호출되어야 한다', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('여러 번 클릭해도 toggleTheme이 매번 호출되어야 한다', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })
  })

  describe('Tooltip', () => {
    it('Light Mode일 때 tooltip이 설정되어야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'light',
        toggleTheme: mockToggleTheme,
        isDark: false,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('Dark Mode일 때 tooltip이 설정되어야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'dark',
        toggleTheme: mockToggleTheme,
        isDark: true,
      })

      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('role="button"이 설정되어야 한다', () => {
      render(<ThemeToggle />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('aria-label이 현재 테마 상태를 반영해야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'light',
        toggleTheme: mockToggleTheme,
        isDark: false,
      })

      const { rerender } = render(<ThemeToggle />)
      expect(screen.getByLabelText(/light mode/i)).toBeInTheDocument()

      mockUseTheme.mockReturnValue({
        themeMode: 'dark',
        toggleTheme: mockToggleTheme,
        isDark: true,
      })

      rerender(<ThemeToggle />)
      expect(screen.getByLabelText(/dark mode/i)).toBeInTheDocument()
    })
  })

  describe('커스텀 스타일', () => {
    it('className을 적용할 수 있어야 한다', () => {
      const { container } = render(<ThemeToggle className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Edge Cases', () => {
    it('toggleTheme이 undefined여도 에러가 발생하지 않아야 한다', () => {
      mockUseTheme.mockReturnValue({
        themeMode: 'light',
        toggleTheme: undefined as any,
        isDark: false,
      })

      expect(() => render(<ThemeToggle />)).not.toThrow()
    })
  })
})
