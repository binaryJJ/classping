import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: 'var(--c-subtle)' }}>
      <div className="w-card text-center" style={{ padding: '32px 24px' }}>
        <p className="text-5xl font-bold mb-4" style={{ color: 'var(--c-primary)' }}>404</p>
        <h2 className="text-base font-bold text-w-heading mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--c-secondary)' }}>
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill text-sm font-medium text-white t-base hover:opacity-90"
          style={{ background: 'var(--c-primary)' }}
        >
          <Home size={16} />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
