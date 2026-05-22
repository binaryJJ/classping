'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useBranch, SUBJECTS, Teacher } from '@/lib/BranchContext'

const SUBJECT_TABS = SUBJECTS.map(s => ({ id: s.id, name: s.name, variant: s.variant, color: s.color }))

function calcTenure(startDate: string): string {
  const start = new Date(startDate)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months}개월`
  if (months === 0) return `${years}년`
  return `${years}년 ${months}개월`
}

interface TeacherFormData {
  name: string
  subject_id: string
  monthly_salary: string
  start_date: string
}

const EMPTY_FORM: TeacherFormData = { name: '', subject_id: '1', monthly_salary: '', start_date: '' }

export default function TeachersPage() {
  const { teachers, students, selectedBranch, addTeacher, updateTeacher, deleteTeacher } = useBranch()
  const [activeSubjectId, setActiveSubjectId] = useState(SUBJECTS[0].id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TeacherFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const filtered = teachers.filter(t => t.subject_id === activeSubjectId)

  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, subject_id: activeSubjectId })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(t: Teacher) {
    setEditingId(t.id)
    setForm({ name: t.name, subject_id: t.subject_id, monthly_salary: String(t.monthly_salary), start_date: t.start_date })
    setFormError('')
    setModalOpen(true)
  }

  function handleDelete(t: Teacher) {
    if (confirm(`${t.name} 강사를 삭제할까요?`)) deleteTeacher(t.id)
  }

  function handleSubmit() {
    if (!form.name.trim()) { setFormError('이름을 입력해주세요.'); return }
    if (!form.start_date) { setFormError('입사일을 입력해주세요.'); return }
    const salary = Number(form.monthly_salary)
    if (!salary || salary <= 0) { setFormError('월 급여를 입력해주세요.'); return }
    const subj = SUBJECTS.find(s => s.id === form.subject_id)!
    const data = {
      name: form.name.trim(),
      subject_id: form.subject_id,
      subject: subj.name,
      subjectVariant: subj.variant as Teacher['subjectVariant'],
      monthly_salary: salary,
      start_date: form.start_date,
      assignedStudentIds: [] as string[],
    }
    if (editingId) {
      updateTeacher(editingId, data)
    } else {
      addTeacher(data)
    }
    setModalOpen(false)
    setActiveSubjectId(form.subject_id)
  }

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      {/* Header */}
      <div className="w-header px-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-w-heading">강사</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{selectedBranch}</p>
        </div>
        <button
          onClick={openAdd}
          className="w-8 h-8 rounded-full flex items-center justify-center t-base hover:opacity-80"
          style={{ background: 'var(--c-primary)' }}
        >
          <Plus size={18} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex px-4 pt-3 gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
        {SUBJECT_TABS.map(tab => {
          const active = tab.id === activeSubjectId
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubjectId(tab.id)}
              className="flex-shrink-0 pb-2.5 px-1 text-sm font-semibold t-base"
              style={{
                color: active ? tab.color : 'var(--c-secondary)',
                borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
              }}
            >
              {tab.name}
            </button>
          )
        })}
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="w-card py-14 text-center">
            <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>등록된 강사가 없습니다</p>
            <button onClick={openAdd} className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--c-primary)' }}>
              + 강사 등록하기
            </button>
          </div>
        ) : (
          filtered.map(teacher => {
            const subjDef = SUBJECTS.find(s => s.id === teacher.subject_id)!
            const assignedStudents = students.filter(s => s.subject_id === teacher.subject_id)
            const annualSalary = teacher.monthly_salary * 12
            return (
              <div key={teacher.id} className="w-card">
                {/* Teacher header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: subjDef.color + '18', color: subjDef.color }}
                    >
                      {teacher.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-w-heading">{teacher.name}</span>
                        <Badge variant={teacher.subjectVariant}>{teacher.subject}</Badge>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>
                        근속 {calcTenure(teacher.start_date)} · {teacher.start_date} 입사
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(teacher)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
                      <Pencil size={14} color="var(--c-secondary)" />
                    </button>
                    <button onClick={() => handleDelete(teacher)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 t-base">
                      <Trash2 size={14} color="var(--c-error)" />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="rounded-input px-3 py-2.5" style={{ background: 'var(--c-subtle)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--c-secondary)' }}>월 급여</p>
                    <p className="text-sm font-bold text-w-heading">{teacher.monthly_salary.toLocaleString()}원</p>
                  </div>
                  <div className="rounded-input px-3 py-2.5" style={{ background: 'var(--c-subtle)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--c-secondary)' }}>연봉</p>
                    <p className="text-sm font-bold text-w-heading">{annualSalary.toLocaleString()}원</p>
                  </div>
                </div>

                {/* Students */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--c-secondary)' }}>담당 수강생</p>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-pill"
                      style={{ background: subjDef.color + '18', color: subjDef.color }}
                    >
                      {assignedStudents.length}명
                    </span>
                  </div>
                  {assignedStudents.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>담당 수강생 없음</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedStudents.map(st => (
                        <span
                          key={st.id}
                          className="text-xs font-medium px-2.5 py-1 rounded-pill"
                          style={{ background: 'var(--c-subtle)', color: 'var(--c-body)', border: '1px solid var(--c-border)' }}
                        >
                          {st.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl" style={{ background: 'var(--c-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h2 className="text-base font-bold text-w-heading">{editingId ? '강사 수정' : '강사 등록'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle">
                <X size={18} color="var(--c-secondary)" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">이름</label>
                <input className="w-input" placeholder="강사 이름" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">담당 과목</label>
                <select
                  className="w-input"
                  value={form.subject_id}
                  onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                >
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">월 급여 (원)</label>
                <input
                  className="w-input"
                  type="number"
                  placeholder="2500000"
                  value={form.monthly_salary}
                  onChange={e => setForm(f => ({ ...f, monthly_salary: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">입사일</label>
                <input className="w-input" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              {formError && <p className="text-xs" style={{ color: 'var(--c-error)' }}>{formError}</p>}
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-pill text-sm font-semibold text-white t-base hover:opacity-90"
                style={{ background: 'var(--c-primary)' }}
              >
                {editingId ? '수정 완료' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
