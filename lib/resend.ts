import { Resend } from 'resend'

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export function buildAbsenceEmail(params: {
  studentName: string
  date: string
  subjectName: string
  teacherName: string
  recipientName: string
  isGuardian: boolean
}) {
  const { studentName, date, subjectName, teacherName, recipientName, isGuardian } = params
  const subject = `[ClassPing] ${studentName} 학생 결석 알림`
  const greeting = isGuardian ? `${recipientName} 보호자님께` : `${recipientName}님께`
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="background: #7c3aed; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">ClassPing 출결 알림</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px;">${greeting}</p>
        <p style="margin: 0 0 16px;"><strong>${studentName}</strong> 학생이 아래 수업에 <strong style="color: #dc2626;">결석</strong>하였습니다.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">날짜</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">과목</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${subjectName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">담당 선생님</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${teacherName}</td>
          </tr>
        </table>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">보강이 필요하신 경우 담당 선생님에게 문의해 주세요.</p>
      </div>
    </div>
  `
  return { subject, html }
}

export function buildMakeupEmail(params: {
  studentName: string
  originalDate: string
  makeupDate: string
  subjectName: string
  teacherName: string
  recipientName: string
  isGuardian: boolean
}) {
  const { studentName, originalDate, makeupDate, subjectName, teacherName, recipientName, isGuardian } = params
  const subject = `[ClassPing] ${studentName} 학생 보강 일정 안내`
  const greeting = isGuardian ? `${recipientName} 보호자님께` : `${recipientName}님께`
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="background: #7c3aed; color: white; padding: 16px 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">ClassPing 보강 안내</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px;">${greeting}</p>
        <p style="margin: 0 0 16px;"><strong>${studentName}</strong> 학생의 보강 일정이 확정되었습니다.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">결석일</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${originalDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">보강일</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; color: #059669; font-weight: bold;">${makeupDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">과목</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${subjectName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">담당 선생님</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${teacherName}</td>
          </tr>
        </table>
      </div>
    </div>
  `
  return { subject, html }
}
