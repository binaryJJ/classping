'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { calculateAge, formatDate, formatCurrency } from '@/lib/utils'
import { useBranch } from '@/lib/BranchContext'

const DEMO_ATTENDANCE = [
  { date: '2026-05-22', status: 'present', subject: '기타' },
  { date: '2026-05-20', status: 'absent', subject: '기타' },
  { date: '2026-05-15', status: 'present', subject: '기타' },
  { date: '2026-05-13', status: 'makeup', subject: '기타' },
  { date: '2026-05-08', status: 'absent', subject: '기타' },
  { date: '2026-05-06', status: 'present', subject: '기타' },
  { date: '2026-04-29', status: 'present', subject: '기타' },
  { date: '2026-04-22', status: 'absent', subject: '기타' },
]

const STATUS_LABEL: Record<string, string> = { present: '출석', absent: '결석', makeup: '보강' }
const STATUS_VARIANT: Record<string, 'present' | 'absent' | 'makeup'> = { present: 'present', absent: 'absent', makeup: 'makeup' }
const STATUS_DOT: Record<string, string> = { present: 'var(--c-success)', absent: 'var(--c-error)', makeup: 'var(--c-primary)' }

function getDaysInMonth(year: number, month: number) {
  const days: { date: string; day: number }[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push({ date: d.toISOString().split('T')[0], day: d.getDay() })
    d.setDate(d.getDate() + 1)
  }
  return days
}

function AttendanceCalendarModal({ onClose, studentName }: { onClose: () => void; studentName: string }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const attendanceMap = Object.fromEntries(DEMO_ATTENDANCE.map(a => [a.date, a]))
  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }
  const thisMonthRecs = DEMO_ATTENDANCE.filter(a => { const d = new Date(a.date); return d.getFullYear() === year && d.getMonth() === month })
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl overflow-hidden" style={{ background: 'var(--c-surface)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <h2 className="text-base font-bold text-w-heading">{studentName} 출결 현황</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle text-sm font-bold" style={{ color: 'var(--c-secondary)' }}>✕</button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base"><ChevronLeft size={18} color="var(--c-primary)" /></button>
            <span className="text-base font-bold text-w-heading">{year}년 {month + 1}월</span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base"><ChevronRight size={18} color="var(--c-primary)" /></button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: i === 0 ? 'var(--c-error)' : i === 6 ? 'var(--c-primary)' : 'var(--c-secondary)' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(({ date, day }) => {
              const rec = attendanceMap[date]
              return (
                <div key={date} className="flex flex-col items-center py-1">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm" style={{ background: rec ? STATUS_DOT[rec.status] + '20' : 'transparent', color: day === 0 ? 'var(--c-error)' : day === 6 ? 'var(--c-primary)' : 'var(--c-body)', fontWeight: rec ? 600 : 400 }}>
                    {new Date(date).getDate()}
                  </span>
                  {rec && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: STATUS_DOT[rec.status] }} />}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
            {[{ label: '출석', color: 'var(--c-success)' }, { label: '결석', color: 'var(--c-error)' }, { label: '보강', color: 'var(--c-primary)' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {thisMonthRecs.length === 0
              ? <p className="text-center text-sm py-4" style={{ color: 'var(--c-secondary)' }}>이 달의 출결 기록이 없습니다</p>
              : thisMonthRecs.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-input" style={{ background: 'var(--c-subtle)' }}>
                  <span className="text-sm text-w-body">{a.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{a.subject}</span>
                    <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { students, teachers } = useBranch()
  const student = students.find(s => s.id === params.id)
  const teacher = teachers.find(t => t.subject_id === student?.subject_id)
  const [calendarOpen, setCalendarOpen] = useState(false)

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: 'var(--c-subtle)' }}>
        <p style={{ color: 'var(--c-secondary)' }}>학생 정보를 찾을 수 없습니다</p>
        <button onClick={() => router.push('/students')} className="text-sm font-medium mt-2" style={{ color: 'var(--c-primary)' }}>목록으로</button>
      </div>
    )
  }

  const presentCount = DEMO_ATTENDANCE.filter(a => a.status === 'present').length
  const absentCount = DEMO_ATTENDANCE.filter(a => a.status === 'absent').length
  const attendanceRate = Math.round((presentCount / DEMO_ATTENDANCE.length) * 100)

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 t-base" style={{ color: 'var(--c-primary)' }}>
          <ChevronLeft size={20} /><span className="text-sm">학생</span>
        </button>
        <Link href={`/students/${student.id}/edit`} className="text-sm font-medium" style={{ color: 'var(--c-primary)' }}>편집</Link>
      </div>

      <div className="flex flex-col items-center py-8" style={{ background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--c-primary)' }}>
          {student.name[0]}
        </div>
        <h1 className="text-xl font-bold text-w-heading mb-2">{student.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={student.is_adult ? 'adult' : 'minor'}>{student.is_adult ? '성인' : '미성년자'}</Badge>
          <Badge variant={student.subjectVariant}>{student.subject}</Badge>
          <span className="text-sm" style={{ color: 'var(--c-secondary)' }}>만 {calculateAge(student.birth_date)}세</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[{ label: '출석', value: presentCount, color: 'var(--c-success)' }, { label: '결석', value: absentCount, color: 'var(--c-error)' }, { label: '출석률', value: `${attendanceRate}%`, color: 'var(--c-primary)' }].map(s => (
            <div key={s.label} className="w-card text-center" style={{ padding: '12px 8px' }}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <section>
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--c-secondary)' }}>기본 정보</p>
          <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
            {[{ label: '연락처', value: student.phone }, { label: '이메일', value: student.email ?? '-' }, { label: '생년월일', value: formatDate(student.birth_date) }, { label: '수강 시작', value: formatDate(student.start_date) }, { label: '월 수강료', value: formatCurrency(student.monthly_fee) }, { label: '담당 강사', value: teacher?.name ?? '-' }].map((row, i, arr) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                <span className="text-sm" style={{ color: 'var(--c-secondary)' }}>{row.label}</span>
                <span className="text-sm font-medium text-w-body">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {!student.is_adult && (
          <section>
            <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--c-warning)' }}>보호자 정보</p>
            <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
              {[{ label: '이름', value: student.guardian_name ?? '-' }, { label: '이메일', value: student.guardian_email ?? '-' }, { label: '연락처', value: student.guardian_phone ?? '-' }].map((row, i, arr) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                  <span className="text-sm" style={{ color: 'var(--c-secondary)' }}>{row.label}</span>
                  <span className="text-sm font-medium text-w-body">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold" style={{ color: 'var(--c-secondary)' }}>최근 출결</p>
            <button onClick={() => setCalendarOpen(true)} className="text-xs font-medium t-base" style={{ color: 'var(--c-primary)' }}>전체 보기</button>
          </div>
          <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
            {DEMO_ATTENDANCE.slice(0, 5).map((a, i, arr) => (
              <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                <span className="text-sm text-w-body">{a.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{a.subject}</span>
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="w-card" style={{ padding: 0 }}>
          <button onClick={() => { if (confirm(`${student.name} 학생을 삭제할까요?`)) router.push('/students') }} className="w-full py-3 text-sm font-medium t-base" style={{ color: 'var(--c-error)' }}>
            학생 삭제
          </button>
        </div>
      </div>

      {calendarOpen && <AttendanceCalendarModal onClose={() => setCalendarOpen(false)} studentName={student.name} />}
    </div>
  )
}
