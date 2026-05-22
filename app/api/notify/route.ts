import { NextRequest, NextResponse } from 'next/server'
import { getResend, buildAbsenceEmail, buildMakeupEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, recipientEmail, recipientName, isGuardian } = body

    if (!recipientEmail) {
      return NextResponse.json({ success: false, error: '수신자 이메일이 없습니다' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY가 설정되지 않았습니다' }, { status: 500 })
    }

    let emailContent: { subject: string; html: string }

    if (type === 'absence') {
      emailContent = buildAbsenceEmail({
        studentName: body.studentName,
        date: body.date,
        subjectName: body.subjectName,
        teacherName: body.teacherName,
        recipientName,
        isGuardian,
      })
    } else if (type === 'makeup') {
      emailContent = buildMakeupEmail({
        studentName: body.studentName,
        originalDate: body.originalDate,
        makeupDate: body.makeupDate,
        subjectName: body.subjectName,
        teacherName: body.teacherName,
        recipientName,
        isGuardian,
      })
    } else {
      return NextResponse.json({ success: false, error: '알 수 없는 알림 타입' }, { status: 400 })
    }

    const { data, error } = await getResend().emails.send({
      from: 'ClassPing <noreply@classping.app>',
      to: [recipientEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Notify API error:', err)
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
