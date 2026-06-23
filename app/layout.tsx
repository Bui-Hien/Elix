import React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Geist_Mono, Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { App as AntdApp } from 'antd'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-display',
  display: 'swap'
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'Seravian - Trang sức đá phong thủy cao cấp',
    template: '%s | Elix'
  },
  description: 'Chuyên cung cấp vòng tay, vòng cổ, mặt dây chuyền đá phong thủy cao cấp. Đá tự nhiên 100%, kiểm định chất lượng, miễn phí vận chuyển.',
  keywords: ['đá phong thủy', 'vòng tay đá', 'thạch anh', 'ngọc bích', 'trang sức đá tự nhiên', 'healing stones'],
  authors: [{ name: 'GemStone' }],
  creator: 'GemStone',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://gemstone.vn',
    siteName: 'Seravian',
    title: 'Seravian - Trang sức đá phong thủy cao cấp',
    description: 'Chuyên cung cấp vòng tay, vòng cổ, mặt dây chuyền đá phong thủy cao cấp'
  },
  icons: {
    icon: [
      {
        url: '/brand/Logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/Logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/brand/Logo.png',
        type: 'image/png',
      },
    ],
    apple: '/brand/Logo.png',
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#2d2a26' }
  ],
  width: 'device-width',
  initialScale: 1
}

import { ReduxProvider } from '@/lib/redux/provider'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ChatWidget } from '@/components/chat/chat-widget'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${cormorant.variable} ${geistMono.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ReduxProvider>
          <GoogleOAuthProvider clientId="830811907263-n7ktqafvc1k54112knagbgdg4a8l4j2j.apps.googleusercontent.com">
            <AntdApp>
              {children}
              <ChatWidget />
              <Toaster position="top-right" richColors style={{ top: '80px' }} />
              <Analytics />
            </AntdApp>
          </GoogleOAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
