-- ClassPing Supabase Schema
-- Supabase SQL Editor에서 실행하세요

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. 과목 (subjects)
-- ========================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. 학생 (students)
-- ========================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  -- is_adult: 만 19세 이상 여부 (생성 시 자동 계산, 앱 레이어에서 처리)
  is_adult BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_fee INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  -- 보호자 정보 (미성년자 전용)
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. 수업 시간표 (schedules)
-- ========================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=일, 1=월 ... 6=토
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. 학생-과목 수강 관계 (student_subjects)
-- ========================================
CREATE TABLE IF NOT EXISTS student_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ========================================
-- 5. 출결 기록 (attendance)
-- ========================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'makeup')),
  notes TEXT,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- ========================================
-- 6. 알림 발송 로그 (notifications)
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('absence', 'makeup')),
  recipient_email TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 인덱스
-- ========================================
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);

-- ========================================
-- Row Level Security (RLS) - 기본 설정
-- 실제 운영 시 사용자 인증에 맞게 수정 필요
-- ========================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 개발 단계: 모든 인증된 사용자 허용 (추후 학원별 분리 적용)
CREATE POLICY "Allow all for authenticated" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON student_subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ========================================
-- 샘플 데이터 (선택 사항)
-- ========================================
-- INSERT INTO subjects (name, teacher_name) VALUES
--   ('수학', '김수학'),
--   ('영어', '이영어'),
--   ('과학', '박과학');

-- INSERT INTO students (name, birth_date, phone, email, is_adult, monthly_fee, start_date)
-- VALUES ('홍길동', '2007-05-15', '010-1234-5678', NULL, FALSE, 150000, '2026-03-01');

-- ========================================
-- 유용한 뷰 (Views)
-- ========================================

-- 이번 달 출결 현황 뷰
CREATE OR REPLACE VIEW monthly_attendance_summary AS
SELECT
  s.id AS student_id,
  s.name AS student_name,
  sub.name AS subject_name,
  DATE_TRUNC('month', a.date) AS month,
  COUNT(*) FILTER (WHERE a.status = 'present') AS present_count,
  COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_count,
  COUNT(*) FILTER (WHERE a.status = 'makeup') AS makeup_count,
  COUNT(*) AS total_count,
  ROUND(
    COUNT(*) FILTER (WHERE a.status = 'present')::NUMERIC / NULLIF(COUNT(*), 0) * 100
  , 1) AS attendance_rate
FROM attendance a
JOIN students s ON a.student_id = s.id
JOIN subjects sub ON a.subject_id = sub.id
GROUP BY s.id, s.name, sub.name, DATE_TRUNC('month', a.date);
