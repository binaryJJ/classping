'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, UserPlus, CalendarCheck, Calendar, Calculator, ChevronDown, MapPin, Plus, Trash2, X, Music, LogOut, BarChart2, Wallet, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useBranch, SUBJECTS } from '@/lib/BranchContext'
import { AttendanceStatus } from '@/lib/types'
import { calculateRefund } from '@/lib/utils'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default function DashboardPage() {
  const router = useRouter()
  const { branches, selectedBranch, students, setSelectedBranch, addBranch, deleteBranch } = useBranch()
  const [branchOpen, setBranchOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [newBranch, setNewBranch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBranchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleAddBranch() {
    const name = newBranch.trim()
    if (!name || branches.includes(name)) return
    addBranch(name)
    setNewBranch('')
  }

  function handleDeleteBranch(b: string) {
    if (branches.length <= 1) { alert('최소 1개 지점이 필요합니다.'); return }
    deleteBranch(b)
  }

  function handleLogout() {
    localStorage.removeItem('els_logged_in')
    router.push('/login')
  }

  const today = new Date()
  const todayDow = today.getDay()
  const todayStr = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}. (${DOW[todayDow]})`

  // 오늘 수업 학생 목록 (지점별 컨텍스트에서 계산)
  const todaySubjects = SUBJECTS.filter(s => s.dayOfWeek.includes(todayDow))
  const todayStudents = todaySubjects.flatMap(subj =>
    students
      .filter(st => st.subject_id === subj.id)
      .map(st => ({ ...st, time: subj.startTime, status: null as AttendanceStatus | null }))
  )

  const totalStudents = students.length

  // 통계 카드 계산
  const totalClasses = students.reduce((sum, s) => sum + s.totalClasses, 0)
  const totalAbsent = students.reduce((sum, s) => sum + s.absentCount, 0)
  const attendanceRate = totalClasses > 0 ? Math.round(((totalClasses - totalAbsent) / totalClasses) * 100) : 0
  const totalRefund = students.reduce((sum, s) => sum + calculateRefund(s.monthly_fee, s.totalClasses, s.absentCount), 0)

  // 오늘 출결 현황 (미처리: 아직 체크 전 상태)
  const presentCount = 0
  const absentTodayCount = 0
  const pendingCount = todayStudents.length

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      {/* Gold Gradient Header */}
      <div
        className="px-4 flex flex-col justify-center"
        style={{
          height: '80px',
          background: 'linear-gradient(to right, #FFB800, #FFA000)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music size={22} color="#171719" strokeWidth={2} />
            <span style={{ color: '#171719', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>EL&#39;S MUSIC</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Branch Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setBranchOpen(v => !v)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-pill t-base"
                style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
              >
                <MapPin size={13} />
                {selectedBranch}
                <ChevronDown size={13} style={{ transform: branchOpen ? 'rotate(180deg)' : 'none', transition: '150ms' }} />
              </button>
              {branchOpen && (
                <div
                  className="absolute right-0 rounded-card overflow-hidden z-50 min-w-[150px]"
                  style={{ top: '40px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.14)' }}
                >
                  {branches.map(b => (
                    <button
                      key={b}
                      onClick={() => { setSelectedBranch(b); setBranchOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm t-base hover:bg-w-subtle flex items-center justify-between"
                      style={{ color: b === selectedBranch ? 'var(--c-primary)' : 'var(--c-body)', fontWeight: b === selectedBranch ? 600 : 400 }}
                    >
                      {b}
                      {b === selectedBranch && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--c-border)' }}>
                    <button
                      onClick={() => { setBranchOpen(false); setManageOpen(true) }}
                      className="w-full text-left px-4 py-2.5 text-xs t-base hover:bg-w-subtle"
                      style={{ color: 'var(--c-secondary)' }}
                    >
                      지점 관리
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full t-base"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <LogOut size={16} color="white" />
            </button>
          </div>
        </div>
        {/* Date bar */}
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
            <div className="w-7 h-7 rounded-input flex items-center justify-center mb-2" style={{ background: '#0ea5e918' }}>
              <Users size={15} color="#0ea5e9" strokeWidth={2} />
            </div>
            <div className="text-base font-bold leading-tight" style={{ color: '#0ea5e9' }}>{totalStudents}명</div>
            <div className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--c-secondary)' }}>전체 수강생</div>
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

          {/* 출석 현황 카드 3개 */}
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
                    style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--c-primary)' }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-w-heading">{s.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={s.subjectVariant}>{s.subject}</Badge>
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
              { href: '/schedule', Icon: Calendar, label: '시간표 보기', color: '#0ea5e9' },
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

      {/* Branch Management Modal */}
      {manageOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setManageOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl" style={{ background: 'var(--c-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h2 className="text-base font-bold text-w-heading">지점 관리</h2>
              <button onClick={() => setManageOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle">
                <X size={18} color="var(--c-secondary)" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {branches.map(b => (
                <div key={b} className="flex items-center justify-between px-4 py-3 rounded-card" style={{ border: '1px solid var(--c-border)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} color="var(--c-primary)" />
                    <span className="text-sm font-medium text-w-body">{b}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBranch(b)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 t-base"
                  >
                    <Trash2 size={14} color="var(--c-error)" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <input
                  className="w-input flex-1"
                  placeholder="새 지점명"
                  value={newBranch}
                  onChange={e => setNewBranch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBranch()}
                />
                <button
                  onClick={handleAddBranch}
                  className="px-4 py-2 rounded-pill text-sm font-medium text-white t-base"
                  style={{ background: 'var(--c-primary)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
