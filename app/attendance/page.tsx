'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { getDayName, getTodayString, formatDate, toLocalDateString, KR_HOLIDAYS_2026 } from '@/lib/utils'
import { AttendanceStatus } from '@/lib/types'
import { useBranch, SUBJECTS } from '@/lib/BranchContext'

interface AttendanceRecord {
  studentId: string
  name: string
  subject: string
  subjectVariant: 'guitar' | 'bass' | 'drums' | 'vocal'
  time: string
  isAdult: boolean
  notifyEmail: string
}

const STATUS_COLOR: Record<AttendanceStatus, string> = { present: 'var(--c-success)', absent: 'var(--c-error)', makeup: 'var(--c-primary)' }
const STATUS_LABEL: Record<AttendanceStatus, string> = { present: '출석', absent: '결석', makeup: '보강' }

function getDaysInMonth(year: number, month: number) {
  const days: { date: string; day: number }[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push({ date: toLocalDateString(d), day: d.getDay() })
    d.setDate(d.getDate() + 1)
  }
  return days
}

function isClassLocked(date: string, time: string): boolean {
  const classDateTime = new Date(`${date}T${time}:00`)
  return new Date() > classDateTime
}

export default function AttendancePage() {
  const { students, selectedBranch } = useBranch()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [statuses, setStatuses] = useState<Record<string, Record<string, AttendanceStatus | null>>>({})
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; student?: AttendanceRecord }>({ open: false })
  const [makeupModal, setMakeupModal] = useState<{ open: boolean; student?: AttendanceRecord }>({ open: false })
  const [makeupDate, setMakeupDate] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; student?: AttendanceRecord; status?: AttendanceStatus }>({ open: false })
  const [sending, setSending] = useState(false)

  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const selectedRecords = useMemo((): AttendanceRecord[] => {
    const dow = new Date(selectedDate + 'T12:00:00').getDay()
    const result: AttendanceRecord[] = []
    for (const subj of SUBJECTS) {
      if (!subj.dayOfWeek.includes(dow)) continue
      for (const st of students) {
        if (st.subject_id !== subj.id) continue
        result.push({ studentId: st.id, name: st.name, subject: st.subject, subjectVariant: st.subjectVariant, time: subj.startTime, isAdult: st.is_adult, notifyEmail: st.notifyEmail })
      }
    }
    return result
  }, [selectedDate, students])

  const dateStatuses = statuses[selectedDate] ?? {}

  // 도트: 상태 있으면 상태 색, 수업 있는 날이면 보라, 없으면 null
  function getDotColor(date: string, dayOfWeek: number): string | null {
    const s = Object.values(statuses[date] ?? {})
    if (s.some(v => v === 'absent')) return 'var(--c-error)'
    if (s.every(v => v === 'present') && s.length > 0) return 'var(--c-success)'
    if (s.length > 0) return 'var(--c-warning)'
    if (SUBJECTS.some(subj => subj.dayOfWeek.includes(dayOfWeek))) return '#7c3aed'
    return null
  }

  function applyStatus(studentId: string, status: AttendanceStatus) {
    setStatuses(prev => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] ?? {}), [studentId]: status } }))
  }

  function handleMarkClick(record: AttendanceRecord, status: AttendanceStatus) {
    if (status === 'absent') {
      applyStatus(record.studentId, status)
      setNotifyModal({ open: true, student: record })
    } else {
      setConfirmModal({ open: true, student: record, status })
    }
  }

  function confirmStatus() {
    if (!confirmModal.student || !confirmModal.status) return
    applyStatus(confirmModal.student.studentId, confirmModal.status)
    if (confirmModal.status === 'makeup') {
      setConfirmModal({ open: false })
      setMakeupModal({ open: true, student: confirmModal.student })
    } else {
      setConfirmModal({ open: false })
    }
  }

  async function sendNotification() {
    if (!notifyModal.student) return
    setSending(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'absence', studentName: notifyModal.student.name, date: formatDate(selectedDate), subjectName: notifyModal.student.subject, teacherName: '담당 강사', recipientEmail: notifyModal.student.notifyEmail, recipientName: notifyModal.student.isAdult ? notifyModal.student.name : '보호자', isGuardian: !notifyModal.student.isAdult }),
      })
      const data = await res.json()
      alert(data.success ? '알림이 발송되었습니다!' : 'RESEND_API_KEY를 .env.local에 설정해주세요')
    } catch { alert('알림 발송 실패') }
    finally { setSending(false); setNotifyModal({ open: false }) }
  }

  async function sendMakeupNotification() {
    if (!makeupModal.student || !makeupDate) return
    setSending(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'makeup', studentName: makeupModal.student.name, originalDate: formatDate(selectedDate), makeupDate: formatDate(makeupDate), subjectName: makeupModal.student.subject, teacherName: '담당 강사', recipientEmail: makeupModal.student.notifyEmail, recipientName: makeupModal.student.isAdult ? makeupModal.student.name : '보호자', isGuardian: !makeupModal.student.isAdult }),
      })
      const data = await res.json()
      alert(data.success ? '보강 알림 발송!' : 'RESEND_API_KEY를 설정해주세요')
    } catch { alert('알림 발송 실패') }
    finally { setSending(false); setMakeupModal({ open: false }); setMakeupDate('') }
  }

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-w-heading">출결 관리</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{selectedBranch}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Calendar */}
        <div className="w-card" style={{ padding: '16px' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
              <ChevronLeft size={20} color="var(--c-primary)" />
            </button>
            <span className="text-base font-bold text-w-heading">{year}년 {month + 1}월</span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
              <ChevronRight size={20} color="var(--c-primary)" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: i === 0 ? 'var(--c-error)' : i === 6 ? 'var(--c-primary)' : 'var(--c-secondary)' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {days.map(({ date, day }) => {
              const isToday = date === getTodayString()
              const isSelected = date === selectedDate
              const dot = getDotColor(date, day)
              const holiday = KR_HOLIDAYS_2026[date]
              const isHoliday = day === 0 || !!holiday
              return (
                <button key={date} onClick={() => setSelectedDate(date)} className="flex flex-col items-center py-1 min-h-10">
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-full text-xs t-base"
                    style={{
                      background: isSelected ? 'var(--c-primary)' : isToday ? 'rgba(124,58,237,0.12)' : 'transparent',
                      color: isSelected ? '#fff' : isHoliday ? 'var(--c-error)' : day === 6 ? 'var(--c-primary)' : 'var(--c-body)',
                      fontWeight: isSelected || isToday ? 700 : 400,
                    }}
                  >
                    {new Date(date + 'T12:00:00').getDate()}
                  </span>
                  {holiday && !isSelected && (
                    <span className="text-[7px] leading-tight text-center w-full truncate px-0.5" style={{ color: 'var(--c-error)' }}>{holiday}</span>
                  )}
                  {dot && !isSelected && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: dot }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Records */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--c-secondary)' }}>
              {selectedDate} ({getDayName(new Date(selectedDate + 'T12:00:00').getDay())}요일)
              {KR_HOLIDAYS_2026[selectedDate] && <span className="ml-1" style={{ color: 'var(--c-error)' }}>· {KR_HOLIDAYS_2026[selectedDate]}</span>}
            </span>
            <div className="flex gap-3 text-xs">
              <span style={{ color: 'var(--c-success)' }}>출석 {Object.values(dateStatuses).filter(s => s === 'present').length}</span>
              <span style={{ color: 'var(--c-error)' }}>결석 {Object.values(dateStatuses).filter(s => s === 'absent').length}</span>
            </div>
          </div>

          {selectedRecords.length === 0 ? (
            <div className="w-card py-10 text-center">
              <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>이 날 수업이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedRecords.map(record => {
                const status = dateStatuses[record.studentId] ?? null
                const locked = isClassLocked(selectedDate, record.time)
                return (
                  <div key={record.studentId} className="w-card" style={{ padding: '16px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--c-primary)' }}>
                          {record.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-w-heading">{record.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant={record.subjectVariant}>{record.subject}</Badge>
                            <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{record.time}</span>
                            {locked && <span className="text-xs font-medium px-1.5 py-0.5 rounded-pill" style={{ background: 'rgba(112,115,124,0.1)', color: 'var(--c-secondary)' }}>잠금</span>}
                          </div>
                        </div>
                      </div>
                      {status && <Badge variant={status}>{STATUS_LABEL[status]}</Badge>}
                    </div>
                    {locked ? (
                      <div className="py-2 text-center text-xs rounded-input" style={{ background: 'var(--c-subtle)', color: 'var(--c-secondary)' }}>
                        수업 시간이 지나 변경할 수 없습니다
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 rounded-input overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
                        {(['present', 'absent', 'makeup'] as AttendanceStatus[]).map((s, idx) => (
                          <button key={s} onClick={() => handleMarkClick(record, s)} className="py-2 text-sm font-semibold t-base"
                            style={{ background: status === s ? STATUS_COLOR[s] : 'transparent', color: status === s ? '#fff' : STATUS_COLOR[s], borderRight: idx < 2 ? '1px solid var(--c-border)' : 'none' }}>
                            {STATUS_LABEL[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false })} title="출결 처리 확인">
        {confirmModal.student && confirmModal.status && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-card" style={{ background: 'var(--c-subtle)' }}>
              <p className="text-sm font-semibold text-w-heading">{confirmModal.student.name}님을 <span style={{ color: STATUS_COLOR[confirmModal.status] }}>{STATUS_LABEL[confirmModal.status]}</span>처리하시겠습니까?</p>
              <p className="text-xs mt-1" style={{ color: 'var(--c-secondary)' }}>{selectedDate} · {confirmModal.student.subject} {confirmModal.student.time}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setConfirmModal({ open: false })}>취소</Button>
              <Button fullWidth onClick={confirmStatus}>확인</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={notifyModal.open} onClose={() => setNotifyModal({ open: false })} title="결석 알림">
        {notifyModal.student && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-card" style={{ background: 'var(--c-subtle)' }}>
              <p className="text-sm font-semibold text-w-heading">{notifyModal.student.name} 결석 처리됨</p>
              <p className="text-xs mt-1" style={{ color: 'var(--c-secondary)' }}>{notifyModal.student.isAdult ? '본인' : '보호자'}({notifyModal.student.notifyEmail})에게 알림을 발송할까요?</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setNotifyModal({ open: false })}>건너뛰기</Button>
              <Button fullWidth onClick={sendNotification} disabled={sending}>{sending ? '발송 중...' : '알림 발송'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={makeupModal.open} onClose={() => setMakeupModal({ open: false })} title="보강 일정 등록">
        {makeupModal.student && (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-card" style={{ background: 'var(--c-subtle)' }}>
              <p className="text-sm font-semibold text-w-heading">{makeupModal.student.name} 보강</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>결석일: {selectedDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-w-heading mb-1.5">보강 날짜</label>
              <input type="date" value={makeupDate} onChange={e => setMakeupDate(e.target.value)} min={getTodayString()} className="w-input" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setMakeupModal({ open: false })}>취소</Button>
              <Button fullWidth onClick={sendMakeupNotification} disabled={sending || !makeupDate}>{sending ? '발송 중...' : '보강 확정 & 알림'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
