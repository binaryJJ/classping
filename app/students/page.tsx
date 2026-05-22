'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { calculateAge, formatCurrency } from '@/lib/utils'
import { useBranch } from '@/lib/BranchContext'

export default function StudentsPage() {
  const { students } = useBranch()
  const [search, setSearch] = useState('')

  const filtered = students.filter(s =>
    s.name.includes(search) || s.phone.includes(search)
  )

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-w-heading">학생</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>링키영어 율현점</p>
        </div>
        <Link href="/students/new">
          <div className="w-8 h-8 rounded-full flex items-center justify-center t-base hover:opacity-80" style={{ background: 'var(--c-primary)' }}>
            <Plus size={18} color="white" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-input" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <Search size={15} color="var(--c-secondary)" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 연락처 검색"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--c-body)' }}
          />
        </div>

        <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{filtered.length}명</p>

        {filtered.length === 0 ? (
          <div className="w-card text-center py-12">
            <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>학생이 없습니다</p>
            <Link href="/students/new" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--c-primary)' }}>
              + 학생 등록하기
            </Link>
          </div>
        ) : (
          <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.map((s, idx) => (
              <Link
                key={s.id}
                href={`/students/${s.id}`}
                className="flex items-center px-4 py-3 t-base hover:bg-w-subtle"
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--c-border)' : 'none' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 text-sm" style={{ background: 'rgba(244,84,122,0.1)', color: 'var(--c-primary)' }}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-w-heading">{s.name}</span>
                    <Badge variant="english">{s.subject}</Badge>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>만 {calculateAge(s.birth_date)}세 · {s.phone}</div>
                </div>
                <div className="text-right mr-2">
                  <div className="text-sm font-semibold text-w-heading">{formatCurrency(s.monthly_fee)}</div>
                  <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>월 수강료</div>
                </div>
                <ChevronRight size={14} color="var(--c-border)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
