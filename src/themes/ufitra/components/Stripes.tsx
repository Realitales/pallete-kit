import { cn } from '@lib/lib/cn'

interface StripesProps {
  className?: string
  color?: string
  opacity?: number
  angle?: number
  gap?: number
}

export function Stripes({
  className,
  color = 'white',
  opacity = 0.04,
  angle = 115,
  gap = 14,
}: StripesProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{
        backgroundImage: `repeating-linear-gradient(${angle}deg, ${color} 0 1px, transparent 1px ${gap}px)`,
        opacity,
      }}
    />
  )
}
