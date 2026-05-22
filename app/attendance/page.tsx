'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { getDayName, getTodayString, formatDate } from '@/lib/utils'
import { AttendanceStatus } from '@/lib/types'

interface AttendanceRecord {
  studentId: string
  name: string
  subject: string
  time: string
  status: AttendanceStatus | null
  isAdult: boolean
  notifyEmail: string
}

const DEMO_RECORDS: Record<string, AttendanceRecord[]> = {
  '2026-05-22': [
    { studentId: '1', name: '김민준', subject: '수학', time: '14:00', status: null, isAdult: false, notifyEmail: 'parent1@email.com' },
    { studentId: '2', name: '이서연', subject: '영어', time: '15:00', status: 'present', isAdult: false, notifyEmail: 'parent2@email.com' },
    { studentId: '3', name: '박지호', subject: '수학', time: '16:00', status: null, isAdult: true, notifyEmail: 'parkjh@email.com' },
    { studentId: '4', name: '최유나', subject: '영어', time: '17:00', status: null, isAdult: false, notifyEmail: 'parent4@email.com' },
  ],
}

function getDaysInMonth(year: number, month: number) {
  const days: { date: string; day: number }[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push({ date: d.toISOString().split('T')[0], day: d.getDay() })
    d.setDate(d.getDate() + 1)
  }
  return days
}

export default function AttendancePage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [records, setRecords] = useState<Record<string, Record<string, AttendanceStatus | null>>>(
    Object.fromEntries(
      Object.entries(DEMO_RECORDS).map(([date, recs]) => [
        date,
        Object.fromEntries(recs.map(r => [r.studentId, r.status]))
      ])
    )
  )
  const [notifyModal, setNotifyModal] = useState<{ open: boolean; student?: AttendanceRecord }>({ open: false })
  const [sending, setSending] = useState(false)
  const [makeupModal, setMakeupModal] = useState<{ open: boolean; student?: AttendanceRecord }>({ open: false })
  const [makeupDate, setMakeupDate] = useState('')

  const days = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()

  const selectedRecords = DEMO_RECORDS[selectedDate] ?? []
  const dateStatuses = records[selectedDate] ?? {}

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getDateColor(date: string) {
    const statuses = Object.values(records[date] ?? {})
    if (statuses.length === 0) return ''
    if (statuses.some(s => s === 'absent')) return 'bg-red-100'
    if (statuses.every(s => s === 'present')) return 'bg-green-100'
    return 'bg-yellow-100'
  }

  async function markStatus(studentId: string, status: AttendanceStatus) {
    const record = selectedRecords.find(r => r.studentId === studentId)
    setRecords(prev => ({
      ...prev,
      [selectedDate]: { ...(prev[selectedDate] ?? {}), [studentId]: status }
    }))

    if (status === 'absent' && record) {
      setNotifyModal({ open: true, student: record })
    }
  }

  async function sendNotification() {
    if (!notifyModal.student) return
    setSending(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'absence',
          studentName: notifyModal.student.name,
          date: formatDate(selectedDate),
          subjectName: notifyModal.student.subject,
          teacherName: '담당 선생님',
          recipientEmail: notifyModal.student.notifyEmail,
          recipientName: notifyModal.student.isAdult ? notifyModal.student.name : '보호자',
          isGuardian: !notifyModal.student.isAdult,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('알림이 발송되었습니다!')
      } else {
        alert('알림 발송 실패: RESEND_API_KEY를 설정해주세요')
      }
    } catch {
      alert('알림 발송 실패')
    } finally {
      setSending(false)
      setNotifyModal({ open: false })
    }
  }

  async function sendMakeupNotification() {
    if (!makeupModal.student || !makeupDate) return
    setSending(true)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'makeup',
          studentName: makeupModal.student.name,
          originalDate: formatDate(selectedDate),
          makeupDate: formatDate(makeupDate),
          subjectName: makeupModal.student.subject,
          teacherName: '담당 선생님',
          recipientEmail: makeupModal.student.notifyEmail,
          recipientName: makeupModal.student.isAdult ? makeupModal.student.name : '보호자',
          isGuardian: !makeupModal.student.isAdult,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('보강 알림이 발송되었습니다!')
      } else {
        alert('알림 발송 실패: RESEND_API_KEY를 설정해주세요')
      }
    } catch {
      alert('알림 발송 실패')
    } finally {
      setSending(false)
      setMakeupModal({ open: false })
      setMakeupDate('')
    }
  }

  return (
    <div>
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">출결 관리</h1>
      </div>

      {/* Calendar */}
      <div className="bg-white border-b border-gray-100 px-4 pb-4">
        <div className="flex items-center justify-between py-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            ‹
          </button>
          <span className="font-semibold text-gray-800">{year}년 {month + 1}월</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(({ date, day }) => {
            const isToday = date === getTodayString()
            const isSelected = date === selectedDate
            const colorClass = getDateColor(date)
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-full mx-auto w-8 h-8 transition-colors
                  ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
                  ${!isSelected && isToday ? 'border-2 border-primary-400 font-bold text-primary-600' : ''}
                  ${!isSelected && !isToday && colorClass ? colorClass : ''}
                  ${!isSelected && day === 0 ? 'text-red-400' : ''}
                  ${!isSelected && day === 6 ? 'text-blue-400' : ''}
                `}
              >
                {new Date(date).getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Records */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">
            {selectedDate} ({getDayName(new Date(selectedDate + 'T12:00:00').getDay())}요일)
          </h2>
          <div className="flex gap-1.5 text-xs text-gray-400">
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full">출석 {Object.values(dateStatuses).filter(s => s === 'present').length}</span>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full">결석 {Object.values(dateStatuses).filter(s => s === 'absent').length}</span>
          </div>
        </div>

        {selectedRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm">이 날 수업이 없습니다</div>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedRecords.map(record => {
              const status = dateStatuses[record.studentId] ?? null
              return (
                <div key={record.studentId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                        {record.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{record.name}</div>
                        <div className="text-xs text-gray-400">{record.subject} · {record.time} · {record.isAdult ? '성인' : '미성년'}</div>
                      </div>
                    </div>
                    {status && (
                      <Badge variant={status}>
                        {status === 'present' ? '출석' : status === 'absent' ? '결석' : '보강'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markStatus(record.studentId, 'present')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        status === 'present'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                      }`}
                    >
                      출석
                    </button>
                    <button
                      onClick={() => markStatus(record.studentId, 'absent')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        status === 'absent'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700'
                      }`}
                    >
                      결석
                    </button>
                    <button
                      onClick={() => markStatus(record.studentId, 'makeup')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        status === 'makeup'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                      }`}
                    >
                      보강
                    </button>
                  </div>
                  {status === 'absent' && (
                    <button
                      onClick={() => setMakeupModal({ open: true, student: record })}
                      className="mt-2 w-full py-1.5 text-xs text-blue-600 border border-blue-100 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      보강 일정 등록 및 알림 발송
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Absence Notification Modal */}
      <Modal isOpen={notifyModal.open} onClose={() => setNotifyModal({ open: false })} title="결석 알림 발송">
        {notifyModal.student && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-sm text-red-700 font-medium mb-1">{notifyModal.student.name} 결석 처리됨</div>
              <div className="text-xs text-red-600">
                {notifyModal.student.isAdult ? '본인' : '보호자'}에게 알림을 발송할까요?
              </div>
              <div className="text-xs text-gray-500 mt-1">
                수신: {notifyModal.student.notifyEmail}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setNotifyModal({ open: false })}>
                건너뛰기
              </Button>
              <Button fullWidth onClick={sendNotification} disabled={sending}>
                {sending ? '발송 중...' : '알림 발송'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Makeup Notification Modal */}
      <Modal isOpen={makeupModal.open} onClose={() => setMakeupModal({ open: false })} title="보강 일정 등록">
        {makeupModal.student && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-sm text-blue-700 font-medium">{makeupModal.student.name} 보강 일정</div>
              <div className="text-xs text-gray-500 mt-1">결석일: {selectedDate}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">보강 날짜</label>
              <input
                type="date"
                value={makeupDate}
                onChange={e => setMakeupDate(e.target.value)}
                min={getTodayString()}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setMakeupModal({ open: false })}>
                취소
              </Button>
              <Button fullWidth onClick={sendMakeupNotification} disabled={sending || !makeupDate}>
                {sending ? '발송 중...' : '보강 확정 & 알림'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
