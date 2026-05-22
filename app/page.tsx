'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, UserPlus, CalendarCheck, Calendar, Calculator, LogOut, BarChart2, Wallet, Users, BookOpen } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useBranch, SUBJECTS } from '@/lib/BranchContext'
import { AttendanceStatus } from '@/lib/types'
import { calculateRefund } from '@/lib/utils'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default function DashboardPage() {
  const router = useRouter()
  const { students } = useBranch()

  function handleLogout() {
    localStorage.removeItem('els_logged_in')
    router.push('/login')
  }

  const today = new Date()
  const todayDow = today.getDay()
  const todayStr = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}. (${DOW[todayDow]})`

  const todaySubjects = SUBJECTS.filter(s => s.dayOfWeek.includes(todayDow))
  const todayStudents = todaySubjects.flatMap(subj =>
    students
      .filter(st => st.subject_id === subj.id)
      .map(st => ({ ...st, time: subj.startTime, status: null as AttendanceStatus | null }))
  )

  const totalStudents = students.length
  const totalClasses = students.reduce((sum, s) => sum + s.totalClasses, 0)
  const totalAbsent = students.reduce((sum, s) => sum + s.absentCount, 0)
  const attendanceRate = totalClasses > 0 ? Math.round(((totalClasses - totalAbsent) / totalClasses) * 100) : 0
  const totalRefund = students.reduce((sum, s) => sum + calculateRefund(s.monthly_fee, s.totalClasses, s.absentCount), 0)

  const presentCount = 0
  const absentTodayCount = 0
  const pendingCount = todayStudents.length

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      {/* Pink Gradient Header */}
      <div
        className="px-4 flex flex-col justify-center"
        style={{
          height: '80px',
          background: 'linear-gradient(to right, #F4547A, #F96D8A)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={22} color="white" strokeWidth={2} />
            <span style={{ color: 'white', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>링키영어</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 500 }}>율현점</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full t-base"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <LogOut size={16} color="white" />
          </button>
        </div>
        <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.88)' }}>{todayStr}</p>
      </div>

      <div className="px-4 space-y-4 py-4">
        {/* 통계 카드 3개 */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="w-card" style={{ padding: '12px 10px' }}>
            <div className="w-7 h-7 rounded-input flex items-center justify-center mb-2" style={{ background: '#00B97C18' }}>
              <BarChart2 size={15} color="var(--c-success)" strokeWidth={2} />
            </div>
            <div className="text-base font-bold leading-tight" style={{ color: 'var(--c-success)' }}>{attendanceRate}%</div>
            <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--c-secondary)' }}>이번달 출석률</div>
          </div>
          <div className="w-card" style={{ padding: '12px 10px' }}>
            <div className="w-7 h-7 rounded-input flex items-center justify-center mb-2" style={{ background: '#FFAB0018' }}>
              <Wallet size={15} color="var(--c-warning)" strokeWidth={2} />
            </div>
            <div className="text-base font-bold leading-tight" style={{ color: 'var(--c-warning)' }}>
              {totalRefund > 0 ? `${(totalRefund / 10000).toFixed(0)}만` : '0원'}
            </div>
            <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--c-secondary)' }}>환불 예정</div>
          </div>
          <div className="w-card" style={{ padding: '12px 10px' }}>
            <div className="w-7 h-7 rounded-input flex items-center justify-center mb-2" style={{ background: 'rgba(244,84,122,0.1)' }}>
              <Users size={15} color="var(--c-primary)" strokeWidth={2} />
            </div>
            <div className="text-base font-bold leading-tight" style={{ color: 'var(--c-primary)' }}>{totalStudents}명</div>
            <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--c-secondary)' }}>전체 학생</div>
          </div>
        </div>

        {/* 오늘 수업 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold text-w-heading">오늘 수업 ({todayStudents.length}명)</h2>
            <Link href="/attendance" className="text-xs font-medium flex items-center gap-0.5" style={{ color: 'var(--c-primary)' }}>
              출결 관리 <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-card px-3 py-2.5 text-center" style={{ background: '#00B97C12', border: '1px solid #00B97C20' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--c-success)' }}>{presentCount}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--c-success)' }}>출석</div>
            </div>
            <div className="rounded-card px-3 py-2.5 text-center" style={{ background: '#F0483C12', border: '1px solid #F0483C20' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--c-error)' }}>{absentTodayCount}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--c-error)' }}>결석</div>
            </div>
            <div className="rounded-card px-3 py-2.5 text-center" style={{ background: 'var(--c-subtle)', border: '1px solid var(--c-border)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--c-secondary)' }}>{pendingCount}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--c-secondary)' }}>미처리</div>
            </div>
          </div>

          {todayStudents.length === 0 ? (
            <div className="w-card py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>오늘 수업이 없습니다</p>
            </div>
          ) : (
            <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
              {todayStudents.map((s, idx) => (
                <Link
                  key={s.id}
                  href="/attendance"
                  className="flex items-center px-4 py-3 t-base hover:bg-w-subtle"
                  style={{ borderBottom: idx < todayStudents.length - 1 ? '1px solid var(--c-border)' : 'none' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0"
                    style={{ background: 'rgba(244,84,122,0.1)', color: 'var(--c-primary)' }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-w-heading">{s.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="english">{s.subject}</Badge>
                      <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{s.time}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--c-border)" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick menu */}
        <section>
          <h2 className="text-sm font-semibold text-w-heading mb-2">빠른 메뉴</h2>
          <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
            {[
              { href: '/students/new', Icon: UserPlus, label: '학생 등록', color: 'var(--c-primary)' },
              { href: '/attendance', Icon: CalendarCheck, label: '출결 체크', color: 'var(--c-success)' },
              { href: '/schedule', Icon: Calendar, label: '시간표 보기', color: 'var(--c-secondary-accent)' },
              { href: '/settlement', Icon: Calculator, label: '정산 보기', color: 'var(--c-warning)' },
            ].map(({ href, Icon, label, color }, idx) => (
              <Link
                key={href}
                href={href}
                className="flex items-center px-4 py-3 t-base hover:bg-w-subtle"
                style={{ borderBottom: idx < 3 ? '1px solid var(--c-border)' : 'none' }}
              >
                <div className="w-8 h-8 rounded-input flex items-center justify-center mr-3 flex-shrink-0" style={{ background: color + '18' }}>
                  <Icon size={17} color={color} strokeWidth={2} />
                </div>
                <span className="flex-1 text-sm text-w-body">{label}</span>
                <ChevronRight size={14} color="var(--c-border)" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
