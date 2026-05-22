import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientBottomNav from '@/components/ClientBottomNav'
import AuthCheck from '@/components/AuthCheck'
import { BranchProvider } from '@/lib/BranchContext'

export const metadata: Metadata = {
  title: '링키영어',
  description: '링키영어 율현점 출결 관리 앱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '링키영어',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F4547A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--c-subtle)' }}>
        <BranchProvider>
          <AuthCheck />
          <div className="max-w-md mx-auto min-h-screen relative" style={{ background: 'var(--c-subtle)' }}>
            <main className="pb-20">{children}</main>
            <ClientBottomNav />
          </div>
        </BranchProvider>
      </body>
    </html>
  )
}
