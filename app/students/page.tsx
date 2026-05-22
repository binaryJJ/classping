'use client'

import { useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { calculateAge, formatCurrency } from '@/lib/utils'
import { Student } from '@/lib/types'

const DEMO_STUDENTS: Student[] = [
  {
    id: '1', name: '김민준', birth_date: '2008-03-15', phone: '010-1234-5678',
    email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-03-01',
    guardian_name: '김부모', guardian_email: 'parent1@email.com', guardian_phone: '010-9876-5432',
    created_at: '2024-03-01',
  },
  {
    id: '2', name: '이서연', birth_date: '2005-07-22', phone: '010-2345-6789',
    email: 'leesy@email.com', is_adult: false, monthly_fee: 180000, start_date: '2024-01-15',
    guardian_name: '이부모', guardian_email: 'parent2@email.com', guardian_phone: '010-8765-4321',
    created_at: '2024-01-15',
  },
  {
    id: '3', name: '박지호', birth_date: '2002-11-30', phone: '010-3456-7890',
    email: 'parkjh@email.com', is_adult: true, monthly_fee: 200000, start_date: '2024-02-01',
    guardian_name: null, guardian_email: null, guardian_phone: null,
    created_at: '2024-02-01',
  },
  {
    id: '4', name: '최유나', birth_date: '2009-05-10', phone: '010-4567-8901',
    email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-04-01',
    guardian_name: '최부모', guardian_email: 'parent4@email.com', guardian_phone: '010-7654-3210',
    created_at: '2024-04-01',
  },
]

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'adult' | 'minor'>('all')

  const filtered = DEMO_STUDENTS.filter(s => {
    const matchSearch = s.name.includes(search) || s.phone.includes(search)
    const matchFilter = filter === 'all' || (filter === 'adult' ? s.is_adult : !s.is_adult)
    return matchSearch && matchFilter
  })

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">학생 관리</h1>
          <Link href="/students/new">
            <Button size="sm">+ 학생 등록</Button>
          </Link>
        </div>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 연락처로 검색"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <div className="flex gap-2 mt-2.5">
          {(['all', 'adult', 'minor'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? `전체 ${DEMO_STUDENTS.length}` : f === 'adult' ? '성인' : '미성년자'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <div className="font-medium">학생이 없습니다</div>
            <div className="text-sm mt-1">+ 학생 등록 버튼으로 추가해보세요</div>
          </div>
        ) : (
          filtered.map(student => <StudentCard key={student.id} student={student} />)
        )}
      </div>
    </div>
  )
}

function StudentCard({ student }: { student: Student }) {
  return (
    <Link href={`/students/${student.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-primary-200 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{student.name}</span>
                <Badge variant={student.is_adult ? 'adult' : 'minor'}>
                  {student.is_adult ? '성인' : '미성년'}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">만 {calculateAge(student.birth_date)}세 · {student.phone}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700">{formatCurrency(student.monthly_fee)}</div>
            <div className="text-xs text-gray-400">월 수강료</div>
          </div>
        </div>
        {!student.is_adult && student.guardian_email && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-50 text-xs text-gray-400">
            보호자: {student.guardian_name} · {student.guardian_email}
          </div>
        )}
      </div>
    </Link>
  )
}
