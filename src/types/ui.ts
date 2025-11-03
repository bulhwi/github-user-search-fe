/**
 * UI State Type Definitions
 */

/**
 * Loading State
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed'

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Breakpoint
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Toast Notification
 */
export interface Toast {
  id: string
  message: string
  severity: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}
