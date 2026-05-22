'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: 'var(--c-subtle)' }}>
      <div className="w-card text-center" style={{ padding: '32px 24px' }}>
        <div className="flex justify-center mb-4">
          <AlertCircle size={40} color="var(--c-error)" strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-bold text-w-heading mb-2">오류가 발생했습니다</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--c-secondary)' }}>
          {error.message || '예기치 않은 오류가 발생했습니다.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-pill text-sm font-medium text-white t-base hover:opacity-90"
          style={{ background: 'var(--c-primary)' }}
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
