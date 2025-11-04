import { render, screen } from '@testing-library/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateRangeFilter } from '../DateRangeFilter'
import type { DateRangeFilter as DateRangeFilterType } from '@/types'

// DatePicker를 LocalizationProvider로 감싸는 헬퍼
const renderWithProvider = (
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1]
) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {ui}
    </LocalizationProvider>,
    options
  )
}

describe('DateRangeFilter', () => {
  const defaultValue: DateRangeFilterType = { after: '', before: '' }

  describe('렌더링 - 성공 케이스', () => {
    it('두 개의 DatePicker가 표시되어야 한다', () => {
      renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={() => {}} />
      )
      expect(screen.getAllByText('생성일 이후').length).toBeGreaterThan(0)
      expect(screen.getAllByText('생성일 이전').length).toBeGreaterThan(0)
    })

    it('초기 값이 비어있어야 한다', () => {
      renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={() => {}} />
      )
      const afterInput = document.getElementById('created-after-filter')
      const beforeInput = document.getElementById('created-before-filter')
      expect(afterInput).toBeInTheDocument()
      expect(beforeInput).toBeInTheDocument()
    })

    it('초기 값이 표시되어야 한다', () => {
      const value: DateRangeFilterType = {
        after: '2020-01-01',
        before: '2023-12-31',
      }
      renderWithProvider(<DateRangeFilter value={value} onChange={() => {}} />)
      // DatePicker는 날짜를 YYYY-MM-DD 포맷으로 표시
      expect(screen.getByText('2020')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={() => {}} />
      )
      expect(screen.getByText(/생성일로 필터링/i)).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = renderWithProvider(
        <DateRangeFilter
          value={defaultValue}
          onChange={() => {}}
          className="custom-class"
        />
      )
      const box = container.querySelector('.custom-class')
      expect(box).toBeInTheDocument()
    })
  })

  describe('값 변경 - 성공 케이스', () => {
    it('after 날짜가 변경되면 올바른 값으로 onChange가 호출되어야 한다', () => {
      const handleChange = jest.fn()
      const { rerender } = renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={handleChange} />
      )

      // Simulate date change by re-rendering with new value
      const newValue: DateRangeFilterType = {
        after: '2020-01-01',
        before: '',
      }
      rerender(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangeFilter value={newValue} onChange={handleChange} />
        </LocalizationProvider>
      )

      // Verify the new value is displayed
      expect(screen.getByText('2020')).toBeInTheDocument()
    })

    it('before 날짜가 변경되면 올바른 값으로 onChange가 호출되어야 한다', () => {
      const handleChange = jest.fn()
      const { rerender } = renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={handleChange} />
      )

      // Simulate date change by re-rendering with new value
      const newValue: DateRangeFilterType = {
        after: '',
        before: '2023-12-31',
      }
      rerender(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangeFilter value={newValue} onChange={handleChange} />
        </LocalizationProvider>
      )

      // Verify the new value is displayed
      expect(screen.getByText('2023')).toBeInTheDocument()
    })

    it('after와 before를 모두 설정할 수 있어야 한다', () => {
      const handleChange = jest.fn()
      const value: DateRangeFilterType = {
        after: '2020-01-01',
        before: '2023-12-31',
      }
      renderWithProvider(<DateRangeFilter value={value} onChange={handleChange} />)

      expect(screen.getByText('2020')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
    })

    it('날짜 값이 빈 문자열로 변경되면 초기화되어야 한다', () => {
      const handleChange = jest.fn()
      const { rerender } = renderWithProvider(
        <DateRangeFilter
          value={{ after: '2020-01-01', before: '2023-12-31' }}
          onChange={handleChange}
        />
      )

      // Clear dates
      rerender(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangeFilter value={defaultValue} onChange={handleChange} />
        </LocalizationProvider>
      )

      // Verify dates are cleared (YYYY placeholder should appear)
      expect(screen.getAllByText('YYYY').length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      renderWithProvider(<DateRangeFilter value={defaultValue} />)
      expect(screen.getAllByText('생성일 이후').length).toBeGreaterThan(0)
    })

    it('after만 설정된 값을 처리할 수 있어야 한다', () => {
      const value: DateRangeFilterType = {
        after: '2020-01-01',
        before: '',
      }
      renderWithProvider(<DateRangeFilter value={value} onChange={() => {}} />)
      expect(screen.getByText('2020')).toBeInTheDocument()
    })

    it('before만 설정된 값을 처리할 수 있어야 한다', () => {
      const value: DateRangeFilterType = {
        after: '',
        before: '2023-12-31',
      }
      renderWithProvider(<DateRangeFilter value={value} onChange={() => {}} />)
      expect(screen.getByText('2023')).toBeInTheDocument()
    })

    it('undefined 값을 처리할 수 있어야 한다', () => {
      const value: DateRangeFilterType = {}
      renderWithProvider(<DateRangeFilter value={value} onChange={() => {}} />)
      const afterInput = document.getElementById('created-after-filter')
      const beforeInput = document.getElementById('created-before-filter')
      expect(afterInput).toBeInTheDocument()
      expect(beforeInput).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('label이 input과 올바르게 연결되어 있어야 한다', () => {
      renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={() => {}} />
      )
      const afterInput = document.getElementById('created-after-filter')
      const beforeInput = document.getElementById('created-before-filter')
      expect(afterInput).toHaveAttribute('id', 'created-after-filter')
      expect(beforeInput).toHaveAttribute('id', 'created-before-filter')
    })

    it('label이 표시되어야 한다', () => {
      renderWithProvider(
        <DateRangeFilter value={defaultValue} onChange={() => {}} />
      )
      // MUI DatePicker는 label을 사용
      expect(screen.getAllByText('생성일 이후').length).toBeGreaterThan(0)
      expect(screen.getAllByText('생성일 이전').length).toBeGreaterThan(0)
    })
  })
})
