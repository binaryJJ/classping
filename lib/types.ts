export interface Student {
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
}

export interface Subject {
  id: string
  name: string
  teacher_name: string
  created_at: string
}

export interface Schedule {
  id: string
  subject_id: string
  day_of_week: number
  start_time: string
  end_time: string
  subject?: Subject
}

export interface StudentSubject {
  id: string
  student_id: string
  subject_id: string
  enrolled_at: string
  student?: Student
  subject?: Subject
}

export type AttendanceStatus = 'present' | 'absent' | 'makeup'

export interface Attendance {
  id: string
  student_id: string
  subject_id: string
  date: string
  status: AttendanceStatus
  notes: string | null
  notified: boolean
  created_at: string
  student?: Student
  subject?: Subject
}

export interface Notification {
  id: string
  student_id: string
  type: 'absence' | 'makeup'
  recipient_email: string
  content: Record<string, unknown>
  sent_at: string
  created_at: string
}

export interface DashboardStats {
  todayStudents: (Student & { subject: Subject; status?: AttendanceStatus })[]
  monthlyAttendanceRate: number
  expectedRefund: number
  totalStudents: number
}
