'use client'

import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material'
import type { SearchInField } from '@/types'

export interface SearchInFilterProps {
  value: SearchInField[]
  onChange: (value: SearchInField[]) => void
  className?: string
}

const searchInOptions: Array<{ value: SearchInField; label: string }> = [
  { value: 'login', label: '사용자명' },
  { value: 'name', label: '이름' },
  { value: 'email', label: '이메일' },
]

/**
 * SearchInFilter Component (Feature #2)
 *
 * 검색 대상 필드 선택 컴포넌트
 * - 다중 선택 가능 (login, name, email)
 * - 최소 1개 이상 선택 필수
 */
export function SearchInFilter({
  value,
  onChange,
  className,
}: SearchInFilterProps) {
  const handleChange = (field: SearchInField, checked: boolean) => {
    if (checked) {
      // 체크: 배열에 추가
      onChange([...value, field])
    } else {
      // 체크 해제: 배열에서 제거 (단, 최소 1개는 유지)
      const newValue = value.filter((v) => v !== field)
      if (newValue.length > 0) {
        onChange(newValue)
      }
      // 모든 선택 해제 방지 (최소 1개 유지)
    }
  }

  return (
    <FormControl component="fieldset" className={className}>
      <FormLabel component="legend">검색 대상</FormLabel>
      <FormGroup>
        {searchInOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={value.includes(option.value)}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                name={option.value}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      <FormHelperText>
        사용자명, 이름, 이메일에서 검색 (최소 1개 필수)
      </FormHelperText>
    </FormControl>
  )
}
