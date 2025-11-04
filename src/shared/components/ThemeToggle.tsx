'use client'

import { IconButton, Tooltip } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4' // Moon (Dark Mode로 전환)
import Brightness7Icon from '@mui/icons-material/Brightness7' // Sun (Light Mode로 전환)
import { useTheme } from '@/shared/hooks/useTheme'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme()

  const label = isDark ? 'Dark mode' : 'Light mode'
  const tooltipTitle = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label={label}
        className={className}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  )
}
