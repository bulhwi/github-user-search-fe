'use client'

import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material'

export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

export interface SelectProps<T = string> {
  id: string
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  helperText?: string
  error?: boolean
  disabled?: boolean
  fullWidth?: boolean
  required?: boolean
  className?: string
}

export function Select<T extends string = string>({
  id,
  label,
  value,
  options,
  onChange,
  helperText,
  error = false,
  disabled = false,
  fullWidth = true,
  required = false,
  className,
}: SelectProps<T>) {
  const handleChange = (event: SelectChangeEvent<T>) => {
    onChange(event.target.value as T)
  }

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <MuiSelect<T>
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={handleChange}
        data-testid={id}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
