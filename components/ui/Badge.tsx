interface BadgeProps {
  children: React.ReactNode
  variant?: 'present' | 'absent' | 'makeup' | 'adult' | 'minor' | 'default' | 'guitar' | 'bass' | 'drums' | 'vocal'
}

const variants: Record<string, { bg: string; color: string }> = {
  present:  { bg: '#00B97C15', color: '#00B97C' },
  absent:   { bg: '#F0483C15', color: '#F0483C' },
  makeup:   { bg: '#7c3aed15', color: '#7c3aed' },
  adult:    { bg: '#7c3aed12', color: '#7c3aed' },
  minor:    { bg: '#FFAB0018', color: '#b37400' },
  default:  { bg: 'rgba(112,115,124,0.1)', color: 'rgba(55,56,60,0.61)' },
  guitar:   { bg: '#7c3aed15', color: '#7c3aed' },
  bass:     { bg: '#0ea5e915', color: '#0369a1' },
  drums:    { bg: '#ef444418', color: '#dc2626' },
  vocal:    { bg: '#00B97C15', color: '#00B97C' },
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
