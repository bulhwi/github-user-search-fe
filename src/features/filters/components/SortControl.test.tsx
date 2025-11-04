import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortControl } from './SortControl'

describe('SortControl', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('렌더링 - 성공 케이스', () => {
    it('정렬 Select가 렌더링되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
    })

    it('Order 토글 버튼이 렌더링되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      expect(screen.getByRole('button', { name: /order/i })).toBeInTheDocument()
    })

    it('기본값으로 Best Match가 선택되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      expect(screen.getByText('Best Match')).toBeInTheDocument()
    })

    it('기본값으로 DESC (내림차순)이 선택되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      expect(screen.getByText(/desc/i)).toBeInTheDocument()
    })
  })

  describe('정렬 옵션 변경', () => {
    it('Best Match를 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="followers" onChange={mockOnChange} />)

      const select = screen.getByLabelText(/sort by/i)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: /best match/i }))

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'best-match',
        order: 'desc',
      })
    })

    it('Followers를 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const select = screen.getByLabelText(/sort by/i)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: /followers/i }))

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'followers',
        order: 'desc',
      })
    })

    it('Repositories를 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const select = screen.getByLabelText(/sort by/i)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: /repositories/i }))

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'repositories',
        order: 'desc',
      })
    })

    it('Joined를 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const select = screen.getByLabelText(/sort by/i)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: /joined/i }))

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'joined',
        order: 'desc',
      })
    })
  })

  describe('Order 토글', () => {
    it('DESC → ASC로 토글할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="followers" order="desc" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      await user.click(orderButton)

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'followers',
        order: 'asc',
      })
    })

    it('ASC → DESC로 토글할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SortControl value="followers" order="asc" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      await user.click(orderButton)

      expect(mockOnChange).toHaveBeenCalledWith({
        sort: 'followers',
        order: 'desc',
      })
    })

    it('DESC일 때 아래 화살표 아이콘이 표시되어야 한다', () => {
      render(<SortControl value="followers" order="desc" onChange={mockOnChange} />)

      expect(screen.getByTestId('ArrowDownwardIcon')).toBeInTheDocument()
    })

    it('ASC일 때 위 화살표 아이콘이 표시되어야 한다', () => {
      render(<SortControl value="followers" order="asc" onChange={mockOnChange} />)

      expect(screen.getByTestId('ArrowUpwardIcon')).toBeInTheDocument()
    })
  })

  describe('Best Match 선택 시 Order 비활성화', () => {
    it('Best Match일 때 Order 버튼이 비활성화되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      expect(orderButton).toBeDisabled()
    })

    it('Best Match가 아닐 때 Order 버튼이 활성화되어야 한다', () => {
      render(<SortControl value="followers" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      expect(orderButton).not.toBeDisabled()
    })

    it('Best Match일 때 Order 버튼에 툴팁이 표시되어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      expect(orderButton).toHaveAttribute('title')
    })
  })

  describe('현재 선택된 정렬 표시', () => {
    it('선택된 정렬 옵션이 Select에 표시되어야 한다', () => {
      render(<SortControl value="followers" onChange={mockOnChange} />)

      expect(screen.getByText('Followers')).toBeInTheDocument()
    })

    it('Order가 DESC일 때 "Descending" 텍스트가 표시되어야 한다', () => {
      render(<SortControl value="followers" order="desc" onChange={mockOnChange} />)

      expect(screen.getByText(/descending/i)).toBeInTheDocument()
    })

    it('Order가 ASC일 때 "Ascending" 텍스트가 표시되어야 한다', () => {
      render(<SortControl value="followers" order="asc" onChange={mockOnChange} />)

      expect(screen.getByText(/ascending/i)).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('Select에 label이 연결되어 있어야 한다', () => {
      render(<SortControl value="best-match" onChange={mockOnChange} />)

      const select = screen.getByLabelText(/sort by/i)
      expect(select).toBeInTheDocument()
    })

    it('Order 버튼에 aria-label이 설정되어야 한다', () => {
      render(<SortControl value="followers" onChange={mockOnChange} />)

      const orderButton = screen.getByRole('button', { name: /order/i })
      expect(orderButton).toHaveAttribute('aria-label')
    })
  })

  describe('Edge Cases', () => {
    it('value가 없으면 best-match를 기본값으로 사용해야 한다', () => {
      render(<SortControl value={undefined as any} onChange={mockOnChange} />)

      expect(screen.getByText('Best Match')).toBeInTheDocument()
    })

    it('order가 없으면 desc를 기본값으로 사용해야 한다', () => {
      render(<SortControl value="followers" order={undefined} onChange={mockOnChange} />)

      expect(screen.getByText(/desc/i)).toBeInTheDocument()
    })
  })

  describe('커스텀 스타일', () => {
    it('className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <SortControl value="best-match" onChange={mockOnChange} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
})
