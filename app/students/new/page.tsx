'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import StudentForm from '@/components/students/StudentForm'
import { Student } from '@/lib/types'
import { isAdult } from '@/lib/utils'

export default function NewStudentPage() {
  const router = useRouter()

  async function handleSubmit(data: Omit<Student, 'id' | 'created_at' | 'is_adult'>) {
    console.log('학생 등록:', { ...data, is_adult: isAdult(data.birth_date) })
    alert(`${data.name} 학생이 등록되었습니다!`)
    router.push('/students')
  }

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 t-base" style={{ color: 'var(--c-primary)' }}>
          <ChevronLeft size={20} /><span className="text-sm">학생</span>
        </button>
        <h1 className="text-base font-bold text-w-heading">학생 등록</h1>
        <div className="w-16" />
      </div>
      <div className="px-4 py-4">
        <StudentForm onSubmit={handleSubmit} submitLabel="등록하기" />
      </div>
    </div>
  )
}
