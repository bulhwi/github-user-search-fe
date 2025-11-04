/**
 * Material-UI Theme Configuration
 *
 * Feature #14: 다크모드 지원
 * - Light/Dark 테마 정의
 * - Material Design 컬러 팔레트
 * - 시스템 Preference 연동
 */

import { createTheme, ThemeOptions } from '@mui/material/styles'

/**
 * 공통 테마 설정
 */
const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
}

/**
 * Light Theme
 */
export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e', // Pink
      light: '#f73378',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
})

/**
 * Dark Theme
 */
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Light Blue
      light: '#b3d9ff',
      dark: '#5d99c6',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#f48fb1', // Light Pink
      light: '#ffc1e3',
      dark: '#c25e82',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    ...commonTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          backgroundImage: 'none', // Material-UI 다크모드 기본 gradient 제거
        },
      },
    },
  },
})

/**
 * 테마 모드에 따른 테마 반환
 */
export function getTheme(mode: 'light' | 'dark') {
  return mode === 'light' ? lightTheme : darkTheme
}
