'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!id || !pw) { setError('아이디와 비밀번호를 입력해주세요.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    if (id === 'admin' && pw === '1234') {
      localStorage.setItem('els_logged_in', 'true')
      router.push('/')
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--c-subtle)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #F4547A, #F96D8A)' }}
        >
          <GraduationCap size={32} color="white" strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold text-w-heading tracking-tight">링키영어</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-secondary)' }}>링키영어 학원 관리 시스템</p>
      </div>

      {/* Form */}
      <div className="w-card w-full" style={{ padding: '24px' }}>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-w-heading mb-1.5">아이디</label>
            <input
              className="w-input"
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={e => setId(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-w-heading mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                className="w-input"
                style={{ paddingRight: '44px' }}
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--c-secondary)' }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium" style={{ color: 'var(--c-error)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-pill font-medium text-sm text-white t-base disabled:opacity-50"
            style={{ background: 'var(--c-primary)' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--c-secondary)' }}>
        데모 계정: <span className="font-medium" style={{ color: 'var(--c-body)' }}>admin / 1234</span>
      </p>
    </div>
  )
}
