'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/login') return
    const loggedIn = localStorage.getItem('els_logged_in')
    if (!loggedIn) {
      router.replace('/login')
    }
  }, [pathname, router])

  return null
}
