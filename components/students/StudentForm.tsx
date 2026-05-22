'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { isAdult } from '@/lib/utils'
import { Student } from '@/lib/types'

interface StudentFormProps {
  initial?: Partial<Student>
  onSubmit: (data: Omit<Student, 'id' | 'created_at' | 'is_adult'>) => Promise<void>
  submitLabel?: string
}

export default function StudentForm({ initial, onSubmit, submitLabel = '저장' }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    birth_date: initial?.birth_date ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    monthly_fee: initial?.monthly_fee?.toString() ?? '',
    start_date: initial?.start_date ?? '',
    guardian_name: initial?.guardian_name ?? '',
    guardian_email: initial?.guardian_email ?? '',
    guardian_phone: initial?.guardian_phone ?? '',
  })

  const adult = form.birth_date ? isAdult(form.birth_date) : null

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.birth_date || !form.phone || !form.monthly_fee || !form.start_date) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name,
        birth_date: form.birth_date,
        phone: form.phone,
        email: form.email || null,
        monthly_fee: Number(form.monthly_fee),
        start_date: form.start_date,
        guardian_name: adult === false ? form.guardian_name || null : null,
        guardian_email: adult === false ? form.guardian_email || null : null,
        guardian_phone: adult === false ? form.guardian_phone || null : null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 기본 정보 */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">기본 정보</h3>
        <div className="space-y-3">
          <Field label="이름 *">
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="홍길동"
              className={inputCls}
              required
            />
          </Field>

          <Field label="생년월일 *">
            <input
              type="date"
              value={form.birth_date}
              onChange={e => set('birth_date', e.target.value)}
              className={inputCls}
              required
            />
            {adult !== null && (
              <div className={`mt-1.5 text-xs px-2 py-1 rounded-full inline-block font-medium ${adult ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {adult ? '✓ 성인 (본인에게 알림)' : '⚠ 미성년자 (보호자에게 알림)'}
              </div>
            )}
          </Field>

          <Field label="연락처 *">
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="010-1234-5678"
              className={inputCls}
              required
            />
          </Field>

          <Field label="이메일">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="example@email.com"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* 수강 정보 */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">수강 정보</h3>
        <div className="space-y-3">
          <Field label="월 수강료 *">
            <div className="relative">
              <input
                type="number"
                value={form.monthly_fee}
                onChange={e => set('monthly_fee', e.target.value)}
                placeholder="150000"
                className={`${inputCls} pr-8`}
                min="0"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
            </div>
          </Field>

          <Field label="수강 시작일 *">
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
              className={inputCls}
              required
            />
          </Field>
        </div>
      </section>

      {/* 보호자 정보 (미성년자만) */}
      {adult === false && (
        <section>
          <h3 className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-3">보호자 정보 (미성년자)</h3>
          <div className="space-y-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
            <Field label="보호자 이름">
              <input
                type="text"
                value={form.guardian_name}
                onChange={e => set('guardian_name', e.target.value)}
                placeholder="보호자 이름"
                className={inputCls}
              />
            </Field>
            <Field label="보호자 이메일 *">
              <input
                type="email"
                value={form.guardian_email}
                onChange={e => set('guardian_email', e.target.value)}
                placeholder="guardian@email.com"
                className={inputCls}
              />
              <p className="text-xs text-yellow-600 mt-1">결석/보강 알림이 이 이메일로 발송됩니다</p>
            </Field>
            <Field label="보호자 연락처">
              <input
                type="tel"
                value={form.guardian_phone}
                onChange={e => set('guardian_phone', e.target.value)}
                placeholder="010-0000-0000"
                className={inputCls}
              />
            </Field>
          </div>
        </section>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? '저장 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors'
