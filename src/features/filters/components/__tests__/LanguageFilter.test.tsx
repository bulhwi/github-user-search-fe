import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageFilter } from '../LanguageFilter'

describe('LanguageFilter', () => {
  describe('렌더링 - 성공 케이스', () => {
    it('기본값으로 빈 입력 필드가 표시되어야 한다', () => {
      render(<LanguageFilter value="" onChange={() => {}} />)
      const input = screen.getByLabelText(/language/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('초기 value가 표시되어야 한다', () => {
      render(<LanguageFilter value="JavaScript" onChange={() => {}} />)
      const input = screen.getByLabelText(/language/i)
      expect(input).toHaveValue('JavaScript')
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      render(<LanguageFilter value="" onChange={() => {}} />)
      expect(
        screen.getByText(/filter by programming language/i)
      ).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <LanguageFilter value="" onChange={() => {}} className="custom-class" />
      )
      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 성공 케이스', () => {
    it('텍스트 입력 시 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LanguageFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/language/i)
      await user.type(input, 'J')

      expect(handleChange).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith('J')
    })

    it('값을 지울 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LanguageFilter value="JavaScript" onChange={handleChange} />)

      const input = screen.getByLabelText(/language/i)
      await user.clear(input)

      expect(handleChange).toHaveBeenCalledWith('')
    })

    it('인기 언어 옵션이 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<LanguageFilter value="" onChange={() => {}} />)

      const input = screen.getByLabelText(/language/i)
      await user.click(input)

      // 인기 언어들이 옵션으로 표시되어야 함
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  describe('Autocomplete 기능', () => {
    it('입력 시 필터링된 옵션이 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<LanguageFilter value="" onChange={() => {}} />)

      const input = screen.getByLabelText(/language/i)
      await user.type(input, 'Java')

      // Java로 시작하는 언어들
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Java')).toBeInTheDocument()
    })

    it('대소문자 구분 없이 필터링되어야 한다', async () => {
      const user = userEvent.setup()
      render(<LanguageFilter value="" onChange={() => {}} />)

      const input = screen.getByLabelText(/language/i)
      await user.type(input, 'python')

      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<LanguageFilter value="" />)
      expect(screen.getByLabelText(/language/i)).toBeInTheDocument()
    })

    it('목록에 없는 커스텀 언어를 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<LanguageFilter value="" onChange={handleChange} />)

      const input = screen.getByLabelText(/language/i)
      await user.type(input, 'E')

      expect(handleChange).toHaveBeenCalledWith('E')
    })
  })

  describe('접근성', () => {
    it('label이 input과 올바르게 연결되어 있어야 한다', () => {
      render(<LanguageFilter value="" onChange={() => {}} />)
      const input = screen.getByLabelText(/language/i)
      expect(input).toHaveAttribute('id')
    })

    it('placeholder가 표시되어야 한다', () => {
      render(<LanguageFilter value="" onChange={() => {}} />)
      const input = screen.getByPlaceholderText(/e\.g\. JavaScript, Python/i)
      expect(input).toBeInTheDocument()
    })
  })
})
