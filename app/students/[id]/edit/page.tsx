'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import StudentForm from '@/components/students/StudentForm'
import { Student } from '@/lib/types'
import { isAdult } from '@/lib/utils'
import { useBranch } from '@/lib/BranchContext'

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { students } = useBranch()
  const student = students.find(s => s.id === params.id)

  async function handleSubmit(data: Omit<Student, 'id' | 'created_at' | 'is_adult'>) {
    console.log('학생 수정:', { ...data, id: params.id, is_adult: isAdult(data.birth_date) })
    alert(`${data.name} 학생 정보가 수정되었습니다!`)
    router.push(`/students/${params.id}`)
  }

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 t-base" style={{ color: 'var(--c-primary)' }}>
          <ChevronLeft size={20} /><span className="text-sm">학생 정보</span>
        </button>
        <h1 className="text-base font-bold text-w-heading">정보 수정</h1>
        <div className="w-16" />
      </div>
      <div className="px-4 py-4">
        <StudentForm initial={student as Student | undefined} onSubmit={handleSubmit} submitLabel="수정 완료" />
      </div>
    </div>
  )
}
