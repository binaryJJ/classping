'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ChevronRight, Pencil, Trash2, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { calculateAge, formatCurrency } from '@/lib/utils'
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
  assignedStudentIds: string[]
}
const EMPTY_FORM: TeacherFormData = { name: '', subject_id: '1', monthly_salary: '', start_date: '', assignedStudentIds: [] }

export default function MembersPage() {
  const { students, teachers, selectedBranch, addTeacher, updateTeacher, deleteTeacher } = useBranch()
  const branchLabel = selectedBranch.slice(0, 2)

  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students')

  // Students state
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'adult' | 'minor'>('all')

  // Teachers state
  const [activeSubjectId, setActiveSubjectId] = useState(SUBJECTS[0].id)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TeacherFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.includes(search) || s.phone.includes(search)
    const matchFilter = filter === 'all' || (filter === 'adult' ? s.is_adult : !s.is_adult)
    return matchSearch && matchFilter
  })

  const filteredTeachers = teachers.filter(t => t.subject_id === activeSubjectId)

  function openAddTeacher() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, subject_id: activeSubjectId })
    setFormError('')
    setModalOpen(true)
  }

  function openEditTeacher(t: Teacher) {
    setEditingId(t.id)
    setForm({
      name: t.name,
      subject_id: t.subject_id,
      monthly_salary: String(t.monthly_salary),
      start_date: t.start_date,
      assignedStudentIds: t.assignedStudentIds ?? [],
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleDeleteTeacher(t: Teacher) {
    if (confirm(`${t.name} 강사를 삭제할까요?`)) deleteTeacher(t.id)
  }

  function toggleStudent(id: string) {
    setForm(f => ({
      ...f,
      assignedStudentIds: f.assignedStudentIds.includes(id)
        ? f.assignedStudentIds.filter(sid => sid !== id)
        : [...f.assignedStudentIds, id],
    }))
  }

  function handleSubmitTeacher() {
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
      assignedStudentIds: form.assignedStudentIds,
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
          <h1 className="text-base font-bold text-w-heading">인원</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{selectedBranch}</p>
        </div>
        {activeTab === 'students' ? (
          <Link href="/students/new">
            <div className="w-8 h-8 rounded-full flex items-center justify-center t-base hover:opacity-80" style={{ background: 'var(--c-primary)' }}>
              <Plus size={18} color="white" strokeWidth={2.5} />
            </div>
          </Link>
        ) : (
          <button onClick={openAddTeacher} className="w-8 h-8 rounded-full flex items-center justify-center t-base hover:opacity-80" style={{ background: 'var(--c-primary)' }}>
            <Plus size={18} color="white" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Segment Control */}
      <div className="px-4 pt-3 pb-0">
        <div className="flex p-1 gap-1" style={{ background: 'var(--c-subtle)', border: '1px solid var(--c-border)', borderRadius: '8px' }}>
          {(['students', 'teachers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm font-semibold t-base"
              style={{
                borderRadius: '6px',
                background: activeTab === tab ? 'var(--c-surface)' : 'transparent',
                color: activeTab === tab ? 'var(--c-primary)' : 'var(--c-secondary)',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tab === 'students' ? '수강생' : '강사'}
            </button>
          ))}
        </div>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-input" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <Search size={15} color="var(--c-secondary)" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이름 또는 연락처 검색"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--c-body)' }}
            />
          </div>

          <div className="flex gap-2">
            {([['all', '전체'], ['minor', '미성년'], ['adult', '성인']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className="px-4 py-1.5 rounded-pill text-sm font-medium t-base"
                style={{
                  background: filter === val ? 'var(--c-primary)' : 'var(--c-surface)',
                  color: filter === val ? 'white' : 'var(--c-secondary)',
                  border: filter === val ? 'none' : '1px solid var(--c-border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{filteredStudents.length}명</p>

          {filteredStudents.length === 0 ? (
            <div className="w-card text-center py-12">
              <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>수강생이 없습니다</p>
              <Link href="/students/new" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--c-primary)' }}>
                + 수강생 등록하기
              </Link>
            </div>
          ) : (
            <div className="w-card" style={{ padding: 0, overflow: 'hidden' }}>
              {filteredStudents.map((s, idx) => (
                <Link
                  key={s.id}
                  href={`/students/${s.id}`}
                  className="flex items-center px-4 py-3 t-base hover:bg-w-subtle"
                  style={{ borderBottom: idx < filteredStudents.length - 1 ? '1px solid var(--c-border)' : 'none' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--c-primary)', fontSize: '11px' }}>
                    {branchLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-w-heading">{s.name}</span>
                      <Badge variant={s.is_adult ? 'adult' : 'minor'}>{s.is_adult ? '성인' : '미성년'}</Badge>
                      <Badge variant={s.subjectVariant}>{s.subject}</Badge>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--c-secondary)' }}>만 {calculateAge(s.birth_date)}세 · {s.phone}</div>
                  </div>
                  <div className="text-right mr-2">
                    <div className="text-sm font-semibold text-w-heading">{formatCurrency(s.monthly_fee)}</div>
                    <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>월 수강료</div>
                  </div>
                  <ChevronRight size={14} color="var(--c-border)" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div>
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
            {filteredTeachers.length === 0 ? (
              <div className="w-card py-14 text-center">
                <p className="text-sm" style={{ color: 'var(--c-secondary)' }}>등록된 강사가 없습니다</p>
              </div>
            ) : (
              filteredTeachers.map(teacher => {
                const subjDef = SUBJECTS.find(s => s.id === teacher.subject_id)!
                const assignedStudents = students.filter(s => (teacher.assignedStudentIds ?? []).includes(s.id))
                const annualSalary = teacher.monthly_salary * 12
                return (
                  <div key={teacher.id} className="w-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0" style={{ background: subjDef.color + '18', color: subjDef.color }}>
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
                        <button onClick={() => openEditTeacher(teacher)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-w-subtle t-base">
                          <Pencil size={14} color="var(--c-secondary)" />
                        </button>
                        <button onClick={() => handleDeleteTeacher(teacher)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 t-base">
                          <Trash2 size={14} color="var(--c-error)" />
                        </button>
                      </div>
                    </div>

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

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <p className="text-xs font-semibold" style={{ color: 'var(--c-secondary)' }}>담당 수강생</p>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-pill" style={{ background: subjDef.color + '18', color: subjDef.color }}>
                          {assignedStudents.length}명
                        </span>
                      </div>
                      {assignedStudents.length === 0 ? (
                        <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>담당 수강생 없음</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {assignedStudents.map(st => (
                            <span key={st.id} className="text-xs font-medium px-2.5 py-1 rounded-pill" style={{ background: 'var(--c-subtle)', color: 'var(--c-body)', border: '1px solid var(--c-border)' }}>
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
        </div>
      )}

      {/* Bottom action button — changes by active tab */}
      <div className="px-4 pb-6">
        {activeTab === 'students' ? (
          <Link href="/students/new">
            <div className="w-full py-3 rounded-pill text-sm font-semibold text-center t-base hover:opacity-80" style={{ background: 'var(--c-surface)', color: 'var(--c-primary)', border: '1.5px solid var(--c-primary)' }}>
              + 수강생 등록하기
            </div>
          </Link>
        ) : (
          <button
            onClick={openAddTeacher}
            className="w-full py-3 rounded-pill text-sm font-semibold t-base hover:opacity-80"
            style={{ background: 'var(--c-surface)', color: 'var(--c-primary)', border: '1.5px solid var(--c-primary)' }}
          >
            + 강사 등록하기
          </button>
        )}
      </div>

      {/* Teacher Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl overflow-hidden" style={{ background: 'var(--c-surface)', maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h2 className="text-base font-bold text-w-heading">{editingId ? '강사 수정' : '강사 등록'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle">
                <X size={18} color="var(--c-secondary)" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">이름</label>
                <input className="w-input" placeholder="강사 이름" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">담당 과목</label>
                <select className="w-input" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">월 급여 (원)</label>
                <input className="w-input" type="number" placeholder="2500000" value={form.monthly_salary} onChange={e => setForm(f => ({ ...f, monthly_salary: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">입사일</label>
                <input className="w-input" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>

              {/* Student Assignment */}
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">
                  담당 수강생
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--c-secondary)' }}>({form.assignedStudentIds.length}명 선택)</span>
                </label>
                <div className="rounded-input overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
                  {students.length === 0 ? (
                    <p className="px-3 py-3 text-sm" style={{ color: 'var(--c-secondary)' }}>등록된 수강생이 없습니다</p>
                  ) : (
                    students.map((st, idx) => {
                      const checked = form.assignedStudentIds.includes(st.id)
                      return (
                        <label
                          key={st.id}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer t-base hover:bg-w-subtle"
                          style={{ borderBottom: idx < students.length - 1 ? '1px solid var(--c-border)' : 'none' }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudent(st.id)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: 'var(--c-primary)' }}
                          />
                          <span className="text-sm font-medium text-w-body">{st.name}</span>
                          <Badge variant={st.subjectVariant}>{st.subject}</Badge>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              {formError && <p className="text-xs" style={{ color: 'var(--c-error)' }}>{formError}</p>}
              <button
                onClick={handleSubmitTeacher}
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
