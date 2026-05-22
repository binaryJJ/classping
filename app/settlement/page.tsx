'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { calculateRefund } from '@/lib/utils'
import { useBranch } from '@/lib/BranchContext'

interface ManualRefund {
  id: string
  studentId: string
  amount: number
  reason: string
  date: string
}

type RefundDone = Record<string, boolean>

const REASON_OPTIONS = ['개인 사정', '학원 휴강', '수업 불만족', '건강 문제', '직접 입력']

const EMPTY_REFUND_FORM = { studentId: '', amount: '', reason: REASON_OPTIONS[0], customReason: '', date: '' }

export default function SettlementPage() {
  const { students, selectedBranch } = useBranch()
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [refundDone, setRefundDone] = useState<RefundDone>({})
  const [manualRefunds, setManualRefunds] = useState<ManualRefund[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRefund, setEditingRefund] = useState<ManualRefund | null>(null)
  const [form, setForm] = useState(EMPTY_REFUND_FORM)
  const [formError, setFormError] = useState('')

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
  const headerLabel = isCurrentMonth ? '이번 달 환불 현황' : `${selectedYear}년 ${selectedMonth}월 환불 현황`
  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 1 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  useEffect(() => { setRefundDone({}) }, [selectedYear, selectedMonth])

  const withRefund = students.map(item => {
    const absentCount = isCurrentMonth ? item.absentCount : 0
    return {
      ...item,
      absentCount,
      autoRefund: calculateRefund(item.monthly_fee, item.totalClasses, absentCount),
      perClass: Math.round(item.monthly_fee / item.totalClasses),
    }
  })

  const totalAutoRefund = withRefund.reduce((s, i) => s + i.autoRefund, 0)
  const totalManualRefund = manualRefunds.reduce((s, r) => s + r.amount, 0)
  const totalRefund = totalAutoRefund + totalManualRefund
  const completedRefund = withRefund.filter(i => refundDone[i.id]).reduce((s, i) => s + i.autoRefund, 0)
  const pendingRefund = totalRefund - completedRefund
  const totalAbsent = withRefund.reduce((s, i) => s + i.absentCount, 0)

  function openAddModal() {
    setEditingRefund(null)
    setForm({ ...EMPTY_REFUND_FORM, studentId: students[0]?.id ?? '', date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01` })
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(r: ManualRefund) {
    setEditingRefund(r)
    const isCustom = !REASON_OPTIONS.slice(0, -1).includes(r.reason)
    setForm({ studentId: r.studentId, amount: String(r.amount), reason: isCustom ? '직접 입력' : r.reason, customReason: isCustom ? r.reason : '', date: r.date })
    setFormError('')
    setModalOpen(true)
  }

  function handleSaveRefund() {
    if (!form.studentId) { setFormError('수강생을 선택해주세요.'); return }
    const amount = Number(form.amount)
    if (!amount || amount <= 0) { setFormError('환불 금액을 입력해주세요.'); return }
    if (!form.date) { setFormError('날짜를 선택해주세요.'); return }
    const finalReason = form.reason === '직접 입력' ? form.customReason.trim() || '직접 입력' : form.reason
    const refund: ManualRefund = {
      id: editingRefund?.id ?? `mr${Date.now()}`,
      studentId: form.studentId,
      amount,
      reason: finalReason,
      date: form.date,
    }
    if (editingRefund) {
      setManualRefunds(prev => prev.map(r => r.id === editingRefund.id ? refund : r))
    } else {
      setManualRefunds(prev => [...prev, refund])
    }
    setModalOpen(false)
  }

  function deleteManualRefund(id: string) {
    if (confirm('이 환불 내역을 삭제할까요?')) setManualRefunds(prev => prev.filter(r => r.id !== id))
  }

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
              { label: '자동 환불', value: `${totalAutoRefund.toLocaleString()}원` },
              { label: '수동 환불', value: `${totalManualRefund.toLocaleString()}원` },
              { label: '총 결석', value: `${totalAbsent}회` },
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
          <p className="text-xs font-medium" style={{ color: 'var(--c-secondary)' }}>자동 환불 계산 방식</p>
          <p className="text-sm text-w-body mt-0.5">월 수강료 ÷ 수업 횟수 × 결석 횟수</p>
        </div>

        {/* Manual refund add button + filter */}
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
            <button
              onClick={openAddModal}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-pill t-base hover:opacity-80"
              style={{ background: 'var(--c-primary)', color: 'white' }}
            >
              <Plus size={12} /> 수동 환불
            </button>
          </div>
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {withRefund.map(item => {
            const done = refundDone[item.id]
            const itemManualRefunds = manualRefunds.filter(r => r.studentId === item.id)
            const totalItemRefund = item.autoRefund + itemManualRefunds.reduce((s, r) => s + r.amount, 0)

            return (
              <div
                key={item.id}
                className="w-card overflow-hidden"
                style={{ opacity: done ? 0.65 : 1, background: done ? '#F0F0F2' : 'var(--c-surface)', transition: 'all 300ms' }}
              >
                {/* Student header */}
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
                  {totalItemRefund > 0 ? (
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: done ? 'var(--c-secondary)' : 'var(--c-error)' }}>-{totalItemRefund.toLocaleString()}원</div>
                      <div className="text-xs" style={{ color: 'var(--c-secondary)' }}>환불 예정</div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-pill" style={{ background: '#00B97C18', color: 'var(--c-success)' }}>환불 없음</span>
                  )}
                </div>

                {/* Auto stats */}
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

                {/* Auto refund row */}
                {item.autoRefund > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 px-1" style={{ borderTop: '1px solid var(--c-border)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-pill" style={{ background: 'rgba(112,115,124,0.12)', color: 'var(--c-secondary)' }}>자동</span>
                      <span className="text-xs" style={{ color: 'var(--c-secondary)' }}>결석 자동 환불 · {item.perClass.toLocaleString()}원 × {item.absentCount}회</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: done ? 'var(--c-secondary)' : 'var(--c-error)' }}>-{item.autoRefund.toLocaleString()}원</span>
                  </div>
                )}

                {/* Manual refund rows */}
                {itemManualRefunds.map(mr => (
                  <div key={mr.id} className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-pill flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--c-primary)' }}>수동</span>
                      <span className="text-xs truncate" style={{ color: 'var(--c-secondary)' }}>{mr.reason} · {mr.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: 'var(--c-error)' }}>-{mr.amount.toLocaleString()}원</span>
                      <button onClick={() => openEditModal(mr)} className="w-5 h-5 flex items-center justify-center rounded t-base hover:bg-w-subtle">
                        <Pencil size={11} color="var(--c-secondary)" />
                      </button>
                      <button onClick={() => deleteManualRefund(mr.id)} className="w-5 h-5 flex items-center justify-center rounded t-base hover:bg-red-50">
                        <Trash2 size={11} color="var(--c-error)" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setForm({ ...EMPTY_REFUND_FORM, studentId: item.id, date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01` }); setEditingRefund(null); setFormError(''); setModalOpen(true) }}
                    className="flex-1 py-2 text-xs font-semibold rounded-pill t-base hover:opacity-80"
                    style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--c-primary)', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                    + 수동 환불
                  </button>
                  {totalItemRefund > 0 && !done && (
                    <button
                      onClick={() => { if (confirm('환불처리가 완료되었나요?')) setRefundDone(p => ({ ...p, [item.id]: true })) }}
                      className="flex-1 py-2 text-xs font-semibold rounded-pill t-base hover:opacity-80"
                      style={{ background: 'var(--c-primary)', color: 'white' }}
                    >
                      환불 완료
                    </button>
                  )}
                  {done && totalItemRefund > 0 && (
                    <div className="flex-1 py-2 text-center text-xs font-medium rounded-pill" style={{ background: 'rgba(112,115,124,0.12)', color: 'var(--c-secondary)' }}>환불 처리 완료</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Manual Refund Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl" style={{ background: 'var(--c-surface)' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <h2 className="text-base font-bold text-w-heading">{editingRefund ? '환불 수정' : '수동 환불 추가'}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-w-subtle">
                <X size={18} color="var(--c-secondary)" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">수강생</label>
                <select
                  className="w-input"
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                >
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.subject})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">환불 금액 (원)</label>
                <input
                  className="w-input"
                  type="number"
                  placeholder="50000"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">환불 사유</label>
                <select
                  className="w-input"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                >
                  {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {form.reason === '직접 입력' && (
                  <input
                    className="w-input mt-2"
                    placeholder="사유를 직접 입력하세요"
                    value={form.customReason}
                    onChange={e => setForm(f => ({ ...f, customReason: e.target.value }))}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-w-heading mb-1.5">날짜</label>
                <input
                  className="w-input"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              {formError && <p className="text-xs" style={{ color: 'var(--c-error)' }}>{formError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-pill text-sm font-semibold t-base"
                  style={{ background: 'var(--c-subtle)', color: 'var(--c-secondary)', border: '1px solid var(--c-border)' }}
                >
                  취소
                </button>
                <button
                  onClick={handleSaveRefund}
                  className="flex-1 py-3 rounded-pill text-sm font-semibold text-white t-base hover:opacity-90"
                  style={{ background: 'var(--c-primary)' }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
