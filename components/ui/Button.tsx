'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'kakao'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants: Record<string, string> = {
  primary: 'bg-w-primary text-white hover:bg-w-primary-hover',
  secondary: 'bg-w-subtle text-w-body border hover:bg-gray-100',
  danger: 'bg-w-error text-white hover:opacity-90',
  ghost: 'text-w-primary hover:bg-purple-50',
  kakao: 'bg-kakao text-[#191919] hover:opacity-90',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-pill
        transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] ?? variants.primary} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      style={{ borderColor: variant === 'secondary' ? 'var(--c-border)' : undefined }}
      {...props}
    >
      {children}
    </button>
  )
}
