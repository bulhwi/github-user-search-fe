import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode, Toast, RateLimit } from '@/types'

export interface UIState {
  themeMode: ThemeMode
  rateLimit: RateLimit | null
  toasts: Toast[]
}

const initialState: UIState = {
  themeMode: 'light',
  rateLimit: null,
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
    },
    setRateLimit: (state, action: PayloadAction<RateLimit>) => {
      state.rateLimit = action.payload
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Date.now().toString(),
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    },
  },
})

export const {
  setThemeMode,
  setRateLimit,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions
export default uiSlice.reducer
