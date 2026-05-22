'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, CalendarCheck, Calendar, CreditCard } from 'lucide-react'

const tabs = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/members', label: '구성원', Icon: Users },
  { href: '/attendance', label: '출결', Icon: CalendarCheck },
  { href: '/schedule', label: '시간표', Icon: Calendar },
  { href: '/settlement', label: '정산', Icon: CreditCard },
]

export default function BottomNav() {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    if (href === '/members') return pathname === '/members' || pathname.startsWith('/students') || pathname.startsWith('/teachers')
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--c-border)',
      }}
    >
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-2 pt-2.5 gap-0.5 t-base"
              style={{ color: active ? 'var(--c-primary)' : 'var(--c-secondary)' }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
