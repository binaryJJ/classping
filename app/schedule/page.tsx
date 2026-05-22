'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useBranch, SUBJECTS } from '@/lib/BranchContext'
import { toLocalDateString, getTodayString } from '@/lib/utils'

const DOW_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function getDaysInMonth(year: number, month: number) {
  const days: { date: string; day: number; dayNum: number }[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push({ date: toLocalDateString(d), day: d.getDay(), dayNum: d.getDate() })
    d.setDate(d.getDate() + 1)
  }
  return days
}

interface DatePopup {
  date: string
  dayOfWeek: number
}

export default function SchedulePage() {
  const { students, teachers, selectedBranch } = useBranch()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [datePopup, setDatePopup] = useState<DatePopup | null>(null)

  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()
  const today = getTodayString()

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const datePopupRows = datePopup && datePopup.dayOfWeek !== 0
    ? SUBJECTS.flatMap(subj =>
        subj.dayOfWeek.includes(datePopup.dayOfWeek)
          ? students.filter(s => s.subject_id === subj.id).map(st => ({ subject: subj, student: st }))
          : []
      )
    : []

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-w-heading">시간표</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{selectedBranch}</p>
        </div>
        <div className="flex gap-2.5 text-xs">
          {SUBJECTS.map(s => (
            <div key={s.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span style={{ color: 'var(--c-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
            <ChevronLeft size={20} color="var(--c-primary)" />
          </button>
          <span className="text-base font-bold text-w-heading">{year}년 {month + 1}월</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
            <ChevronRight size={20} color="var(--c-primary)" />
          </button>
        </div>

        {/* Calendar */}
        <div className="w-card" style={{ padding: '12px', overflowX: 'auto' }}>
          <div className="grid grid-cols-7 mb-1" style={{ minWidth: '280px' }}>
            {DOW_NAMES.map((d, i) => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: i === 0 ? 'var(--c-error)' : i === 6 ? 'var(--c-primary)' : 'var(--c-secondary)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px" style={{ minWidth: '280px' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="min-h-10" style={{ background: 'var(--c-subtle)', borderRadius: '4px' }} />
            ))}
            {days.map(({ date, day, dayNum }) => {
              const isSunday = day === 0
              const classesToday = isSunday ? [] : SUBJECTS.filter(s => s.dayOfWeek.includes(day))
              const isToday = date === today
              return (
                <button
                  key={date}
                  disabled={isSunday}
                  onClick={() => { if (!isSunday) setDatePopup({ date, dayOfWeek: day }) }}
                  className="min-h-10 p-0.5 rounded flex flex-col gap-0.5 text-left w-full t-base hover:bg-gray-50"
                  style={{
                    background: isToday ? 'rgba(124,58,237,0.05)' : 'transparent',
                    border: isToday ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                    opacity: isSunday ? 0.35 : 1,
                    cursor: isSunday ? 'default' : 'pointer',
                  }}
                >
                  <span
                    className="text-[10px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mx-auto"
                    style={{
                      background: isToday ? 'var(--c-primary)' : 'transparent',
                      color: isToday ? '#fff' : day === 0 ? 'var(--c-error)' : day === 6 ? 'var(--c-primary)' : 'var(--c-body)',
                    }}
                  >
                    {dayNum}
                  </span>
                  {classesToday.map(cls => {
                    const count = students.filter(s => s.subject_id === cls.id).length
                    return (
                      <div
                        key={cls.id}
                        className="w-full rounded px-0.5 py-px"
                        style={{ background: cls.color + '18', borderLeft: `2px solid ${cls.color}` }}
                      >
                        <div className="text-[9px] font-bold leading-tight truncate" style={{ color: cls.color }}>{cls.name}</div>
                        <div className="text-[8px] leading-tight" style={{ color: 'var(--c-secondary)' }}>{count}명</div>
                      </div>
                    )
                  })}
                </button>
              )
            })}
          </div>
        </div>

        {/* Subject legend */}
        <section>
          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--c-secondary)' }}>강좌 목록</p>
          <div className="space-y-2">
            {SUBJECTS.map(s => {
              const branchStudents = students.filter(st => st.subject_id === s.id)
              const subjectTeachers = teachers.filter(t => t.subject_id === s.id)
              return (
                <div key={s.id} className="w-card flex items-center justify-between" style={{ borderLeft: `3px solid ${s.color}`, paddingTop: '10px', paddingBottom: '10px' }}>
                  <div>
                    <div className="text-sm font-bold text-w-heading mb-0.5">{s.name}</div>
                    {subjectTeachers.length === 0 ? (
                      <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>{s.teacherName} · {s.startTime}~{s.endTime}</div>
                    ) : (
                      subjectTeachers.map(t => (
                        <div key={t.id} className="text-xs" style={{ color: 'var(--c-secondary)' }}>
                          {t.name} · {s.startTime}~{s.endTime}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-w-heading">{branchStudents.length}명</div>
                    <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>
                      {s.dayOfWeek.map(d => DOW_NAMES[d]).join('·')}요일
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Date Click Popup */}
      {datePopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDatePopup(null)} />
          <div className="relative w-full max-w-md rounded-t-2xl overflow-hidden" style={{ background: 'var(--c-surface)', maxHeight: '85vh' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div>
                <h2 className="text-base font-bold text-w-heading">{datePopup.date}</h2>
                <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{DOW_NAMES[datePopup.dayOfWeek]}요일 · {datePopupRows.length}명</p>
              </div>
              <button onClick={() => setDatePopup(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
                <X size={18} color="var(--c-secondary)" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
              {datePopupRows.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>수업이 없는 날입니다</p>
                </div>
              ) : (
                <div>
                  {datePopupRows.map(({ subject, student }, idx) => (
                    <div
                      key={`${subject.id}-${student.id}`}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: idx < datePopupRows.length - 1 ? '1px solid var(--c-border)' : 'none' }}
                    >
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 w-12 text-center"
                        style={{ background: subject.color + '20', color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <span className="text-sm flex-shrink-0" style={{ color: 'var(--c-secondary)' }}>{subject.startTime}</span>
                      <span className="text-sm font-semibold text-w-heading flex-1">{student.name}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--c-secondary)' }}>강사: {subject.teacherName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
