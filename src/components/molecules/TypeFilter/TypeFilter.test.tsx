import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypeFilter } from './TypeFilter'
import type { AccountType } from '@/types'

describe('TypeFilter', () => {
  it('should render with default "All" selected', () => {
    const onChange = jest.fn()
    render(<TypeFilter value={null} onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    expect(select).toBeInTheDocument()
    expect(select).toHaveTextContent('All')
  })

  it('should render with "Users" selected when value is "user"', () => {
    const onChange = jest.fn()
    render(<TypeFilter value="user" onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    expect(select).toHaveTextContent('Users')
  })

  it('should render with "Organizations" selected when value is "org"', () => {
    const onChange = jest.fn()
    render(<TypeFilter value="org" onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    expect(select).toHaveTextContent('Organizations')
  })

  it('should call onChange with "user" when Users is selected', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<TypeFilter value={null} onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    await user.click(select)

    const userOption = screen.getByRole('option', { name: 'Users' })
    await user.click(userOption)

    expect(onChange).toHaveBeenCalledWith('user')
  })

  it('should call onChange with "org" when Organizations is selected', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<TypeFilter value={null} onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    await user.click(select)

    const orgOption = screen.getByRole('option', { name: 'Organizations' })
    await user.click(orgOption)

    expect(onChange).toHaveBeenCalledWith('org')
  })

  it('should call onChange with null when All is selected', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    render(<TypeFilter value="user" onChange={onChange} />)

    const select = screen.getByLabelText('Account Type')
    await user.click(select)

    const allOption = screen.getByRole('option', { name: 'All' })
    await user.click(allOption)

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('should display helper text', () => {
    const onChange = jest.fn()
    render(<TypeFilter value={null} onChange={onChange} />)

    expect(
      screen.getByText('Filter by user or organization')
    ).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const onChange = jest.fn()
    const { container } = render(
      <TypeFilter value={null} onChange={onChange} className="custom-class" />
    )

    const formControl = container.querySelector('.custom-class')
    expect(formControl).toBeInTheDocument()
  })
})
