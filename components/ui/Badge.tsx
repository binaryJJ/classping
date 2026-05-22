interface BadgeProps {
  children: React.ReactNode
  variant?: 'present' | 'absent' | 'makeup' | 'english' | 'default'
}

const variants: Record<string, { bg: string; color: string }> = {
  present:  { bg: '#00B97C15', color: '#00B97C' },
  absent:   { bg: '#F0483C15', color: '#F0483C' },
  makeup:   { bg: '#F4547A15', color: '#F4547A' },
  english:  { bg: 'rgba(91,196,192,0.15)', color: '#3aaba6' },
  default:  { bg: 'rgba(112,115,124,0.1)', color: 'rgba(55,56,60,0.61)' },
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const v = variants[variant] ?? variants.default
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-semibold"
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  )
}
