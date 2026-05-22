'use client'

import { useState, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { calculateRefund } from '@/lib/utils'
import { useBranch } from '@/lib/BranchContext'

export default function SettlementPage() {
  const { students, selectedBranch } = useBranch()
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [refundDone, setRefundDone] = useState<Record<string, boolean>>({})

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
  const headerLabel = isCurrentMonth ? '이번 달 환불 현황' : `${selectedYear}년 ${selectedMonth}월 환불 현황`

  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 1 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  // 년/월 변경 시 환불 완료 상태 초기화
  useEffect(() => {
    setRefundDone({})
  }, [selectedYear, selectedMonth])

  // 현재 달: 실제 결석 데이터 사용 / 다른 달: 결석 없음 (데이터 없음)
  const withRefund = students.map(item => {
    const absentCount = isCurrentMonth ? item.absentCount : 0
    return {
      ...item,
      absentCount,
      refund: calculateRefund(item.monthly_fee, item.totalClasses, absentCount),
      perClass: Math.round(item.monthly_fee / item.totalClasses),
    }
  })

  function handleRefundComplete(id: string) {
    if (confirm('환불처리가 완료되었나요?')) {
      setRefundDone(prev => ({ ...prev, [id]: true }))
    }
  }

  const totalRefund = withRefund.reduce((sum, item) => sum + item.refund, 0)
  const completedRefund = withRefund.filter(item => refundDone[item.id]).reduce((sum, item) => sum + item.refund, 0)
  const pendingRefund = totalRefund - completedRefund
  const totalAbsent = withRefund.reduce((sum, item) => sum + item.absentCount, 0)

  return (
    <div style={{ background: 'var(--c-subtle)', minHeight: '100%' }}>
      <div className="w-header px-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-w-heading">환불 정산</h1>
          <p className="text-xs" style={{ color: 'var(--c-secondary)' }}>{selectedBranch}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary Card */}
        <div className="w-card" style={{ background: 'var(--c-primary)', border: 'none', padding: '20px' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{headerLabel}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>환불 완료</p>
              <p className="text-xl font-bold text-white">{completedRefund.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>환불 미완료</p>
              <p className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{pendingRefund.toLocaleString()}원</p>
            </div>
          </div>
          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>총 환불 예정</p>
            <p className="text-base font-semibold text-white mt-0.5">{totalRefund.toLocaleString()}원</p>
          </div>
          <div className="flex gap-6 mt-3">
            {[
              { label: '결석 학생', value: `${withRefund.filter(i => i.absentCount > 0).length}명` },
              { label: '총 결석', value: `${totalAbsent}회` },
              { label: '전체 학생', value: `${students.length}명` },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</p>
                <p className="text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className="w-card" style={{ padding: '12px 16px' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--c-secondary)' }}>계산 방식</p>
          <p className="text-sm text-w-body mt-0.5">월 수강료 ÷ 수업 횟수 × 결석 횟수</p>
        </div>

        {/* Year/Month filter + section header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold px-1" style={{ color: 'var(--c-secondary)' }}>수강생별 내역</p>
          <div className="flex items-center gap-1.5">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="text-xs font-medium px-2 py-1.5 rounded-input t-base"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-body)', outline: 'none' }}
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-medium px-2 py-1.5 rounded-input t-base"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-body)', outline: 'none' }}
            >
              {monthOptions.map(m => <option key={m} value={m}>{m}월</option>)}
            </select>
          </div>
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {withRefund.map(item => {
            const done = refundDone[item.id]
            return (
              <div
                key={item.id}
                className="w-card overflow-hidden"
                style={{ opacity: done ? 0.65 : 1, background: done ? '#F0F0F2' : 'var(--c-surface)', transition: 'all 300ms' }}
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: done ? 'rgba(112,115,124,0.1)' : 'rgba(124,58,237,0.1)', color: done ? 'var(--c-secondary)' : 'var(--c-primary)' }}>
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-w-heading">{item.name}</span>
                        <Badge variant={item.is_adult ? 'adult' : 'minor'}>{item.is_adult ? '성인' : '미성년'}</Badge>
                        <Badge variant={item.subjectVariant}>{item.subject}</Badge>
                      </div>
                      {done && <span className="text-xs font-medium" style={{ color: 'var(--c-secondary)' }}>환불 완료</span>}
                    </div>
                  </div>
                  {item.refund > 0 ? (
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: done ? 'var(--c-secondary)' : 'var(--c-error)' }}>-{item.refund.toLocaleString()}원</div>
                      <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>환불 예정</div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-pill" style={{ background: 'var(--c-success)18', color: 'var(--c-success)' }}>환불 없음</span>
                  )}
                </div>

                <div className="grid grid-cols-4 mt-3">
                  {[
                    { label: '수강료', v: `${item.monthly_fee.toLocaleString()}원`, c: 'var(--c-body)' },
                    { label: '수업수', v: `${item.totalClasses}회`, c: 'var(--c-body)' },
                    { label: '결석', v: `${item.absentCount}회`, c: 'var(--c-error)' },
                    { label: '회당', v: `${item.perClass.toLocaleString()}원`, c: 'var(--c-primary)' },
                  ].map((s, i) => (
                    <div key={i} className="text-center py-2" style={{ borderRight: i < 3 ? '1px solid var(--c-border)' : 'none' }}>
                      <div className="text-xs font-semibold" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--c-secondary)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {item.absentCount > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-3 px-1" style={{ borderTop: '1px solid var(--c-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>{item.perClass.toLocaleString()}원 × {item.absentCount}회</span>
                    <span className="text-xs font-bold" style={{ color: done ? 'var(--c-secondary)' : 'var(--c-error)' }}>= {item.refund.toLocaleString()}원</span>
                  </div>
                )}

                {item.refund > 0 && !done && (
                  <button onClick={() => handleRefundComplete(item.id)} className="mt-3 w-full py-2 text-sm font-semibold rounded-pill t-base hover:opacity-80" style={{ background: 'var(--c-primary)', color: 'white' }}>
                    환불 완료
                  </button>
                )}
                {done && item.refund > 0 && (
                  <div className="mt-3 py-2 text-center text-xs font-medium rounded-pill" style={{ background: 'rgba(112,115,124,0.12)', color: 'var(--c-secondary)' }}>환불 처리 완료</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
