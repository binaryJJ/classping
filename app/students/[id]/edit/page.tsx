'use client'

import { useRouter } from 'next/navigation'
import StudentForm from '@/components/students/StudentForm'
import { Student } from '@/lib/types'
import { isAdult } from '@/lib/utils'

const DEMO_STUDENTS: Record<string, Student> = {
  '1': {
    id: '1', name: '김민준', birth_date: '2008-03-15', phone: '010-1234-5678',
    email: null, is_adult: false, monthly_fee: 150000, start_date: '2024-03-01',
    guardian_name: '김부모', guardian_email: 'parent1@email.com', guardian_phone: '010-9876-5432',
    created_at: '2024-03-01',
  },
}

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const student = DEMO_STUDENTS[params.id]

  async function handleSubmit(data: Omit<Student, 'id' | 'created_at' | 'is_adult'>) {
    console.log('학생 수정:', { ...data, id: params.id, is_adult: isAdult(data.birth_date) })
    alert(`${data.name} 학생 정보가 수정되었습니다!`)
    router.push(`/students/${params.id}`)
  }

  return (
    <div>
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-600 text-sm mb-2">
          ← 돌아가기
        </button>
        <h1 className="text-xl font-bold text-gray-900">학생 정보 수정</h1>
      </div>
      <div className="px-4 py-5">
        <StudentForm initial={student} onSubmit={handleSubmit} submitLabel="수정 완료" />
      </div>
    </div>
  )
}
