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

  function handleKakao() {
    alert('카카오 로그인은 서비스 연동 후 사용 가능합니다.\n(데모: admin / 1234)')
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
          style={{ background: 'var(--c-primary)' }}
        >
          <GraduationCap size={32} color="white" strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold text-w-heading tracking-tight">ClassPing</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--c-secondary)' }}>손쉬운 학원 관리 시스템</p>
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

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1" style={{ borderTop: '1px solid var(--c-border)' }} />
          <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>또는</span>
          <div className="flex-1" style={{ borderTop: '1px solid var(--c-border)' }} />
        </div>

        <button
          onClick={handleKakao}
          className="w-full py-3 rounded-pill font-medium text-sm t-base flex items-center justify-center gap-2"
          style={{ background: '#FEE500', color: '#191919' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.07 1.356 3.888 3.402 4.944l-.87 3.24a.2.2 0 00.306.216L8.31 13.17c.228.018.459.03.69.03 4.142 0 7.5-2.634 7.5-5.88C16.5 4.134 13.142 1.5 9 1.5z" fill="#191919"/>
          </svg>
          카카오로 로그인
        </button>
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--c-secondary)' }}>
        데모 계정: <span className="font-medium" style={{ color: 'var(--c-body)' }}>admin / 1234</span>
      </p>
    </div>
  )
}
