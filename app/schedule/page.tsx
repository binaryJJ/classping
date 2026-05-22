'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getDayNameFull } from '@/lib/utils'

interface ScheduleItem {
  id: string
  subjectId: string
  subjectName: string
  teacherName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  studentCount: number
  color: string
}

const COLORS = ['bg-purple-100 border-purple-200 text-purple-800', 'bg-blue-100 border-blue-200 text-blue-800', 'bg-green-100 border-green-200 text-green-800', 'bg-orange-100 border-orange-200 text-orange-800']

const DEMO_SCHEDULE: ScheduleItem[] = [
  { id: '1', subjectId: 's1', subjectName: '수학', teacherName: '김수학', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', studentCount: 5, color: COLORS[0] },
  { id: '2', subjectId: 's1', subjectName: '수학', teacherName: '김수학', dayOfWeek: 3, startTime: '14:00', endTime: '15:30', studentCount: 5, color: COLORS[0] },
  { id: '3', subjectId: 's1', subjectName: '수학', teacherName: '김수학', dayOfWeek: 5, startTime: '14:00', endTime: '15:30', studentCount: 5, color: COLORS[0] },
  { id: '4', subjectId: 's2', subjectName: '영어', teacherName: '이영어', dayOfWeek: 2, startTime: '15:00', endTime: '16:30', studentCount: 4, color: COLORS[1] },
  { id: '5', subjectId: 's2', subjectName: '영어', teacherName: '이영어', dayOfWeek: 4, startTime: '15:00', endTime: '16:30', studentCount: 4, color: COLORS[1] },
  { id: '6', subjectId: 's3', subjectName: '과학', teacherName: '박과학', dayOfWeek: 2, startTime: '17:00', endTime: '18:30', studentCount: 3, color: COLORS[2] },
  { id: '7', subjectId: 's4', subjectName: '국어', teacherName: '최국어', dayOfWeek: 6, startTime: '10:00', endTime: '11:30', studentCount: 6, color: COLORS[3] },
]

const DAYS = [0, 1, 2, 3, 4, 5, 6]
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function SchedulePage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null)
  const [newSchedule, setNewSchedule] = useState({
    subjectName: '', teacherName: '', dayOfWeek: '1', startTime: '09:00', endTime: '10:30',
  })

  const today = new Date().getDay()

  return (
    <div>
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">시간표</h1>
          <Button size="sm" onClick={() => setShowAddModal(true)}>+ 수업 추가</Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full px-4 py-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DAYS.map(day => (
              <div
                key={day}
                className={`text-center py-2 rounded-lg text-xs font-semibold ${
                  day === today ? 'bg-primary-600 text-white' :
                  day === 0 ? 'text-red-400 bg-red-50' :
                  day === 6 ? 'text-blue-400 bg-blue-50' :
                  'text-gray-500 bg-gray-50'
                }`}
              >
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          {/* Schedule cells */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(day => {
              const dayItems = DEMO_SCHEDULE.filter(s => s.dayOfWeek === day)
              return (
                <div key={day} className="min-h-48 flex flex-col gap-1">
                  {dayItems.length === 0 ? (
                    <div className="flex-1 border border-dashed border-gray-200 rounded-lg" />
                  ) : (
                    dayItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`text-left p-1.5 rounded-lg border text-[10px] leading-tight ${item.color} hover:opacity-80 transition-opacity`}
                      >
                        <div className="font-bold truncate">{item.subjectName}</div>
                        <div className="opacity-70 truncate">{item.startTime}</div>
                        <div className="opacity-60 truncate">~{item.endTime}</div>
                        <div className="mt-0.5 opacity-70">{item.studentCount}명</div>
                      </button>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-2">과목 목록</h3>
        <div className="space-y-2">
          {Array.from(new Map(DEMO_SCHEDULE.map(s => [s.subjectId, s] as [string, ScheduleItem])).values()).map(item => (
            <div key={item.subjectId} className={`flex items-center justify-between p-3 rounded-xl border ${item.color}`}>
              <div>
                <span className="font-semibold text-sm">{item.subjectName}</span>
                <span className="text-xs ml-2 opacity-70">· {item.teacherName}</span>
              </div>
              <div className="text-xs opacity-70">
                {DEMO_SCHEDULE.filter(s => s.subjectId === item.subjectId).map(s => DAY_LABELS[s.dayOfWeek]).join(', ')}요일
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="수업 상세"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${selectedItem.color}`}>
              <div className="text-xl font-bold mb-1">{selectedItem.subjectName}</div>
              <div className="text-sm opacity-80">담당: {selectedItem.teacherName}</div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">요일</span>
                <span className="font-medium">{getDayNameFull(selectedItem.dayOfWeek)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">시간</span>
                <span className="font-medium">{selectedItem.startTime} ~ {selectedItem.endTime}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">수강생 수</span>
                <span className="font-medium">{selectedItem.studentCount}명</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setSelectedItem(null)}>닫기</Button>
              <Button variant="danger" fullWidth onClick={() => { setSelectedItem(null); alert('삭제 기능은 Supabase 연동 후 활성화됩니다') }}>삭제</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="수업 추가">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">과목명 *</label>
            <input
              type="text"
              value={newSchedule.subjectName}
              onChange={e => setNewSchedule(p => ({ ...p, subjectName: e.target.value }))}
              placeholder="수학"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">담당 선생님 *</label>
            <input
              type="text"
              value={newSchedule.teacherName}
              onChange={e => setNewSchedule(p => ({ ...p, teacherName: e.target.value }))}
              placeholder="홍길동"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">요일</label>
            <select
              value={newSchedule.dayOfWeek}
              onChange={e => setNewSchedule(p => ({ ...p, dayOfWeek: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
            >
              {DAYS.map(d => <option key={d} value={d}>{getDayNameFull(d)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">시작 시간</label>
              <input type="time" value={newSchedule.startTime} onChange={e => setNewSchedule(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">종료 시간</label>
              <input type="time" value={newSchedule.endTime} onChange={e => setNewSchedule(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" fullWidth onClick={() => setShowAddModal(false)}>취소</Button>
            <Button fullWidth onClick={() => {
              if (!newSchedule.subjectName || !newSchedule.teacherName) { alert('필수 항목을 입력해주세요'); return }
              alert('수업이 추가되었습니다! (Supabase 연동 후 저장됩니다)')
              setShowAddModal(false)
            }}>추가</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
