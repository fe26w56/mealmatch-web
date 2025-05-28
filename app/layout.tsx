import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'
import { APP_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} - 献立計画`,
  description: APP_CONFIG.description,
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/logo.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: `${APP_CONFIG.name} - 献立計画`,
    description: APP_CONFIG.description,
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
