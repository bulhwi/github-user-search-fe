'use client'

import { Select, SelectOption } from '@/components/atoms/Select'
import type { AccountType } from '@/types'

export interface TypeFilterProps {
  value: AccountType | null
  onChange: (type: AccountType | null) => void
  className?: string
}

type TypeFilterValue = 'all' | 'user' | 'org'

const typeOptions: SelectOption<TypeFilterValue>[] = [
  { value: 'all', label: 'All' },
  { value: 'user', label: 'Users' },
  { value: 'org', label: 'Organizations' },
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
      label="Account Type"
      value={selectValue}
      options={typeOptions}
      onChange={handleChange}
      helperText="Filter by user or organization"
      className={className}
    />
  )
}
