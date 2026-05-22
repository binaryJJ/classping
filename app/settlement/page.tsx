'use client'

import Badge from '@/components/ui/Badge'
import { formatCurrency, calculateRefund } from '@/lib/utils'

interface RefundItem {
  studentId: string
  name: string
  subject: string
  monthlyFee: number
  totalClasses: number
  absentCount: number
  isAdult: boolean
}

const DEMO_DATA: RefundItem[] = [
  { studentId: '1', name: '김민준', subject: '수학', monthlyFee: 150000, totalClasses: 12, absentCount: 2, isAdult: false },
  { studentId: '2', name: '이서연', subject: '영어', monthlyFee: 180000, totalClasses: 8, absentCount: 1, isAdult: false },
  { studentId: '3', name: '박지호', subject: '수학', monthlyFee: 200000, totalClasses: 12, absentCount: 3, isAdult: true },
  { studentId: '4', name: '최유나', subject: '영어', monthlyFee: 150000, totalClasses: 8, absentCount: 0, isAdult: false },
]

const CURRENT_MONTH = '2026년 5월'

export default function SettlementPage() {

  const withRefund = DEMO_DATA.map(item => ({
    ...item,
    refund: calculateRefund(item.monthlyFee, item.totalClasses, item.absentCount),
    perClass: Math.round(item.monthlyFee / item.totalClasses),
  }))

  const totalRefund = withRefund.reduce((sum, item) => sum + item.refund, 0)
  const totalAbsent = withRefund.reduce((sum, item) => sum + item.absentCount, 0)

  return (
    <div>
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">환불 정산</h1>
        <p className="text-sm text-gray-400 mt-0.5">{CURRENT_MONTH} 기준</p>
      </div>

      {/* Summary */}
      <div className="bg-primary-600 mx-4 mt-4 rounded-2xl p-4 text-white">
        <div className="text-primary-200 text-sm mb-1">이번 달 환불 예정 금액</div>
        <div className="text-3xl font-bold">{formatCurrency(totalRefund)}</div>
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <div className="text-primary-200 text-xs">결석 학생</div>
            <div className="font-semibold">{withRefund.filter(i => i.absentCount > 0).length}명</div>
          </div>
          <div>
            <div className="text-primary-200 text-xs">총 결석 횟수</div>
            <div className="font-semibold">{totalAbsent}회</div>
          </div>
          <div>
            <div className="text-primary-200 text-xs">전체 학생</div>
            <div className="font-semibold">{DEMO_DATA.length}명</div>
          </div>
        </div>
      </div>

      {/* Formula Info */}
      <div className="mx-4 mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="text-xs text-gray-500 font-medium mb-1">환불 계산 방식</div>
        <div className="text-xs text-gray-600">월 수강료 ÷ 수업 횟수 × 결석 횟수</div>
      </div>

      {/* Student List */}
      <div className="px-4 mt-4 space-y-3 pb-6">
        <h2 className="font-semibold text-gray-800 text-sm">학생별 환불 내역</h2>
        {withRefund.map(item => (
          <div key={item.studentId} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                      <Badge variant={item.isAdult ? 'adult' : 'minor'}>
                        {item.isAdult ? '성인' : '미성년'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">{item.subject}</div>
                  </div>
                </div>
                {item.refund > 0 ? (
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">-{formatCurrency(item.refund)}</div>
                    <div className="text-xs text-gray-400">환불 예정</div>
                  </div>
                ) : (
                  <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">환불 없음</div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs font-bold text-gray-700">{formatCurrency(item.monthlyFee)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">월 수강료</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs font-bold text-gray-700">{item.totalClasses}회</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">수업 횟수</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <div className="text-xs font-bold text-red-600">{item.absentCount}회</div>
                  <div className="text-[10px] text-red-400 mt-0.5">결석</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs font-bold text-blue-600">{formatCurrency(item.perClass)}</div>
                  <div className="text-[10px] text-blue-400 mt-0.5">회당 금액</div>
                </div>
              </div>

              {item.absentCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {formatCurrency(item.perClass)} × {item.absentCount}회
                  </span>
                  <span className="font-bold text-red-600">= {formatCurrency(item.refund)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Export hint */}
      <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
        <p className="text-xs text-blue-600">Supabase 연동 후 월별 정산 내역 저장 및 내보내기 기능이 활성화됩니다</p>
      </div>
    </div>
  )
}
