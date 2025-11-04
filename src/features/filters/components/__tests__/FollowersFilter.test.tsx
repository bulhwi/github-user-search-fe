import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { FollowersFilter } from '../FollowersFilter'
import type { RangeFilter } from '@/types'

// Controlled component for testing
function ControlledFollowersFilter() {
  const [value, setValue] = useState<RangeFilter>({})
  return <FollowersFilter value={value} onChange={setValue} />
}

describe('FollowersFilter', () => {
  const defaultValue: RangeFilter = {}

  // Helper functions
  const getMinInput = () => screen.getByLabelText(/최소 팔로워/i) as HTMLInputElement
  const getMaxInput = () => screen.getByLabelText(/최대 팔로워/i) as HTMLInputElement

  describe('렌더링 - 성공 케이스', () => {
    it('기본 요소들이 표시되어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText(/팔로워 수/i)).toBeInTheDocument()
      expect(getMinInput()).toBeInTheDocument()
      expect(getMaxInput()).toBeInTheDocument()
    })

    it('초기 값이 비어있어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(getMinInput()).toHaveValue(null)
      expect(getMaxInput()).toHaveValue(null)
    })

    it('초기 값이 표시되어야 한다', () => {
      const value: RangeFilter = { min: 100, max: 1000 }
      render(<FollowersFilter value={value} onChange={() => {}} />)
      expect(getMinInput()).toHaveValue(100)
      expect(getMaxInput()).toHaveValue(1000)
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(screen.getByText(/팔로워 수로 필터링/i)).toBeInTheDocument()
    })

    it('커스텀 className을 적용할 수 있어야 한다', () => {
      const { container } = render(
        <FollowersFilter value={defaultValue} onChange={() => {}} className="custom-class" />
      )
      const formControl = container.querySelector('.custom-class')
      expect(formControl).toBeInTheDocument()
    })
  })

  describe('사용자 상호작용 - 성공 케이스', () => {
    it('min 값을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledFollowersFilter />)

      await user.type(getMinInput(), '100')

      expect(getMinInput()).toHaveValue(100)
    })

    it('max 값을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledFollowersFilter />)

      await user.type(getMaxInput(), '1000')

      expect(getMaxInput()).toHaveValue(1000)
    })

    it('min과 max를 모두 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledFollowersFilter />)

      await user.type(getMinInput(), '100')
      await user.type(getMaxInput(), '1000')

      expect(getMinInput()).toHaveValue(100)
      expect(getMaxInput()).toHaveValue(1000)
    })

    it('값을 지울 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      const value: RangeFilter = { min: 100, max: 1000 }
      render(<FollowersFilter value={value} onChange={handleChange} />)

      await user.clear(getMinInput())

      expect(handleChange).toHaveBeenCalledWith({ max: 1000 })
    })
  })

  describe('유효성 검증', () => {
    it('min > max일 때 에러가 표시되어야 한다', () => {
      const value: RangeFilter = { min: 1000, max: 100 }
      render(<FollowersFilter value={value} onChange={() => {}} />)

      expect(screen.getByText(/최소값은 최대값보다 작거나 같아야 합니다/i)).toBeInTheDocument()
    })

    it('min <= max일 때 에러가 표시되지 않아야 한다', () => {
      const value: RangeFilter = { min: 100, max: 1000 }
      render(<FollowersFilter value={value} onChange={() => {}} />)

      expect(screen.queryByText(/최소값은 최대값보다 작거나 같아야 합니다/i)).not.toBeInTheDocument()
      expect(screen.getByText(/팔로워 수로 필터링/i)).toBeInTheDocument()
    })

    it('min만 있을 때 에러가 표시되지 않아야 한다', () => {
      const value: RangeFilter = { min: 100 }
      render(<FollowersFilter value={value} onChange={() => {}} />)

      expect(screen.queryByText(/최소값은 최대값보다 작거나 같아야 합니다/i)).not.toBeInTheDocument()
    })

    it('max만 있을 때 에러가 표시되지 않아야 한다', () => {
      const value: RangeFilter = { max: 1000 }
      render(<FollowersFilter value={value} onChange={() => {}} />)

      expect(screen.queryByText(/최소값은 최대값보다 작거나 같아야 합니다/i)).not.toBeInTheDocument()
    })

    it('min === max일 때 에러가 표시되지 않아야 한다', () => {
      const value: RangeFilter = { min: 100, max: 100 }
      render(<FollowersFilter value={value} onChange={() => {}} />)

      expect(screen.queryByText(/최소값은 최대값보다 작거나 같아야 합니다/i)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('onChange가 제공되지 않아도 렌더링되어야 한다', () => {
      // @ts-expect-error Testing without onChange
      render(<FollowersFilter value={defaultValue} />)
      expect(screen.getByLabelText(/최소 팔로워/i)).toBeInTheDocument()
    })

    it('0 값을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledFollowersFilter />)

      await user.type(getMinInput(), '0')

      expect(getMinInput()).toHaveValue(0)
    })

    it('큰 숫자를 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<ControlledFollowersFilter />)

      await user.type(getMinInput(), '1000000')

      expect(getMinInput()).toHaveValue(1000000)
    })
  })

  describe('접근성', () => {
    it('label이 input과 올바르게 연결되어 있어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(getMinInput()).toHaveAttribute('type', 'number')
      expect(getMaxInput()).toHaveAttribute('type', 'number')
    })

    it('type="number" 속성이 있어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(getMinInput()).toHaveAttribute('type', 'number')
      expect(getMaxInput()).toHaveAttribute('type', 'number')
    })

    it('min 속성이 0이어야 한다', () => {
      render(<FollowersFilter value={defaultValue} onChange={() => {}} />)
      expect(getMinInput()).toHaveAttribute('min', '0')
      expect(getMaxInput()).toHaveAttribute('min', '0')
    })
  })
})
