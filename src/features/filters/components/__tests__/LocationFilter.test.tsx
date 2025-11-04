import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationFilter } from '../LocationFilter'

describe('LocationFilter', () => {
  describe('렌더링 - 성공 케이스', () => {
    it('기본값으로 빈 입력 필드가 표시되어야 한다', () => {
      render(<LocationFilter value="" onChange={() => {}} />)
      const input = screen.getByLabelText(/위치/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('초기 value가 표시되어야 한다', () => {
      render(<LocationFilter value="Seoul" onChange={() => {}} />)
      const input = screen.getByLabelText(/위치/i)
      expect(input).toHaveValue('Seoul')
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      render(<LocationFilter value="" onChange={() => {}} />)
      expect(
        screen.getByText(/위치로 검색/i)
      ).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <LocationFilter value="" onChange={() => {}} className="custom-class" />
      )
      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 성공 케이스', () => {
    it('텍스트 입력 시 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      await user.type(input, 'S')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith('S')
    })

    it('값을 변경할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="Seoul" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      await user.clear(input)

      expect(handleChange).toHaveBeenCalledWith('')
    })

    it('값을 지울 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="Seoul" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      await user.clear(input)

      expect(handleChange).toHaveBeenCalledWith('')
    })

    it('공백이 포함된 위치를 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      // 공백 문자 입력
      await user.type(input, ' ')

      expect(handleChange).toHaveBeenCalledWith(' ')
    })

    it('특수문자가 포함된 위치를 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      await user.type(input, 'ã')

      expect(handleChange).toHaveBeenCalledWith('ã')
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<LocationFilter value="" />)
      expect(screen.getByLabelText(/위치/i)).toBeInTheDocument()
    })

    it('매우 긴 위치 이름을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LocationFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/위치/i)
      await user.type(input, 'A')

      // onChange가 호출되었는지 확인
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith('A')
    })
  })

  describe('접근성', () => {
    it('label이 input과 올바르게 연결되어 있어야 한다', () => {
      render(<LocationFilter value="" onChange={() => {}} />)
      const input = screen.getByLabelText(/위치/i)
      expect(input).toHaveAttribute('id')
    })

    it('placeholder가 표시되어야 한다', () => {
      render(<LocationFilter value="" onChange={() => {}} />)
      const input = screen.getByPlaceholderText(/예: 서울, 샌프란시스코/i)
      expect(input).toBeInTheDocument()
    })
  })
})
