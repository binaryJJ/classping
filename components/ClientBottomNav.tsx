'use client'

import { usePathname } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function ClientBottomNav() {
  const pathname = usePathname()
  if (pathname === '/login') return null
  return <BottomNav />
}
