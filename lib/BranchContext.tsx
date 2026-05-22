'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface BranchStudent {
  id: string
  name: string
  birth_date: string
  phone: string
  email: string | null
  is_adult: boolean
  monthly_fee: number
  start_date: string
  guardian_name: string | null
  guardian_email: string | null
  guardian_phone: string | null
  created_at: string
  subject_id: string
  subject: string
  subjectVariant: 'guitar' | 'bass' | 'drums' | 'vocal'
  notifyEmail: string
  totalClasses: number
  absentCount: number
}

export interface Teacher {
  id: string
  name: string
  subject_id: string
  subject: string
  subjectVariant: 'guitar' | 'bass' | 'drums' | 'vocal'
  monthly_salary: number
  start_date: string
  assignedStudentIds: string[]
}

export interface SubjectDef {
  id: string
  name: string
  variant: 'guitar' | 'bass' | 'drums' | 'vocal'
  teacherName: string
  dayOfWeek: number[]
  startTime: string
  endTime: string
  color: string
}

export const SUBJECTS: SubjectDef[] = [
  { id: '1', name: '기타', variant: 'guitar', teacherName: '김기타', dayOfWeek: [1, 3, 4, 5], startTime: '14:00', endTime: '15:00', color: '#7c3aed' },
  { id: '2', name: '베이스', variant: 'bass', teacherName: '이베이스', dayOfWeek: [2, 4], startTime: '15:00', endTime: '16:00', color: '#0ea5e9' },
  { id: '3', name: '드럼', variant: 'drums', teacherName: '박드럼', dayOfWeek: [0, 6], startTime: '10:00', endTime: '12:00', color: '#ef4444' },
  { id: '4', name: '보컬', variant: 'vocal', teacherName: '최보컬', dayOfWeek: [1, 3, 5], startTime: '16:00', endTime: '17:00', color: '#00B97C' },
]

const ALL_STUDENTS: Record<string, BranchStudent[]> = {
  '위례점': [
    { id: 'w1', name: '김민준', birth_date: '2008-03-15', phone: '010-1234-5678', email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-03-01', guardian_name: '김부모', guardian_email: 'parent_w1@email.com', guardian_phone: '010-9876-5432', created_at: '2024-03-01', subject_id: '1', subject: '기타', subjectVariant: 'guitar', notifyEmail: 'parent_w1@email.com', totalClasses: 12, absentCount: 2 },
    { id: 'w2', name: '이서연', birth_date: '2005-07-22', phone: '010-2345-6789', email: 'leesy@email.com', is_adult: false, monthly_fee: 180000, start_date: '2024-01-15', guardian_name: '이부모', guardian_email: 'parent_w2@email.com', guardian_phone: '010-8765-4321', created_at: '2024-01-15', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', notifyEmail: 'parent_w2@email.com', totalClasses: 12, absentCount: 1 },
    { id: 'w3', name: '박지호', birth_date: '2002-11-30', phone: '010-3456-7890', email: 'parkjh@email.com', is_adult: true, monthly_fee: 200000, start_date: '2024-02-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-02-01', subject_id: '3', subject: '드럼', subjectVariant: 'drums', notifyEmail: 'parkjh@email.com', totalClasses: 4, absentCount: 3 },
    { id: 'w4', name: '최유나', birth_date: '2009-05-10', phone: '010-4567-8901', email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-04-01', guardian_name: '최부모', guardian_email: 'parent_w4@email.com', guardian_phone: '010-7654-3210', created_at: '2024-04-01', subject_id: '2', subject: '베이스', subjectVariant: 'bass', notifyEmail: 'parent_w4@email.com', totalClasses: 8, absentCount: 0 },
    { id: 'w5', name: '강동원', birth_date: '2000-09-20', phone: '010-5678-9012', email: 'kang@email.com', is_adult: true, monthly_fee: 150000, start_date: '2024-05-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-05-01', subject_id: '1', subject: '기타', subjectVariant: 'guitar', notifyEmail: 'kang@email.com', totalClasses: 12, absentCount: 1 },
    { id: 'w6', name: '신예은', birth_date: '2010-02-14', phone: '010-6789-0123', email: null, is_adult: false, monthly_fee: 180000, start_date: '2024-06-01', guardian_name: '신부모', guardian_email: 'parent_w6@email.com', guardian_phone: '010-6543-2109', created_at: '2024-06-01', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', notifyEmail: 'parent_w6@email.com', totalClasses: 12, absentCount: 0 },
    { id: 'w7', name: '윤석영', birth_date: '2007-06-30', phone: '010-7890-1234', email: null, is_adult: false, monthly_fee: 200000, start_date: '2024-07-01', guardian_name: '윤부모', guardian_email: 'parent_w7@email.com', guardian_phone: '010-5432-1098', created_at: '2024-07-01', subject_id: '3', subject: '드럼', subjectVariant: 'drums', notifyEmail: 'parent_w7@email.com', totalClasses: 4, absentCount: 1 },
    { id: 'w8', name: '정현수', birth_date: '2001-12-05', phone: '010-8901-2345', email: 'jung@email.com', is_adult: true, monthly_fee: 150000, start_date: '2024-08-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-08-01', subject_id: '2', subject: '베이스', subjectVariant: 'bass', notifyEmail: 'jung@email.com', totalClasses: 8, absentCount: 2 },
    { id: 'w9', name: '홍길동', birth_date: '2011-08-22', phone: '010-9012-3456', email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-09-01', guardian_name: '홍부모', guardian_email: 'parent_w9@email.com', guardian_phone: '010-4321-0987', created_at: '2024-09-01', subject_id: '1', subject: '기타', subjectVariant: 'guitar', notifyEmail: 'parent_w9@email.com', totalClasses: 12, absentCount: 0 },
    { id: 'w10', name: '임지선', birth_date: '1998-04-17', phone: '010-0123-4567', email: 'lim@email.com', is_adult: true, monthly_fee: 180000, start_date: '2024-10-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-10-01', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', notifyEmail: 'lim@email.com', totalClasses: 12, absentCount: 3 },
  ],
  '잠실점': [
    { id: 'j1', name: '조현우', birth_date: '2009-01-20', phone: '010-1111-2222', email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-03-01', guardian_name: '조부모', guardian_email: 'parent_j1@email.com', guardian_phone: '010-2222-3333', created_at: '2024-03-01', subject_id: '1', subject: '기타', subjectVariant: 'guitar', notifyEmail: 'parent_j1@email.com', totalClasses: 12, absentCount: 1 },
    { id: 'j2', name: '한다솜', birth_date: '2003-11-05', phone: '010-3333-4444', email: 'han@email.com', is_adult: true, monthly_fee: 180000, start_date: '2024-01-15', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-01-15', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', notifyEmail: 'han@email.com', totalClasses: 12, absentCount: 2 },
    { id: 'j3', name: '오민준', birth_date: '2008-07-18', phone: '010-5555-6666', email: null, is_adult: false, monthly_fee: 200000, start_date: '2024-02-01', guardian_name: '오부모', guardian_email: 'parent_j3@email.com', guardian_phone: '010-6666-7777', created_at: '2024-02-01', subject_id: '3', subject: '드럼', subjectVariant: 'drums', notifyEmail: 'parent_j3@email.com', totalClasses: 4, absentCount: 0 },
    { id: 'j4', name: '서지원', birth_date: '2000-03-25', phone: '010-7777-8888', email: 'seo@email.com', is_adult: true, monthly_fee: 150000, start_date: '2024-04-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-04-01', subject_id: '2', subject: '베이스', subjectVariant: 'bass', notifyEmail: 'seo@email.com', totalClasses: 8, absentCount: 1 },
    { id: 'j5', name: '김철수', birth_date: '1999-09-10', phone: '010-8888-9999', email: 'kim@email.com', is_adult: true, monthly_fee: 150000, start_date: '2024-05-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-05-01', subject_id: '1', subject: '기타', subjectVariant: 'guitar', notifyEmail: 'kim@email.com', totalClasses: 12, absentCount: 0 },
    { id: 'j6', name: '이민수', birth_date: '2010-05-28', phone: '010-9999-0000', email: null, is_adult: false, monthly_fee: 200000, start_date: '2024-06-01', guardian_name: '이부모', guardian_email: 'parent_j6@email.com', guardian_phone: '010-0000-1111', created_at: '2024-06-01', subject_id: '3', subject: '드럼', subjectVariant: 'drums', notifyEmail: 'parent_j6@email.com', totalClasses: 4, absentCount: 2 },
    { id: 'j7', name: '박영희', birth_date: '2006-12-14', phone: '010-1122-3344', email: null, is_adult: false, monthly_fee: 180000, start_date: '2024-07-01', guardian_name: '박부모', guardian_email: 'parent_j7@email.com', guardian_phone: '010-3344-5566', created_at: '2024-07-01', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', notifyEmail: 'parent_j7@email.com', totalClasses: 12, absentCount: 1 },
    { id: 'j8', name: '최지영', birth_date: '2002-08-30', phone: '010-5566-7788', email: 'choi@email.com', is_adult: true, monthly_fee: 150000, start_date: '2024-08-01', guardian_name: null, guardian_email: null, guardian_phone: null, created_at: '2024-08-01', subject_id: '2', subject: '베이스', subjectVariant: 'bass', notifyEmail: 'choi@email.com', totalClasses: 8, absentCount: 0 },
  ],
}

const INITIAL_TEACHERS: Record<string, Teacher[]> = {
  '위례점': [
    { id: 'wt1', name: '김강사', subject_id: '1', subject: '기타', subjectVariant: 'guitar', monthly_salary: 2500000, start_date: '2023-03-01', assignedStudentIds: ['w1', 'w5', 'w9'] },
    { id: 'wt2', name: '이강사', subject_id: '3', subject: '드럼', subjectVariant: 'drums', monthly_salary: 2800000, start_date: '2024-01-15', assignedStudentIds: ['w3', 'w7'] },
  ],
  '잠실점': [
    { id: 'jt1', name: '박강사', subject_id: '4', subject: '보컬', subjectVariant: 'vocal', monthly_salary: 2600000, start_date: '2022-06-01', assignedStudentIds: ['j2', 'j7'] },
    { id: 'jt2', name: '최강사', subject_id: '2', subject: '베이스', subjectVariant: 'bass', monthly_salary: 2400000, start_date: '2025-02-10', assignedStudentIds: ['j4', 'j8'] },
  ],
}

const DEFAULT_BRANCHES = ['위례점', '잠실점']

interface BranchContextType {
  branches: string[]
  selectedBranch: string
  students: BranchStudent[]
  teachers: Teacher[]
  setSelectedBranch: (b: string) => void
  addBranch: (name: string) => void
  deleteBranch: (name: string) => void
  addTeacher: (t: Omit<Teacher, 'id'>) => void
  updateTeacher: (id: string, data: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void
}

const BranchContext = createContext<BranchContextType | null>(null)

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branches, setBranches] = useState<string[]>(DEFAULT_BRANCHES)
  const [selectedBranch, setSelectedBranchState] = useState(DEFAULT_BRANCHES[0])
  const [teachersMap, setTeachersMap] = useState<Record<string, Teacher[]>>(INITIAL_TEACHERS)

  useEffect(() => {
    const saved = localStorage.getItem('els_branches')
    const savedSelected = localStorage.getItem('els_selected_branch')
    if (saved) { try { setBranches(JSON.parse(saved)) } catch {} }
    if (savedSelected) setSelectedBranchState(savedSelected)
  }, [])

  function setSelectedBranch(b: string) {
    setSelectedBranchState(b)
    localStorage.setItem('els_selected_branch', b)
  }

  function addBranch(name: string) {
    const next = [...branches, name]
    setBranches(next)
    localStorage.setItem('els_branches', JSON.stringify(next))
  }

  function deleteBranch(name: string) {
    const next = branches.filter(b => b !== name)
    setBranches(next)
    localStorage.setItem('els_branches', JSON.stringify(next))
    if (selectedBranch === name && next.length > 0) setSelectedBranch(next[0])
  }

  function addTeacher(t: Omit<Teacher, 'id'>) {
    const newT = { ...t, id: `t${Date.now()}`, assignedStudentIds: t.assignedStudentIds ?? [] }
    setTeachersMap(prev => ({ ...prev, [selectedBranch]: [...(prev[selectedBranch] ?? []), newT] }))
  }

  function updateTeacher(id: string, data: Partial<Teacher>) {
    setTeachersMap(prev => ({
      ...prev,
      [selectedBranch]: (prev[selectedBranch] ?? []).map(t => t.id === id ? { ...t, ...data } : t)
    }))
  }

  function deleteTeacher(id: string) {
    setTeachersMap(prev => ({
      ...prev,
      [selectedBranch]: (prev[selectedBranch] ?? []).filter(t => t.id !== id)
    }))
  }

  const students = ALL_STUDENTS[selectedBranch] ?? ALL_STUDENTS['위례점']
  const teachers = teachersMap[selectedBranch] ?? []

  return (
    <BranchContext.Provider value={{ branches, selectedBranch, students, teachers, setSelectedBranch, addBranch, deleteBranch, addTeacher, updateTeacher, deleteTeacher }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}
