/**
 * useTheme Hook
 *
 * Feature #14: 다크모드 지원
 * - 시스템 Preference 자동 감지
 * - localStorage 저장/로드
 * - 테마 토글 기능
 */

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setThemeMode } from '@/store/slices/uiSlice'
import type { ThemeMode } from '@/types'

const THEME_STORAGE_KEY = 'github-user-search-theme'

/**
 * 시스템 Preference 감지
 */
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * localStorage에서 테마 로드
 */
function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error)
  }

  return null
}

/**
 * localStorage에 테마 저장
 */
function saveTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
}

/**
 * useTheme Hook
 */
export function useTheme() {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector((state) => state.ui.themeMode)

  // 초기 테마 설정 (localStorage > System Preference)
  useEffect(() => {
    const storedTheme = getStoredTheme()
    const systemPreference = getSystemPreference()

    // localStorage에 저장된 테마가 있으면 우선 사용
    const initialTheme = storedTheme || systemPreference

    if (initialTheme !== themeMode) {
      dispatch(setThemeMode(initialTheme))
    }
  }, [dispatch, themeMode])

  // 시스템 Preference 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // localStorage에 저장된 테마가 있으면 시스템 Preference 무시
      const storedTheme = getStoredTheme()
      if (storedTheme) return

      const newTheme = e.matches ? 'dark' : 'light'
      dispatch(setThemeMode(newTheme))
    }

    // addEventListener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // addListener (legacy browsers)
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [dispatch])

  // 테마 토글
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light'
    dispatch(setThemeMode(newTheme))
    saveTheme(newTheme)
  }

  // 특정 테마로 설정
  const setTheme = (theme: ThemeMode) => {
    dispatch(setThemeMode(theme))
    saveTheme(theme)
  }

  return {
    themeMode,
    toggleTheme,
    setTheme,
    isDark: themeMode === 'dark',
  }
}
