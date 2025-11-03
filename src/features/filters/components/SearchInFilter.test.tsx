import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInFilter } from './SearchInFilter'

describe('SearchInFilter', () => {
  it('should render all three checkboxes', () => {
    const onChange = jest.fn()
    render(<SearchInFilter value={['login']} onChange={onChange} />)

    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should check the selected fields', () => {
    const onChange = jest.fn()
    render(<SearchInFilter value={['login', 'name']} onChange={onChange} />)

    expect(screen.getByLabelText('Username')).toBeChecked()
    expect(screen.getByLabelText('Full Name')).toBeChecked()
    expect(screen.getByLabelText('Email')).not.toBeChecked()
  })

  it('should call onChange when checking a field', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SearchInFilter value={['login']} onChange={onChange} />)

    const emailCheckbox = screen.getByLabelText('Email')
    await user.click(emailCheckbox)

    expect(onChange).toHaveBeenCalledWith(['login', 'email'])
  })

  it('should call onChange when unchecking a field', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SearchInFilter value={['login', 'name']} onChange={onChange} />)

    const nameCheckbox = screen.getByLabelText('Full Name')
    await user.click(nameCheckbox)

    expect(onChange).toHaveBeenCalledWith(['login'])
  })

  it('should not allow unchecking the last field', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SearchInFilter value={['login']} onChange={onChange} />)

    const loginCheckbox = screen.getByLabelText('Username')
    await user.click(loginCheckbox)

    // onChange should NOT be called (최소 1개 유지)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should allow multiple selections', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<SearchInFilter value={['login']} onChange={onChange} />)

    const nameCheckbox = screen.getByLabelText('Full Name')
    await user.click(nameCheckbox)

    expect(onChange).toHaveBeenCalledWith(['login', 'name'])

    // 두 번째 클릭은 새로운 value로 다시 render해야 정확히 테스트 가능
    // 여기서는 첫 번째 호출만 확인
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should display helper text', () => {
    const onChange = jest.fn()
    render(<SearchInFilter value={['login']} onChange={onChange} />)

    expect(
      screen.getByText(
        'Search in username, full name, or email (at least one required)'
      )
    ).toBeInTheDocument()
  })

  it('should apply custom className', () => {
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
