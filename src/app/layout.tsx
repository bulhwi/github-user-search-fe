import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'GitHub User Search',
  description: 'Search GitHub users with advanced filters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body id="__next">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}