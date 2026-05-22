'use client'

import { useRouter } from 'next/navigation'
import StudentForm from '@/components/students/StudentForm'
import { Student } from '@/lib/types'
import { isAdult } from '@/lib/utils'

export default function NewStudentPage() {
  const router = useRouter()

  async function handleSubmit(data: Omit<Student, 'id' | 'created_at' | 'is_adult'>) {
    // Supabase 연동 전 데모: 콘솔 출력 후 목록으로 이동
    console.log('학생 등록:', { ...data, is_adult: isAdult(data.birth_date) })
    alert(`${data.name} 학생이 등록되었습니다!`)
    router.push('/students')
  }

  return (
    <div>
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-600 text-sm mb-2">
          ← 돌아가기
        </button>
        <h1 className="text-xl font-bold text-gray-900">학생 등록</h1>
      </div>
      <div className="px-4 py-5">
        <StudentForm onSubmit={handleSubmit} submitLabel="등록하기" />
      </div>
    </div>
  )
}
