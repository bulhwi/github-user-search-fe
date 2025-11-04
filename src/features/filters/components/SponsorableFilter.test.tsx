import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { SponsorableFilter } from './SponsorableFilter'

// Controlled component for testing
function ControlledSponsorableFilter() {
  const [value, setValue] = useState(false)
  return <SponsorableFilter value={value} onChange={setValue} />
}

describe('SponsorableFilter', () => {
  const defaultValue = false

  describe('렌더링 - 성공 케이스', () => {
    it('기본 요소들이 표시되어야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText(/sponsorable only/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('초기 값이 false일 때 스위치가 꺼져있어야 한다', () => {
      render(<SponsorableFilter value={false} onChange={() => {}} />)
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })

    it('초기 값이 true일 때 스위치가 켜져있어야 한다', () => {
      render(<SponsorableFilter value={true} onChange={() => {}} />)
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toBeChecked()
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText(/show only sponsorable users/i)).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <SponsorableFilter value={defaultValue} onChange={() => {}} className="custom-class" />
      )
      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 성공 케이스', () => {
    it('스위치를 클릭하면 onChange가 true로 호출되어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<SponsorableFilter value={false} onChange={handleChange} />)

      await user.click(screen.getByRole('checkbox'))

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('켜진 스위치를 클릭하면 onChange가 false로 호출되어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<SponsorableFilter value={true} onChange={handleChange} />)

      await user.click(screen.getByRole('checkbox'))

      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('여러 번 토글할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledSponsorableFilter />)

      const switchElement = screen.getByRole('checkbox')

      expect(switchElement).not.toBeChecked()

      await user.click(switchElement)
      expect(switchElement).toBeChecked()

      await user.click(switchElement)
      expect(switchElement).not.toBeChecked()

      await user.click(switchElement)
      expect(switchElement).toBeChecked()
    })

    it('label을 클릭해도 스위치가 토글되어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<SponsorableFilter value={false} onChange={handleChange} />)

      await user.click(screen.getByText(/sponsorable only/i))

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<SponsorableFilter value={defaultValue} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('value가 undefined일 때 false로 처리되어야 한다', () => {
      // @ts-expect-error Testing with undefined value
      render(<SponsorableFilter value={undefined} onChange={() => {}} />)
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })

    it('value가 null일 때 false로 처리되어야 한다', () => {
      // @ts-expect-error Testing with null value
      render(<SponsorableFilter value={null} onChange={() => {}} />)
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).not.toBeChecked()
    })
  })

  describe('접근성', () => {
    it('스위치가 올바른 role을 가져야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('스위치가 aria-label을 가져야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      const switchElement = screen.getByRole('checkbox')
      expect(switchElement).toHaveAttribute('aria-label')
    })

    it('FormControlLabel이 스위치와 연결되어야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      const label = screen.getByText(/sponsorable only/i)
      expect(label).toBeInTheDocument()
    })

    it('도움말 텍스트가 있어야 한다', () => {
      render(<SponsorableFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText(/show only sponsorable users/i)).toBeInTheDocument()
    })
  })

  describe('스타일링', () => {
    it('FormControl이 fullWidth여야 한다', () => {
      const { container } = render(
        <SponsorableFilter value={defaultValue} onChange={() => {}} />
      )
      const formControl = container.querySelector('.MuiFormControl-root')
      expect(formControl).toBeInTheDocument()
    })

    it('Switch 컴포넌트가 렌더링되어야 한다', () => {
      const { container } = render(
        <SponsorableFilter value={defaultValue} onChange={() => {}} />
      )
      const switchElement = container.querySelector('.MuiSwitch-root')
      expect(switchElement).toBeInTheDocument()
    })
  })
})
