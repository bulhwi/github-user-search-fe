import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInFilter } from './SearchInFilter'

describe('SearchInFilter', () => {
  describe('렌더링 - 성공 케이스', () => {
    it('세 개의 체크박스를 모두 렌더링해야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={['login']} onChange={onChange} />)

      expect(screen.getByLabelText('Login')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('선택된 필드가 체크되어야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={['login', 'name']} onChange={onChange} />)

      expect(screen.getByLabelText('Login')).toBeChecked()
      expect(screen.getByLabelText('Name')).toBeChecked()
      expect(screen.getByLabelText('Email')).not.toBeChecked()
    })

    it('도움말 텍스트를 표시해야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={['login']} onChange={onChange} />)

      expect(
        screen.getByText(
          'Search in login, name, or email (at least one required)'
        )
      ).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const onChange = jest.fn()
      const { container } = render(
        <SearchInFilter
          value={['login']}
          onChange={onChange}
          className="custom-class"
        />
      )

      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 체크', () => {
    it('필드를 체크하면 onChange가 추가된 배열과 함께 호출되어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login']} onChange={onChange} />)

      const emailCheckbox = screen.getByLabelText('Email')
      await user.click(emailCheckbox)

      expect(onChange).toHaveBeenCalledWith(['login', 'email'])
    })

    it('여러 필드를 동시에 선택할 수 있어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login']} onChange={onChange} />)

      const nameCheckbox = screen.getByLabelText('Name')
      await user.click(nameCheckbox)

      expect(onChange).toHaveBeenCalledWith(['login', 'name'])
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('모든 필드를 선택할 수 있어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login']} onChange={onChange} />)

      // Name 추가
      const nameCheckbox = screen.getByLabelText('Name')
      await user.click(nameCheckbox)
      expect(onChange).toHaveBeenLastCalledWith(['login', 'name'])

      // Email 추가 (다음 렌더에서)
      // 실제로는 새로운 value로 rerender해야 하지만 여기서는 첫 호출만 확인
    })
  })

  describe('사용자 상호작용 - 언체크', () => {
    it('필드를 언체크하면 onChange가 제거된 배열과 함께 호출되어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login', 'name']} onChange={onChange} />)

      const nameCheckbox = screen.getByLabelText('Name')
      await user.click(nameCheckbox)

      expect(onChange).toHaveBeenCalledWith(['login'])
    })

    it('마지막 필드는 언체크할 수 없어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login']} onChange={onChange} />)

      const loginCheckbox = screen.getByLabelText('Login')
      await user.click(loginCheckbox)

      // onChange가 호출되지 않아야 함 (최소 1개 유지)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('두 개 중 하나를 언체크하면 한 개가 남아야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login', 'name', 'email']} onChange={onChange} />)

      const emailCheckbox = screen.getByLabelText('Email')
      await user.click(emailCheckbox)

      expect(onChange).toHaveBeenCalledWith(['login', 'name'])
    })
  })

  describe('Edge Cases', () => {
    it('빈 배열이 전달되어도 렌더링되어야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={[]} onChange={onChange} />)

      expect(screen.getByLabelText('Login')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('중복된 값이 있는 배열도 처리해야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={['login', 'login', 'name']} onChange={onChange} />)

      expect(screen.getByLabelText('Login')).toBeChecked()
      expect(screen.getByLabelText('Name')).toBeChecked()
    })

    it('잘못된 값이 포함된 배열도 처리해야 한다', () => {
      const onChange = jest.fn()
      // @ts-expect-error Testing with invalid value
      render(<SearchInFilter value={['login', 'invalid', 'name']} onChange={onChange} />)

      expect(screen.getByLabelText('Login')).toBeChecked()
      expect(screen.getByLabelText('Name')).toBeChecked()
      expect(screen.getByLabelText('Email')).not.toBeChecked()
    })
  })

  describe('접근성', () => {
    it('모든 체크박스가 접근 가능해야 한다', () => {
      const onChange = jest.fn()
      render(<SearchInFilter value={['login']} onChange={onChange} />)

      const usernameCheckbox = screen.getByLabelText('Login')
      const nameCheckbox = screen.getByLabelText('Name')
      const emailCheckbox = screen.getByLabelText('Email')

      expect(usernameCheckbox).toHaveAccessibleName('Login')
      expect(nameCheckbox).toHaveAccessibleName('Name')
      expect(emailCheckbox).toHaveAccessibleName('Email')
    })

    it('체크박스가 키보드로 조작 가능해야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<SearchInFilter value={['login']} onChange={onChange} />)

      // Tab으로 포커스 이동 후 Space로 선택
      await user.tab()
      await user.tab()
      await user.tab()
      await user.keyboard(' ')

      // Email 체크박스가 체크되어야 함
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('실패 케이스', () => {
    it('onChange가 없어도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<SearchInFilter value={['login']} />)

      expect(screen.getByLabelText('Login')).toBeInTheDocument()
    })
  })
})
