'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { formatCurrency, getDayName } from '@/lib/utils'
import { AttendanceStatus } from '@/lib/types'

interface TodayStudent {
  id: string
  name: string
  subject: string
  time: string
  status: AttendanceStatus | null
}

const DEMO_TODAY: TodayStudent[] = [
  { id: '1', name: '김민준', subject: '수학', time: '14:00', status: 'present' },
  { id: '2', name: '이서연', subject: '영어', time: '15:00', status: null },
  { id: '3', name: '박지호', subject: '수학', time: '16:00', status: 'absent' },
]

export default function DashboardPage() {
  const today = new Date()
  const dayName = getDayName(today.getDay())

  const presentCount = DEMO_TODAY.filter(s => s.status === 'present').length
  const absentCount = DEMO_TODAY.filter(s => s.status === 'absent').length
  const pendingCount = DEMO_TODAY.filter(s => s.status === null).length

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-primary-200 text-sm">{today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 {dayName}요일</span>
        </div>
        <h1 className="text-2xl font-bold">ClassPing</h1>
        <p className="text-primary-200 text-sm mt-0.5">안녕하세요! 오늘도 좋은 하루 되세요</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="이번달 출석률" value="87%" icon="📊" color="bg-white" />
          <StatCard label="환불 예정" value={formatCurrency(45000)} icon="💰" color="bg-white" />
          <StatCard label="전체 학생" value="12명" icon="👥" color="bg-white" />
        </div>
      </div>

      {/* Today's Classes */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">오늘 수업 ({DEMO_TODAY.length}명)</h2>
          <Link href="/attendance" className="text-sm text-primary-600 font-medium">출결 관리 →</Link>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-600">{presentCount}</div>
            <div className="text-xs text-green-600">출석</div>
          </div>
          <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-red-600">{absentCount}</div>
            <div className="text-xs text-red-600">결석</div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-gray-500">{pendingCount}</div>
            <div className="text-xs text-gray-500">미처리</div>
          </div>
        </div>

        <div className="space-y-2">
          {DEMO_TODAY.map(student => (
            <Link
              key={student.id}
              href="/attendance"
              className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {student.name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                  <div className="text-xs text-gray-400">{student.subject} · {student.time}</div>
                </div>
              </div>
              {student.status ? (
                <Badge variant={student.status}>
                  {student.status === 'present' ? '출석' : student.status === 'absent' ? '결석' : '보강'}
                </Badge>
              ) : (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">미처리</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">빠른 메뉴</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/students/new" className="flex items-center gap-2 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <span className="text-xl">➕</span>
            <span className="text-sm font-medium text-primary-700">학생 등록</span>
          </Link>
          <Link href="/attendance" className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
            <span className="text-xl">✅</span>
            <span className="text-sm font-medium text-green-700">출결 체크</span>
          </Link>
          <Link href="/schedule" className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-xl">📅</span>
            <span className="text-sm font-medium text-blue-700">시간표 보기</span>
          </Link>
          <Link href="/settlement" className="flex items-center gap-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium text-yellow-700">환불 계산</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 shadow-sm border border-gray-100`}>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-base font-bold text-gray-800 leading-tight">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
