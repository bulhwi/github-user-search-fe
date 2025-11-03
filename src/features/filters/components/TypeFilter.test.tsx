import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypeFilter } from './TypeFilter'

describe('TypeFilter', () => {
  describe('렌더링 - 성공 케이스', () => {
    it('기본값으로 "All"이 선택되어야 한다', () => {
      const onChange = jest.fn()
      render(<TypeFilter value={null} onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      expect(select).toBeInTheDocument()
      expect(select).toHaveTextContent('All')
    })

    it('value가 "user"일 때 "Users"가 선택되어야 한다', () => {
      const onChange = jest.fn()
      render(<TypeFilter value="user" onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      expect(select).toHaveTextContent('Users')
    })

    it('value가 "org"일 때 "Organizations"가 선택되어야 한다', () => {
      const onChange = jest.fn()
      render(<TypeFilter value="org" onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      expect(select).toHaveTextContent('Organizations')
    })

    it('도움말 텍스트를 표시해야 한다', () => {
      const onChange = jest.fn()
      render(<TypeFilter value={null} onChange={onChange} />)

      expect(
        screen.getByText('Filter by user or organization')
      ).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const onChange = jest.fn()
      const { container } = render(
        <TypeFilter value={null} onChange={onChange} className="custom-class" />
      )

      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 성공 케이스', () => {
    it('Users를 선택하면 onChange가 "user"와 함께 호출되어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<TypeFilter value={null} onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      await user.click(select)

      const userOption = screen.getByRole('option', { name: 'Users' })
      await user.click(userOption)

      expect(onChange).toHaveBeenCalledWith('user')
    })

    it('Organizations를 선택하면 onChange가 "org"와 함께 호출되어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<TypeFilter value={null} onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      await user.click(select)

      const orgOption = screen.getByRole('option', { name: 'Organizations' })
      await user.click(orgOption)

      expect(onChange).toHaveBeenCalledWith('org')
    })

    it('All을 선택하면 onChange가 null과 함께 호출되어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<TypeFilter value="user" onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      await user.click(select)

      const allOption = screen.getByRole('option', { name: 'All' })
      await user.click(allOption)

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('다른 타입으로 변경할 수 있어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<TypeFilter value="user" onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      await user.click(select)

      const orgOption = screen.getByRole('option', { name: 'Organizations' })
      await user.click(orgOption)

      expect(onChange).toHaveBeenCalledWith('org')
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      const { container } = render(<TypeFilter value={null} />)

      const select = screen.getByLabelText('Account Type')
      expect(select).toBeInTheDocument()
    })

    it('여러 번 연속으로 값을 변경할 수 있어야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      const { rerender } = render(<TypeFilter value={null} onChange={onChange} />)

      // 첫 번째 변경: All → Users
      const select = screen.getByLabelText('Account Type')
      await user.click(select)
      await user.click(screen.getByRole('option', { name: 'Users' }))

      expect(onChange).toHaveBeenCalledWith('user')

      // 두 번째 변경: Users → Organizations
      rerender(<TypeFilter value="user" onChange={onChange} />)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: 'Organizations' }))

      expect(onChange).toHaveBeenCalledWith('org')

      // 세 번째 변경: Organizations → All
      rerender(<TypeFilter value="org" onChange={onChange} />)
      await user.click(select)
      await user.click(screen.getByRole('option', { name: 'All' }))

      expect(onChange).toHaveBeenCalledWith(null)
      expect(onChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('접근성', () => {
    it('label이 select와 올바르게 연결되어 있어야 한다', () => {
      const onChange = jest.fn()
      render(<TypeFilter value={null} onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      expect(select).toHaveAccessibleName('Account Type')
    })

    it('모든 옵션이 접근 가능해야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<TypeFilter value={null} onChange={onChange} />)

      const select = screen.getByLabelText('Account Type')
      await user.click(select)

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Users' })).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'Organizations' })
      ).toBeInTheDocument()
    })
  })
})
