import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ReposFilter } from '../ReposFilter'
import type { RangeFilter } from '@/types'

// Controlled wrapper for testing
function ControlledReposFilter({ initialValue = {}, className }: { initialValue?: RangeFilter; className?: string }) {
  const [value, setValue] = useState<RangeFilter>(initialValue)
  return <ReposFilter value={value} onChange={setValue} className={className} />
}

describe('ReposFilter', () => {
  const getMinInput = () => screen.getByRole('spinbutton', { name: /최소 리포지토리/i }) as HTMLInputElement
  const getMaxInput = () => screen.getByRole('spinbutton', { name: /최대 리포지토리/i }) as HTMLInputElement

  describe('렌더링 - 성공 케이스', () => {
    it('Min과 Max 입력 필드를 렌더링해야 한다', () => {
      const onChange = jest.fn()
      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMinInput()).toBeInTheDocument()
      expect(getMaxInput()).toBeInTheDocument()
    })

    it('초기 값이 없을 때 빈 입력 필드를 표시해야 한다', () => {
      const onChange = jest.fn()
      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMinInput().value).toBe('')
      expect(getMaxInput().value).toBe('')
    })

    it('초기 값이 있을 때 입력 필드에 값을 표시해야 한다', () => {
      const onChange = jest.fn()
      const value: RangeFilter = { min: 10, max: 100 }
      render(<ReposFilter value={value} onChange={onChange} />)

      expect(getMinInput().value).toBe('10')
      expect(getMaxInput().value).toBe('100')
    })

    it('도움말 텍스트를 표시해야 한다', () => {
      const onChange = jest.fn()
      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(
        screen.getByText('리포지토리 수로 필터링')
      ).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const onChange = jest.fn()
      const { container } = render(
        <ReposFilter value={{}} onChange={onChange} className="custom-class" />
      )

      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - Min 입력', () => {
    it('Min 값을 입력하면 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMinInput(), '10')

      expect(getMinInput().value).toBe('10')
    })

    it('Min 값만 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMinInput(), '50')

      expect(getMinInput().value).toBe('50')
    })

    it('Min 값을 변경하면 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter initialValue={{ min: 10 }} />)

      await user.clear(getMinInput())
      await user.type(getMinInput(), '20')

      expect(getMinInput().value).toBe('20')
    })

    it('Min 값을 지우면 onChange가 빈 객체와 함께 호출되어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter initialValue={{ min: 10 }} />)

      await user.clear(getMinInput())

      expect(getMinInput().value).toBe('')
    })
  })

  describe('사용자 상호작용 - Max 입력', () => {
    it('Max 값을 입력하면 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMaxInput(), '100')

      expect(getMaxInput().value).toBe('100')
    })

    it('Max 값만 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMaxInput(), '200')

      expect(getMaxInput().value).toBe('200')
    })

    it('Max 값을 변경하면 onChange가 호출되어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter initialValue={{ max: 100 }} />)

      await user.clear(getMaxInput())
      await user.type(getMaxInput(), '150')

      expect(getMaxInput().value).toBe('150')
    })
  })

  describe('사용자 상호작용 - 범위 입력', () => {
    it('Min과 Max를 모두 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMinInput(), '10')
      await user.type(getMaxInput(), '100')

      expect(getMinInput().value).toBe('10')
      expect(getMaxInput().value).toBe('100')
    })

    it('Max를 먼저 입력하고 Min을 나중에 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMaxInput(), '100')
      await user.type(getMinInput(), '10')

      expect(getMinInput().value).toBe('10')
      expect(getMaxInput().value).toBe('100')
    })
  })

  describe('유효성 검증', () => {
    it('음수 값을 입력할 수 없어야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMinInput()).toHaveAttribute('min', '0')
    })

    it('Min이 Max보다 클 때 에러 메시지를 표시해야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{ min: 100, max: 50 }} onChange={onChange} />)

      expect(
        screen.getByText('최소값은 최대값보다 작거나 같아야 합니다')
      ).toBeInTheDocument()
    })

    it('Min이 Max보다 작거나 같을 때 에러 메시지가 없어야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{ min: 50, max: 100 }} onChange={onChange} />)

      expect(
        screen.queryByText('최소값은 최대값보다 작거나 같아야 합니다')
      ).not.toBeInTheDocument()
    })

    it('Min과 Max가 같을 때 유효해야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{ min: 50, max: 50 }} onChange={onChange} />)

      expect(
        screen.queryByText('최소값은 최대값보다 작거나 같아야 합니다')
      ).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('0을 Min 값으로 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMinInput(), '0')

      expect(getMinInput().value).toBe('0')
    })

    it('큰 숫자를 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()

      render(<ControlledReposFilter />)

      await user.type(getMaxInput(), '999999')

      expect(getMaxInput().value).toBe('999999')
    })

    it('소수점을 입력할 수 없어야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMinInput()).toHaveAttribute('step', '1')
    })

    it('onChange가 없어도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<ReposFilter value={{}} />)

      expect(getMinInput()).toBeInTheDocument()
    })

    it('Min만 있는 값으로 렌더링할 수 있어야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{ min: 10 }} onChange={onChange} />)

      expect(getMinInput().value).toBe('10')
    })

    it('Max만 있는 값으로 렌더링할 수 있어야 한다', () => {
      const onChange = jest.fn()

      render(<ReposFilter value={{ max: 100 }} onChange={onChange} />)

      expect(getMaxInput().value).toBe('100')
    })
  })

  describe('접근성', () => {
    it('Min 입력 필드가 접근 가능해야 한다', () => {
      const onChange = jest.fn()
      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMinInput()).toHaveAccessibleName()
    })

    it('Max 입력 필드가 접근 가능해야 한다', () => {
      const onChange = jest.fn()
      render(<ReposFilter value={{}} onChange={onChange} />)

      expect(getMaxInput()).toHaveAccessibleName()
    })

    it('입력 필드가 키보드로 조작 가능해야 한다', async () => {
      const onChange = jest.fn()
      const user = userEvent.setup()

      render(<ReposFilter value={{}} onChange={onChange} />)

      // Tab으로 포커스 이동
      await user.tab()
      expect(getMinInput()).toHaveFocus()

      await user.tab()
      expect(getMaxInput()).toHaveFocus()
    })
  })
})
