'use client'

import { Select, SelectOption } from '@/shared/components/Select'
import type { AccountType } from '@/types'

export interface TypeFilterProps {
  value: AccountType | null
  onChange: (type: AccountType | null) => void
  className?: string
}

type TypeFilterValue = 'all' | 'user' | 'org'

const typeOptions: SelectOption<TypeFilterValue>[] = [
  { value: 'all', label: '전체' },
  { value: 'user', label: '사용자' },
  { value: 'org', label: '조직' },
]

export function TypeFilter({ value, onChange, className }: TypeFilterProps) {
  const selectValue: TypeFilterValue = value || 'all'

  const handleChange = (newValue: TypeFilterValue) => {
    if (newValue === 'all') {
      onChange(null)
    } else {
      onChange(newValue as AccountType)
    }
  }

  return (
    <Select<TypeFilterValue>
      id="type-filter"
      label="계정 타입"
      value={selectValue}
      options={typeOptions}
      onChange={handleChange}
      helperText="사용자 또는 조직으로 필터링"
      className={className}
    />
  )
}
