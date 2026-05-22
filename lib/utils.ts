export function isAdult(birthDate: string): boolean {
  const birth = new Date(birthDate)
  const today = new Date()
  const cutoff = new Date(birth.getFullYear() + 19, birth.getMonth(), birth.getDate())
  return today >= cutoff
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export function getDayName(day: number): string {
  return ['일', '월', '화', '수', '목', '금', '토'][day]
}

export function getDayNameFull(day: number): string {
  return ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][day]
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const week: Date[] = []
  const day = baseDate.getDay()
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - day)
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    week.push(d)
  }
  return week
}

export function calculateRefund(monthlyFee: number, totalClasses: number, absentCount: number): number {
  if (totalClasses === 0) return 0
  return Math.round((monthlyFee / totalClasses) * absentCount)
}
