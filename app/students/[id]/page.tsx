'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { calculateAge, formatDate, formatCurrency } from '@/lib/utils'
import { Student } from '@/lib/types'

const DEMO_STUDENTS: Record<string, Student> = {
  '1': {
    id: '1', name: '김민준', birth_date: '2008-03-15', phone: '010-1234-5678',
    email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-03-01',
    guardian_name: '김부모', guardian_email: 'parent1@email.com', guardian_phone: '010-9876-5432',
    created_at: '2024-03-01',
  },
  '2': {
    id: '2', name: '이서연', birth_date: '2005-07-22', phone: '010-2345-6789',
    email: 'leesy@email.com', is_adult: false, monthly_fee: 180000, start_date: '2024-01-15',
    guardian_name: '이부모', guardian_email: 'parent2@email.com', guardian_phone: '010-8765-4321',
    created_at: '2024-01-15',
  },
  '3': {
    id: '3', name: '박지호', birth_date: '2002-11-30', phone: '010-3456-7890',
    email: 'parkjh@email.com', is_adult: true, monthly_fee: 200000, start_date: '2024-02-01',
    guardian_name: null, guardian_email: null, guardian_phone: null,
    created_at: '2024-02-01',
  },
}

const DEMO_ATTENDANCE = [
  { date: '2026-05-20', status: 'present', subject: '수학' },
  { date: '2026-05-15', status: 'absent', subject: '수학' },
  { date: '2026-05-13', status: 'present', subject: '수학' },
  { date: '2026-05-08', status: 'makeup', subject: '수학' },
  { date: '2026-05-06', status: 'absent', subject: '수학' },
]

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const student = DEMO_STUDENTS[params.id]

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl">🔍</div>
        <div className="text-gray-500">학생 정보를 찾을 수 없습니다</div>
        <Button onClick={() => router.push('/students')}>목록으로</Button>
      </div>
    )
  }

  const absentCount = DEMO_ATTENDANCE.filter(a => a.status === 'absent').length
  const presentCount = DEMO_ATTENDANCE.filter(a => a.status === 'present').length
  const attendanceRate = Math.round((presentCount / DEMO_ATTENDANCE.length) * 100)

  return (
    <div>
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 pt-12 pb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-200 text-sm mb-3">
          ← 돌아가기
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {student.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={student.is_adult ? 'adult' : 'minor'}>
                  {student.is_adult ? '성인' : '미성년자'}
                </Badge>
                <span className="text-primary-200 text-sm">만 {calculateAge(student.birth_date)}세</span>
              </div>
            </div>
          </div>
          <Link href={`/students/${student.id}/edit`}>
            <button className="text-primary-200 text-sm bg-white/10 px-3 py-1.5 rounded-lg">수정</button>
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="text-xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-gray-400">출석</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="text-xl font-bold text-red-500">{absentCount}</div>
            <div className="text-xs text-gray-400">결석</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <div className="text-xl font-bold text-primary-600">{attendanceRate}%</div>
            <div className="text-xs text-gray-400">출석률</div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">기본 정보</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow label="연락처" value={student.phone} />
            <InfoRow label="이메일" value={student.email ?? '-'} />
            <InfoRow label="생년월일" value={formatDate(student.birth_date)} />
            <InfoRow label="수강 시작" value={formatDate(student.start_date)} />
            <InfoRow label="월 수강료" value={formatCurrency(student.monthly_fee)} />
          </div>
        </div>

        {/* Guardian Info */}
        {!student.is_adult && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 shadow-sm">
            <div className="px-4 py-3 border-b border-yellow-100">
              <h2 className="font-semibold text-yellow-700 text-sm">보호자 정보</h2>
            </div>
            <div className="divide-y divide-yellow-100/50">
              <InfoRow label="이름" value={student.guardian_name ?? '-'} />
              <InfoRow label="이메일" value={student.guardian_email ?? '-'} />
              <InfoRow label="연락처" value={student.guardian_phone ?? '-'} />
            </div>
          </div>
        )}

        {/* Attendance History */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">출결 이력</h2>
            <Link href="/attendance" className="text-xs text-primary-600">전체 보기</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {DEMO_ATTENDANCE.map((a, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">{a.date}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.subject}</span>
                </div>
                <Badge variant={a.status as 'present' | 'absent' | 'makeup'}>
                  {a.status === 'present' ? '출석' : a.status === 'absent' ? '결석' : '보강'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => { if (confirm(`${student.name} 학생을 삭제할까요?`)) router.push('/students') }}
          className="w-full py-3 text-red-500 text-sm font-medium border border-red-100 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
        >
          학생 삭제
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{value}</span>
    </div>
  )
}
