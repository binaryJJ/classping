'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface BranchStudent {
  id: string
  name: string
  birth_date: string
  phone: string
  email: string | null
  monthly_fee: number
  start_date: string
  guardian_name: string | null
  guardian_email: string | null
  guardian_phone: string | null
  created_at: string
  subject_id: string
  subject: string
  subjectVariant: 'english'
  notifyEmail: string
  totalClasses: number
  absentCount: number
}

export interface Teacher {
  id: string
  name: string
  subject_id: string
  subject: string
  subjectVariant: 'english'
  monthly_salary: number
  start_date: string
  assignedStudentIds: string[]
}

export interface SubjectDef {
  id: string
  name: string
  variant: 'english'
  teacherName: string
  dayOfWeek: number[]
  startTime: string
  endTime: string
  color: string
}

export const SUBJECTS: SubjectDef[] = [
  { id: '1', name: '영어', variant: 'english', teacherName: '영어강사', dayOfWeek: [1, 2, 3, 4, 5], startTime: '15:00', endTime: '17:00', color: '#5BC4C0' },
]

const BRANCH_NAME = '율현점'

const ALL_STUDENTS: BranchStudent[] = [
  { id: 's1', name: '김민준', birth_date: '2014-03-15', phone: '010-1234-5678', email: null, monthly_fee: 150000, start_date: '2024-03-01', guardian_name: '김부모', guardian_email: 'parent_s1@email.com', guardian_phone: '010-9876-5432', created_at: '2024-03-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s1@email.com', totalClasses: 12, absentCount: 2 },
  { id: 's2', name: '이서연', birth_date: '2013-07-22', phone: '010-2345-6789', email: null, monthly_fee: 150000, start_date: '2024-01-15', guardian_name: '이부모', guardian_email: 'parent_s2@email.com', guardian_phone: '010-8765-4321', created_at: '2024-01-15', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s2@email.com', totalClasses: 16, absentCount: 1 },
  { id: 's3', name: '박지호', birth_date: '2015-11-30', phone: '010-3456-7890', email: null, monthly_fee: 150000, start_date: '2024-02-01', guardian_name: '박부모', guardian_email: 'parent_s3@email.com', guardian_phone: '010-7654-3210', created_at: '2024-02-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s3@email.com', totalClasses: 8, absentCount: 3 },
  { id: 's4', name: '최유나', birth_date: '2016-05-10', phone: '010-4567-8901', email: null, monthly_fee: 150000, start_date: '2024-04-01', guardian_name: '최부모', guardian_email: 'parent_s4@email.com', guardian_phone: '010-6543-2109', created_at: '2024-04-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s4@email.com', totalClasses: 12, absentCount: 0 },
  { id: 's5', name: '강동원', birth_date: '2012-09-20', phone: '010-5678-9012', email: null, monthly_fee: 150000, start_date: '2024-05-01', guardian_name: '강부모', guardian_email: 'parent_s5@email.com', guardian_phone: '010-5432-1098', created_at: '2024-05-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s5@email.com', totalClasses: 12, absentCount: 1 },
  { id: 's6', name: '신예은', birth_date: '2014-02-14', phone: '010-6789-0123', email: null, monthly_fee: 150000, start_date: '2024-06-01', guardian_name: '신부모', guardian_email: 'parent_s6@email.com', guardian_phone: '010-4321-0987', created_at: '2024-06-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s6@email.com', totalClasses: 12, absentCount: 0 },
  { id: 's7', name: '윤석영', birth_date: '2013-06-30', phone: '010-7890-1234', email: null, monthly_fee: 150000, start_date: '2024-07-01', guardian_name: '윤부모', guardian_email: 'parent_s7@email.com', guardian_phone: '010-3210-9876', created_at: '2024-07-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s7@email.com', totalClasses: 8, absentCount: 1 },
  { id: 's8', name: '정현수', birth_date: '2015-12-05', phone: '010-8901-2345', email: null, monthly_fee: 150000, start_date: '2024-08-01', guardian_name: '정부모', guardian_email: 'parent_s8@email.com', guardian_phone: '010-2109-8765', created_at: '2024-08-01', subject_id: '1', subject: '영어', subjectVariant: 'english', notifyEmail: 'parent_s8@email.com', totalClasses: 8, absentCount: 2 },
]

const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: '이영어', subject_id: '1', subject: '영어', subjectVariant: 'english', monthly_salary: 2500000, start_date: '2023-03-01', assignedStudentIds: ['s1', 's2', 's3', 's4'] },
  { id: 't2', name: '박영어', subject_id: '1', subject: '영어', subjectVariant: 'english', monthly_salary: 2400000, start_date: '2024-01-15', assignedStudentIds: ['s5', 's6', 's7', 's8'] },
]

interface BranchContextType {
  selectedBranch: string
  students: BranchStudent[]
  teachers: Teacher[]
  addTeacher: (t: Omit<Teacher, 'id'>) => void
  updateTeacher: (id: string, data: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void
}

const BranchContext = createContext<BranchContextType | null>(null)

export function BranchProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS)

  function addTeacher(t: Omit<Teacher, 'id'>) {
    const newT = { ...t, id: `t${Date.now()}`, assignedStudentIds: t.assignedStudentIds ?? [] }
    setTeachers(prev => [...prev, newT])
  }

  function updateTeacher(id: string, data: Partial<Teacher>) {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }

  function deleteTeacher(id: string) {
    setTeachers(prev => prev.filter(t => t.id !== id))
  }

  return (
    <BranchContext.Provider value={{ selectedBranch: BRANCH_NAME, students: ALL_STUDENTS, teachers, addTeacher, updateTeacher, deleteTeacher }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within BranchProvider')
  return ctx
}
