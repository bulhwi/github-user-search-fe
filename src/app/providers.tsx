'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeWrapper } from './ThemeWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  )
}