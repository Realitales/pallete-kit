import { cn } from '@lib/lib/cn'

interface AccentLineProps {
  className?: string
  color?: string
  inset?: number
}

export function AccentLine({
  className,
  color = 'var(--color-momentum, #5B5FFF)',
  inset = 14,
}: AccentLineProps) {
  return (
    <div
      className={cn('pointer-events-none absolute top-0 h-px', className)}
      style={{
        left: inset,
        right: inset,
        backgroundImage: `linear-gradient(90deg, ${color} 0%, transparent 70%)`,
      }}
    />
  )
}
