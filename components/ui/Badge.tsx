interface BadgeProps {
  children: React.ReactNode
  variant?: 'present' | 'absent' | 'makeup' | 'adult' | 'minor' | 'default'
}

const variants = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  makeup: 'bg-blue-100 text-blue-700',
  adult: 'bg-purple-100 text-purple-700',
  minor: 'bg-yellow-100 text-yellow-700',
  default: 'bg-gray-100 text-gray-700',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
