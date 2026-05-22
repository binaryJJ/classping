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

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.birth_date || !form.phone || !form.monthly_fee || !form.start_date) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name, birth_date: form.birth_date, phone: form.phone,
        email: form.email || null, monthly_fee: Number(form.monthly_fee),
        start_date: form.start_date,
        guardian_name: adult === false ? form.guardian_name || null : null,
        guardian_email: adult === false ? form.guardian_email || null : null,
        guardian_phone: adult === false ? form.guardian_phone || null : null,
      })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section>
        <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'var(--c-secondary)' }}>기본 정보</p>
        <div className="space-y-3">
          <Field label="이름 *">
            <input className="w-input" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="홍길동" required />
          </Field>
          <Field label="생년월일 *">
            <input className="w-input" type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} required />
            {adult !== null && (
              <div className="mt-1.5 text-xs px-3 py-1.5 rounded-pill inline-block font-medium" style={{ background: adult ? 'rgba(124,58,237,0.1)' : 'rgba(255,171,0,0.15)', color: adult ? 'var(--c-primary)' : '#b37400' }}>
                {adult ? '✓ 성인 — 본인에게 알림 발송' : '⚠ 미성년자 — 보호자에게 알림 발송'}
              </div>
            )}
          </Field>
          <Field label="연락처 *">
            <input className="w-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="010-1234-5678" required />
          </Field>
          <Field label="이메일">
            <input className="w-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" />
          </Field>
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'var(--c-secondary)' }}>수강 정보</p>
        <div className="space-y-3">
          <Field label="월 수강료 *">
            <div className="relative">
              <input className="w-input" style={{ paddingRight: '36px' }} type="number" value={form.monthly_fee} onChange={e => set('monthly_fee', e.target.value)} placeholder="150000" min="0" required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--c-secondary)' }}>원</span>
            </div>
          </Field>
          <Field label="수강 시작일 *">
            <input className="w-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
          </Field>
        </div>
      </section>

      {adult === false && (
        <section>
          <p className="text-xs font-semibold mb-3 px-1" style={{ color: 'var(--c-warning)' }}>보호자 정보 (미성년자)</p>
          <div className="space-y-3 p-4 rounded-card" style={{ background: 'rgba(255,171,0,0.06)', border: '1px solid rgba(255,171,0,0.2)' }}>
            <Field label="보호자 이름">
              <input className="w-input" type="text" value={form.guardian_name} onChange={e => set('guardian_name', e.target.value)} placeholder="보호자 이름" />
            </Field>
            <Field label="보호자 이메일 *">
              <input className="w-input" type="email" value={form.guardian_email} onChange={e => set('guardian_email', e.target.value)} placeholder="guardian@email.com" />
              <p className="text-xs mt-1" style={{ color: 'var(--c-warning)' }}>결석/보강 알림이 이 이메일로 발송됩니다</p>
            </Field>
            <Field label="보호자 연락처">
              <input className="w-input" type="tel" value={form.guardian_phone} onChange={e => set('guardian_phone', e.target.value)} placeholder="010-0000-0000" />
            </Field>
          </div>
        </section>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={() => router.back()}>취소</Button>
        <Button type="submit" fullWidth disabled={loading}>{loading ? '저장 중...' : submitLabel}</Button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-w-heading mb-1.5">{label}</label>
      {children}
    </div>
  )
}
